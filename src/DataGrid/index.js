import './index.scss'
import containerTemplate from './template.html'
import Event from '../utils/event'

const plugins = []

function defaultColumnRender (columnDef) {
  return columnDef.name
}

function defaultDataRender (columnDef, rowData) {
  return rowData[columnDef.key]
}

class DataGrid extends Event {
  /**
   * 保存插件
   * @param {Function} plugin
   */
  static use (plugin) {
    if (process.env.NODE_ENV === 'development') {
      if (typeof plugin !== 'function') {
        throw new TypeError('.use(plugin) 参数类型错误: plugin 必需是一个函数。')
      }
    }
    if (plugins.indexOf(plugin) < 0) plugins.push(plugin)
  }

  constructor (ele, options) {
    super()
    this.el = ele
    this.options = Object.assign({}, {
      height: ele.clientHeight // 表格的总高度,
    }, options)
    plugins.forEach(plugin => plugin(this))
    this._init()
  }

  /**
   * 重置各种状态
   * @private
   */
  _reset () {
    this._selectRowIndex = -1
  }

  _init () {
    this.emit('beforeInit')
    const { el } = this
    el.classList.add('datagrid')
    el.innerHTML = containerTemplate

    const ui = {
      $columnsWrapper: '.grid-columns-wrapper',
      $columns: '.grid-columns',
      $bodyWrapper: '.grid-body-wrapper',
      $body: '.grid-body',
      $noData: '.grid-no-data'
    }

    for (let key in ui) {
      ui[key] = el.querySelector(ui[key])
    }

    // body 横向滚动时, 也要调整 columns 的左边距
    ui.$bodyWrapper.addEventListener('scroll', () => {
      ui.$columns.style.left = '-' + ui.$bodyWrapper.scrollLeft + 'px'
    })

    // 点击数据行时, 给出事件提示
    ui.$body.addEventListener('click', e => {
      // 查找被点击元素的父 tr 元素
      let tr = e.target
      do {
        if (tr.tagName === 'TR') {
          break
        }
        if (tr === ui.$body) {
          tr = null
          break
        }
        tr = tr.parentElement
      } while (true)
      if (!tr) return
      const trIndex = Number(tr.dataset.index)
      if (!Number.isNaN(trIndex) && this._selectRowIndex !== trIndex) this.selectRow(trIndex)
    })

    this.ui = ui
    this.emit('afterInit')
  }

  /**
   * 给表格填充数据
   * @param data
   * @param {String[]|Object[]} data.columns - 表格的字段定义
   * @param {Object[]} data.rows - 数据
   */
  setData (data) {
    this._reset()
    this.empty = !data.rows || !data.rows.length
    this.emit('beforeSetData', data)
    this.columnsDef = data.columns
    this.rows = data.rows
    this._renderColumns()
    this._renderBody()
    this.resize()
  }

  /**
   * 选中表格中的某一行
   * @param index
   */
  selectRow (index) {
    const tr = this.ui.$body.querySelector(`tr[data-index="${index}"]`)
    if (!tr) return
    const selectedTR = this.ui.$body.querySelector('tr.selected')
    if (selectedTR) selectedTR.classList.remove('selected')
    tr.classList.add('selected')
    this._selectRowIndex = index
    this.emit('selectedChanged', index)
  }

  /**
   * 渲染表头
   * @private
   */
  _renderColumns () {
    let columnsHTML = ''
    let colGroupHTML = ''
    let totalWidth = 0
    this.columnsDef.map(columnDef => {
      const _def = typeof columnDef === 'string'
        ? { name: columnDef }
        : columnDef

      if (!columnDef.key) columnDef.key = columnDef.name

      const width = columnDef.width || 100
      totalWidth += 100
      colGroupHTML += '<colgroup'
      colGroupHTML += ` width="${width}"`
      colGroupHTML += '></colgroup>'

      columnsHTML += '<th>' + (columnDef.th || defaultColumnRender)(columnDef) + '</th>'

      return _def
    })
    this._colgroups = colGroupHTML
    this._totalWidth = totalWidth
    this.ui.$columns.innerHTML = `${colGroupHTML}<thead><tr>${columnsHTML}</tr></thead>`
  }

  /**
   * 渲染数据
   * @private
   */
  _renderBody () {
    if (this.empty) {
      this.ui.$body.classList.add('hidden')
      this.ui.$noData.classList.remove('hidden')
      return
    }

    const bodyHTMLArray = this.rows.map((row, index) => {
      let rowHTML = `<tr data-index="${index}">`
      this.columnsDef.forEach(columnDef => {
        rowHTML += '<td>' + (columnDef.td || defaultDataRender)(columnDef, row) + '</td>'
      })
      rowHTML += '</tr>'
      return rowHTML
    })

    this.emit('beforeRenderBody', bodyHTMLArray)

    this.ui.$body.innerHTML = `${this._colgroups}<tbody>${bodyHTMLArray.join('')}</tbody>`
    this.ui.$body.classList.remove('hidden')
    this.ui.$noData.classList.add('hidden')
  }

  /**
   * 调整各种尺寸
   */
  resize () {
    const { _totalWidth } = this
    this.ui.$columns.style.width = _totalWidth + 'px' // 总长度需要先设定, 因为它会影响 columns 的高度

    const totalHeight = this.options.height
    const columnsHeight = this.ui.$columnsWrapper.clientHeight
    const bodyHeight = totalHeight - columnsHeight
    const obj = {
      totalHeight,
      bodyHeight
    }
    this.emit('beforeSetSize', obj)
    this.ui.$bodyWrapper.style.height = obj.bodyHeight + 'px'
    if (this.empty) {
      this.ui.$noData.style.height = obj.bodyHeight + 'px'
      this.ui.$noData.style.lineHeight = obj.bodyHeight + 'px'
    } else {
      this.ui.$body.style.width = _totalWidth + 'px'
    }
    this.emit('afterSetSize')
  }
}

export default DataGrid
