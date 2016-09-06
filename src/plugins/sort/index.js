import './index.scss'
import findParent from '../../utils/findParent'
import addEvent from '../../utils/addEvent'

const { indexOf, forEach } = Array.prototype

const DESC = -1 // 降序
const ASC = 1 // 升序
const NONE_ORDER = 0 // 不排序

const CLASS_ASC = 'order-by-asc'
const CLASS_DESC = 'order-by-desc'

export default function (DataGrid) {
  DataGrid.hook(datagrid => {
    if (!datagrid.options.sortable) return

    const unbindEvents = []

    // 使用一个对象保存每个字段当前的排序状态
    let state = {}

    unbindEvents.push(
      // 给每个字段内部注入小箭头
      datagrid.on('beforeRenderColumns', columnsHTMLArr => {
        columnsHTMLArr.forEach((html, index) => {
          columnsHTMLArr[index] = html.replace('</th>', '<span class="order-ico"></span></th>')
        })
      })
    )

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
          forEach.call($columnsWrapper.querySelectorAll(`.${CLASS_DESC}, .${CLASS_ASC}`), th => {
            th.classList.remove(CLASS_ASC, CLASS_DESC)
          })
          const order = state[index] || NONE_ORDER
          state = {}
          switch (order) {
            case NONE_ORDER:
              state[index] = ASC
              th.classList.add(CLASS_ASC)
              break
            case ASC:
              state[index] = DESC
              th.classList.add(CLASS_DESC)
              break
            case DESC:
              state[index] = NONE_ORDER
              break
          }
          datagrid.emit('sort', columnDef, state[index], th)
        })
      )
    })

    datagrid.once('beforeDestroy', ()=> {
      unbindEvents.forEach(unbind => unbind())
    })
  })
}


