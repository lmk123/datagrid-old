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
      const i = eventArr.indexOf(handlerFunc)
      if (i >= 0) eventArr.splice(i, 1)
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
      // 等 emit 中的 forEach 执行完后再改变数组
      window.setTimeout(unwatch, 0)
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
