const { indexOf } = Array.prototype

const IS_TOUCH = 'ontouchstart' in window
const MOUSEDOWN = IS_TOUCH ? 'touchstart' : 'mousedown'
const MOUSEMOVE = IS_TOUCH ? 'touchmove' : 'mousemove'
const MOUSEUP = IS_TOUCH ? 'touchend' : 'mouseup'

export default function (DataGrid) {
  DataGrid.hook(datagrid => {
    // 注入供用户拖拽的小方块
    datagrid.on('beforeRenderColumns', columnsHTMLArr => {
      columnsHTMLArr.forEach((html, index) => {
        columnsHTMLArr[index] = html.replace('</th>', '<span class="drag-lever">x</span></th>')
      })
    })

    let dragging = false
    let draggingLever
    let draggingColumnIndex
    let startX

    datagrid.el.addEventListener(MOUSEDOWN, e => {
      if (e.target.classList.contains('drag-lever') && e.button === 0) {
        console.log('开始移动')
        let th
        let node = e.target
        while ((node = node.parentElement) && node !== datagrid.el) {
          if (node.tagName === 'TH') {
            th = node
            break
          }
        }
        if (!th) return
        dragging = true
        draggingLever = e.target
        draggingLever.classList.add('dragging')
        startX = e.pageX
        draggingColumnIndex = indexOf.call(th.parentElement.children, th)
      }
    })

    datagrid.el.addEventListener(MOUSEMOVE, e => {
      if (!dragging) return
      e.preventDefault() // 阻止在 PC 端拖动鼠标时选中文字或在移动端滑动屏幕
    })

    datagrid.el.addEventListener(MOUSEUP, e => {
      if (!dragging) return
      console.log('结束移动')
      dragging = false
      draggingLever.classList.remove('dragging')
      const endX = e.pageX
      const move = endX - startX // 计算移动的距离
      console.log('移动了', move)
      datagrid.renderData.columnsWidth[draggingColumnIndex] = datagrid.renderData.columnsWidth[draggingColumnIndex] + move
      datagrid._setWidth(datagrid.renderData.columnsWidth)
    })
  })
}
