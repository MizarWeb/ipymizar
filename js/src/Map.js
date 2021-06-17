
const widgets = require('@jupyter-widgets/base');
// const L = require('./leaflet.js');
const Mizar = require('regards-mizar').default
const utils = require('./utils.js');
// const proj = require('./projections.js');

const DEFAULT_LOCATION = [0.0, 0.0];

// const CRS_TO_CONTEXT = {
//   Equatorial: "Sky",
//   Galactic: "Sky",
//   "CRS:84": "Planet",
//   "IAU2000:49901": "Planet",
//   "IAU2000:49900": "Planet",
//   "IAU2000:30101": "Planet",
//   "IAU2000:30100": "Planet",
//   HorizontalLocal: "Ground",
//   "IAU:Sun": "Planet"
// };

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
      zoom: [0.0, 0.0] // can also be a tuple with three elements, the last one being the distance
      // center: DEFAULT_LOCATION,
      // zoom_start: 12,
      // zoom: 12,
      // max_zoom: 18,
      // min_zoom: 1,
      // dragging: true,
      // touch_zoom: true,
      // zoom_delta: 1,
      // zoom_snap: 1,
      // scroll_wheel_zoom: false,
      // double_click_zoom: true,
      // box_zoom: true,
      // tap: true,
      // tap_tolerance: 15,
      // world_copy_jump: false,
      // bounce_at_zoom_limits: true,
      // keyboard: true,
      // keyboard_pan_offset: 80,
      // keyboard_zoom_offset: 1,
      // inertia: true,
      // inertia_deceleration: 3000,
      // inertia_max_speed: 1500,
      // zoom_animation_threshold: 4,
      // south: DEFAULT_LOCATION[0],
      // north: DEFAULT_LOCATION[0],
      // east: DEFAULT_LOCATION[1],
      // west: DEFAULT_LOCATION[1],
      // bottom: 0,
      // top: 9007199254740991,
      // right: 0,
      // left: 9007199254740991,
      // options: [],
      // layers: [],
      // crs: {
      //   name: 'EPSG3857',
      //   custom: false
      // },
      // _dragging: false,
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
    // The dirty flag is used to prevent sub-pixel center changes
    // computed by leaflet to be applied to the model.
    this.dirty = false;
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

  remove_control_view(child_view) {
    console.error("remove_control_view")
    this.obj.removeControl(child_view.obj);
    child_view.remove();
  }

  add_control_model(child_model) {
    console.error("add_control_model")
    return this.create_child_view(child_model, {
      map_view: this
    }).then(view => {
      this.obj.addControl(view.obj);

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
    this.map_container.addEventListener("mousewheel", function(event) {
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
    this.control_views = new widgets.ViewList(
      this.add_control_model,
      this.remove_control_view,
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
      this.mizar_events();
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

  mizar_events() {
    console.log("mizar_events")
    // this.obj.on('moveend', e => {
    //   console.log("moveend")
    //   if (!this.dirty) {
    //     this.dirty = true;
    //     var c = e.target.getCenter();
    //     this.model.set('center', [c.lat, c.lng]);
    //     this.dirty = false;
    //   }
    //   this.model.set('_dragging', false);
    // });

    // this.obj.on('movestart', () => {
    //   console.log("movestart")
    //   this.model.set('_dragging', true);
    // });

    // this.obj.on('zoomend', e => {
    //   console.log("zoomend")
    //   if (!this.dirty) {
    //     this.dirty = true;
    //     var z = e.target.getZoom();
    //     this.model.set('zoom', z);
    //     this.dirty = false;
    //   }
    // });

    // this.obj.on(
    //   'click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu preclick',
    //   event => {
    //     console.log("click ...")
    //     this.send({
    //       event: 'interaction',
    //       type: event.type,
    //       coordinates: [event.latlng.lat, event.latlng.lng],
    //       location: this.model.get('location')
    //     });
    //   }
    // );

    // this.obj.on('fullscreenchange', () => {
    //   console.log("fullscreenchange")
    //   this.model.set('fullscreen', this.obj.isFullscreen());
    // });
  }

  model_events() {
    console.log("model_events")
    var key;
    var o = this.model.get('options');
    for (var i = 0; i < o.length; i++) {
      key = o[i];
      this.listenTo(
        this.model,
        'change:' + key,
        function () {
          L.setOptions(this.obj, this.get_options());
        },
        this
      );
    }
    this.listenTo(this.model, 'msg:custom', this.handle_msg, this);
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
          this.dirty = true;
          console.log("change:zoom")
          // get the navigation object
          var nav = this.obj.getActivatedContext().getNavigation();

          var zoom = this.model.get('zoom')
          var options = {};
          switch (zoom.length) {
            case 2:
              var geoPos = zoom
              break;
            case 3:
              var geoPos = zoom.slice(0, 2);
              options.distance = zoom.slice(-1)[0];
              break;
            default:
              console.error(`Hay un problema con el zoom`);
          }
          nav.zoomTo(geoPos, options);
          this.dirty = false;
        }
      },
      this
    );
    // this.listenTo(
    //   this.model,
    //   'change:zoom',
    //   function () {
    //     if (!this.dirty) {
    //       this.dirty = true;
    //       console.log("change:zoom")
    //       // Using flyTo instead of setZoom to adjust for potential
    //       // sub-pixel error in leaflet object's center.
    //       //
    //       // Disabling animation on updates from the model because
    //       // animation triggers a `moveend` event in an animationFrame,
    //       // which causes the center to bounce despite of the dirty flag
    //       // which is set back to false synchronously.
    //       this.obj.flyTo(this.model.get('center'), this.model.get('zoom'), {
    //         animate: false
    //       });
    //       this.dirty = false;
    //     }
    //   },
    //   this
    // );
    this.listenTo(
      this.model,
      'change:center',
      function () {
        if (!this.dirty) {
          this.dirty = true;
          this.obj.panTo(this.model.get('center'));
          this.dirty = false;
        }
      },
      this
    );
  }

  handle_msg(content) {
    switch (content.method) {
      case 'foo':
        break;
    }
  }

  processLuminoMessage(msg) {
    console.log("processLuminoMessage", msg)
    super.processLuminoMessage(msg);
    switch (msg.type) {
      case 'resize':
        // We set the dirty flag to true to prevent the sub-pixel error
        // on the new center to be reflected on the model.
        this.dirty = true;
        // On the pan option:
        // `pan=true`  causes the center to be unchanged upon resize (up
        // to sub-pixel differences)
        // `pan=false` corresponds to having to top-left corner
        // unchanged.
        this.obj.invalidateSize({
          animate: false,
          pan: true
        });
        this.dirty = false;
        break;
      case 'after-show':
        this.dirty = true;
        this.obj.invalidateSize({
          animate: false,
          pan: true
        });
        this.dirty = false;
        break;
    }
  }
}
