require('./index.scss')
var containerTemplate = require('./template.html')
var Event = require('../utils/Event')
var addEvent = require('../utils/addEvent')
var extend = require('../utils/extend')
var findParent = require('../utils/findParent')
var debounce = require('../utils/debounce')

var DefaultWidth = 100

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
  var el = this.el = document.createElement('div')
  this.options = extend({}, {
    height: ele.clientHeight // 表格的总高度
  }, options)

  // 从 document 里删除原本的节点并保存下来，供实例销毁之后重新显示出来
  var parent = ele.parentElement
  ele.parentElement.insertBefore(el, ele)
  parent.removeChild(ele)
  this.origin = ele

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

  var that = this
  _unbindEvents.push(
    // body 横向滚动时, 也要调整 columns 的左边距
    addEvent(ui.$bodyWrapper, 'scroll', function () {
      ui.$columns.style.left = '-' + ui.$bodyWrapper.scrollLeft + 'px'
    }),
    addEvent(ui.$bodyWrapper, 'mouseover', function (e) {
      var tr = findParent('tr', e.target)
      if (!tr) return
      var trIndex = tr.getAttribute('data-index')
      if (trIndex) {
        that.trHover(true, Number(trIndex))
      }
    }),
    addEvent(ui.$bodyWrapper, 'mouseout', function (e) {
      var tr = findParent('tr', e.target)
      if (!tr) return
      var trIndex = tr.getAttribute('data-index')
      if (trIndex) {
        that.trHover(false, Number(trIndex))
      }
    })
  )

  this.ui = ui

  if (this.options.fit) {
    _unbindEvents.push(
      addEvent(window, 'resize', debounce(function () {
        that.setWidth()
      }))
    )
  }

  this.emit('afterInit')
}

/**
 * 处理 tr 元素的 hover 状态
 * @param {Boolean} inOrOut - 此元素需要添加（true）还是移除（false） hover 状态
 * @param {Number} index - 元素的 index
 * @param {Boolean} emit - 设为 false 则不触发相关事件
 */
dp.trHover = function (inOrOut, index, emit) {
  var tbody = this.ui.$bodyWrapper.querySelector('tbody')
  var hoverToTR = tbody.querySelector('[data-index="' + index + '"]')
  hoverToTR.classList[inOrOut ? 'add' : 'remove']('hover')
  if (emit !== false) this.emit(inOrOut ? 'trHoverTo' : 'clearHover', index, hoverToTR, this.rows && this.rows[index])
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

/**
 * 根据用户给的宽度数组计算出实际需要用到的最小宽度数组，
 * 因为用户可能不传宽度数组，或者宽度数组的长度比字段数组长或短，
 * 所以要处理一遍
 * @param {Array} [widthArr]
 * @return {Array}
 */
dp.normalizeWidth = function (widthArr) {
  var renderData = this.renderData
  var columnsDef = renderData.columnsDef
  if (!Array.isArray(widthArr)) widthArr = []
  var result = []
  for (var i = 0; i < columnsDef.length; i++) {
    result[i] = widthArr[i] || Math.max(columnsDef[i].name.length * 15, DefaultWidth)
  }
  return result
}

/**
 * 设置宽度。
 * 默认情况下，用户设置的宽度会成为最终字段的宽度，
 * 但如果 fit 设置为 true，则将用户传进来的宽度视为"最小宽度"，
 * 如果这些最小宽度加起来大于 wrapper 的宽度，则直接使用最小宽度作为 td 的宽度；
 * 如果加起来小于 wrapper 的宽度，则用 wrapper 宽度减去最小宽度的差值，除以字段的个数得到平均值，再给每个最小宽度加上这个平均值作为字段的真正宽度
 * @param {Number[]} [customWidth]
 */
dp.setWidth = function (customWidth) {
  var renderData = this.renderData

  if (customWidth || !renderData.columnsMinWidth) {
    renderData.columnsMinWidth = this.normalizeWidth(customWidth)
  }

  var columnsMinWidth = renderData.columnsMinWidth
  var columnsWidth

  if (this.options.fit) {
    var sum = columnsMinWidth.reduce(function (w1, w2) {
      return w1 + w2
    })
    var bodyWrapperWidth = this.ui.$bodyWrapper.clientWidth
    if (sum >= bodyWrapperWidth) {
      columnsWidth = columnsMinWidth
    } else {
      var diff = (bodyWrapperWidth - sum) / renderData.columnsDef.length
      columnsWidth = columnsMinWidth.map(function (w) {
        return w + diff
      })
    }
  } else {
    columnsWidth = columnsMinWidth
  }
  renderData.columnsWidth = columnsWidth
  var cols = this._colGroupsHTML(columnsWidth)
  this._renderCols(cols)
  this._resize(columnsWidth)
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
 * 销毁实例
 */
dp.destroy = function () {
  this.emit('beforeDestroy')
  this._unbindEvents.forEach(function (unbind) { unbind() })

  // 还原原本的 dom 节点
  var el = this.el
  var parent = el.parentElement
  parent.insertBefore(this.origin, el)
  parent.removeChild(el)

  this.emit('afterDestroy')
}

module.exports = DataGrid
