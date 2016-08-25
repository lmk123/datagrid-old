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
    plugins.forEach(plugin => plugin(this))
    this.el = ele
    this.options = Object.assign({}, {
      height: ele.clientHeight // 表格的总高度,
    }, options)
    this._init()
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
      $body: '.grid-body'
    }

    for (let key in ui) {
      ui[key] = el.querySelector(ui[key])
    }

    // body 横向滚动时, 也要调整 columns 的左边距
    ui.$bodyWrapper.addEventListener('scroll', () => {
      ui.$columns.style.left = '-' + ui.$bodyWrapper.scrollLeft + 'px'
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
    this.emit('beforeSetData', data)
    this.columnsDef = data.columns
    this.rows = data.rows
    this.empty = !!(this.rows && this.rows.length)
    this._renderColumns()
    this._renderBody()
    this.resize()
  }

  /**
   * 渲染表头
   * @private
   */
  _renderColumns () {
    let columnsHTML = ''
    this.columnsDef.map(columnDef => {
      const _def = typeof columnDef === 'string'
        ? { name: columnDef }
        : columnDef

      if (!columnDef.key) columnDef.key = columnDef.name

      columnsHTML += '<th>' + (columnDef.th || defaultColumnRender)(columnDef) + '</th>'

      return _def
    })
    this.ui.$columns.innerHTML = `<thead><tr>${columnsHTML}</tr></thead>`
  }

  /**
   * 渲染数据
   * @private
   */
  _renderBody () {
    if (this.empty) {
      // todo 暂无数据提示
    }

    const bodyHTMLArray = this.rows.map(row => {
      let rowHTML = '<tr>'
      this.columnsDef.forEach(columnDef => {
        rowHTML += '<td>' + (columnDef.td || defaultDataRender)(columnDef, row) + '</td>'
      })
      rowHTML += '</tr>'
      return rowHTML
    })

    this.emit('beforeRenderBody', bodyHTMLArray)

    this.ui.$body.innerHTML = `<tbody>${bodyHTMLArray.join('')}</tbody>`
  }

  /**
   * 调整各种尺寸
   */
  resize () {
    const totalHeight = this.options.height
    const columnsHeight = this.ui.$columnsWrapper.clientHeight
    const bodyHeight = totalHeight - columnsHeight
    const obj = {
      totalHeight,
      columnsHeight,
      bodyHeight
    }
    this.emit('beforeSetBodyHeight', obj)
    this.ui.$bodyWrapper.style.height = obj.bodyHeight + 'px'
  }
}

export default DataGrid
