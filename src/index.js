var DataGrid = require('./DataGrid/index')

DataGrid.use(require('./plugins/selection'))
DataGrid.use(require('./plugins/pager'))
DataGrid.use(require('./plugins/sort'))
DataGrid.use(require('./plugins/drag'))
DataGrid.use(require('./plugins/fixed'))

module.exports = DataGrid
