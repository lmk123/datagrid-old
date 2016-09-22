require('./index.scss')
var findParent = require('../../utils/findParent')

module.exports = function (DataGrid) {
  DataGrid.prototype.selectRow = function (index, fire) {
    var $body = this.ui.$body
    var tr = $body.querySelector('tr[data-index="' + index + '"]')
    if (!tr) return
    var selectedTR = $body.querySelector('tr.selected')
    if (selectedTR) selectedTR.classList.remove('selected')
    tr.classList.add('selected')
    this._selectRowIndex = index
    if (fire !== false) this.emit('selectedChanged', index)
  }

  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.selection) return
    var unbind = datagrid.on('beforeSetData', function () {
      datagrid._selectRowIndex = null
    })

    datagrid.once('afterInit', function () {
      var $body = datagrid.ui.$body
      // 点击数据行时, 给出事件提示
      $body.addEventListener('click', function (e) {
        var tr = findParent('tr', e.target, $body)
        if (!tr) return
        var trIndex = Number(tr.dataset.index)
        if (!Number.isNaN(trIndex) && datagrid._selectRowIndex !== trIndex) datagrid.selectRow(trIndex)
      })
    })

    datagrid.once('beforeDestroy', unbind)
  })
}
