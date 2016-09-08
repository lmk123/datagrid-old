import './index.scss'
import pagerTemplate from './template.html'
import addEvent from '../../utils/addEvent'

export default function (DataGrid) {
  DataGrid.hook(function (datagrid) {
    function jumpTo (pageNo) {
      if (Number.isNaN(pageNo) || pageNo < 1 || pageNo > pager.totalPage) {
        wrapper.querySelector('[data-page]').value = pager.cur
        return
      }
      wrapper.querySelector('[data-page]').value = pager.cur = pageNo
      datagrid.emit('switchPage', pageNo)
    }

    const pager = datagrid.pager = {
      cur: 1, // 当前页数
      total: null, // 总共有多少条记录
      size: null, // 每一页有多少条记录
      start: null, // 当前页的数据是从第几条开始的
      end: null, // 当前页的数据是在第几条结束的
      totalPage: null // 一共有多少页
    }

    const unbindEvents = []

    const wrapper = document.createElement('div')
    wrapper.classList.add('grid-pager-wrapper')

    unbindEvents.push(
      addEvent(wrapper, 'click', e => {
        const { jump } = e.target.dataset
        if (!jump) return
        let pageTo
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
      addEvent(wrapper, 'click', e => {
        if (e.target.dataset.downlond === undefined) return
        datagrid.emit('download-table')
      }),
      addEvent(wrapper, 'keydown', e => {
        if (e.keyCode !== 13) return
        if (e.target.dataset.page === undefined) return
        jumpTo(Number(e.target.value))
      }),
      datagrid.on('beforeSetData', data => {
        if (!data.rows || !data.rows.length) {
          wrapper.classList.add('hidden')
          return
        }
        const { size, total } = data
        const { cur } = pager
        const dataLength = data.rows.length
        pager.total = total
        pager.size = size

        pager.start = (cur - 1) * size + 1
        pager.end = pager.start + dataLength - 1
        pager.total = total
        pager.totalPage = Math.ceil(total / size)

        wrapper.innerHTML = pagerTemplate.replace(/\{\{(\w+)\}\}/g, (word, group) => {
          return pager[group]
        })
        wrapper.classList.remove('hidden')
      }),
      datagrid.on('beforeSetSize', heightObj => {
        const wrapperHeight = wrapper.clientHeight
        heightObj.pagerHeight = wrapperHeight
        heightObj.bodyHeight = heightObj.bodyHeight - wrapperHeight
      })
    )
    datagrid.once('afterInit', () => {
      datagrid.el.appendChild(wrapper)
      datagrid.ui.$pagerWrapper = wrapper
    })
    datagrid.once('beforeDestroy', () => {
      unbindEvents.forEach(unbind => unbind())
    })
  })
}
