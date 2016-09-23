var has = Object.prototype.hasOwnProperty

module.exports = function (target) {
  for (var i = 1; i < arguments.length; i += 1) {
    var d = arguments[i]
    if (!d || typeof d !== 'object') continue
    for (var key in d) {
      if (has.call(d, key)) {
        target[key] = d[key]
      }
    }
  }
  return target
}
