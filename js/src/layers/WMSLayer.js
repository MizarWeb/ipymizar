const layer = require('./Layer.js');
const Mizar = require('regards-mizar').default

export class MizarWMSLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarWMSLayerView',
      _model_name: 'MizarWMSLayerModel',
      // Layers to display on map. Value is a comma-separated list of layer names.
      layers: '',
      format: "image/jpeg",
      transparent: false,
      time: ''
    };
  }
}
export class MizarWMSLayerView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.WMS,
      layers: this.model.get('layers')
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
    })
  }
}
