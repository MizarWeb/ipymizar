
const widgets = require('@jupyter-widgets/base');
// const L = require('./leaflet.js');
const Mizar = require('regards-mizar').default
const utils = require('./utils.js');
// const proj = require('./projections.js');

// const DEFAULT_LOCATION = [0.0, 0.0];


export class MizarPlanetModel extends widgets.DOMWidgetModel {
  defaults() {
    console.error("defaults", super.defaults())
    return {
      ...super.defaults(),
      _view_name: 'MizarPlanetView',
      _model_name: 'MizarPlanetModel',
      _model_module: 'jupyter-mizar',
      _view_module: 'jupyter-mizar',
      crs: 'CRS:84'
    };
  }

  initialize(attributes, options) {
    console.error("initialize", attributes, options)
    super.initialize(attributes, options);
    this.set('window_url', window.location.href);
  }
}

MizarPlanetModel.serializers = {
  ...widgets.DOMWidgetModel.serializers,
  layers: { deserialize: widgets.unpack_models },
};

export class MizarPlanetView extends utils.MizarDOMWidgetView {
  initialize(options) {
    console.error("PlanetView init", options)
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
    this.model.on('change:width', this._onWidthChanged, this);
    this.model.on('change:height', this._onHeightChanged, this);

    this.el.appendChild(this.map_container);

    this.layer_views = new widgets.ViewList(
      this.add_layer_model,
      this.remove_layer_view,
      this
    );
    this.displayed.then(this.render_mizar.bind(this));
  }

  _onWidthChanged() {
    console.log("_onWidthChanged")
    console.log(this.model.get('width'))
    this.map_container.width = this.model.get('width');
  }
  _onHeightChanged() {
    console.log("_onHeightChanged")
    this.map_container.height = this.model.get('height');
  }

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
      let mizarOptions = {
        // the canvas ID where Mizar is inserted
        canvas: this.map_container,
        // define a planet context
        planetContext: {
          // the CRS of the Earth
          coordinateSystem: {
            geoideName: 'CRS:84',
            // projectionName: Mizar.PROJECTION.Plate, 
            // geoideName: this.model.get("crs"),
          },
          navigation: {
            initTarget: [1.45294189453125, 43.597300467515375, 50000]
          }
        },
      }
      var options = {
        ...this.get_options(),
      };
      console.log("options would be", options)
      this.obj = new Mizar(mizarOptions)
      this.obj.addLayer({
        type: "OSM",
        baseUrl: "https://c.tile.openstreetmap.org",
        background: true
      })
      this.obj.addLayer({
        layers: "BioNonBio",
        baseUrl: "http://opf-proto.cst.cnes.fr/mapserver/",
        type: "WMS",
        time: '2017-01-01T00:00:00.000Z',
        background: false
      })
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
  }

  processLuminoMessage(msg) {
    console.log("processLuminoMessage", msg)
    super.processLuminoMessage(msg);
  }
}
