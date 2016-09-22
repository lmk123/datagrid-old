require('./index.scss')
var containerTemplate = require('./template.html')
var Event = require('../utils/Event')
var addEvent = require('../utils/addEvent')

function defaultColumnRender (columnDef) {
  return columnDef.name
}

function defaultDataRender (columnDef, rowData) {
  return rowData[columnDef.key]
}

var hooks = []

/**
 * 构造函数
 * @param {HTMLElement} ele
 * @param {Object} [options]
 */
function DataGrid (ele, options) {
  Event.call(this)
  this.el = ele
  this.options = Object.assign({}, {
    height: ele.clientHeight // 表格的总高度
  }, options)
  hooks.forEach(function (fn) { fn(this) }, this)
  this._init()
}

/**
 * 保存插件
 * @param {Function} plugin
 */
DataGrid.use = function (plugin) {
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
DataGrid.hook = function (fn) {
  hooks.push(fn)
  return function () {
    var i = hooks.indexOf(fn)
    if (i >= 0) hooks.splice(i, 1)
  }
}

var dp = DataGrid.prototype = Object.create(Event.prototype)
dp.constructor = DataGrid

dp._init = function () {
  var _unbindEvents = this._unbindEvents = []
  this.emit('beforeInit')
  var el = this.el
  el.classList.add('datagrid')
  el.innerHTML = containerTemplate

  var ui = {
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

  for (var key in ui) {
    ui[key] = el.querySelector(ui[key])
  }

  _unbindEvents.push(
    // body 横向滚动时, 也要调整 columns 的左边距
    addEvent(ui.$bodyWrapper, 'scroll', function () {
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
dp.setData = function (data) {
  this.emit('beforeSetData', data)
  this.renderData = {}
  this.setColumns(data.columns)
  this.setBody(data.rows)
  this.setWidth(data.width)
  this.emit('afterSetData', data)
}

dp.setWidth = function (widthArr) {
  if (widthArr) {
    this.renderData.columnsWidth = widthArr
  } else {
    widthArr = this.renderData.columnsWidth
  }
  var cols = this._colGroupsHTML(widthArr)
  this._renderCols(cols)
  this._resize(widthArr)
}

/**
 * 计算出表格的 col 元素的 HTML
 * @param {Number[]} columnsWidth - 定义字段宽度的数组
 * @private
 * @return {String[]}
 */
dp._colGroupsHTML = function (columnsWidth) {
  return columnsWidth ? columnsWidth.map(function (width) { return '<col style="width:' + width + 'px">' }) : []
}

/**
 * 填充 colsHTML
 * @param {String[]} colsHTML
 * @private
 */
dp._renderCols = function (colsHTML) {
  var ui = this.ui
  ui.$columnsColGroup.innerHTML = ui.$bodyColGroup.innerHTML = colsHTML.join('')
}

/**
 * 调整各种尺寸
 * @param {Number[]} columnsWidth
 * @private
 */
dp._resize = function (columnsWidth) {
  var ui = this.ui
  var $columns = ui.$columns
  var $bodyWrapper = ui.$bodyWrapper
  var $noData = ui.$noData
  var $body = ui.$body
  var _totalWidth = columnsWidth ? columnsWidth.reduce(function (prev, width) { return prev + width }) : this.el.clientWidth
  $columns.style.width = _totalWidth + 'px' // 总长度需要先设定, 因为它会影响 columnsWrapper.clientHeight
  var totalHeight = this.options.height
  var columnsHeight = this.ui.$columnsWrapper.clientHeight
  var bodyHeight = totalHeight - columnsHeight
  var obj = {
    totalHeight: totalHeight,
    bodyHeight: bodyHeight
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
dp.setColumns = function (columns) {
  var columnsDef = this.renderData.columnsDef = this._normalize(columns)
  var columnsHTML = this._columnsHTML(columnsDef)
  this.emit('beforeRenderColumns', columnsHTML)
  this._renderColumns(columnsHTML)
}

/**
 * 调整字段定义, 并根据字段定义计算出每个字段的宽度数组
 * @param columns
 * @private
 */
dp._normalize = function (columns) {
  return columns.map(function (columnDef) {
    var _def = typeof columnDef === 'string'
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
dp._columnsHTML = function (columnsDef) {
  return columnsDef.map(function (columnDef) {
    return '<th>' + (columnDef.th || defaultColumnRender)(columnDef) + '</th>'
  })
}

/**
 * 渲染表头
 * @param {String[]} columnsHTML
 * @private
 */
dp._renderColumns = function (columnsHTML) {
  this.ui.$columnsThead.innerHTML = columnsHTML.join('')
}

/**
 * 渲染表格的方法
 * @param {Object[]} rows
 */
dp.setBody = function (rows) {
  var renderData = this.renderData
  this.empty = !rows || !rows.length
  renderData.rows = rows
  renderData.trsArr = this._bodyHTML(renderData.columnsDef, rows)
  this._renderBody(renderData.trsArr)
}

/**
 * 计算出渲染 body 需要的数据
 * @private
 */
dp._bodyHTML = function (columnsDef, rows) {
  return this.empty ? [] : rows.map(function (row, index) {
    var rowHTML = '<tr data-index="' + index + '">'
    columnsDef.forEach(function (columnDef) {
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
dp._renderBody = function (trsArr) {
  var ui = this.ui
  var $body = ui.$body
  var $noData = ui.$noData
  var $bodyTbody = ui.$bodyTbody
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
dp.destroy = function (remove) {
  this.emit('beforeDestroy')
  this._unbindEvents.forEach(function (unbind) { unbind() })
  if (remove) this.el.remove()
  this.emit('afterDestroy')
}

module.exports = DataGrid
