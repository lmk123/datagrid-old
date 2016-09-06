import './index.scss'
import addEvent from '../../utils/addEvent'
import findParent from '../../utils/findParent'

const MIN_WIDTH = 100 // 表格的最小宽度

const { indexOf } = Array.prototype

const IS_TOUCH = 'ontouchstart' in window
const MOUSEDOWN = IS_TOUCH ? 'touchstart' : 'mousedown'
const MOUSEMOVE = IS_TOUCH ? 'touchmove' : 'mousemove'
const MOUSEUP = IS_TOUCH ? 'touchend' : 'mouseup'

export default function (DataGrid) {
  DataGrid.hook(datagrid => {
    // 拖动时显示的虚线
    const dragLine = document.createElement('div')
    dragLine.classList.add('dragging-line')

    const unbindEvents = []

    // 注入虚线
    datagrid.once('afterInit', () => {
      datagrid.ui.$draggingLine = dragLine
      datagrid.el.appendChild(dragLine)
    })

    let dragging = false // 是否正在拖动中
    let draggingLever // 被拖动的那个小方块
    let draggingTH // 被拖动的 th 元素
    let draggingColumnIndex // 被拖动的元素是第几个字段
    let startX // 拖动开始时的 pageX 值
    let draggingLineInitLeft // 拖动开始时虚线的左编剧
    let minLeft // 当往左边拖动时能拖动的最大距离

    unbindEvents.push(
      // 注入供用户拖拽的小方块
      datagrid.on('beforeRenderColumns', columnsHTMLArr => {
        columnsHTMLArr.forEach((html, index) => {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="drag-lever"></span></th>')
        })
      }),
      addEvent(datagrid.el, MOUSEDOWN, e => {
        if (e.target.classList.contains('drag-lever') && e.button === 0) {
          const th = findParent('th', e.target, datagrid.el)
          if (!th) return

          // 给 th 加一个状态, 避免触发排序功能
          // todo 需要一个临时关闭排序的开关
          th.classList.add('resizing')
          draggingTH = th

          minLeft = -(th.clientWidth - MIN_WIDTH)

          const { $columnsWrapper, $bodyWrapper } = datagrid.ui

          // 显示虚线
          dragLine.style.height = $columnsWrapper.clientHeight + $bodyWrapper.clientHeight + 'px'
          draggingLineInitLeft = th.offsetLeft + th.clientWidth - $bodyWrapper.scrollLeft
          dragLine.style.left = draggingLineInitLeft + 'px'
          dragLine.classList.add('show')

          dragging = true
          draggingLever = e.target
          draggingLever.classList.add('dragging')
          startX = e.pageX
          draggingColumnIndex = indexOf.call(th.parentElement.children, th)
        }
      }),
      addEvent(document, MOUSEMOVE, e => {
        if (!dragging) return
        e.preventDefault() // 阻止在 PC 端拖动鼠标时选中文字或在移动端滑动屏幕
        // 调整虚线的 left 值
        const moved = e.pageX - startX
        if (moved > minLeft) {
          dragLine.style.left = draggingLineInitLeft + (e.pageX - startX) + 'px'
        }
      }),
      addEvent(document, MOUSEUP, e => {
        if (!dragging) return
        // 等 ../sort/index.js 里的 click 事件处理完后再移除这个 CSS 类
        setTimeout(() => draggingTH.classList.remove('resizing'), 0)
        dragLine.classList.remove('show')
        dragging = false
        draggingLever.classList.remove('dragging')
        let moved = e.pageX - startX // 计算移动的距离
        if (moved < minLeft) moved = minLeft
        const { columnsWidth } = datagrid.renderData
        columnsWidth[draggingColumnIndex] = columnsWidth[draggingColumnIndex] + moved
        datagrid.setWidth(columnsWidth)
      })
    )

    datagrid.once('beforeDestroy', ()=> {
      unbindEvents.forEach(unbind => unbind())
    })
  })
}
