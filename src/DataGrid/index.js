import './index.scss'
import containerTemplate from './template.html'
import Event from '../utils/Event'
import addEvent from '../utils/addEvent'

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

  /**
   * 每次创建新的实例时都会触发这个函数
   * @param {Function} fn
   * @return {function()}
   */
  static hook (fn) {
    hooks.push(fn)
    return () => {
      const i = hooks.indexOf(fn)
      if (i >= 0) hooks.splice(i, 1)
    }
  }

  /**
   * 构造函数
   * @param {HTMLElement} ele
   * @param {Object} [options]
   */
  constructor (ele, options) {
    super()
    this.el = ele
    this.options = Object.assign({}, {
      height: ele.clientHeight // 表格的总高度
    }, options)
    hooks.forEach(fn => fn(this))
    this._init()
  }

  _init () {
    const _unbindEvents = this._unbindEvents = []
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

    _unbindEvents.push(
      // body 横向滚动时, 也要调整 columns 的左边距
      addEvent(ui.$bodyWrapper, 'scroll', () => {
        ui.$columns.style.left = '-' + ui.$bodyWrapper.scrollLeft + 'px'
      })
    )

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
    this.renderData = {}
    this.setColumns(data.columns)
    this.setBody(data.rows)
    this.setWidth(data.width)
    this.emit('afterSetData')
  }

  setWidth (widthArr) {
    if (widthArr) {
      this.renderData.columnsWidth = widthArr
    } else {
      widthArr = this.renderData.columnsWidth
    }
    const cols = this._colGroupsHTML(widthArr)
    this._renderCols(cols)
    this._resize(widthArr)
  }

  /**
   * 计算出表格的 col 元素的 HTML
   * @param {Number[]} columnsWidth - 定义字段宽度的数组
   * @private
   * @return {String[]}
   */
  _colGroupsHTML (columnsWidth) {
    return columnsWidth ? columnsWidth.map(width => `<col style="width:${width}px">`) : []
  }

  /**
   * 填充 colsHTML
   * @param {String[]} colsHTML
   * @private
   */
  _renderCols (colsHTML) {
    const { ui } = this
    ui.$columnsColGroup.innerHTML = ui.$bodyColGroup.innerHTML = colsHTML.join('')
  }

  /**
   * 调整各种尺寸
   * @param {Number[]} columnsWidth
   * @private
   */
  _resize (columnsWidth) {
    const { $columns, $bodyWrapper, $noData, $body } = this.ui
    const _totalWidth = columnsWidth ? columnsWidth.reduce((prev, width) => prev + width) : this.el.clientWidth
    $columns.style.width = _totalWidth + 'px' // 总长度需要先设定, 因为它会影响 columnsWrapper.clientHeight
    const totalHeight = this.options.height
    const columnsHeight = this.ui.$columnsWrapper.clientHeight
    const bodyHeight = totalHeight - columnsHeight
    const obj = {
      totalHeight,
      bodyHeight
    }
    this.emit('beforeSetSize', obj)
    $bodyWrapper.style.height = obj.bodyHeight + 'px'
    if (this.empty) {
      $noData.style.height = obj.bodyHeight + 'px'
      $noData.style.lineHeight = obj.bodyHeight + 'px'
    } else {
      $body.style.width = _totalWidth + 'px'
    }
  }

  /**
   * 渲染表头的方法
   * @param {String[]|Object[]} columns
   * @private
   */
  setColumns (columns) {
    const columnsDef = this.renderData.columnsDef = this._normalize(columns)
    const columnsHTML = this._columnsHTML(columnsDef)
    this.emit('beforeRenderColumns', columnsHTML)
    this._renderColumns(columnsHTML)
  }

  /**
   * 调整字段定义, 并根据字段定义计算出每个字段的宽度数组
   * @param columns
   * @private
   */
  _normalize (columns) {
    return columns.map(columnDef => {
      const _def = typeof columnDef === 'string'
        ? { name: columnDef }
        : columnDef

      if (!_def.key) _def.key = _def.name
      return _def
    })
  }

  /**
   * 计算出渲染表头字段的 HTML
   * @private
   */
  _columnsHTML (columnsDef) {
    return columnsDef.map(columnDef => {
      return '<th>' + (columnDef.th || defaultColumnRender)(columnDef) + '</th>'
    })
  }

  /**
   * 渲染表头
   * @param {String[]} columnsHTML
   * @private
   */
  _renderColumns (columnsHTML) {
    this.ui.$columnsThead.innerHTML = columnsHTML.join('')
  }

  /**
   * 渲染表格的方法
   * @param {Object[]} rows
   */
  setBody (rows) {
    const { renderData } = this
    this.empty = !rows || !rows.length
    renderData.rows = rows
    renderData.trsArr = this._bodyHTML(renderData.columnsDef, rows)
    this._renderBody(renderData.trsArr)
  }

  /**
   * 计算出渲染 body 需要的数据
   * @private
   */
  _bodyHTML (columnsDef, rows) {
    return this.empty ? [] : rows.map((row, index) => {
      let rowHTML = `<tr data-index="${index}">`
      columnsDef.forEach(columnDef => {
        rowHTML += '<td>' + (columnDef.td || defaultDataRender)(columnDef, row) + '</td>'
      })
      rowHTML += '</tr>'
      return rowHTML
    })
  }

  /**
   * 渲染数据
   * @param {String[]} trsArr
   * @private
   */
  _renderBody (trsArr) {
    const { $body, $noData, $bodyTbody } = this.ui
    if (this.empty) {
      $body.classList.add('hidden')
      $noData.classList.remove('hidden')
      return
    }
    $bodyTbody.innerHTML = trsArr.join('')
    $body.classList.remove('hidden')
    $noData.classList.add('hidden')
  }

  /**
   * 销毁实例。
   * @param {Boolean} remove - 如果为 true, 则会移除根节点
   */
  destroy (remove) {
    this.emit('beforeDestroy')
    this._unbindEvents.forEach(unbind => unbind())
    if (remove) this.el.remove()
    this.emit('afterDestroy')
  }
}

export default DataGrid
