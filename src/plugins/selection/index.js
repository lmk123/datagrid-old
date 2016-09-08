import './index.scss'
import findParent from '../../utils/findParent'

export default function (DataGrid) {
  DataGrid.prototype.selectRow = function (index) {
    const { $body } = this.ui
    const tr = $body.querySelector(`tr[data-index="${index}"]`)
    if (!tr) return
    const selectedTR = $body.querySelector('tr.selected')
    if (selectedTR) selectedTR.classList.remove('selected')
    tr.classList.add('selected')
    this._selectRowIndex = index
    this.emit('selectedChanged', index)
  }

  DataGrid.hook(datagrid => {
    const unbind = datagrid.on('beforeSetData', () => {
      datagrid._selectRowIndex = null
    })

    datagrid.once('afterInit', () => {
      const { $body } = datagrid.ui
      // 点击数据行时, 给出事件提示
      $body.addEventListener('click', e => {
        const tr = findParent('tr', e.target, $body)
        if (!tr) return
        const trIndex = Number(tr.dataset.index)
        if (!Number.isNaN(trIndex) && datagrid._selectRowIndex !== trIndex) datagrid.selectRow(trIndex)
      })
    })

    datagrid.once('beforeDestroy', unbind)
  })
}
