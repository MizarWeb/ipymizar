
const widgets = require('@jupyter-widgets/base');
// const L = require('../leaflet.js');
const utils = require('../utils.js');

export class MizarControlModel extends widgets.WidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarControlView',
      _model_name: 'MizarControlModel',
      _view_module: 'jupyter-mizar',
      _model_module: 'jupyter-mizar',
      options: [],
      position: 'topleft'
    };
  }
}

export class MizarControlView extends utils.MizarWidgetView {
  initialize(parameters) {
    super.initialize(parameters);
    this.map_view = this.options.map_view;
  }

  render() {
    return Promise.resolve(this.create_obj()).then(() => {
      this.mizar_events();
      this.model_events();
    });
  }

  mizar_events() {}

  model_events() {
    var key;
    var o = this.model.get('options');
    for (var i = 0; i < o.length; i++) {
      key = o[i];
      this.listenTo(
        this.model,
        'change:' + key,
        function() {
          L.setOptions(this.obj, this.get_options());
        },
        this
      );
    }
  }
}
