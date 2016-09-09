import DataGrid from './DataGrid/index'

import Selection from './plugins/selection'
import Pager from './plugins/pager'
import Sorter from './plugins/sort'
import Drag from './plugins/drag'
import Fixed from './plugins/fixed'

DataGrid.use(Selection)
DataGrid.use(Pager)
DataGrid.use(Sorter)
DataGrid.use(Drag)
DataGrid.use(Fixed)

export default DataGrid
