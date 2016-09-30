// todo selection 插件的全选功能目前无法与 fixedColumns 插件共同使用
require('./index.scss')
var findParent = require('../../utils/findParent')
var addEvent = require('../../utils/addEvent')

var SelectedClassName = 'selected'

module.exports = function (DataGrid) {
  DataGrid.prototype.selectRow = function (index, fire) {
    var $body = this.ui.$body
    var tr = $body.querySelector('tr[data-index="' + index + '"]')
    if (!tr) return
    // 如果是多选，则判断当前点击的行是否已被选中，
    // 如果已被选中，则删除选中状态，
    // 否则添加选中状态
    var i = this._selectRowsIndex.indexOf(index)

    // 多选状态下，如果此行已被选中，则清除此行的选中状态；
    // 如果没被选中，则添加选中状态
    if (this._isMultipleSelect) {
      if (i >= 0) {
        this._selectRowsIndex.splice(i, 1)
      } else {
        this._selectRowsIndex.push(index)
      }
    } else {
      // 单选状态下，如果已被选中则直接返回，不做任何操作；
      // 否则删除上次选中状态并给当前行添加选中状态
      if (i >= 0) return
      var selectedTR = $body.querySelector('tr.' + SelectedClassName)
      if (selectedTR) selectedTR.classList.remove(SelectedClassName)
      tr.classList.add('selected')
      this._selectRowsIndex = [index]
    }

    if (fire !== false) this.emit('selectedChanged', this._isMultipleSelect ? this._selectRowsIndex : index)
  }

  DataGrid.prototype.selectAll = function (allOrNone, fire) {
    if (!this._isMultipleSelect) return
    this._selectRowsIndex = []
    var that = this
    Array.prototype.forEach.call(this.ui.$bodyWrapper.querySelectorAll('tr[data-index]'), function (tr) {
      if (allOrNone) {
        var index = Number(tr.getAttribute('data-index'))
        that._selectRowsIndex.push(index)
      }
      tr.querySelector('input[type=checkbox]').checked = allOrNone
    })
    if (fire !== false) this.emit('selectedChanged', this._selectRowsIndex)
  }

  DataGrid.hook(function (datagrid) {
    var selectionType = datagrid.options.selection
    if (!selectionType) return
    var isMultiple = datagrid._isMultipleSelect = selectionType === 'multiple'
    var unbindEvents = []
    unbindEvents.push(datagrid.on('beforeSetData', function () {
      datagrid._selectRowsIndex = []
    }))

    if (isMultiple) {
      unbindEvents.push(datagrid.on('beforeSetData', function (data) {
        data.columns.unshift({
          sortable: false,
          thRenderer: function () {
            return '<input type="checkbox" class="select-all">'
          },
          tdRenderer: function () {
            return '<input type="checkbox">'
          }
        })
      }))
    }

    datagrid.once('afterInit', function () {
      var $bodyWrapper = datagrid.ui.$bodyWrapper
      var $columnsWrapper = datagrid.ui.$columnsWrapper
      if (isMultiple) {
        // 点击开头的 checkbox 才触发事件
        unbindEvents.push(addEvent($bodyWrapper, 'change', function (e) {
          if (e.target.tagName !== 'INPUT' || e.target.type !== 'checkbox') return
          $columnsWrapper.querySelector('input.select-all').checked = false
          var tr = findParent('tr', e.target, $bodyWrapper)
          if (!tr) return
          var trIndex = Number(tr.getAttribute('data-index'))
          if (!Number.isNaN(trIndex)) datagrid.selectRow(trIndex)
          // 等 datagrid.selectRow() 方法执行完成后，判断 _selectedRowsIndex 数组的长度是否等于 rows 的长度就知道是否是全选了
          $columnsWrapper.querySelector('input[type=checkbox].select-all').checked = !datagrid.empty && datagrid._selectRowsIndex.length === datagrid.renderData.rows.length
        }))
        // 全选 checkbox
        unbindEvents.push(addEvent($columnsWrapper, 'change', function (e) {
          var input = e.target
          if (input.tagName !== 'INPUT' || input.type !== 'checkbox' || !input.classList.contains('select-all')) return
          datagrid.selectAll(input.checked)
        }))
      } else {
        // 点击数据行时, 给出事件提示
        unbindEvents.push(addEvent($bodyWrapper, 'click', function (e) {
          var tr = findParent('tr', e.target, $bodyWrapper)
          if (!tr) return
          var trIndex = Number(tr.getAttribute('data-index'))
          if (!Number.isNaN(trIndex)) datagrid.selectRow(trIndex)
        }))
      }
    })

    datagrid.once('beforeDestroy', function () {
      unbindEvents.forEach(function (unbind) {
        unbind()
      })
    })
  })
}
