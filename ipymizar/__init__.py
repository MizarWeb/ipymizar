from ._version import version_info, __version__  # noqa

# Allow dependencies to ipymizar to not be installed upon post-link for
# conda-build.

try:
    from .mizar import (  # noqa
        CRS,
        HipsLayer,
        MizarMap,
        OSMLayer,
        WMSLayer,
    )
    from .basemaps import basemaps   # noqa
except ImportError:
    pass


def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': 'jupyter-mizar'
    }]


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'nbextension',
        'dest': 'jupyter-mizar',
        'require': 'jupyter-mizar/extension'
    }]
