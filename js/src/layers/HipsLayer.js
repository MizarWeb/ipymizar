

const layer = require('./Layer.js');
const Mizar = require('regards-mizar').default

export class MizarHipsLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarHipsLayerView',
      _model_name: 'MizarHipsLayerModel',
    };
  }
}

export class MizarHipsLayerView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.Hips,
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
    })
  }
}
