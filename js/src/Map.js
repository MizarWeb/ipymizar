
const widgets = require('@jupyter-widgets/base');
// const L = require('./leaflet.js');
const Mizar = require('regards-mizar').default
const utils = require('./utils.js');
// const proj = require('./projections.js');

export class MizarMapModel extends widgets.DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarMapView',
      _model_name: 'MizarMapModel',
      _model_module: 'jupyter-mizar',
      _view_module: 'jupyter-mizar',
      crs: 'CRS:84',
      layers: [],
      _geo_pos: [0.0, 0.0],
      _zoom_to_opts: {}
    };
  }

  initialize(attributes, options) {
    super.initialize(attributes, options);
    this.set('window_url', window.location.href);
  }
}

MizarMapModel.serializers = {
  ...widgets.DOMWidgetModel.serializers,
  layers: { deserialize: widgets.unpack_models },
};

export class MizarMapView extends utils.MizarDOMWidgetView {
  initialize(options) {
    super.initialize(options);
  }

  remove_layer_view(child_view) {
    let layerID = child_view.obj.getID();
    const result = this.obj.removeLayer(layerID);
    child_view.remove();
    this.obj.getActivatedContext().refresh();
  }

  add_layer_model(child_model) {
    return this.create_child_view(child_model, {
      map_view: this
    }).then(view => {
      return view;
    });
  }

  render() {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('mizar-widgets');
    this.map_container = document.createElement('canvas');
    // Fix mouse wheel
    this.map_container.addEventListener("mousewheel", function (event) {
      event.preventDefault();
    }, { passive: false });

    this.el.appendChild(this.map_container);
    // Makes temporal layers works (ノಠ益ಠ)ノ彡┻━┻
    this.timeTravelDiv = document.createElement('div');
    this.timeTravelDiv.setAttribute("id", "timeTravelDiv");
    this.el.appendChild(this.timeTravelDiv);

    this.layer_views = new widgets.ViewList(
      this.add_layer_model,
      this.remove_layer_view,
      this
    );
    this.displayed.then(this.render_mizar.bind(this));
  }

  render_mizar() {
    this.create_obj().then(() => {
      this.layer_views.update(this.model.get('layers'));
      this.model_events();
      // Fix pixel not squared
      this.obj.getActivatedContext().refresh()
      return this;
    });
  }

  create_obj() {
    return this.layoutPromise.then(() => {
      var mizarOptions = {
        // the canvas ID where Mizar is inserted
        canvas: this.map_container
      };
      var crs = this.model.get('crs');
      var context = {
        coordinateSystem: {
          geoideName: crs
        },
        navigation: {
          initTarget: this.model.get('init_target')
        }
      };
      switch (Mizar.CRS_TO_CONTEXT[crs]) {
        case 'Planet':
          mizarOptions.planetContext = context;
          break;
        case 'Sky':
          mizarOptions.skyContext = context;
          break;
        default:
          console.error(`Hay un problema con el context`);
      }
      this.obj = new Mizar(mizarOptions)
    });
  }

  model_events() {
    this.listenTo(
      this.model,
      'change:_geo_pos change:_zoom_to_opts',
      function () {
        var nav = this.obj.getActivatedContext().getNavigation();
        var geoPos = this.model.get('_geo_pos')
        var options = this.model.get('_zoom_to_opts')
        nav.zoomTo(geoPos, options);
      },
      this
    );
    this.listenTo(
      this.model,
      'change:layers',
      function () {
        this.layer_views.update(this.model.get('layers'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:zoom',
      function () {
        var nav = this.obj.getActivatedContext().getNavigation();
        var zoom = this.model.get('zoom')
        var geoPos = [zoom[0], zoom[1]]
        var options = zoom[2] ? {
          distance: zoom[2]
        } : undefined
        nav.zoomTo(geoPos, options);
      },
      this
    );
    this.listenTo(
      this.model,
      'change:time',
      function () {
        var time = this.model.get('time')
        this.obj.setTime(time)
      },
      this
    );
  }

  processLuminoMessage(msg) {
    console.log("processLuminoMessage", msg)
    super.processLuminoMessage(msg);
  }
}
