import DataGrid from './DataGrid/index'
import Pager from './plugins/pager'
import Sorter from './plugins/sort'

DataGrid.use(Pager)
DataGrid.use(Sorter)

export default DataGrid
