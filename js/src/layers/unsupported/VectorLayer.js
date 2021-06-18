
const layer = require('../Layer.js');

export class MizarVectorLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarVectorLayerView',
      _model_name: 'MizarVectorLayerModel'
    };
  }
}

export class MizarVectorLayerView extends layer.MizarLayerView { }
