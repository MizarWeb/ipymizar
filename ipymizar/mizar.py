import copy

from ipywidgets import (
    Widget, DOMWidget, CallbackDispatcher, widget_serialization,
)

from traitlets import (
    CFloat, Float, Unicode, Tuple, List, Instance, Bool, Dict,
    default, observe, validate, TraitError, Union
)

from ._version import EXTENSION_VERSION


class LayerException(TraitError):
    """Custom LayerException class."""
    pass


class OSMLayer(Widget):
    _view_name = Unicode('MizarOSMLayerView').tag(sync=True)
    _model_name = Unicode('MizarOSMLayerModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # Some properties extracted from 'AbstractLayer configuration'
    # Should be the same for each layer.
    name = Unicode().tag(sync=True)
    attribution = Unicode().tag(sync=True)
    copyright_url = Unicode().tag(sync=True)
    background = Bool(True).tag(sync=True)
    visible = Bool(True).tag(sync=True)
    opacity = Float(1.0, min=0.0, max=1.0).tag(sync=True)

    # Some specific properties of this layer
    url = Unicode('https://c.tile.openstreetmap.org').tag(sync=True)


class WMSLayer(Widget):
    _view_name = Unicode('MizarWMSLayerView').tag(sync=True)
    _model_name = Unicode('MizarWMSLayerModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # Some properties extracted from 'AbstractLayer configuration'
    # Should be the same for each layer.
    name = Unicode().tag(sync=True)
    attribution = Unicode().tag(sync=True)
    copyright_url = Unicode().tag(sync=True)
    background = Bool(True).tag(sync=True)
    visible = Bool(True).tag(sync=True)
    opacity = Float(1.0, min=0.0, max=1.0).tag(sync=True)

    # Some specific properties of this layer
    url = Unicode('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').tag(sync=True)
    layers = Unicode(doc="Layers to display on map. Value is a comma-separated list of layer names.").tag(sync=True)
    format = Unicode('image/jpeg', doc="Format for the map output").tag(sync=True)
    transparent = Bool(False, doc="Whether the map background should be transparent. Default is false").tag(sync=True)
    time = Unicode().tag(sync=True)


class HipsLayer(Widget):
    _view_name = Unicode('MizarHipsLayerView').tag(sync=True)
    _model_name = Unicode('MizarHipsLayerModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # Some properties extracted from 'AbstractLayer configuration'
    # Should be the same for each layer.
    name = Unicode().tag(sync=True)
    attribution = Unicode().tag(sync=True)
    copyright_url = Unicode().tag(sync=True)
    background = Bool(True).tag(sync=True)
    visible = Bool(True).tag(sync=True)

    # Some style properties
    opacity = Float(1.0, min=0.0, max=1.0).tag(sync=True)

    # Some specific properties of this layer
    url = Unicode('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').tag(sync=True)


class GeoJSONLayer(Widget):
    _view_name = Unicode('MizarGeoJSONLayerView').tag(sync=True)
    _model_name = Unicode('MizarGeoJSONLayerModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # Some properties extracted from 'AbstractLayer configuration'
    # Should be the same for each layer.
    name = Unicode().tag(sync=True)
    attribution = Unicode().tag(sync=True)
    copyright_url = Unicode().tag(sync=True)
    background = Bool(False).tag(sync=True)
    visible = Bool(True).tag(sync=True)
    opacity = Float(1.0, min=0.0, max=1.0).tag(sync=True)
    style = Dict().tag(sync=True)

    # Some specific properties of this layer
    url = Unicode().tag(sync=True)
    data = Dict().tag(sync=True)

    @observe("data")
    def _update_data(self, change):
        # We need to make a deep copy for ipywidgets to see the change
        self.data = copy.deepcopy(self.data)


class CRS:
    Equatorial = "Equatorial"
    Galactic = "Galactic"
    WGS84 = "CRS:84"
    Mars_2000 = "IAU2000:49901"
    Mars_2000_old = "IAU2000:49900"
    Moon_2000 = "IAU2000:30101"
    Moon_2000_old = "IAU2000:30100"
    HorizontalLocal = "HorizontalLocal"
    Sun = "IAU:Sun"


class MizarMap(DOMWidget):
    """Map class.

    The Map class is the main widget in ipymizar.

    Attributes
    ----------
    layers: list of Layer instances
        The list of layers that are currently on the map.
    controls: list of Control instances
        The list of controls that are currently on the map.
    zoom: float, default 12
        The current zoom value of the map.
    zoom_delta: float, default 1
        Controls how much the map’s zoom level will change after
        pressing + or - on the keyboard, or using the zoom controls.
    crs: projection, default projections.EPSG3857
        Coordinate reference system, which can be ‘Earth’, ‘EPSG3395’, ‘EPSG3857’,
        ‘EPSG4326’, ‘Base’, ‘Simple’ or user defined projection.
    """

    _view_name = Unicode('MizarMapView').tag(sync=True)
    _model_name = Unicode('MizarMapModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # URL of the window where the map is displayed
    window_url = Unicode(read_only=True).tag(sync=True)

    crs = Unicode(CRS.WGS84).tag(sync=True)
    zoom = Union(
        (
            Tuple(CFloat(), CFloat(), CFloat()),
            Tuple(CFloat(), CFloat()),
        ),
        default_value=(0, 0)
    ).tag(sync=True)

    options = List(trait=Unicode()).tag(sync=True)

    # zoom_control = Bool(True)

    # layers = Tuple().tag(trait=Instance(Layer), sync=True, **widget_serialization)
    layers = Tuple().tag(sync=True, **widget_serialization)

    @default('options')
    def _default_options(self):
        return [name for name in self.traits(o=True)]

    def __init__(self, **kwargs):
        super(MizarMap, self).__init__(**kwargs)
        self.on_msg(self._handle_mizar_event)

    _layer_ids = List()

    @validate('layers')
    def _validate_layers(self, proposal):
        '''Validate layers list.

        Makes sure only one instance of any given layer can exist in the
        layers list.
        '''
        self._layer_ids = [layer.model_id for layer in proposal.value]
        if len(set(self._layer_ids)) != len(self._layer_ids):
            raise LayerException('duplicate layer detected, only use each layer once')
        return proposal.value

    def add_layer(self, layer):
        """Add a layer on the map.

        Parameters
        ----------
        layer: Layer instance
            The new layer to add.
        """
        if layer.model_id in self._layer_ids:
            raise LayerException('layer already on map: %r' % layer)
        self.layers = tuple([layer for layer in self.layers] + [layer])

    def remove_layer(self, rm_layer):
        """Remove a layer from the map.

        Parameters
        ----------
        layer: Layer instance
            The layer to remove.
        """
        if rm_layer.model_id not in self._layer_ids:
            raise LayerException('layer not on map: %r' % rm_layer)
        self.layers = tuple([layer for layer in self.layers if layer.model_id != rm_layer.model_id])

    def clear_layers(self):
        """Remove all layers from the map."""
        self.layers = ()

    # Event handling
    _interaction_callbacks = Instance(CallbackDispatcher, ())

    def _handle_mizar_event(self, _, content, buffers):
        if content.get('event', '') == 'interaction':
            self._interaction_callbacks(**content)

    def on_interaction(self, callback, remove=False):
        self._interaction_callbacks.register_callback(callback, remove=remove)

    _geo_pos = Tuple(CFloat(), CFloat(), default_value=(0, 0)).tag(sync=True)
    _zoom_to_opts = Dict().tag(sync=True)

    def zoom_to(self, geo_pos, **kwargs):
        """Zooms to a 3D position (longitude, latitude).

        Parameters
        ----------
        geo_pos : Tuple(Float, Float)
            Spatial position in decimal degree [longitude, latitude]
        kwargs:
            Common:
                duration: int
                    Duration of the animation in milliseconds
            Planet:
                distance: int
                    Final zooming distance in meters - if not set, this is the current distance
                tilt: int
                    Defines the tilt at the end of animation
                heading: int
                    Defines the heading at the end of animation. By default, the current heading is conserved
            Sky:
                fov: float
                    Field of view in degree

        """
        # On the JS side: call zoomTo watching simultaneously both these parameters
        self._geo_pos = geo_pos
        self._zoom_to_opts = kwargs
