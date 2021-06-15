
const widgets = require('@jupyter-widgets/base');
// const L = require('./leaflet.js');
const Mizar = require('regards-mizar').default
const utils = require('./utils.js');
// const proj = require('./projections.js');

const DEFAULT_LOCATION = [0.0, 0.0];


export class MizarPlanetModel extends widgets.DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarPlanetView',
      _model_name: 'MizarPlanetModel',
      _model_module: 'jupyter-mizar',
      _view_module: 'jupyter-mizar',
      center: DEFAULT_LOCATION,
      zoom_start: 12,
      zoom: 12,
      max_zoom: 18,
      min_zoom: 1,
      dragging: true,
      touch_zoom: true,
      zoom_delta: 1,
      zoom_snap: 1,
      scroll_wheel_zoom: false,
      double_click_zoom: true,
      box_zoom: true,
      tap: true,
      tap_tolerance: 15,
      world_copy_jump: false,
      bounce_at_zoom_limits: true,
      keyboard: true,
      keyboard_pan_offset: 80,
      keyboard_zoom_offset: 1,
      inertia: true,
      inertia_deceleration: 3000,
      inertia_max_speed: 1500,
      zoom_animation_threshold: 4,
      south: DEFAULT_LOCATION[0],
      north: DEFAULT_LOCATION[0],
      east: DEFAULT_LOCATION[1],
      west: DEFAULT_LOCATION[1],
      bottom: 0,
      top: 9007199254740991,
      right: 0,
      left: 9007199254740991,
      options: [],
      layers: [],
      controls: [],
      crs: {
        name: 'EPSG3857',
        custom: false
      },
      _dragging: false,

      // For the dummy image
      src: 'https://lagranderecre-lagranderecre-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/0/0/ae8adfc9a2047079049f1c0410e37c32f5e882ad_IMG-PRODUCT-828315-2.jpeg',
      width: 500,
      height: 500
    };
  }

  initialize(attributes, options) {
    super.initialize(attributes, options);
    this.set('window_url', window.location.href);
  }
}

MizarPlanetModel.serializers = {
  ...widgets.DOMWidgetModel.serializers,
  layers: { deserialize: widgets.unpack_models },
  controls: { deserialize: widgets.unpack_models },
};

export class MizarPlanetView extends utils.MizarDOMWidgetView {
  initialize(options) {
    super.initialize(options);
    // The dirty flag is used to prevent sub-pixel center changes
    // computed by leaflet to be applied to the model.
    this.dirty = false;
  }

  remove_layer_view(child_view) {
    this.obj.removeLayer(child_view.obj);
    child_view.remove();
  }

  add_layer_model(child_model) {
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
    this.obj.removeControl(child_view.obj);
    child_view.remove();
  }

  add_control_model(child_model) {
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
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('mizar-widgets');
    this.map_container = document.createElement('canvas');
    this.map_container.setAttribute("id", 'mizar-' + new Date().getTime());
    this.model.on('change:width', this._onWidthChanged, this);
    this.model.on('change:height', this._onHeightChanged, this);

    this.el.appendChild(this.map_container);

    let mizarOptions = {
      // the canvas ID where Mizar is inserted
      canvas: this.map_container,
      // define a planet context
      planetContext: {
        // the CRS of the Earth
        coordinateSystem: {
          geoideName: 'CRS:84',
        },
      },
    }

    new Mizar(mizarOptions)
    // this.layer_views = new widgets.ViewList(
    //   this.add_layer_model,
    //   this.remove_layer_view,
    //   this
    // );
    // this.control_views = new widgets.ViewList(
    //   this.add_control_model,
    //   this.remove_control_view,
    //   this
    // );
    // this.displayed.then(this.render_mizar.bind(this));
  }

  // For the dummy image
  _onWidthChanged() {
    console.log("WOUALOU")
    console.log(this.model.get('width'))
    this.img_container.width = this.model.get('width');
  }
  _onHeightChanged() {
    this.img_container.height = this.model.get('height');
  }

  render_mizar() {
    this.create_obj().then(() => {
      this.layer_views.update(this.model.get('layers'));
      this.control_views.update(this.model.get('controls'));
      this.mizar_events();
      this.model_events();

      return this;
    });
  }

  create_obj() {
    return this.layoutPromise.then(() => {
      var options = {
        ...this.get_options(),
        crs: proj.getProjection(this.model.get('crs')),
        zoomControl: false,
      };
      this.obj = L.map(this.map_container, options);
    });
  }

  mizar_events() {
    this.obj.on('moveend', e => {
      if (!this.dirty) {
        this.dirty = true;
        var c = e.target.getCenter();
        this.model.set('center', [c.lat, c.lng]);
        this.dirty = false;
      }
      this.model.set('_dragging', false);
    });

    this.obj.on('movestart', () => {
      this.model.set('_dragging', true);
    });

    this.obj.on('zoomend', e => {
      if (!this.dirty) {
        this.dirty = true;
        var z = e.target.getZoom();
        this.model.set('zoom', z);
        this.dirty = false;
      }
    });

    this.obj.on(
      'click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu preclick',
      event => {
        this.send({
          event: 'interaction',
          type: event.type,
          coordinates: [event.latlng.lat, event.latlng.lng],
          location: this.model.get('location')
        });
      }
    );

    this.obj.on('fullscreenchange', () => {
      this.model.set('fullscreen', this.obj.isFullscreen());
    });
  }

  model_events() {
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
        this.layer_views.update(this.model.get('layers'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:controls',
      function () {
        this.control_views.update(this.model.get('controls'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:zoom',
      function () {
        if (!this.dirty) {
          this.dirty = true;
          // Using flyTo instead of setZoom to adjust for potential
          // sub-pixel error in leaflet object's center.
          //
          // Disabling animation on updates from the model because
          // animation triggers a `moveend` event in an animationFrame,
          // which causes the center to bounce despite of the dirty flag
          // which is set back to false synchronously.
          this.obj.flyTo(this.model.get('center'), this.model.get('zoom'), {
            animate: false
          });
          this.dirty = false;
        }
      },
      this
    );
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
