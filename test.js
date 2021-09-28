_c('div', {}, [
  _c('h1', { nativeOn: { click: showProp }, domProps: { title: 'title' } }, [
    _v('Vue源码测试'),
  ]),
  _c('div', { nativeOn: { click: clickMethod } }, [
    _v('Hello,' + _s(name) + ', this is your message:' + _s(msg) + ''),
  ]),
  _c('ul', {}, [
    _c('li', {}, [_v('' + _s(todoList[todoList.length - 1].name))]),
  ]),
  _c('p', {}, [_v('你今天未完成的任务数量为:' + _s(num))]),
  _c('input', {}),
  _c('p', {}, [_v('' + _s(value))]),
])
