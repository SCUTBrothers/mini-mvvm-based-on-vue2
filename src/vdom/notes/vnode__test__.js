import { h } from './src/vdom/h.js'
import { init } from './src/vdom/init.js'
import { classModule } from './src/vdom/modules/class.js'
import { eventListenerModule } from './src/vdom/modules/eventlistener.js'
import { propsModule } from './src/vdom/modules/props.js'
import { styleModule } from './src/vdom/modules/style.js'

const patch = init([eventListenerModule, propsModule, classModule, styleModule])
const container = document.getElementById('app')
let vnode = h(
  'div',
  {
    id: 'app',
    class: { blue: true },
    on: {
      click(event, vnode) {
        console.log(this == vnode)
        console.log('event called')
      },
    },
    props: {
      title: 'message',
    },
    style: {
      width: '100px',
      position: 'absolute',
      top: '20px',
      left: '40px',
      color: 'red',
    },
  },
  '这是由虚拟节点生成的元素中的文本'
)
patch(container, vnode)
