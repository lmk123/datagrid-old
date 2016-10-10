require('./index.scss')
var findParent = require('../../utils/findParent')
var addEvent = require('../../utils/addEvent')

var indexOf = Array.prototype.indexOf

var DESC = -1 // 降序
var ASC = 1 // 升序
var NONE_ORDER = 0 // 不排序

var CLASS_ASC = 'order-by-asc'
var CLASS_DESC = 'order-by-desc'

module.exports = function (DataGrid) {
  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.columnSorting) return

    var unbindEvents = []

    var lastSortColumnIndex
    var sortType = NONE_ORDER

    unbindEvents.push(
      // 给每个字段内部注入小箭头
      datagrid.on('beforeRenderColumns', function (columnsHTMLArr) {
        columnsHTMLArr.forEach(function (html, index) {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="order-ico"></span></th>')
        })
      })
    )

    function clearLastSort () {
      if (typeof lastSortColumnIndex === 'number') {
        var lastTH = datagrid.ui.$columnsWrapper.querySelector('th:nth-child(' + (lastSortColumnIndex + 1) + ')')
        if (lastTH) lastTH.classList.remove(CLASS_ASC, CLASS_DESC)
      }
    }

    datagrid.once('afterInit', function () {
      // 监听字段的点击事件
      var $columnsWrapper = datagrid.ui.$columnsWrapper
      unbindEvents.push(
        addEvent($columnsWrapper, 'click', function (e) {
          var th = findParent('th', e.target, $columnsWrapper)
          if (!th) return
          if (th.classList.contains('resizing')) return
          var index = indexOf.call(th.parentElement.children, th)
          var columnDef = datagrid.renderData.columnsDef[index]
          if (columnDef.sortable === false) return

          if (index !== lastSortColumnIndex) {
            clearLastSort()
            lastSortColumnIndex = index
            sortType = NONE_ORDER
          }

          th.classList.remove(CLASS_ASC, CLASS_DESC)

          switch (sortType) {
            case NONE_ORDER:
              sortType = ASC
              th.classList.add(CLASS_ASC)
              break
            case ASC:
              sortType = DESC
              th.classList.add(CLASS_DESC)
              break
            case DESC:
              sortType = NONE_ORDER
              break
          }
          datagrid.emit('sort', columnDef, sortType, th)
        }),
        datagrid.on('afterSetData', function () {
          if (typeof lastSortColumnIndex !== 'number' || lastSortColumnIndex < 0) return
          var th = datagrid.ui.$columnsWrapper.querySelector('th[data-index=' + lastSortColumnIndex + ']')
          if (!th) return
          switch (sortType) {
            case ASC:
              th.classList.add(CLASS_ASC)
              break
            case DESC:
              th.classList.add(CLASS_DESC)
              break
          }
        })
      )
    })

    datagrid.once('beforeDestroy', function () {
      unbindEvents.forEach(function (unbind) { unbind() })
    })
  })
}
