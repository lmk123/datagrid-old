import DataGrid from './DataGrid/index'
import Pager from './plugins/pager'
import Sorter from './plugins/sort'
import Drag from './plugins/drag'

DataGrid.use(Pager)
DataGrid.use(Sorter)
DataGrid.use(Drag)

export default DataGrid
