
const Mizar = require('regards-mizar').default
const layer = require('./Layer.js');

export class MizarGeoJSONModel extends layer.MizarLayerModel {
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

export class MizarGeoJSONView extends layer.MizarLayerView {
  create_obj() {
    const mizarMap = this.map_view.obj
    const basicOptions = this.getBasicConf()
    mizarMap.addLayer({
      ...basicOptions,
      type: Mizar.LAYER.GeoJSON,
      style: this.model.get('style')
    }, (layerId) => {
      // store layer
      this.obj = mizarMap.getLayerByID(layerId)
      this.obj.addFeatureCollection(this.model.get('data'))
    })
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
        this.obj.addFeatureCollection(this.model.get('data'))
      },
      this
    );
  }
}
