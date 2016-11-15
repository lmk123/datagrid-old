require('./index.scss')
var findParent = require('../../utils/findParent')
var addEvent = require('../../utils/addEvent')

var DESC = -1 // 降序
var ASC = 1 // 升序
var NONE_ORDER = 0 // 不排序

var CLASS_ASC = 'order-by-asc'
var CLASS_DESC = 'order-by-desc'

module.exports = function (DataGrid) {
  DataGrid.prototype.sortBy = function (index, fire) {
    var columnDef = this.renderData.columnsDef[index]
    if (!columnDef || columnDef.sortable === false) return

    var sort = this.sort || (this.sort = {})

    var $columnsWrapper = this.ui.$columnsWrapper
    var lastSortIndex = sort.index
    if (index !== lastSortIndex) {
      if (typeof lastSortIndex === 'number') {
        var lastTH = $columnsWrapper.querySelector('th[data-index="' + lastSortIndex + '"]')
        if (lastTH) lastTH.classList.remove(CLASS_ASC, CLASS_DESC)
      }
      sort.index = index
      sort.direction = NONE_ORDER
    }

    var th = $columnsWrapper.querySelector('th[data-index="' + index + '"]')
    th.classList.remove(CLASS_ASC, CLASS_DESC)

    switch (sort.direction) {
      case NONE_ORDER:
        sort.direction = ASC
        th.classList.add(CLASS_ASC)
        break
      case ASC:
        sort.direction = DESC
        th.classList.add(CLASS_DESC)
        break
      case DESC:
        sort.direction = NONE_ORDER
        break
    }
    if (fire !== false) this.emit('sort', columnDef, sort.direction, index, th)
  }

  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.columnSorting) return

    var unbindEvents = []

    unbindEvents.push(
      // 给每个字段内部注入小箭头
      datagrid.on('beforeRenderColumns', function (columnsHTMLArr) {
        columnsHTMLArr.forEach(function (html, index) {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="order-ico"></span></th>')
        })
      })
    )

    datagrid.once('afterInit', function () {
      // 监听字段的点击事件
      var $columnsWrapper = datagrid.ui.$columnsWrapper
      unbindEvents.push(
        addEvent($columnsWrapper, 'click', function (e) {
          var th = findParent('th', e.target, $columnsWrapper)
          if (!th) return
          if (th.classList.contains('resizing')) return
          var index = Number(th.getAttribute('data-index'))
          if (!window.isNaN(index)) datagrid.sortBy(index)
        }),
        datagrid.on('afterSetData', function () {
          var lastSortColumnIndex = datagrid.sort && datagrid.sort.index
          if (typeof lastSortColumnIndex !== 'number' || lastSortColumnIndex < 0) return
          var th = datagrid.ui.$columnsWrapper.querySelector('th[data-index="' + lastSortColumnIndex + '"]')
          if (!th) return
          switch (datagrid.sort.direction) {
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
