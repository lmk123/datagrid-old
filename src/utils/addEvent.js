/**
 * 给元素注册事件, 并返回一个函数用于解绑事件
 * @param {EventTarget} element
 * @param {String} eventName
 * @param {Function} handler
 * @param {Boolean} [useCapture]
 * @return {function()}
 */
export default function (element, eventName, handler, useCapture = false) {
  element.addEventListener(eventName, handler, useCapture)
  return () => {
    element.removeEventListener(eventName, handler, useCapture)
  }
}
