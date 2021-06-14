
const L = require('../leaflet.js');
const featuregroup = require('./FeatureGroup.js');

export class MizarGeoJSONModel extends featuregroup.MizarFeatureGroupModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarGeoJSONView',
      _model_name: 'MizarGeoJSONModel',
      data: {},
      style: {},
      hover_style: {},
      point_style: {}
    };
  }
}

export class MizarGeoJSONView extends featuregroup.MizarFeatureGroupView {
  create_obj() {
    var style = feature => {
      const model_style = this.model.get('style');
      const feature_style = feature.properties.style || {};
      return {
         ...feature_style,
         ...model_style
      };
    };

    var options = {
      style: style,
      onEachFeature: (feature, layer) => {
        var mouseevent = e => {
          if (e.type == 'mouseover') {
            layer.setStyle(this.model.get('hover_style'));
            layer.once('mouseout', () => {
              this.obj.resetStyle(layer);
            });
          }
          this.send({
            event: e.type,
            feature: feature,
            properties: feature.properties,
            id: feature.id
          });
        };
        layer.on({
          mouseover: mouseevent,
          click: mouseevent
        });
      }
    };

    var point_style = this.model.get('point_style');

    if (Object.keys(point_style).length !== 0) {
      options.pointToLayer = function(feature, latlng) {
        return new L.CircleMarker(latlng, point_style);
      };
    }

    this.obj = L.geoJson(this.model.get('data'), options);
  }

  model_events() {
    this.listenTo(
      this.model,
      'change:style',
      function() {
        this.obj.setStyle(this.model.get('style'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:data',
      function() {
        this.obj.clearLayers();
        this.obj.addData(this.model.get('data'));
      },
      this
    );
  }
}
