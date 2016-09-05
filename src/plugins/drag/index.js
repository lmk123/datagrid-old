import './index.scss'

const MIN_WIDTH = 100 // 表格的最小宽度

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
        columnsHTMLArr[index] = html.replace('</th>', '<span class="drag-lever"></span></th>')
      })
    })

    datagrid.on('afterInit', () => {
      const line = document.createElement('div')
      line.classList.add('dragging-line')
      datagrid.ui.$draggingLine = line
      datagrid.el.appendChild(line)
    })

    let dragging = false
    let draggingLever
    let draggingTH
    let draggingColumnIndex
    let startX
    let draggingLineInitLeft
    let minLeft

    datagrid.el.addEventListener(MOUSEDOWN, e => {
      if (e.target.classList.contains('drag-lever') && e.button === 0) {
        let th
        let node = e.target
        while ((node = node.parentElement) && node !== datagrid.el) {
          if (node.tagName === 'TH') {
            th = node
            break
          }
        }
        if (!th) return

        // 给 th 加一个状态, 避免触发排序功能
        th.classList.add('resizing')
        draggingTH = th

        minLeft = -(th.clientWidth - MIN_WIDTH)

        // 显示虚线
        const line = datagrid.ui.$draggingLine
        line.style.height = datagrid.ui.$columnsWrapper.clientHeight + datagrid.ui.$bodyWrapper.clientHeight + 'px'
        draggingLineInitLeft = th.offsetLeft + th.clientWidth - datagrid.ui.$bodyWrapper.scrollLeft
        line.style.left = draggingLineInitLeft + 'px'
        line.classList.add('show')

        dragging = true
        draggingLever = e.target
        draggingLever.classList.add('dragging')
        startX = e.pageX
        draggingColumnIndex = indexOf.call(th.parentElement.children, th)
      }
    })

    document.addEventListener(MOUSEMOVE, e => {
      if (!dragging) return
      e.preventDefault() // 阻止在 PC 端拖动鼠标时选中文字或在移动端滑动屏幕
      // 调整虚线的 left 值
      const moved = e.pageX - startX
      if (moved > minLeft) {
        datagrid.ui.$draggingLine.style.left = draggingLineInitLeft + (e.pageX - startX) + 'px'
      }
    })

    document.addEventListener(MOUSEUP, e => {
      if (!dragging) return
      // 等 ../sort/index.js 里的 click 事件处理完后再移除这个 CSS 类
      setTimeout(() => draggingTH.classList.remove('resizing'), 0)
      datagrid.ui.$draggingLine.classList.remove('show')
      dragging = false
      draggingLever.classList.remove('dragging')
      let moved = e.pageX - startX // 计算移动的距离
      if (moved < minLeft) moved = minLeft
      datagrid.renderData.columnsWidth[draggingColumnIndex] = datagrid.renderData.columnsWidth[draggingColumnIndex] + moved
      datagrid._setWidth(datagrid.renderData.columnsWidth)
    })
  })
}
