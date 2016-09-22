require('./index.scss')
var addEvent = require('../../utils/addEvent')
var findParent = require('../../utils/findParent')

var MIN_WIDTH = 100 // 表格的最小宽度

var indexOf = Array.prototype.indexOf

var IS_TOUCH = 'ontouchstart' in window
var MOUSEDOWN = IS_TOUCH ? 'touchstart' : 'mousedown'
var MOUSEMOVE = IS_TOUCH ? 'touchmove' : 'mousemove'
var MOUSEUP = IS_TOUCH ? 'touchend' : 'mouseup'

module.exports = function (DataGrid) {
  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.columnResize) return

    // 拖动时显示的虚线
    var dragLine = document.createElement('div')
    dragLine.classList.add('dragging-line')

    var unbindEvents = []

    // 注入虚线
    datagrid.once('afterInit', function () {
      datagrid.ui.$draggingLine = dragLine
      datagrid.el.appendChild(dragLine)
    })

    var dragging = false // 是否正在拖动中
    var draggingLever // 被拖动的那个小方块
    var draggingTH // 被拖动的 th 元素
    var draggingColumnIndex // 被拖动的元素是第几个字段
    var startX // 拖动开始时的 pageX 值
    var draggingLineInitLeft // 拖动开始时虚线的左编剧
    var minLeft // 当往左边拖动时能拖动的最大距离

    unbindEvents.push(
      // 注入供用户拖拽的小方块
      datagrid.on('beforeRenderColumns', function (columnsHTMLArr) {
        columnsHTMLArr.forEach(function (html, index) {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="drag-lever"></span></th>')
        })
      }),
      addEvent(datagrid.el, MOUSEDOWN, function (e) {
        if (e.target.classList.contains('drag-lever') && e.button === 0) {
          var th = findParent('th', e.target, datagrid.el)
          if (!th) return

          // 给 th 加一个状态, 避免触发排序功能
          // todo 需要一个临时关闭排序的开关
          th.classList.add('resizing')
          draggingTH = th

          minLeft = -(th.clientWidth - MIN_WIDTH)

          var ui = datagrid.ui
          var $columnsWrapper = ui.$columnsWrapper
          var $bodyWrapper = ui.$bodyWrapper

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
      addEvent(document, MOUSEMOVE, function (e) {
        if (!dragging) return
        e.preventDefault() // 阻止在 PC 端拖动鼠标时选中文字或在移动端滑动屏幕
        // 调整虚线的 left 值
        var moved = e.pageX - startX
        if (moved > minLeft) {
          dragLine.style.left = draggingLineInitLeft + (e.pageX - startX) + 'px'
        }
      }),
      addEvent(document, MOUSEUP, function (e) {
        if (!dragging) return
        // 等 ../sort/index.js 里的 click 事件处理完后再移除这个 CSS 类
        setTimeout(function () { draggingTH.classList.remove('resizing') }, 0)
        dragLine.classList.remove('show')
        dragging = false
        draggingLever.classList.remove('dragging')
        var moved = e.pageX - startX // 计算移动的距离
        if (moved < minLeft) moved = minLeft
        var columnsWidth = datagrid.renderData.columnsWidth
        columnsWidth[draggingColumnIndex] = columnsWidth[draggingColumnIndex] + moved
        datagrid.setWidth(columnsWidth)
      })
    )

    datagrid.once('beforeDestroy', function () {
      unbindEvents.forEach(function (unbind) { unbind() })
    })
  })
}
