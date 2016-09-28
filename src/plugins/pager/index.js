require('./index.scss')
var pagerTemplate = require('./template.html')
var addEvent = require('../../utils/addEvent')

module.exports = function (DataGrid) {
  DataGrid.hook(function (datagrid) {
    if (!datagrid.options.pagination) return

    var pagingTemplate = datagrid.options.pagingTemplate || pagerTemplate

    function jumpTo (pageNo) {
      if (Number.isNaN(pageNo) || pageNo < 1 || pageNo > pager.totalPage) {
        wrapper.querySelector('[data-page]').value = pager.cur
        return
      }
      wrapper.querySelector('[data-page]').value = pager.cur = pageNo
      datagrid.emit('switchPage', pageNo)
    }

    var pager = datagrid.pager = {
      cur: 1, // 当前页数
      total: null, // 总共有多少条记录
      size: null, // 每一页有多少条记录
      start: null, // 当前页的数据是从第几条开始的
      end: null, // 当前页的数据是在第几条结束的
      totalPage: null // 一共有多少页
    }

    var unbindEvents = []

    var wrapper = document.createElement('div')
    wrapper.classList.add('grid-pager-wrapper')

    unbindEvents.push(
      addEvent(wrapper, 'click', function (e) {
        var jump = e.target.dataset.jump
        if (!jump) return
        var pageTo
        switch (jump) {
          case 'first':
            pageTo = 1
            break
          case 'end':
            pageTo = pager.totalPage
            break
          case 'prev':
            pageTo = pager.cur - 1
            break
          case 'next':
            pageTo = pager.cur + 1
            break
        }
        jumpTo(pageTo)
      }),
      addEvent(wrapper, 'click', function (e) {
        if (e.target.dataset.downlond === undefined) return
        datagrid.emit('download-table')
      }),
      addEvent(wrapper, 'keydown', function (e) {
        if (e.keyCode !== 13) return
        if (e.target.dataset.page === undefined) return
        jumpTo(Number(e.target.value))
      }),
      datagrid.on('beforeSetData', function (data) {
        if (!data.rows || !data.rows.length) {
          wrapper.classList.add('hidden')
          return
        }
        var size = data.size || 0
        var total = data.total || 0
        var cur = pager.cur
        var dataLength = data.rows.length
        pager.total = total
        pager.size = size

        pager.start = (cur - 1) * size + 1
        pager.end = pager.start + dataLength - 1
        pager.total = total
        pager.totalPage = Math.ceil(total / size) || 0

        wrapper.innerHTML = pagingTemplate.replace(/\{\{(\w+)\}\}/g, function (word, group) {
          return pager[group]
        })
        wrapper.classList.remove('hidden')
      }),
      datagrid.on('beforeSetSize', function (heightObj) {
        var wrapperHeight = wrapper.offsetHeight
        heightObj.pagerHeight = wrapperHeight
        heightObj.bodyHeight = heightObj.bodyHeight - wrapperHeight
      })
    )
    datagrid.once('afterInit', function () {
      datagrid.ui.$gridWrapper.appendChild(wrapper)
      datagrid.ui.$pagerWrapper = wrapper
    })
    datagrid.once('beforeDestroy', function () {
      unbindEvents.forEach(function (unbind) { unbind() })
    })
  })
}
