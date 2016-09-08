import './index.scss'
import findParent from '../../utils/findParent'
import addEvent from '../../utils/addEvent'

const { indexOf } = Array.prototype

const DESC = -1 // 降序
const ASC = 1 // 升序
const NONE_ORDER = 0 // 不排序

const CLASS_ASC = 'order-by-asc'
const CLASS_DESC = 'order-by-desc'

export default function (DataGrid) {
  DataGrid.hook(datagrid => {
    if (!datagrid.options.columnSorting) return

    const unbindEvents = []

    let lastSortColumnIndex
    let sortType = NONE_ORDER

    unbindEvents.push(
      // 给每个字段内部注入小箭头
      datagrid.on('beforeRenderColumns', columnsHTMLArr => {
        columnsHTMLArr.forEach((html, index) => {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="order-ico"></span></th>')
        })
      })
    )

    function clearLastSort () {
      if (typeof lastSortColumnIndex === 'number') {
        const lastTH = datagrid.ui.$columnsWrapper.querySelector(`th:nth-child(${lastSortColumnIndex + 1})`)
        if (lastTH) lastTH.classList.remove(CLASS_ASC, CLASS_DESC)
      }
    }

    datagrid.once('afterInit', () => {
      // 监听字段的点击事件
      const { $columnsWrapper } = datagrid.ui
      unbindEvents.push(
        addEvent($columnsWrapper, 'click', e => {
          const th = findParent('th', e.target, $columnsWrapper)
          if (!th) return
          if (th.classList.contains('resizing')) return
          const index = indexOf.call(th.parentElement.children, th)
          const columnDef = datagrid.renderData.columnsDef[index]
          if (columnDef.sortable === false) return

          if (index !== lastSortColumnIndex) {
            clearLastSort()
            lastSortColumnIndex = index
            sortType = NONE_ORDER
          }

          th.classList.remove(CLASS_ASC, CLASS_DESC)

          switch (sortType) {
            case NONE_ORDER:
              sortType = ASC
              th.classList.add(CLASS_ASC)
              break
            case ASC:
              sortType = DESC
              th.classList.add(CLASS_DESC)
              break
            case DESC:
              sortType = NONE_ORDER
              break
          }
          datagrid.emit('sort', columnDef, sortType, th)
        })
      )
    })

    datagrid.once('beforeDestroy', () => {
      unbindEvents.forEach(unbind => unbind())
    })
  })
}
