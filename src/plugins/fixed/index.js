import './index.scss'
import addEvent from '../../utils/addEvent'

export default function (DataGrid) {
  DataGrid.hook(datagrid => {
    if (!datagrid.options.fixedColumns) return

    const unbindEvents = []

    let fixedDataGrid

    datagrid.on('afterSetData', data => {
      const { fixedColumnsLeft } = data
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
      const datagridContainer = document.createElement('div')
      datagridContainer.classList.add('fixed-datagrid')

      const div = document.createElement('div')
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
        datagrid.on('selectedChanged', index => {
          fixedDataGrid.selectRow(index, false)
        })
        fixedDataGrid.on('selectedChanged', index => {
          datagrid.selectRow(index)
        })
      }

      /**
       * 同步固定表格和主表格的 body 滚动位置
       * @param e
       */
      function syncScrollTop (e) {
        const isInFixed = fixedDataGrid.el.contains(e.target)
        const needAdjustBody = (isInFixed ? datagrid : fixedDataGrid).ui.$bodyWrapper
        const fromBody = (isInFixed ? fixedDataGrid : datagrid).ui.$bodyWrapper
        needAdjustBody.scrollTop = fromBody.scrollTop
      }
    }
  })
}

