
// const L = require('../leaflet.js');
const tilelayer = require('./TileLayer.js');
// const proj = require('../projections.js');

export class MizarWMSLayerModel extends tilelayer.MizarTileLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarWMSLayerView',
      _model_name: 'MizarWMSLayerModel',
      layers: '',
      styles: '',
      format: 'image/jpeg',
      transparent: false,
      crs: null,
      uppercase: false
    };
  }
}

export class MizarWMSLayerView extends tilelayer.MizarTileLayerView {
  create_obj() {
    this.obj = L.tileLayer.wms(this.model.get('url'), {
      ...this.get_options(),
      crs: proj.getProjection(this.model.get('crs')),
    });
  }

  model_events() {
    super.model_events();

    for (var option in this.get_options()) {
      this.model.on('change:' + option, () => {
        this.obj.setParams(this.get_options(), true);
        this.obj.refresh();
      });
    }
  }
}
