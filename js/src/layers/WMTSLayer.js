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
      time: '',
    };
  }
}
export class MizarWMTSLayerView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    console.log("layers", this.model.get('layers'))
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.WTMS,
      layers: this.model.get('layers'),
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
    })
    console.log("WMTS layer", this.obj)
  }
}
