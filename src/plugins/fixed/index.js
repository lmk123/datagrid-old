require('./index.scss')
var slice = Array.prototype.slice
var addEvent = require('../../utils/addEvent')

module.exports = function (DataGrid) {
  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.fixedColumns) return

    var unbindEvents = []

    var fixedDataGrid
    var fixedColumnsLeft

    datagrid.on('afterSetData', function (data) {
      fixedColumnsLeft = data.fixedColumnsLeft
      if (!fixedColumnsLeft) {
        if (fixedDataGrid) fixedDataGrid.el.classList.add('hidden')
        return
      }
      if (!fixedDataGrid) initFixedDataGrid(datagrid.el)
      fixedDataGrid.el.classList.remove('hidden')
      fixedDataGrid.setData({
        columns: datagrid.renderData.columnsDef.slice(0, fixedColumnsLeft),
        width: datagrid.renderData.columnsWidth.slice(0, fixedColumnsLeft),
        rows: datagrid.renderData.rows
      })
      // 保证 fixedDataGrid 中每一行的高度都与原 datagrid 的高度一致
      var fixedGridTrs = slice.call(fixedDataGrid.ui.$columnsWrapper.querySelectorAll('tr')).concat(slice.call(fixedDataGrid.ui.$bodyWrapper.querySelectorAll('tr')))
      var gridTrs = slice.call(datagrid.ui.$columnsWrapper.querySelectorAll('tr')).concat(slice.call(datagrid.ui.$bodyWrapper.querySelectorAll('tr')))
      fixedGridTrs.forEach(function (tr, index) {
        var dTr = gridTrs[index]
        if (tr.clientHeight !== dTr.clientHeight) {
          tr.style.height = dTr.clientHeight + 'px'
        }
      })
    })

    datagrid.once('beforeDestroy', function () {
      unbindEvents.forEach(function (unbind) {
        unbind()
      })
    })

    function initFixedDataGrid () {
      var datagridContainer = document.createElement('div')
      datagridContainer.classList.add('fixed-datagrid')

      var div = document.createElement('div')
      div.classList.add('hidden')
      datagridContainer.appendChild(div)

      datagrid.el.appendChild(datagridContainer)
      fixedDataGrid = new DataGrid(div, {
        height: datagrid.ui.$columnsWrapper.offsetHeight + datagrid.ui.$bodyWrapper.offsetHeight,
        columnSorting: datagrid.options.columnSorting,
        columnResize: datagrid.options.columnResize,
        selection: datagrid.options.selection
      })

      // 修改一个元素的 scrollTop 属性值会触发这个元素的 onscroll 事件，
      // 为了避免两个 datagrid 相互之间循环触发 onscroll 事件，
      // 所以加了下面的一堆标识位。
      // 循环触发 onscroll 事件会导致在快速滑动时两个表格的 scrollTop 不同步，
      // 造成"撕裂"现象
      var dataGridBodyScrolling = false
      var dataGridBodyScrollingTimeId
      var fixedDataGridBodyScrolling = false
      var fixedDataGridBodyScrollingTimeId
      unbindEvents.push(
        addEvent(datagrid.ui.$bodyWrapper, 'scroll', function () {
          if (fixedDataGridBodyScrolling) return
          dataGridBodyScrolling = true
          dataGridBodyScrollingTimeId && clearTimeout(dataGridBodyScrollingTimeId)
          dataGridBodyScrollingTimeId = setTimeout(function () {
            dataGridBodyScrolling = false
          }, 250)
          fixedDataGrid.ui.$bodyWrapper.scrollTop = this.scrollTop
        }),
        addEvent(fixedDataGrid.ui.$bodyWrapper, 'scroll', function () {
          if (dataGridBodyScrolling) return
          fixedDataGridBodyScrolling = true
          fixedDataGridBodyScrollingTimeId && clearTimeout(fixedDataGridBodyScrollingTimeId)
          fixedDataGridBodyScrollingTimeId = setTimeout(function () {
            fixedDataGridBodyScrolling = false
          }, 250)
          datagrid.ui.$bodyWrapper.scrollTop = this.scrollTop
        })
      )

      unbindEvents.push(
        datagrid.on('trHoverTo', syncHoverIn),
        fixedDataGrid.on('trHoverTo', syncHoverIn),
        datagrid.on('clearHover', syncHoverOut),
        fixedDataGrid.on('clearHover', syncHoverOut)
      )

      function syncHoverIn (index, trElement) {
        var to = fixedDataGrid.el.contains(trElement) ? datagrid : fixedDataGrid
        to.trHover(true, index, false)
      }

      function syncHoverOut (index, trElement) {
        var to = fixedDataGrid.el.contains(trElement) ? datagrid : fixedDataGrid
        to.trHover(false, index, false)
      }

      if (datagrid.options.selection) {
        datagrid.on('selectedChanged', function (index) {
          fixedDataGrid.selectRow(index, false)
        })
        fixedDataGrid.on('selectedChanged', function (index) {
          datagrid.selectRow(index)
        })
      }

      if (datagrid.options.columnSorting) {
        fixedDataGrid.on('sort', function (columnDef, direction, index) {
          datagrid.sortBy(index)
        })
        datagrid.on('sort', function (columnDef, direction, index) {
          if (index < fixedColumnsLeft) return
          var lastSortIndex = fixedDataGrid.sort && fixedDataGrid.sort.index
          if (typeof lastSortIndex === 'number') {
            fixedDataGrid.sort.direction = 0
            var lastTh = fixedDataGrid.ui.$columnsWrapper.querySelector('th[data-index="' + lastSortIndex + '"]')
            if (lastTh) lastTh.classList.remove('order-by-asc', 'order-by-desc')
          }
        })
      }
    }
  })
}

