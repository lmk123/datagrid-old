/**
 * 返回一个延迟执行的函数
 * @param {Function} fn
 * @param {Number} [timeout]
 * @return {Function}
 */
module.exports = function (fn, timeout) {
  var timeId
  timeout = typeof timeout === 'number' ? timeout : 250
  return function () {
    if (typeof timeId === 'number') window.clearTimeout(timeId)
    var args = arguments
    timeId = window.setTimeout(function () {
      fn.apply(null, args)
    }, timeout)
  }
}
