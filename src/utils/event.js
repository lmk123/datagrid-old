class MyEvent {
  constructor () {
    this._callbacks = {}
  }

  /**
   * 注册事件监听函数
   * @param {string} eventName
   * @param {function()} handlerFunc
   * @return {function()} - 调用此函数可以取消掉监听
   */
  on (eventName, handlerFunc) {
    const { _callbacks } = this
    const eventArr = (_callbacks[eventName] || (_callbacks[eventName] = []))
    eventArr.push(handlerFunc)
    return () => {
      eventArr.splice(eventArr.indexOf(handlerFunc), 1)
    }
  }

  /**
   * 注册事件监听函数, 但只监听一次
   * @param {string} eventName
   * @param {function()} handlerFunc
   * @return {function()}
   */
  once (eventName, handlerFunc) {
    const unwatch = this.on(eventName, function () {
      handlerFunc.apply(null, arguments)
      unwatch()
    })
    return unwatch
  }

  /**
   * 发布事件
   * @param {string} eventName
   * @param args
   */
  emit (eventName, ...args) {
    const eventArr = this._callbacks[eventName]
    if (!eventArr || !eventArr.length) return
    eventArr.forEach(func => func.apply(null, args))
  }
}

export default MyEvent
