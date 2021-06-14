
const widgets = require('@jupyter-widgets/base');

function camel_case(input) {
  // Convert from foo_bar to fooBar
  return input.toLowerCase().replace(/_(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
}

export class MizarWidgetView extends widgets.WidgetView {}
export class MizarDOMWidgetView extends widgets.DOMWidgetView {}

class mizarViewCommon {
  get_options() {
    var o = this.model.get('options');
    var options = {};
    var key;
    for (var i = 0; i < o.length; i++) {
      key = o[i];
      // Convert from foo_bar to fooBar that Mizar.js uses
      options[camel_case(key)] = this.model.get(key);
    }
    return options;
  }
}

function applyMixins(derivedCtor, baseCtors) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

applyMixins(MizarWidgetView, [mizarViewCommon]);
applyMixins(MizarDOMWidgetView, [mizarViewCommon]);
