
const widgets = require('@jupyter-widgets/base');
// const L = require('./leaflet.js');
const Mizar = require('regards-mizar').default
const utils = require('./utils.js');
// const proj = require('./projections.js');

export class MizarMapModel extends widgets.DOMWidgetModel {
  defaults() {
    console.error("defaults", super.defaults())
    return {
      ...super.defaults(),
      _view_name: 'MizarMapView',
      _model_name: 'MizarMapModel',
      _model_module: 'jupyter-mizar',
      _view_module: 'jupyter-mizar',
      crs: 'CRS:84',
      zoom: [0.0, 0.0], // can also be a tuple with three elements, the last one being the distance
      layers: [],
    };
  }

  initialize(attributes, options) {
    console.error("initialize", attributes, options)
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
    console.error("MizarMapView init", options)
    super.initialize(options);
  }

  remove_layer_view(child_view) {
    console.error("remove_layer_view")
    this.obj.removeLayer(child_view.obj);
    child_view.remove();
  }

  add_layer_model(child_model) {
    console.error("add_layer_model")
    return this.create_child_view(child_model, {
      map_view: this
    }).then(view => {
      this.obj.addLayer(view.obj);

      // Trigger the displayed event of the child view.
      this.displayed.then(() => {
        view.trigger('displayed', this);
      });

      return view;
    });
  }

  render() {
    console.error("render")
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('mizar-widgets');
    this.map_container = document.createElement('canvas');
    // Fix mouse wheel
    this.map_container.addEventListener("mousewheel", function (event) {
      event.preventDefault();
    }, { passive: false });
    // this.model.on('change:width', this._onWidthChanged, this);
    // this.model.on('change:height', this._onHeightChanged, this);

    this.el.appendChild(this.map_container);

    this.layer_views = new widgets.ViewList(
      this.add_layer_model,
      this.remove_layer_view,
      this
    );
    this.displayed.then(this.render_mizar.bind(this));
  }

  // _onWidthChanged() {
  //   console.log("_onWidthChanged")
  //   console.log(this.model.get('width'))
  //   this.map_container.width = this.model.get('width');
  // }
  // _onHeightChanged() {
  //   console.log("_onHeightChanged")
  //   this.map_container.height = this.model.get('height');
  // }

  render_mizar() {
    console.log("render_mizar")
    this.create_obj().then(() => {

      this.layer_views.update(this.model.get('layers'));
      this.model_events();

      return this;
    });
  }

  create_obj() {
    console.log("create_obj")
    return this.layoutPromise.then(() => {
      var mizarOptions = {
        // the canvas ID where Mizar is inserted
        canvas: this.map_container
      };
      var crs = this.model.get('crs');
      console.error(crs);
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
      var options = {
        ...this.get_options(),
      };
      console.log("options would be", options)
      console.error(mizarOptions)
      this.obj = new Mizar(mizarOptions)
      // this.obj.addLayer({
      //   type: "OSM",
      //   baseUrl: "https://c.tile.openstreetmap.org",
      //   background: true
      // })
      // this.obj.addLayer({
      //   layers: "BioNonBio",
      //   baseUrl: "http://opf-proto.cst.cnes.fr/mapserver/",
      //   type: "WMS",
      //   time: '2017-01-01T00:00:00.000Z',
      //   // visible: true,
      //   background: false
      // })
      console.error("this.obj", this.obj)
    });
  }

  model_events() {
    this.listenTo(
      this.model,
      'change:layers',
      function () {
        console.log("change:layers")
        this.layer_views.update(this.model.get('layers'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:zoom',
      function () {
        if (!this.dirty) {
          console.log("change:zoom")
          var nav = this.obj.getActivatedContext().getNavigation();
          var zoom = this.model.get('zoom')
          var geoPos = [zoom[0], zoom[1]]
          var options = zoom[2] ? {
            distance: zoom[2]
          } : undefined
          nav.zoomTo(geoPos, options);
        }
      },
      this
    );
  }

  processLuminoMessage(msg) {
    console.log("processLuminoMessage", msg)
    super.processLuminoMessage(msg);
  }
}
