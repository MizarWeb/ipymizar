
const widgets = require('@jupyter-widgets/base');
// const PMessaging = require('@lumino/messaging');
// const PWidgets = require('@lumino/widgets');
// const L = require('../leaflet.js');
// const utils = require('../utils.js');
// const Mizar = require('regards-mizar').default

export class MizarLayerModel extends widgets.WidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarLayerView',
      _model_name: 'MizarLayerModel',
      _view_module: 'jupyter-mizar',
      _model_module: 'jupyter-mizar',
      crs: '',
      opacity: 1.0,
      background: false
    };
  }
}

MizarLayerModel.serializers = {
  ...widgets.WidgetModel.serializers,
  popup: { deserialize: widgets.unpack_models }
};

export class MizarUILayerModel extends MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarUILayerView',
      _model_name: 'MizarUILayerModel'
    };
  }
  /**
   * Return the configuration related to any Mizar layer
   */
  getBasicConf() {
    const conf = {}
    if (this.model.get('crs')) {
      conf.crs = this.model.get('crs')
    }
    if (this.model.get('opacity')) {
      conf.crs = this.model.get('opacity')
    }
    if (this.model.get('background')) {
      conf.crs = this.model.get('background')
    }
    return conf
  }
}
