// * props修改为domProps以与源码对应
function updateDomProps(oldVnode, vnode) {
  let cur
  let old
  const elm = vnode.elm
  let oldDomProps = oldVnode.data.domProps
  let domProps = vnode.data.domProps

  // domProps和新domProps均为undefined, return
  if (!oldDomProps && !domProps) return
  // oldDomProps和新props相等, return
  if (!oldDomProps === domProps) return

  // oldDomProps和props中, 可能会有一个为undefined
  oldDomProps = oldDomProps || {}
  domProps = domProps || {}

  for (let key in domProps) {
    cur = domProps[key]
    old = oldDomProps[key]
    // 如果旧prop不等于新prop, 且key不等于value或者elm[key]不等于新prop(不会对value属性赋值, 或者重复赋值)
    // ? 为什么要加old !== cur的判定, 旧的domProps没有任何参考价值吧
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      // * 等价于elm.setAttribute(key, cur), 属性最终会设置到元素的属性节点
      elm[key] = cur
    }
  }
}

export const domPropsModule = { create: updateDomProps, update: updateDomProps }
