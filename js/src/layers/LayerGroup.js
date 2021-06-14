
const widgets = require('@jupyter-widgets/base');
// const L = require('../leaflet.js');
const layer = require('./Layer.js');

export class MizarLayerGroupModel extends layer.MizarLayerModel {
  defaults() {
    return {
      _view_name: 'MizarLayerGroupView',
      _model_name: 'MizarLayerGroupModel',
      layers: []
    };
  }
}

MizarLayerGroupModel.serializers = {
  ...widgets.WidgetModel.serializers,
  layers: { deserialize: widgets.unpack_models }
};

export class MizarLayerGroupView extends layer.MizarLayerView {
  create_obj() {
    this.obj = L.layerGroup();
    this.layer_views = new widgets.ViewList(
      this.add_layer_model,
      this.remove_layer_view,
      this
    );
    this.layer_views.update(this.model.get('layers'));
  }

  remove_layer_view(child_view) {
    this.obj.removeLayer(child_view.obj);
    child_view.remove();
  }

  add_layer_model(child_model) {
    return this.create_child_view(child_model).then(child_view => {
      this.obj.addLayer(child_view.obj);
      return child_view;
    });
  }

  model_events() {
    this.listenTo(
      this.model,
      'change:layers',
      function() {
        this.layer_views.update(this.model.get('layers'));
      },
      this
    );
  }
}
