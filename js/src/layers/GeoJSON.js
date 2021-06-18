
const Mizar = require('regards-mizar').default
const layer = require('./Layer.js');

export class MizarGeoJSONLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarGeoJSONLayerView',
      _model_name: 'MizarGeoJSONLayerModel',
      visible: true,
      data: {},
      style: {},
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
      style: this.model.get('style'),
    }
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
    this.listenTo(
      this.model,
      'change:style',
      function () {
        const style = this.model.get('style')
        if (style.extrusionScale) {
          this.obj.style.setExtrusionScale(style.extrusionScale)
        }
        if (style.fill) {
          this.obj.style.setFill(style.fill)
        }
        if (style.fillColor) {
          this.obj.style.setFillColor(style.fillColor)
        }
        if (style.fillShader) {
          this.obj.style.setFillShader(style.fillShader)
        }
        if (style.fillTexture) {
          this.obj.style.setFillTexture(style.fillTexture)
        }
        if (style.fillTextureURL) {
          this.obj.style.setFillTextureURL(style.fillTextureURL)
        }
        if (style.icon) {
          this.obj.style.setIcon(style.icon)
        }
        if (style.iconURL) {
          this.obj.style.setIconURL(style.iconURL)
        }
        if (style.label) {
          this.obj.style.setLabel(style.label)
        }
        if (style.onTerrain) {
          this.obj.style.setOnTerrain(style.onTerrain)
        }
        if (style.opacity) {
          this.obj.style.setOpacity(style.opacity)
        }
        if (style.pointMaxSize) {
          this.obj.style.setPointMaxSize(style.pointMaxSize)
        }
        if (style.strokeColor) {
          this.obj.style.setStrokeColor(style.strokeColor)
        }
        if (style.strokeWidth) {
          this.obj.style.setStrokeWidth(style.strokeWidth)
        }
        if (style.textColor) {
          this.obj.style.setTextColor(style.textColor)
        }
        if (style.zIndex) {
          this.obj.style.setZIndex(style.zIndex)
        }
      },
      this
    );
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
