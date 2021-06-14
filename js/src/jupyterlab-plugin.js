
var jupyter_mizar = require('./index');

var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'jupyter.extensions.jupyter-mizar',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
    widgets.registerWidget({
      name: 'jupyter-mizar',
      version: jupyter_mizar.version,
      exports: jupyter_mizar
    });
  },
  autoStart: true
};
