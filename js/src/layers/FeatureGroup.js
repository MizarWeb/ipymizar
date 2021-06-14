
const L = require('../leaflet.js');
const layergroup = require('./LayerGroup.js');

export class MizarFeatureGroupModel extends layergroup.MizarLayerGroupModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarFeatureGroupView',
      _model_name: 'MizarFeatureGroupModel'
    };
  }
}

export class MizarFeatureGroupView extends layergroup.MizarLayerGroupView {
  create_obj() {
    this.obj = L.featureGroup();
  }
}
