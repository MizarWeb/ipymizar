
// const L = require('../leaflet.js');
const tilelayer = require('./TileLayer.js');
// const proj = require('../projections.js');
const Mizar = require('regards-mizar').default

export class MizarWMSLayerModel extends tilelayer.MizarTileLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarWMSLayerView',
      _model_name: 'MizarWMSLayerModel',
      url: '',
      //Layers to display on map. Value is a comma-separated list of layer names.
      layers: '',
      transparent: false,
      format: "image/jpeg",
      time: '',
      numberOfLevels: 21,
      tilePixelSize: 256,
      restrictTo: null,
    };
  }
}

export class MizarWMSLayerView extends tilelayer.MizarTileLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()

    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.WMS,
      url: this.model.get('url'),
      layers: this.model.get('layers'),
      transparent: this.model.get('transparent'),
      restrictTo: this.model.get('restrictTo'),
      tilePixelSize: this.model.get('tilePixelSize'),
      numberOfLevels: this.model.get('numberOfLevels'),
      time: this.model.get('time'),
      format: this.model.get('format'),
    }, (layerId) => {
      // store layer
      this.obj = this.objMap.getLayerByID(layerId)
    })
  }

  model_events() {
    super.model_events();

  }
}
