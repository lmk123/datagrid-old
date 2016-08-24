import noop from './utils/noop'
import containerTemplate from './templates/container.html'
import pagerTemplate from './templates/pager.html'

class DataGrid {
  constructor (ele) {
    this._container = ele
    ele.classList.add('datagrid')
    this._height = ele.clientHeight
    this._pager = {
      curPage: 1
    }
  }

  _init () {
    this._init = noop
    const { _container } = this
    _container.innerHTML = containerTemplate

    const ui = {
      $columns: '.grid-columns',
      $columnsWrapper: '.grid-columns-wrapper',
      $fixedColumns: '.grid-fixed-columns',
      $fixedColumnsWrapper: '.grid-fixed-columns-wrapper',
      $body: '.grid-body',
      $bodyWrapper: '.grid-body-wrapper',
      $fixedBody: '.grid-fixed-body',
      $fixedBodyWrapper: '.grid-fixed-body-wrapper',
      $pagerWrapper: '.grid-pager-wrapper'
    }

    for (let key in ui) {
      ui[key] = _container.querySelector(ui[key])
    }

    this._ui = ui

    // body 横向滚动时, 也要调整 columns 的距离
    ui.$bodyWrapper.addEventListener('scroll', () => {
      ui.$columns.style.left = '-' + ui.$bodyWrapper.scrollLeft + 'px'
    })
  }

  /**
   * 设置表格数据
   * @param data
   * @param {Object[]} data.columns
   * @param {Object[]} data.data
   */
  setData (data) {
    if (process.env.NODE_ENV === 'development') {
      if (typeof data !== 'object' || !Array.isArray(data.columns) || !Array.isArray(data.data)) {
        throw new TypeError('.setData 方法的参数不合法。')
      }
    }

    this._init()
    this.fixedColumns = []
    this._renderHeaders(data.columns)
    this._renderBody(data.data)
    this._renderPager(data.size, data.total)
    this.resize()
  }

  /**
   * 渲染表头
   * @param {String[]|Object[]} columns
   * @private
   */
  _renderHeaders (columns) {
    let columnsHTML = ''
    let fixedColumnsHTML = ''
    this.columns = columns.map(column => {
      const _column = typeof column === 'string' ? {
        name: column,
        key: column,
        fixed: false
      } : column

      if (_column.fixed) {
        this.fixedColumns.push(_column)
      }

      const th = `<th>${_column.name}</th>`
      columnsHTML += th
      if (_column.fixed) {
        fixedColumnsHTML += th
      }

      return _column
    })

    const { $columns, $fixedColumns, $fixedColumnsWrapper } = this._ui
    $columns.innerHTML = `<thead><tr>${columnsHTML}</tr></thead>`
    if (this.fixedColumns.length) {
      $fixedColumns.innerHTML = `<thead><tr>${fixedColumnsHTML}</tr></thead>`
      $fixedColumnsWrapper.classList.remove('hidden')
    } else {
      $fixedColumnsWrapper.classList.add('hidden')
    }
  }

  /**
   * 渲染表格数据
   * @param {Object[]} rows
   * @private
   */
  _renderBody (rows) {
    const columns = this.columns
    this.data = rows

    let rowsTableHTML = '<tbody>'
    let fixedRowsTableHTML = '<tbody>'

    rows.forEach(row => {
      rowsTableHTML += '<tr>'
      fixedRowsTableHTML += '<tr>'

      columns.forEach(column => {
        const td = `<td>${getColumnHTML(column, row)}</td>`
        rowsTableHTML += td
        if (column.fixed) {
          fixedRowsTableHTML += td
        }
      })

      rowsTableHTML += '</tr>'
      fixedRowsTableHTML += '</tr>'
    })

    const { $body, $fixedBody, $fixedBodyWrapper } = this._ui
    $body.innerHTML = rowsTableHTML + '</tbody>'
    if (this.fixedColumns.length) {
      $fixedBody.innerHTML = fixedRowsTableHTML + '</tbody>'
      $fixedBodyWrapper.classList.remove('hidden')
    } else {
      $fixedBodyWrapper.classList.add('hidden')
    }
  }

  /**
   * 渲染分页
   * @param {Number} size - 每次请求的数据有多少条
   * @param {Number} total - 总共有多少条数据
   * @private
   */
  _renderPager (size, total) {
    const { _pager } = this
    const { curPage } = _pager
    const dataLength = this.data.length

    _pager.start = (curPage - 1) * size + 1
    _pager.end = _pager.start + dataLength - 1
    _pager.total = total
    _pager.totalPage = Math.ceil(total / size)
    this._ui.$pagerWrapper.innerHTML = pagerTemplate.replace(/\{\{(\w+)\}\}/g, (word, group) => {
      return _pager[group]
    })
  }

  /**
   * 调整高度、字段的宽度等。
   */
  resize () {
    const { $columns, $fixedColumns, $bodyWrapper, $body, $fixedBodyWrapper, $pagerWrapper } = this._ui

    // 先给 body 设置计算出来的宽度
    // $columns.style.width = $body.style.width = this._tableWidth + 'px'

    // 然后根据 body 里每个 td 的宽度调整表头的 th 的宽度
    let columGroupHtml = ''
    Array.prototype.forEach.call($bodyWrapper.querySelector('tr').querySelectorAll('td'), (tdElement, index) => {
      columGroupHtml += `<colgroup width="${tdElement.clientWidth}"></colgroup>`
    })
    $columns.insertAdjacentHTML('afterbegin', columGroupHtml)

    // 再根据 headers 的高度调整 body 的高度及 top 值
    const columnsHeight = $columns.clientHeight
    const pagerHeight = $pagerWrapper.clientHeight
    const totalHeight = this._height
    const bodyHeight = totalHeight - columnsHeight - pagerHeight

    $fixedBodyWrapper.style.top = $fixedColumns.style.height = columnsHeight + 'px'
    $fixedBodyWrapper.style.height = $bodyWrapper.style.height = bodyHeight + 'px'
  }
}

/**
 * 获取一个字段的 HTML 内容
 * @param {Object} column
 * @param {Object} row
 */
function getColumnHTML (column, row) {
  if (!column.key) {
    column.key = column.name
  }
  const { render } = column
  if (typeof render === 'function') {
    return render(column, row)
  }
  return row[column.key]
}

export default DataGrid
