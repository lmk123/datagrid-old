var slice = Array.prototype.slice

function MyEvent () {
  this._callbacks = {}
}

var p = MyEvent.prototype

/**
 * 注册事件监听函数
 * @param {string} eventName
 * @param {function()} handlerFunc
 * @return {function()} - 调用此函数可以取消掉监听
 */
p.on = function (eventName, handlerFunc) {
  var callbacks = this._callbacks
  var eventArr = (callbacks[eventName] || (callbacks[eventName] = []))
  eventArr.push(handlerFunc)
  return function () {
    var i = eventArr.indexOf(handlerFunc)
    if (i >= 0) eventArr.splice(i, 1)
  }
}

/**
 * 注册事件监听函数, 但只监听一次
 * @param {string} eventName
 * @param {function()} handlerFunc
 * @return {function()}
 */
p.once = function (eventName, handlerFunc) {
  var unwatch = this.on(eventName, function () {
    handlerFunc.apply(null, arguments)
    // 等 emit 中的 forEach 执行完后再改变数组
    window.setTimeout(unwatch, 0)
  })
  return unwatch
}

/**
 * 发布事件
 * @param {string} eventName
 */
p.emit = function (eventName/* , ...args  */) {
  var eventArr = this._callbacks[eventName]
  if (!eventArr || !eventArr.length) return
  var args = slice.call(arguments, 1)
  eventArr.forEach(function (func) {
    func.apply(null, args)
  })
}

module.exports = MyEvent
