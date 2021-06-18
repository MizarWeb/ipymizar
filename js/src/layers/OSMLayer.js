
const layer = require('./Layer.js');
const Mizar = require('regards-mizar').default

export class MizarOSMLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarOSMLayerView',
      _model_name: 'MizarOSMLayerModel',
      url: '',
    };
  }
}

export class MizarOSMLayerView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.OSM,
      baseUrl: this.model.get('url'),
      background: this.model.get('background'),
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
    })
  }
}
