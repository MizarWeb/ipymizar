
// const L = require('../leaflet.js');
const Mizar = require('regards-mizar').default
const tilelayer = require('./TileLayer.js');
// const proj = require('../projections.js');

export class MizarWMSLayerModel extends tilelayer.MizarTileLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarWMSLayerView',
      _model_name: 'MizarWMSLayerModel',
      // layers: '',
      // styles: '',
      // format: 'image/jpeg',
      // transparent: false,
      // crs: null,
      // uppercase: false
    };
  }
}

export class MizarWMSLayerView extends tilelayer.MizarTileLayerView {
  create_obj() {
    console.error("Create obj")
    console.error(this.map_view)
    console.error(this.map_view.obj)
    console.error("Add WMS layer")
    const mizarMap = this.map_view.obj;
    const layer_id = mizarMap.addLayer({
      type: Mizar.LAYER.WMS,
      baseUrl: this.model.get('url'),
      background: true
    });
    console.error(layer_id)
    this.obj = mizarMap.getLayerById(layer_id)
    // mizarMap.addLayer({
    //   type: Mizar.LAYER.WMS,
    //   baseUrl: this.model.get('url'),
    //   background: true
    // }, (whatever) => {
    //   // Store layer pointer
    //   this.obj = this.mizarMap.getLayerById(whatever)
    // })
    console.error(this.obj)
  }
  //   this.obj = L.tileLayer.wms(this.model.get('url'), {
  //     ...this.get_options(),
  //     crs: proj.getProjection(this.model.get('crs')),
  //   });
  // }

  model_events() {
    super.model_events();

    // for (var option in this.get_options()) {
    //   this.model.on('change:' + option, () => {
    //     this.obj.setParams(this.get_options(), true);
    //     this.obj.refresh();
    //   });
    // }
  }
}
