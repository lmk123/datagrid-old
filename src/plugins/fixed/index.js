require('./index.scss')
var addEvent = require('../../utils/addEvent')

module.exports = function (DataGrid) {
  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.fixedColumns) return

    var unbindEvents = []

    var fixedDataGrid

    datagrid.on('afterSetData', function (data) {
      var fixedColumnsLeft = data.fixedColumnsLeft
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
    })

    function initFixedDataGrid () {
      var datagridContainer = document.createElement('div')
      datagridContainer.classList.add('fixed-datagrid')

      var div = document.createElement('div')
      div.classList.add('hidden')
      datagridContainer.appendChild(div)

      datagrid.el.appendChild(datagridContainer)
      fixedDataGrid = new DataGrid(div, {
        height: datagrid.ui.$columnsWrapper.clientHeight + datagrid.ui.$bodyWrapper.clientHeight,
        columnSorting: datagrid.options.columnSorting,
        columnResize: datagrid.options.columnResize,
        selection: datagrid.options.selection
      })

      unbindEvents.push(
        addEvent(fixedDataGrid.ui.$bodyWrapper, 'scroll', syncScrollTop),
        addEvent(datagrid.ui.$bodyWrapper, 'scroll', syncScrollTop)
      )

      if (datagrid.options.selection) {
        datagrid.on('selectedChanged', function (index) {
          fixedDataGrid.selectRow(index, false)
        })
        fixedDataGrid.on('selectedChanged', function (index) {
          datagrid.selectRow(index)
        })
      }

      /**
       * 同步固定表格和主表格的 body 滚动位置
       * @param e
       */
      function syncScrollTop (e) {
        var isInFixed = fixedDataGrid.el.contains(e.target)
        var needAdjustBody = (isInFixed ? datagrid : fixedDataGrid).ui.$bodyWrapper
        var fromBody = (isInFixed ? fixedDataGrid : datagrid).ui.$bodyWrapper
        needAdjustBody.scrollTop = fromBody.scrollTop
      }
    }
  })
}

