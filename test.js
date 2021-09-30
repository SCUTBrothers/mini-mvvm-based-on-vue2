let oldChildren = [1, 2, 3, 123, 1, 2, 3, 4, 5]
let children = [3, 2, 4331, 2334, 3, 2, 1, 3, 4, 2, 1, 3]

diffing()

console.log(oldChildren)
console.log(children)

function diffing() {
  // 如果oldChildren和chidren当中, 有一个length = 0, 就不用比较拉, 直接完整替换或删除就行了
  // 四种命中是建立在, 两者的children长度都大于0的前提下
  let os = 0
  let oe = oldChildren.length - 1
  let ns = 0
  let ne = children.length - 1

  let oldCh = oldChildren[os]
  let ch = children[ns]

  while (oldCh === ch && os <= oe && ns <= ne) {
    oldCh = oldChildren[++os]
    ch = children[++ns]
  }

  // * 第一种命中(是否尾部添加或删除, 处理尾部部分)
  // 1. os > oe, 或者ns > ne
  if (os > oe) {
    // 1.1 children从尾部新增了元素或者两者相同(oe = ne)
    if (oe !== ne) {
      // 两者长度不同(新增)
      while (ne >= ns) {
        oldChildren.push(children[ne])
        ne--
      }
    }
  } else if (ns > ne) {
    // 1.2 children从尾部删除了元素或者两者相同
    if (oe !== ne) {
      while (oe >= os) {
        oldChildren.pop()
        oe--
      }
    }
  } else {
    // * os = ns >= oe & ne
    // * 第二种命中 新后与旧后(判断是否头部或者中间**完整**插入或删除, 处理头部部分)

    // 2. oldCh != ch
    oldCh = oldChildren[oe]
    ch = children[ne]
    while (oldCh === ch && oe >= os && ne >= ns) {
      oldCh = oldChildren[--oe]
      ch = children[--ne]
    }

    if (oe < os) {
      // * 插入
      while (ne >= ns) {
        console.log(ne)
        oldChildren.splice(os, 0, children[ne])
        ne--
      }
    } else if (ne < ns) {
      // * 删除
      while (oe >= os) {
        oldChildren.splice(oe, 1)
        oe--
      }
    } else {
      // * 第三种命中 新后与旧前, 首部翻转
      oldCh = oldChildren[os]
      ch = children[ne]

      while (oldCh === ch && oe >= os && ne >= ns) {
        oldChildren.splice(oe + 1, 0, oldCh)
        oldChildren.splice(os, 1)
        os--
        oe--
        oldCh = oldChildren[++os]
        ch = children[--ne]
      }

      if (ne < ns) {
        // 翻转, oldChidren有多余
        oldChildren = oldChildren.splice(os, oe - os + 1)
      } else if (os > oe) {
        // 翻转, chidren顶部有多余
        oldChildren = children.slice(ns, ne + 1).concat(oldChildren)
      } else {
        console.log(oldChildren)
        console.log(children)
        // * 第四种命中 新前与旧后
        oldCh = oldChildren[os]
        ch = children[ne]

        while (oldCh == ch && ns >= ne && oe >= os) {
          oldChildren.splice(os, 1, ch)
          ++oe
          ++os
          oldCh = oldChildren[--oe]
          ch = children[++ns]
        }

        if (ns > ne) {
          // oldChildren有多余的部分, 删掉
          oldChildren = oldChildren.splice(0, os)
        } else if (oe < os) {
          oldChildren = oldChildren.concat(children.slice(ns, ne + 1))
        } else {
          // ! 四种命中全都整完了, 第四种命中也将翻转的部分处理完了. 这个时候如果还存在oldCh和ch不等,
          // ! 那么在oldChildren中查找新前
          let temp = os
          let isExist = false
          for (let i = temp; i <= oe; i++) {
            if (oldChildren[i] === children[i]) {
              let insert = oldChildren.splice(i, 1)
              oldChildren.splice(os, 0, insert)
              os++
              ns++
              isExist = true
              break
            }
          }
          if (!isExist) {
            // 如果不存在, 那么将新前插入到旧前的前面
            oldChildren.splice(os, 0, children[ns])
            os++
            oe++
            ns++
          }
          diffing()
        }
      }
    }
  }
}
