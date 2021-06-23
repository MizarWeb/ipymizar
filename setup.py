# -*- coding: utf-8 -*-

import os
from setuptools import setup, find_packages

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    get_version,
    skip_if_exists
)

# the name of the package
name = 'ipymizar'
long_description = 'A Jupyter widget for Mizar'

here = os.path.dirname(os.path.abspath(__file__))

# Get ipymizar version
version = get_version(os.path.join(name, '_version.py'))

js_dir = os.path.join(here, 'js')

# Representative files that should exist after a successful build
jstargets = [
    os.path.join('ipymizar/nbextension', 'index.js'),
    os.path.join('ipymizar/labextension', 'package.json'),
]

data_files_spec = [
    ('share/jupyter/nbextensions/jupyter-mizar', 'ipymizar/nbextension', '*.*'),
    ('share/jupyter/labextensions/jupyter-mizar', 'ipymizar/labextension', '**'),
    ('share/jupyter/labextensions/jupyter-mizar', '.', 'install.json'),
    ('etc/jupyter/nbconfig/notebook.d', '.', 'jupyter-mizar.json'),
]

cmdclass = create_cmdclass('jsdeps', data_files_spec=data_files_spec)
js_command = combine_commands(
    install_npm(js_dir, npm=["yarn"], build_cmd='build:prod'), ensure_targets(jstargets),
)

is_repo = os.path.exists(os.path.join(here, '.git'))
if is_repo:
    cmdclass['jsdeps'] = js_command
else:
    cmdclass['jsdeps'] = skip_if_exists(jstargets, js_command)

setup_args = dict(
    name=name,
    version=version,
    description='A Jupyter widget for Mizar',
    long_description=long_description,
    license='GPL-3.0',
    include_package_data=True,
    install_requires=[
        'ipywidgets>=7.6.0,<8',
        'traittypes>=0.2.1,<3',
    ],
    packages=find_packages(),
    zip_safe=False,
    cmdclass=cmdclass,
    author='CNES',
    author_email='',
    url='',
    keywords=['ipython', 'jupyter', 'widgets'],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Framework :: IPython',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'Topic :: Multimedia :: Graphics',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
    ],
)

setup(**setup_args)
