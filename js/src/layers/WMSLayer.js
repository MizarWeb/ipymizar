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
    };
  }
}
export class MizarWMSLayerView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    if (this.model.has('transparent')) {
      basicOptions.transparent = this.model.get('transparent')
    }
    if (this.model.has('format')) {
      basicOptions.format = this.model.get('format')
    }
    if (this.model.has('layers')) {
      basicOptions.layers = this.model.get('layers')
    }
    // if (this.model.has('time')) {
    //   basicOptions.time = this.model.get('time')
    // }
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.WMS,
      autoFillTimeTravel: true
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
    })
  }
}
