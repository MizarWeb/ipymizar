import copy

from ipywidgets import (
    interactive, Box,
    Widget, DOMWidget, CallbackDispatcher, widget_serialization,
)

from traitlets import (
    CFloat, Float, Unicode, Tuple, List, Instance, Bool, Dict,
    link, observe, validate, TraitError
)

from ._version import EXTENSION_VERSION

_CRS_TO_CONTEXT = {
    "Equatorial": "Sky",
    "Galactic": "Sky",
    "CRS:84": "Planet",
    "IAU2000:49901": "Planet",
    "IAU2000:49900": "Planet",
    "IAU2000:30101": "Planet",
    "IAU2000:30100": "Planet",
    "HorizontalLocal": "Ground",
    "IAU:Sun": "Planet"
}


class InteractMixin(object):
    """Abstract InteractMixin class."""

    def interact(self, **kwargs):
        c = []
        for name, abbrev in kwargs.items():
            default = getattr(self, name)
            widget = interactive.widget_from_abbrev(abbrev, default)
            if not widget.description:
                widget.description = name
            widget.link = link((widget, 'value'), (self, name))
            c.append(widget)
        cont = Box(children=c)
        return cont


class LayerException(TraitError):
    """Custom LayerException class."""
    pass


class Layer(Widget, InteractMixin):
    """Abstract Layer class.

    Base class for all layers in ipymizar.

    Attributes
    ----------
    name : str
        Custom name for the layer.
    background: bool
        Set the layer as the background, True by default.
    visible: bool
        Whether the layer is displayed or not, True by default.
    opacity: float
        Layer opacity, between 0.0 and 1.0, 1.0 by default.
    """

    _view_name = Unicode('MizarLayerView').tag(sync=True)
    _model_name = Unicode('MizarLayerModel').tag(sync=True)

    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)
    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # Some properties extracted from 'AbstractLayer configuration'
    # Should be the same for each layer.
    name = Unicode().tag(sync=True)
    background = Bool(True).tag(sync=True)
    visible = Bool(True).tag(sync=True)
    opacity = Float(1.0, min=0.0, max=1.0).tag(sync=True)


class OSMLayer(Layer):
    """OpenStreetMap layer class.

    Attributes
    ----------
    url: str
        Url to the OSM server, 'https://c.tile.openstreetmap.org' by default.
    """

    _view_name = Unicode('MizarOSMLayerView').tag(sync=True)
    _model_name = Unicode('MizarOSMLayerModel').tag(sync=True)

    # Some specific properties of this layer
    url = Unicode('https://c.tile.openstreetmap.org').tag(sync=True)


class WMSLayer(Layer):
    """WMS layer class.

    Attributes
    ----------
    url: str
        Url to the WMS server.
    layers: str
        Comma-separated list of WMS layers to show.
    format: str
        WMS image format (use `'image/png'` for layers with transparency).
        'image/jpeg' by default
    transparent: bool
        If true, the WMS service will return images with transparency.
        False by default.
    """

    _view_name = Unicode('MizarWMSLayerView').tag(sync=True)
    _model_name = Unicode('MizarWMSLayerModel').tag(sync=True)

    # Some specific properties of this layer
    url = Unicode('').tag(sync=True)
    layers = Unicode().tag(sync=True)
    format = Unicode('image/jpeg').tag(sync=True)
    transparent = Bool(False).tag(sync=True)


class WMTSLayer(Layer):
    """WMTS layer class.

    Attributes
    ----------
    url: str
        Url to the WMTS server.
    layers: str
        Comma-separated list of WMS layers to show.
    format: str
        WMS image format (use `'image/png'` for layers with transparency).
        'image/jpeg' by default
    transparent: bool
        If true, the WMS service will return images with transparency.
        False by default.
    """

    _view_name = Unicode('MizarWMTSLayerView').tag(sync=True)
    _model_name = Unicode('MizarWMTSLayerModel').tag(sync=True)

    # Some specific properties of this layer
    url = Unicode().tag(sync=True)
    layers = Unicode().tag(sync=True)
    format = Unicode('image/jpeg').tag(sync=True)
    transparent = Bool(False).tag(sync=True)


class HipsLayer(Layer):
    """Hips layer class.

    Attributes
    ----------
    url: str
        Url to the Hips server.
    """

    _view_name = Unicode('MizarHipsLayerView').tag(sync=True)
    _model_name = Unicode('MizarHipsLayerModel').tag(sync=True)

    # Some specific properties of this layer
    url = Unicode('').tag(sync=True)


class GeoJSONLayer(Layer):
    """GeoJSON layer class.

    Layer created from a GeoJSON data structure.

    Attributes
    ----------
    url: str
        Url to a GeoJSON file. Mutually exclusive with `data`.
    data: dict
        The JSON data structure.
    style: dict
        Extra style to apply to the features.
    """

    _view_name = Unicode('MizarGeoJSONLayerView').tag(sync=True)
    _model_name = Unicode('MizarGeoJSONLayerModel').tag(sync=True)

    # Some specific properties of this layer
    url = Unicode().tag(sync=True)
    data = Dict().tag(sync=True)
    style = Dict().tag(sync=True)

    @observe("data")
    def _update_data(self, change):
        # We need to make a deep copy for ipywidgets to see the change
        self.data = copy.deepcopy(self.data)


class CRS:
    """CRS options"""

    Equatorial = "Equatorial"
    Galactic = "Galactic"
    WGS84 = "CRS:84"
    Mars_2000 = "IAU2000:49901"
    Mars_2000_old = "IAU2000:49900"
    Moon_2000 = "IAU2000:30101"
    Moon_2000_old = "IAU2000:30100"
    HorizontalLocal = "HorizontalLocal"
    Sun = "IAU:Sun"

    @staticmethod
    def list(context=None):
        """List the CRS options available.

        Parameters
        ----------
        context : str, optional
            'Sky' or 'Planet', by default None

        Returns
        -------
        list:
            List of CRS.
        """
        crs_opts = []
        for attr in dir(CRS):
            if not attr.startswith("_") and attr != "list":
                if context:
                    crs_context = _CRS_TO_CONTEXT[getattr(CRS, attr)]
                    if crs_context == context:
                        crs_opts.append(attr)
                else:
                    crs_opts.append(attr)
        return crs_opts


class MizarMap(DOMWidget, InteractMixin):
    """Map class.

    The Map class is the main widget in ipymizar.

    Attributes
    ----------
    layers: list of Layer instances
        The list of layers that are currently on the map.
    center: tuple(float, float)
        The current center of the map. Default is (0.0, 0.0).
    zoom_opts: dict
        Options to control the camera/zoom view, depending on the
        context (Planet vs. Sky):
            distance: int
                Planet only. Final zooming distance in meters
            fov: float
                Sky only. Field of view of the camera in decimal degree
    crs: str
        Coordinate reference system. Use the CRS class to see the
        options available. Default is `CRS.WGS84`.
    time: str
        Time set to each layer (if relevant) of the map.
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
    context = Unicode("Planet", read_only=True)
    center = Tuple(CFloat(), CFloat(), default_value=(0.0, 0.0)).tag(sync=True)
    zoom_opts = Dict().tag(sync=True)

    time = Unicode().tag(sync=True)

    layers = Tuple().tag(
        trait=Instance(Layer),
        sync=True,
        **widget_serialization
    )

    def __init__(self, **kwargs):
        super(MizarMap, self).__init__(**kwargs)
        self.set_trait("context", _CRS_TO_CONTEXT[self.crs])

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
            raise LayerException(
                'duplicate layer detected, only use each layer once'
            )
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
        rm_layer: Layer instance
            The layer to remove.
        """
        if rm_layer.model_id not in self._layer_ids:
            raise LayerException('layer not on map: %r' % rm_layer)
        self.layers = tuple([
            layer
            for layer in self.layers
            if layer.model_id != rm_layer.model_id
        ])

    def clear_layers(self):
        """Remove all layers from the map."""
        self.layers = ()

    # Event handling
    _interaction_callbacks = Instance(CallbackDispatcher, ())

    def _handle_mizar_event(self, _, content, buffers):
        if content.get('event', '') == 'interaction':
            self._interaction_callbacks(**content)

    @validate("zoom_opts")
    def _valid_zoom_opts(self, proposal):
        zoom_opts = proposal["value"]
        distance = zoom_opts.get("distance")
        if distance is not None and not isinstance(distance, (int, float)):
            raise TraitError("'distance' must be an integer.")
        return zoom_opts

    def zoom_to(self, center, **kwargs):
        """Zooms to a 3D position (longitude, latitude).

        Parameters
        ----------
        center : Tuple(Float, Float)
            Spatial position in decimal degree [longitude, latitude]
        kwargs:
            distance: int
                Planet only. Final zooming distance in meters
            fov: float
                Sky only. Field of view of the camera in decimal degree

        """
        # On the JS side: call zoomTo watching simultaneously both these
        # parameters to trigger a single call to the method.
        self.center = center
        self.zoom_opts = kwargs
