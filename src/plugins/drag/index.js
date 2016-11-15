require('./index.scss')
var addEvent = require('../../utils/addEvent')
var findParent = require('../../utils/findParent')

var MIN_WIDTH = 100 // 表格的最小宽度

var indexOf = Array.prototype.indexOf

var IS_TOUCH = 'ontouchstart' in window
var MOUSEDOWN = IS_TOUCH ? 'touchstart' : 'mousedown'
var MOUSEMOVE = IS_TOUCH ? 'touchmove' : 'mousemove'
var MOUSEUP = IS_TOUCH ? 'touchend' : 'mouseup'

var getPageX = IS_TOUCH ? function (e) {
  return e.pageX || e.changedTouches[0].pageX
} : function (e) {
  return e.pageX
}

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
    var draggingTH // 被拖动的 th 元素
    var draggingColumnIndex // 被拖动的元素是第几个字段
    var startX // 拖动开始时的 pageX 值
    var draggingLineInitLeft // 拖动开始时虚线的左编剧
    var minLeft // 当往左边拖动时能拖动的最大距离

    function showDragLine (th) {
      // 显示虚线
      var ui = datagrid.ui
      var $columnsWrapper = ui.$columnsWrapper
      var $bodyWrapper = ui.$bodyWrapper

      dragLine.style.height = $columnsWrapper.offsetHeight + $bodyWrapper.offsetHeight + 'px'
      draggingLineInitLeft = th.offsetLeft + th.clientWidth - $bodyWrapper.scrollLeft
      dragLine.style.left = draggingLineInitLeft + 1 + 'px'
      document.documentElement.classList.add('data-grid-dragging')
    }

    // 在非触摸屏设备上，鼠标移上去的时候就显示拖拽虚线
    if (!IS_TOUCH) {
      unbindEvents.push(
        addEvent(datagrid.el, 'mouseover', function (e) {
          if (!e.target.classList.contains('drag-lever')) return
          var th = findParent('th', e.target, datagrid.el)
          if (!th) return
          showDragLine(th)
        }),
        addEvent(datagrid.el, 'mouseout', function (e) {
          if (!e.target.classList.contains('drag-lever') || dragging) return
          document.documentElement.classList.remove('data-grid-dragging')
        })
      )
    }

    unbindEvents.push(
      // 注入供用户拖拽的小方块
      datagrid.on('beforeRenderColumns', function (columnsHTMLArr) {
        columnsHTMLArr.forEach(function (html, index) {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="drag-lever"></span></th>')
        })
      }),
      addEvent(datagrid.el, MOUSEDOWN, function (e) {
        if (e.target.classList.contains('drag-lever') && (IS_TOUCH || e.button === 0)) {
          var th = findParent('th', e.target, datagrid.el)
          if (!th) return

          if (IS_TOUCH) showDragLine(th)

          // 给 th 加一个状态, 避免触发排序功能
          // todo 需要一个临时关闭排序的开关
          th.classList.add('resizing')
          minLeft = -(th.clientWidth - MIN_WIDTH)
          draggingTH = th
          dragging = true
          startX = getPageX(e)
          draggingColumnIndex = indexOf.call(th.parentElement.children, th)
        }
      }),
      addEvent(document, MOUSEMOVE, function (e) {
        if (!dragging) return
        e.preventDefault() // 阻止在 PC 端拖动鼠标时选中文字或在移动端滑动屏幕
        // 调整虚线的 left 值
        var moved = getPageX(e) - startX
        if (moved > minLeft) {
          dragLine.style.left = draggingLineInitLeft + (getPageX(e) - startX) + 'px'
        }
      }),
      addEvent(document, MOUSEUP, function (e) {
        if (!dragging) return
        // 等 ../sort/index.js 里的 click 事件处理完后再移除这个 CSS 类
        setTimeout(function () { draggingTH.classList.remove('resizing') }, 0)
        document.documentElement.classList.remove('data-grid-dragging')
        dragging = false
        var moved = getPageX(e) - startX // 计算移动的距离
        if (moved < minLeft) moved = minLeft
        var columnsMinWidth = datagrid.renderData.columnsMinWidth
        columnsMinWidth[draggingColumnIndex] = columnsMinWidth[draggingColumnIndex] + moved
        datagrid.setWidth(columnsMinWidth)
      })
    )

    datagrid.once('beforeDestroy', function () {
      unbindEvents.forEach(function (unbind) { unbind() })
    })
  })
}
