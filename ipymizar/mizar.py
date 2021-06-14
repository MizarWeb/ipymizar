import copy

from ipywidgets import (
    Widget, DOMWidget, Box, CallbackDispatcher, widget_serialization,
    interactive, Style
)

from ipywidgets.widgets.trait_types import InstanceDict
from ipywidgets.embed import embed_minimal_html

from traitlets import (
    CFloat, Float, Unicode, Int, Tuple, List, Instance, Bool, Dict, Enum,
    link, observe, default, validate, TraitError, Union, Any
)

from ._version import EXTENSION_VERSION

from .projections import projections


def_loc = [0.0, 0.0]
allowed_cursor = ['alias', 'cell', 'grab', 'move', 'crosshair', 'context-menu',
                  'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize',
                  'sw-resize', 'w-resize', 'nw-resize', 'nesw-resize',
                  'nwse-resize', 'row-resize', 'col-resize', 'copy', 'default',
                  'grabbing', 'help', 'no-drop', 'not-allowed', 'pointer',
                  'progress', 'text', 'wait', 'zoom-in', 'zoom-out']


def basemap_to_tiles(basemap, day='yesterday', **kwargs):
    """Turn a basemap into a TileLayer object.

    Parameters
    ----------
    basemap : dict
        Basemap description coming from ipymizar.basemaps.
    day: string
        If relevant for the chosen basemap, you can specify the day for
        the tiles in the "%Y-%m-%d" format. Defaults to "yesterday".
    kwargs: key-word arguments
        Extra key-word arguments to pass to the TileLayer constructor.
    """
    from datetime import date, timedelta

    if day == 'yesterday':
        yesterday = date.today() - timedelta(1)
        day = yesterday.strftime('%Y-%m-%d')

    url = basemap.get('url', '')
    if url.count('%'):
        url = url % day

    return TileLayer(
        url=url,
        max_zoom=basemap.get('max_zoom', 19),
        min_zoom=basemap.get('min_zoom', 1),
        attribution=basemap.get('attribution', ''),
        name=basemap.get('name', ''),
        **kwargs
    )


class LayerException(TraitError):
    """Custom LayerException class."""
    pass


class InteractMixin(object):
    """Abstract InteractMixin class.

    This allows to link a parameter to a widget:

    >>> m.interact(zoom=(5, 10, 1))
    Will link a slider widget (values allowed between 5 and 10, step of 1) to
    the m object.
    """

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


class Layer(Widget, InteractMixin):
    """Abstract Layer class.

    Base class for all layers in ipymizar.

    Attributes
    ----------
    name : string
        Custom name for the layer, which will be used by the LayersControl.
    """

    _view_name = Unicode('MizarLayerView').tag(sync=True)
    _model_name = Unicode('MizarLayerModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)

    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    name = Unicode('').tag(sync=True)
    base = Bool(False).tag(sync=True)
    bottom = Bool(False).tag(sync=True)

    options = List(trait=Unicode()).tag(sync=True)

    def __init__(self, **kwargs):
        super(Layer, self).__init__(**kwargs)
        self.on_msg(self._handle_mouse_events)

    @default('options')
    def _default_options(self):
        return [name for name in self.traits(o=True)]

    # Event handling
    _click_callbacks = Instance(CallbackDispatcher, ())
    _dblclick_callbacks = Instance(CallbackDispatcher, ())
    _mousedown_callbacks = Instance(CallbackDispatcher, ())
    _mouseup_callbacks = Instance(CallbackDispatcher, ())
    _mouseover_callbacks = Instance(CallbackDispatcher, ())
    _mouseout_callbacks = Instance(CallbackDispatcher, ())

    def _handle_mouse_events(self, _, content, buffers):
        event_type = content.get('type', '')
        if event_type == 'click':
            self._click_callbacks(**content)
        if event_type == 'dblclick':
            self._dblclick_callbacks(**content)
        if event_type == 'mousedown':
            self._mousedown_callbacks(**content)
        if event_type == 'mouseup':
            self._mouseup_callbacks(**content)
        if event_type == 'mouseover':
            self._mouseover_callbacks(**content)
        if event_type == 'mouseout':
            self._mouseout_callbacks(**content)

    def on_click(self, callback, remove=False):
        """Add a click event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on click event.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._click_callbacks.register_callback(callback, remove=remove)

    def on_dblclick(self, callback, remove=False):
        """Add a double-click event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on double-click event.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._dblclick_callbacks.register_callback(callback, remove=remove)

    def on_mousedown(self, callback, remove=False):
        """Add a mouse-down event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on mouse-down event.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._mousedown_callbacks.register_callback(callback, remove=remove)

    def on_mouseup(self, callback, remove=False):
        """Add a mouse-up event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on mouse-up event.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._mouseup_callbacks.register_callback(callback, remove=remove)

    def on_mouseover(self, callback, remove=False):
        """Add a mouse-over event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on mouse-over event.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._mouseover_callbacks.register_callback(callback, remove=remove)

    def on_mouseout(self, callback, remove=False):
        """Add a mouse-out event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on mouse-out event.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._mouseout_callbacks.register_callback(callback, remove=remove)


class UILayer(Layer):
    """Abstract UILayer class."""

    _view_name = Unicode('MizarUILayerView').tag(sync=True)
    _model_name = Unicode('MizarUILayerModel').tag(sync=True)


class RasterLayer(Layer):
    """Abstract RasterLayer class.

    Attributes
    ----------
    opacity: float, default 1.
        Opacity of the layer between 0. (fully transparent) and 1. (fully opaque).
    visible: boolean, default True
        Whether the layer is visible or not.
    """

    _view_name = Unicode('MizarRasterLayerView').tag(sync=True)
    _model_name = Unicode('MizarRasterLayerModel').tag(sync=True)

    opacity = Float(1.0, min=0.0, max=1.0).tag(sync=True)
    visible = Bool(True).tag(sync=True)


class TileLayer(RasterLayer):
    """TileLayer class.

    Tile service layer.

    Attributes
    ----------
    url: string, default "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        Url to the tiles service.
    min_zoom: int, default 0
        Minimum zoom for this tile service.
    max_zoom: int, default 18
        Maximum zoom for this tile service.
    tile_size int, default 256
        Tile sizes for this tile service.
    attribution string, default "Map data (c) <a href="https://openstreetmap.org">OpenStreetMap</a> contributors"
        Tiles service attribution.
    no_wrap boolean, default False
        Whether the layer is wrapped around the antimeridian.
    tms: boolean, default False
        If true, inverses Y axis numbering for tiles (turn this on for TMS services).
    show_loading: boolean, default False
        Whether to show a spinner when tiles are loading.
    loading: boolean, default False
        Whether the tiles are currently loading.
    """

    _view_name = Unicode('MizarTileLayerView').tag(sync=True)
    _model_name = Unicode('MizarTileLayerModel').tag(sync=True)

    bottom = Bool(True).tag(sync=True)
    url = Unicode('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').tag(sync=True)
    min_zoom = Int(0).tag(sync=True, o=True)
    max_zoom = Int(18).tag(sync=True, o=True)
    min_native_zoom = Int(0).tag(sync=True, o=True)
    max_native_zoom = Int(18).tag(sync=True, o=True)
    tile_size = Int(256).tag(sync=True, o=True)
    attribution = Unicode('Map data (c) <a href="https://openstreetmap.org">OpenStreetMap</a> contributors').tag(
        sync=True, o=True)
    detect_retina = Bool(False).tag(sync=True, o=True)
    no_wrap = Bool(False).tag(sync=True, o=True)
    tms = Bool(False).tag(sync=True, o=True)
    show_loading = Bool(False).tag(sync=True)
    loading = Bool(False, read_only=True).tag(sync=True)

    _load_callbacks = Instance(CallbackDispatcher, ())

    def __init__(self, **kwargs):
        super(TileLayer, self).__init__(**kwargs)
        self.on_msg(self._handle_mizar_event)

    def _handle_mizar_event(self, _, content, buffers):
        if content.get('event', '') == 'load':
            self._load_callbacks(**content)

    def on_load(self, callback, remove=False):
        """Add a load event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called when the tiles have finished loading.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._load_callbacks.register_callback(callback, remove=remove)

    def redraw(self):
        """Force redrawing the tiles.

        This is especially useful when you are sure the server updated the tiles and you
        need to refresh the layer.
        """
        self.send({'msg': 'redraw'})


class WMSLayer(TileLayer):
    """WMSLayer class.

    Attributes
    ----------
    layers: string, default ""
        Comma-separated list of WMS layers to show.
    format: string, default "image/jpeg"
        WMS image format (use `'image/png'` for layers with transparency).
    transparent: boolean, default False
        If true, the WMS service will return images with transparency.
    crs: dict, default ipymizar.projections.EPSG3857
        Projection used for this WMS service.
    """

    _view_name = Unicode('MizarWMSLayerView').tag(sync=True)
    _model_name = Unicode('MizarWMSLayerModel').tag(sync=True)

    # Options
    layers = Unicode().tag(sync=True, o=True)
    format = Unicode('image/jpeg').tag(sync=True, o=True)
    transparent = Bool(False).tag(sync=True, o=True)
    crs = Dict(default_value=projections.EPSG3857).tag(sync=True)
    uppercase = Bool(False).tag(sync=True, o=True)


class VectorLayer(Layer):
    """VectorLayer abstract class."""

    _view_name = Unicode('MizarVectorLayerView').tag(sync=True)
    _model_name = Unicode('MizarVectorLayerModel').tag(sync=True)


class LayerGroup(Layer):
    """LayerGroup class.

    A group of layers that you can put on the map like other layers.

    Attributes
    ----------
    layers: list, default []
        List of layers to include in the group.
    """

    _view_name = Unicode('MizarLayerGroupView').tag(sync=True)
    _model_name = Unicode('MizarLayerGroupModel').tag(sync=True)

    layers = Tuple().tag(trait=Instance(Layer), sync=True, **widget_serialization)

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
        """Add a new layer to the group.

        Parameters
        ----------
        layer: layer instance
            The new layer to include in the group.
        """
        if isinstance(layer, dict):
            layer = basemap_to_tiles(layer)
        if layer.model_id in self._layer_ids:
            raise LayerException('layer already in layergroup: %r' % layer)
        self.layers = tuple([layer for layer in self.layers] + [layer])

    def remove_layer(self, rm_layer):
        """Remove a layer from the group.

        Parameters
        ----------
        layer: layer instance
            The layer to remove from the group.
        """
        if rm_layer.model_id not in self._layer_ids:
            raise LayerException('layer not on in layergroup: %r' % rm_layer)
        self.layers = tuple([layer for layer in self.layers if layer.model_id != rm_layer.model_id])

    def substitute_layer(self, old, new):
        """Substitute a layer with another one in the group.

        Parameters
        ----------
        old: layer instance
            The layer to remove from the group.
        new: layer instance
            The new layer to include in the group.
        """
        if isinstance(new, dict):
            new = basemap_to_tiles(new)
        if old.model_id not in self._layer_ids:
            raise LayerException('Could not substitute layer: layer not in layergroup.')
        self.layers = tuple([new if layer.model_id == old.model_id else layer for layer in self.layers])

    def clear_layers(self):
        """Remove all layers from the group."""
        self.layers = ()


class FeatureGroup(LayerGroup):
    """FeatureGroup abstract class."""

    _view_name = Unicode('MizarFeatureGroupView').tag(sync=True)
    _model_name = Unicode('MizarFeatureGroupModel').tag(sync=True)


class GeoJSON(FeatureGroup):
    """GeoJSON class.

    Layer created from a GeoJSON data structure.

    Attributes
    ----------
    data: dict, default {}
        The JSON data structure.
    style: dict, default {}
        Extra style to apply to the features.
    hover_style: dict, default {}
        Style that will be applied to a feature when the mouse is over this feature.
    point_style: dict, default {}
        Extra style to apply to the point features.
    style_callback: callable, default None
        Function that will be called for each feature, should take the feature as
        input and return the feature style.
    """

    _view_name = Unicode('MizarGeoJSONView').tag(sync=True)
    _model_name = Unicode('MizarGeoJSONModel').tag(sync=True)

    data = Dict().tag(sync=True)
    style = Dict().tag(sync=True)
    hover_style = Dict().tag(sync=True)
    point_style = Dict().tag(sync=True)
    style_callback = Any()

    _click_callbacks = Instance(CallbackDispatcher, ())
    _hover_callbacks = Instance(CallbackDispatcher, ())

    def __init__(self, **kwargs):
        self.updating = True

        super(GeoJSON, self).__init__(**kwargs)

        self.data = self._get_data()
        self.updating = False

    @validate('style_callback')
    def _validate_style_callback(self, proposal):
        if not callable(proposal.value):
            raise TraitError('style_callback should be callable (functor/function/lambda)')
        return proposal.value

    @observe('data', 'style', 'style_callback')
    def _update_data(self, change):
        if self.updating:
            return

        self.updating = True
        self.data = self._get_data()
        self.updating = False

    def _get_data(self):
        if 'type' not in self.data:
            # We can't apply a style we don't know what the data look like
            return self.data

        datatype = self.data['type']

        style_callback = None
        if self.style_callback:
            style_callback = self.style_callback
        elif self.style:
            style_callback = lambda feature: self.style
        else:
            # No style to apply
            return self.data

        # We need to make a deep copy for ipywidgets to see the change
        data = copy.deepcopy(self.data)

        if datatype == 'Feature':
            self._apply_style(data, style_callback)
        elif datatype == 'FeatureCollection':
            for feature in data['features']:
                self._apply_style(feature, style_callback)

        return data

    @property
    def __geo_interface__(self):
        """
        Return a dict whose structure aligns to the GeoJSON format
        For more information about the ``__geo_interface__``, see
        https://gist.github.com/sgillies/2217756
        """

        return self.data

    def _apply_style(self, feature, style_callback):
        if 'properties' not in feature:
            feature['properties'] = {}

        properties = feature['properties']
        if 'style' in properties:
            style = properties['style'].copy()
            style.update(style_callback(feature))
            properties['style'] = style
        else:
            properties['style'] = style_callback(feature)

    def _handle_mouse_events(self, _, content, buffers):
        if content.get('event', '') == 'click':
            self._click_callbacks(**content)
        if content.get('event', '') == 'mouseover':
            self._hover_callbacks(**content)

    def on_click(self, callback, remove=False):
        """Add a feature click event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called on click event on a feature, this function
            should take the event and the feature as inputs.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._click_callbacks.register_callback(callback, remove=remove)

    def on_hover(self, callback, remove=False):
        """Add a feature hover event listener.

        Parameters
        ----------
        callback : callable
            Callback function that will be called when the mouse is over a feature, this function
            should take the event and the feature as inputs.
        remove: boolean
            Whether to remove this callback or not. Defaults to False.
        """
        self._hover_callbacks.register_callback(callback, remove=remove)


class ControlException(TraitError):
    """Custom LayerException class."""
    pass


class Control(Widget):
    """Control abstract class.

    This is the base class for all ipymizar controls. A control is additional
    UI components on top of the Map.

    Attributes
    ----------
    position: str, default 'topleft'
        The position of the control. Possible values are 'topright',
        'topleft', 'bottomright' and 'bottomleft'.
    """

    _view_name = Unicode('MizarControlView').tag(sync=True)
    _model_name = Unicode('MizarControlModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)

    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    options = List(trait=Unicode()).tag(sync=True)

    position = Enum(
        ['topright', 'topleft', 'bottomright', 'bottomleft'],
        default_value='topleft',
        help="""Possible values are topleft, topright, bottomleft
                or bottomright"""
    ).tag(sync=True, o=True)

    @default('options')
    def _default_options(self):
        return [name for name in self.traits(o=True)]


class WidgetControl(Control):
    """WidgetControl class.

    A control that contains any DOMWidget instance.

    Attributes
    ----------
    widget: DOMWidget
        The widget to put inside of the control. It can be any widget, even coming from
        a third-party library like bqplot.
    """

    _view_name = Unicode('MizarWidgetControlView').tag(sync=True)
    _model_name = Unicode('MizarWidgetControlModel').tag(sync=True)

    widget = Instance(DOMWidget).tag(sync=True, **widget_serialization)

    max_width = Int(default_value=None, allow_none=True).tag(sync=True)
    min_width = Int(default_value=None, allow_none=True).tag(sync=True)
    max_height = Int(default_value=None, allow_none=True).tag(sync=True)
    min_height = Int(default_value=None, allow_none=True).tag(sync=True)

    transparent_bg = Bool(False).tag(sync=True, o=True)


class LayersControl(Control):
    """LayersControl class.

    A control which allows hiding/showing different layers on the Map.
    """

    _view_name = Unicode('MizarLayersControlView').tag(sync=True)
    _model_name = Unicode('MizarLayersControlModel').tag(sync=True)


class ZoomControl(Control):
    """ZoomControl class.

    A control which contains buttons for zooming in/out the Map.

    Attributes
    ----------
    zoom_in_text: str, default '+'
        Text to put in the zoom-in button.
    zoom_in_title: str, default 'Zoom in'
        Title to put in the zoom-in button, this is shown when the mouse
        is over the button.
    zoom_out_text: str, default '-'
        Text to put in the zoom-out button.
    zoom_out_title: str, default 'Zoom out'
        Title to put in the zoom-out button, this is shown when the mouse
        is over the button.
    """

    _view_name = Unicode('MizarZoomControlView').tag(sync=True)
    _model_name = Unicode('MizarZoomControlModel').tag(sync=True)

    zoom_in_text = Unicode('+').tag(sync=True, o=True)
    zoom_in_title = Unicode('Zoom in').tag(sync=True, o=True)
    zoom_out_text = Unicode('-').tag(sync=True, o=True)
    zoom_out_title = Unicode('Zoom out').tag(sync=True, o=True)


class Planet(DOMWidget, InteractMixin):
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

    _view_name = Unicode('MizarPlanetView').tag(sync=True)
    _model_name = Unicode('MizarPlanetModel').tag(sync=True)
    _view_module = Unicode('jupyter-mizar').tag(sync=True)
    _model_module = Unicode('jupyter-mizar').tag(sync=True)

    _view_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_VERSION).tag(sync=True)

    # URL of the window where the map is displayed
    window_url = Unicode(read_only=True).tag(sync=True)

    # For the dummy image
    src = Unicode("https://lagranderecre-lagranderecre-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/0/0/ae8adfc9a2047079049f1c0410e37c32f5e882ad_IMG-PRODUCT-828315-2.jpeg").tag(sync=True)
    width = Int(500).tag(sync=True)
    height = Int(500).tag(sync=True)

    # Map options
    zoom_start = CFloat(12).tag(sync=True, o=True)
    zoom = CFloat(12).tag(sync=True, o=True)
    max_zoom = CFloat(18).tag(sync=True, o=True)
    min_zoom = CFloat(1).tag(sync=True, o=True)
    zoom_delta = CFloat(1).tag(sync=True, o=True)
    interpolation = Unicode('bilinear').tag(sync=True, o=True)
    crs = Dict(default_value=projections.EPSG3857).tag(sync=True)

    modisdate = Unicode('yesterday').tag(sync=True)

    # Interaction options
    dragging = Bool(True).tag(sync=True, o=True)
    touch_zoom = Bool(True).tag(sync=True, o=True)
    scroll_wheel_zoom = Bool(False).tag(sync=True, o=True)
    double_click_zoom = Bool(True).tag(sync=True, o=True)
    box_zoom = Bool(True).tag(sync=True, o=True)
    tap = Bool(True).tag(sync=True, o=True)
    tap_tolerance = Int(15).tag(sync=True, o=True)
    world_copy_jump = Bool(False).tag(sync=True, o=True)
    bounce_at_zoom_limits = Bool(True).tag(sync=True, o=True)
    keyboard = Bool(True).tag(sync=True, o=True)
    keyboard_pan_offset = Int(80).tag(sync=True, o=True)
    keyboard_zoom_offset = Int(1).tag(sync=True, o=True)
    inertia = Bool(True).tag(sync=True, o=True)
    inertia_deceleration = Int(3000).tag(sync=True, o=True)
    inertia_max_speed = Int(1500).tag(sync=True, o=True)
    zoom_animation_threshold = Int(4).tag(sync=True, o=True)
    fullscreen = Bool(False).tag(sync=True, o=True)

    options = List(trait=Unicode()).tag(sync=True)

    zoom_control = Bool(True)

    layers = Tuple().tag(trait=Instance(Layer), sync=True, **widget_serialization)

    @default('options')
    def _default_options(self):
        return [name for name in self.traits(o=True)]

    def __init__(self, **kwargs):
        super(Planet, self).__init__(**kwargs)
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
        if isinstance(layer, dict):
            layer = basemap_to_tiles(layer)
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

    def substitute_layer(self, old, new):
        """Replace a layer with another one on the map.

        Parameters
        ----------
        old: Layer instance
            The old layer to remove.
        new: Layer instance
            The new layer to add.
        """
        if isinstance(new, dict):
            new = basemap_to_tiles(new)
        if old.model_id not in self._layer_ids:
            raise LayerException('Could not substitute layer: layer not on map.')
        self.layers = tuple([new if layer.model_id == old.model_id else layer for layer in self.layers])

    def clear_layers(self):
        """Remove all layers from the map."""
        self.layers = ()

    controls = Tuple().tag(trait=Instance(Control), sync=True, **widget_serialization)
    _control_ids = List()

    @validate('controls')
    def _validate_controls(self, proposal):
        '''Validate controls list.

        Makes sure only one instance of any given layer can exist in the
        controls list.
        '''
        self._control_ids = [c.model_id for c in proposal.value]
        if len(set(self._control_ids)) != len(self._control_ids):
            raise ControlException('duplicate control detected, only use each control once')
        return proposal.value

    def add_control(self, control):
        """Add a control on the map.

        Parameters
        ----------
        control: Control instance
            The new control to add.
        """
        if control.model_id in self._control_ids:
            raise ControlException('control already on map: %r' % control)
        self.controls = tuple([c for c in self.controls] + [control])

    def remove_control(self, control):
        """Remove a control from the map.

        Parameters
        ----------
        control: Control instance
            The control to remove.
        """
        if control.model_id not in self._control_ids:
            raise ControlException('control not on map: %r' % control)
        self.controls = tuple([c for c in self.controls if c.model_id != control.model_id])

    def clear_controls(self):
        """Remove all controls from the map."""
        self.controls = ()

    def save(self, outfile, **kwargs):
        """Save the Map to an .html file.

        Parameters
        ----------
        outfile: str or file-like object
            The file to write the HTML output to.
        kwargs: keyword-arguments
            Extra parameters to pass to the ipywidgets.embed.embed_minimal_html function.
        """
        embed_minimal_html(outfile, views=[self], **kwargs)

    def __iadd__(self, item):
        if isinstance(item, Layer):
            self.add_layer(item)
        elif isinstance(item, Control):
            self.add_control(item)
        return self

    def __isub__(self, item):
        if isinstance(item, Layer):
            self.remove_layer(item)
        elif isinstance(item, Control):
            self.remove_control(item)
        return self

    def __add__(self, item):
        if isinstance(item, Layer):
            self.add_layer(item)
        elif isinstance(item, Control):
            self.add_control(item)
        return self

    # Event handling
    _interaction_callbacks = Instance(CallbackDispatcher, ())

    def _handle_mizar_event(self, _, content, buffers):
        if content.get('event', '') == 'interaction':
            self._interaction_callbacks(**content)

    def on_interaction(self, callback, remove=False):
        self._interaction_callbacks.register_callback(callback, remove=remove)

    # Navigation handling

    def zoom_to(self, geo_pos):
        pass
