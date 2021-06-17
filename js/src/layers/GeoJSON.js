
const Mizar = require('regards-mizar').default
const layer = require('./Layer.js');

export class MizarGeoJSONModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarGeoJSONView',
      _model_name: 'MizarGeoJSONModel',
      data: {},
      // style: {},
      strokeColor: '',
      strokeWidth: '',
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
      style: {
        strokeColor: this.model.get('strokeColor'),
        strokeWidth: this.model.get('strokeWidth'),
        // ...this.model.get('style')
      }
    }, (layerId) => {
      // store layer
      this.obj = this.objMap.getLayerByID(layerId)
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
