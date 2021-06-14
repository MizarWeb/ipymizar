
const L = require('../leaflet.js');
const control = require('./Control.js');

export class MizarZoomControlModel extends control.MizarControlModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarZoomControlView',
      _model_name: 'MizarZoomControlModel',
      zoom_in_text: '+',
      zoom_in_title: 'Zoom in',
      zoom_out_text: '-',
      zoom_out_title: 'Zoom out'
    };
  }
}

export class MizarZoomControlView extends control.MizarControlView {
  initialize(parameters) {
    super.initialize(parameters);
    this.map_view = this.options.map_view;
  }

  create_obj() {
    this.obj = L.control.zoom(this.get_options());
  }
}
