const { indexOf } = Array.prototype

export default function (DataGrid) {
  DataGrid.hook(datagrid => {
    // 注入供用户拖拽的小方块
    datagrid.on('beforeRenderColumns', columnsHTMLArr => {
      columnsHTMLArr.forEach((html, index) => {
        columnsHTMLArr[index] = html.replace('</th>', '<span class="drag-lever">x</span></th>')
      })
    })

    let dragging = false
    let draggingLever
    let draggingColumnIndex
    let startX

    datagrid.el.addEventListener('mousedown', e => {
      if (e.target.classList.contains('drag-lever') && e.button === 0) {
        console.log('开始移动')
        let th
        let node = e.target
        while ((node = node.parentElement) && node !== datagrid.el) {
          if (node.tagName === 'TH') {
            th = node
            break
          }
        }
        if (!th) return
        dragging = true
        draggingLever = e.target
        draggingLever.classList.add('dragging')
        startX = e.pageX
        draggingColumnIndex = indexOf.call(th.parentElement.children, th)
      }
    })

    datagrid.el.addEventListener('mousemove', e => {
      if (!dragging) return
      e.preventDefault() // 阻止拖动鼠标时选中文字
    })

    datagrid.el.addEventListener('mouseup', e => {
      if (!dragging) return
      console.log('结束移动')
      dragging = false
      draggingLever.classList.remove('dragging')
      const endX = e.pageX
      const move = endX - startX // 计算移动的距离
      console.log('移动了', move)
      datagrid.renderData.columnsWidth[draggingColumnIndex] = datagrid.renderData.columnsWidth[draggingColumnIndex] + move
      datagrid._setWidth(datagrid.renderData.columnsWidth)
    })
  })
}
