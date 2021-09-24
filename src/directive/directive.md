# directive笔记

## v-if 和 v-for的优先级(面试题)

`vue-template-compiler` 对以下模板template模板编译的结果:

```JS
// 编译前
<
div v -
  if = "false" v -
  for = "i in 3" > < /div>

// 编译得到的render函数
with(this) {
  return _l(3, function(i) {
    return false ? _c('div') : _e()
  })
}
```

编译得到的render函数中:
* _l(times, callback)代表指令v-for的函数
  + times代表v-for循环的次数
  + callback调用_c生成虚拟节点
    - false代表v-if值为false(false的时候调用_e()生成空标签) 

正是因为v-for和v-if连用的时候, 回调函数要先进行if判定以确定是否渲染虚拟元素节点, 所以会造成性能上的问题, 因此建议**v-for和v-if不要连用**
同时在ast解析生成render函数的时候, 是需要先对v-for进行处理, 如果还设置了v-if, 那么会再次进行编译

## v-for, v-model和v-for的实现原理

`v-if`

```JS
// template
<div v-if="false"></div>

// render函数
with(this) {
    return (false) ? _c("div") : _e()
}
```

`v-for`

```JS
// template
<div v-for="i in 3"></div>

// render函数
with(this) {
    return _l((3), function (i) {
        return _c("div") 
    })
}
```

`v-model`

```JS
// template
<input v-model="name"></input>

// render函数
with (this) {
    return _c("input", {
        directives: [
            {
                name: "model",
                rawName: "v-model",
                value: (name),
                expression: "name"
            }
        ],
        domProps: {
            "value": (name)
        },
        on: {
            "input": function ($event) {
                if ($event.target.composing) return             }
                name = $event.target.value
        }
    })
}
```

## 指令正则匹配

前缀: `prefix = "v-"`

正则表达式: `v-(\w+):?`

测试代码

```JS
const prefix = 'v-'
const directiveCapture = new RegExp(`${prefix}(\\w+):?`)
let name = 'v-bind:'
let match = name.match(directiveCapture)
console.log(match[1])
```
