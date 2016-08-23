import DataGrid from './DataGrid'

/**
 * 初始化一个 html 元素
 * @param {HTMLElement|String} element
 */
export default function (element) {
  const _ele = typeof element === 'string' ? document.querySelector(element) : element
  if (!_ele) return
  return new DataGrid(_ele)
}
