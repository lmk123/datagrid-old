import './index.scss'
import containerTemplate from './template.html'
import Event from '../utils/event'

function defaultColumnRender (columnDef) {
  return columnDef.name
}

function defaultDataRender (columnDef, rowData) {
  return rowData[columnDef.key]
}

const hooks = []

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
      if (plugin._installed) return
      plugin._installed = true
    }
    plugin(DataGrid)
  }

  static hook (fn) {
    hooks.push(fn)
    return () => {
      const i = hooks.indexOf(fn)
      if (i >= 0) hooks.splice(i, 1)
    }
  }

  constructor (ele, options) {
    super()
    this.el = ele
    this.options = Object.assign({}, {
      height: ele.clientHeight // 表格的总高度,
    }, options)
    hooks.forEach(fn => fn(this))
    this._init()
  }

  /**
   * 重置各种状态
   * @private
   */
  _reset () {
    this._selectRowIndex = -1
    this.renderData = {}
  }

  _init () {
    this.emit('beforeInit')
    const { el } = this
    el.classList.add('datagrid')
    el.innerHTML = containerTemplate

    const ui = {
      $columnsWrapper: '.grid-columns-wrapper',
      $columns: '.grid-columns',
      $columnsColGroup: '.grid-columns colgroup',
      $columnsThead: '.grid-columns thead',
      $bodyWrapper: '.grid-body-wrapper',
      $body: '.grid-body',
      $bodyColGroup: '.grid-body colgroup',
      $bodyTbody: '.grid-body tbody',
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
   * @param {Number[]} data.width - 每个字段对应的宽度
   */
  setData (data) {
    this.emit('beforeSetData', data)
    this._reset()
    this._setColumns(data.columns)
    this._setBody(data.rows)
    this._setWidth(data.width)
    this.emit('afterSetData')
  }

  _setWidth (widthArr) {
    if (widthArr) {
      this.renderData.columnsWidth = widthArr
    }
    this._colGroupsHTML()
    this._renderCols()
    this._resize()
  }

  _setBody (rows) {
    this.empty = !rows || !rows.length
    this.rows = rows
    this._bodyHTML()
    this._renderBody()
  }

  _setColumns (columns) {
    this._normalize(columns)
    this._columnsHTML()
    this._renderColumns()
  }

  /**
   * 调整字段定义, 并根据字段定义计算出每个字段的宽度数组
   * @param columns
   * @private
   */
  _normalize (columns) {
    const result = columns.map(columnDef => {
      const _def = typeof columnDef === 'string'
        ? { name: columnDef }
        : columnDef

      if (!_def.key) _def.key = _def.name
      if (!_def.width) _def.width = 100
      return _def
    })
    this.renderData.columnsDef = result
  }

  /**
   * 计算出表格的 col 元素的 HTML
   * @private
   */
  _colGroupsHTML () {
    this.renderData.colsHTMLArr = this.renderData.columnsWidth ? this.renderData.columnsWidth.map((width) => {
      return `<col style="width:${width}px">`
    }, '') : []
  }

  /**
   * 计算出渲染表头字段的 HTML
   * @private
   */
  _columnsHTML () {
    this.renderData.columnsHTMLArr = this.renderData.columnsDef.map((columnDef) => {
      return '<th>' + (columnDef.th || defaultColumnRender)(columnDef) + '</th>'
    }, '')
  }

  /**
   * 计算出渲染 body 需要的数据
   * @private
   */
  _bodyHTML () {
    this.renderData.trsArr = this.empty ? [] : this.rows.map((row, index) => {
      let rowHTML = `<tr data-index="${index}">`
      this.renderData.columnsDef.forEach(columnDef => {
        rowHTML += '<td>' + (columnDef.td || defaultDataRender)(columnDef, row) + '</td>'
      })
      rowHTML += '</tr>'
      return rowHTML
    })
  }

  _renderColumns () {
    this.ui.$columnsThead.innerHTML = this.renderData.columnsHTMLArr.join('')
  }

  _renderCols () {
    this.ui.$columnsColGroup.innerHTML = this.ui.$bodyColGroup.innerHTML = this.renderData.colsHTMLArr.join('')
  }

  _renderBody () {
    if (this.empty) {
      this.ui.$body.classList.add('hidden')
      this.ui.$noData.classList.remove('hidden')
      return
    }
    this.ui.$bodyTbody.innerHTML = this.renderData.trsArr.join('')
    this.ui.$body.classList.remove('hidden')
    this.ui.$noData.classList.add('hidden')
  }

  _resize () {
    const _totalWidth = this.renderData.columnsWidth ? this.renderData.columnsWidth.reduce((prev, width) => prev + width) : this.el.clientWidth
    this.ui.$columns.style.width = _totalWidth + 'px' // 总长度需要先设定, 因为它会影响 columnsWrapper.clientHeight
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
}

export default DataGrid
