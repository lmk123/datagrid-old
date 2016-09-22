/**
 * 寻找一个元素指定名称的父元素
 * @param {String} tagName - 要寻找的元素名
 * @param {HTMLElement} node - 从哪个元素开始寻找
 * @param {HTMLElement} [stop] - 碰到这个元素时停止查找
 * @return {null|HTMLElement}
 */
module.exports = function (tagName, node, stop) {
  if (!stop) stop = document.body
  var tag = tagName.toUpperCase()
  var parent = node
  var tr = null
  do {
    if (parent.tagName === tag) {
      tr = parent
      break
    }
  } while (parent !== stop && (parent = parent.parentElement))
  return tr
}
