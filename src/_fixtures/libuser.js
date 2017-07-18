var React = require('react')

module.exports = function () {
  return React
}

if (typeof window !== 'undefined') {
  window['React'] = React
}
