
const widgets = require('@jupyter-widgets/base');
// const PMessaging = require('@lumino/messaging');
// const PWidgets = require('@lumino/widgets');
// const L = require('../leaflet.js');
const utils = require('../utils.js');
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
      name: '',
      background: true,
      visible: true,
      attribution: '',
      copyright_url: '',
      url: '',
    };
  }
}

MizarLayerModel.serializers = {
  ...widgets.WidgetModel.serializers,
};



export class MizarLayerView extends utils.MizarWidgetView {
  initialize(parameters) {
    super.initialize(parameters);
    this.map_view = this.options.map_view;
  }

  render() {
    return Promise.resolve(this.create_obj()).then(() => {
      this.model_events();
    });
  }

  /**
   * Return the configuration related to any Mizar layer
   */
  getBasicConf() {
    const conf = {}
    if (this.model.get('crs')) {
      conf.crs = this.model.get('crs')
    }
    conf.opacity = this.model.has('opacity') ? this.model.get('opacity') * 100 : 100
    if (this.model.has('background')) {
      conf.background = this.model.get('background')
    }
    if (this.model.has('visible')) {
      conf.visible = this.model.get('visible')
    }
    if (this.model.get('attribution')) {
      conf.attribution = this.model.get('attribution')
    }
    if (this.model.get('copyright_url')) {
      conf.copyright_url = this.model.get('copyright_url')
    }
    if (this.model.get('url')) {
      conf.baseUrl = this.model.get('url')
    }
    return conf
  }

  model_events() {
    this.listenTo(
      this.model,
      'change:opacity',
      function() {
        console.error("OPACITY CHANGE")
        console.log("this.obj", this.obj)
        this.obj.setOpacity(this.model.get('opacity'));
      },
      this
    );
  }
}



export class MizarUILayerModel extends MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarUILayerView',
      _model_name: 'MizarUILayerModel',
    };
  }
}
