import DataGrid from './DataGrid/index'
import Pager from './plugins/pager'

const { use } =  DataGrid

use(Pager)

/**
 * 初始化一个 html 元素
 * @param {HTMLElement|String} element
 */
function init (element) {
  const _ele = typeof element === 'string' ? document.querySelector(element) : element
  if (!_ele) return
  return new DataGrid(_ele)
}

export {
  init,
  use
}
