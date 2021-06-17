
const layer = require('./Layer.js');

export class MizarRasterLayerModel extends layer.MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarRasterLayerView',
      _model_name: 'MizarRasterLayerModel',
      visible: true
    };
  }
}

export class MizarRasterLayerView extends layer.MizarLayerView {
  model_events() {
    super.model_events();
    this.listenTo(
      this.model,
      'change:opacity',
      function() {
        if (this.model.get('visible')) {
          this.obj.setOpacity(this.model.get('opacity'));
        }
      },
      this
    );
    this.listenTo(
      this.model,
      'change:visible',
      function() {
        this.obj.setVisible(this.model.get('visible'));
        // if (this.model.get('visible')) {
        //   this.obj.setOpacity(this.model.get('opacity'));
        // } else {
        //   this.obj.setOpacity(0);
        // }
      },
      this
    );

    // if (this.model.get('visible')) {
    //   this.obj.setOpacity(this.model.get('opacity'));
    // } else {
    //   this.obj.setOpacity(0);
    // }
  }
}
