import DataGrid from './DataGrid/index'
import Pager from './plugins/pager'
import Sorter from './plugins/sort'

const { use } =  DataGrid

use(Pager)
use(Sorter)

/**
 * 初始化一个 html 元素
 * @param {HTMLElement|String} element
 * @param {Object} [options]
 */
function init (element, options) {
  const _ele = typeof element === 'string' ? document.querySelector(element) : element
  if (!_ele) return
  return new DataGrid(_ele, options)
}

export {
  init,
  use
}
