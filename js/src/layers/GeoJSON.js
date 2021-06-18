
const Mizar = require('regards-mizar').default
const layer = require('./Layer.js');

export class MizarGeoJSONLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarGeoJSONLayerView',
      _model_name: 'MizarGeoJSONLayerModel',
      data: {},
      style: {},
      // strokeColor: '',
      // strokeWidth: '',
    };
  }
}

export class MizarGeoJSONLayerView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    const options = {
      ...basicOptions,
      type: Mizar.LAYER.GeoJSON,
      style: this.model.get('style')
    }
    console.log("GEOSJON LAHYER conf", options)
    mizarMap.addLayer(options, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
      this.addFeatures()
    })
  }

  addFeatures() {
    const data = this.model.get('data')
    this.obj.addFeatureCollection(data)
  }

  model_events() {
    // this.listenTo(
    //   this.model,
    //   'change:style',
    //   function () {
    //     this.obj.setStyle(this.model.get('style'));
    //   },
    //   this
    // );
    this.listenTo(
      this.model,
      'change:data',
      function () {
        this.obj.removeAllFeatures()
        this.addFeatures()
      },
      this
    );
  }
}
