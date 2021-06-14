
// Export everything from jupyter-mizar and the npm package version number.
module.exports = require('./jupyter-mizar.js');
module.exports['version'] = require('../package.json').version;
