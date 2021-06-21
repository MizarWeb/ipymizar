const layer = require('./Layer.js');
const Mizar = require('regards-mizar').default

export class MizarWMTSLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarWMTSLayerView',
      _model_name: 'MizarWMTSLayerModel',
      // Layers to display on map. Value is a comma-separated list of layer names.
      layers: '',
      format: "image/jpeg",
      transparent: false,
    };
  }
}
export class MizarWMTSLayerView extends layer.MizarLayerView {
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
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.WMTS,
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
    })
  }
}
