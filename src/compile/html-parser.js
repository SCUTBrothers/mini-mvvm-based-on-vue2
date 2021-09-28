/**
 * * Modified at https://github.com/blowsie/Pure-JavaScript-HTML5-Parser
 */

/**
 * startTag
 * <div class="red" v-on:click = "clickMethod" v-if = "true" width = 100 >
 * g1(标签名): div
 * g2(属性, 带首部空格, 不带尾部空格. 如果没有属性则为""):  class="red" v-on:click = "clickMethod" v-if = "true" width = 100
 * g3?(匹配/, 判断是否是自闭合标签, 如果没有/则是"", 如果有是/)
 */
const startTag =
  /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:@][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/
const endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/
const attr =
  /([a-zA-Z_:@][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g

// 空元素
const empty = makeMap(
  'area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr'
)

// 块元素
const block = makeMap(
  'a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video'
)

const inline = makeMap(
  'abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var'
) // 行内元素

// 自闭合标签 <li/>
const closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr')

// 属性值可以没有等号的属性, 如disabled相当于disabled = "disabled"
const fillAttrs = makeMap(
  'checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected'
)

// 特殊元素
const special = makeMap('script,style')

function makeMap(str) {
  const obj = {}
  const items = str.split(',')
  for (let i = 0; i < items.length; i++) {
    obj[items[i]] = true
  }

  return obj
}

export default function HTMLParser(html, handler) {
  html = html.trim()
  let index,
    chars,
    match,
    last = html
  const stack = []

  /**
   * stack.last: 返回栈顶元素
   */
  stack.last = function () {
    return this[this.length - 1]
  }

  while (html) {
    chars = true

    if (!stack.last() || !special[stack.last()]) {
      // 如果栈顶为空或者栈顶标签不为script或者style, 则
      // 注释
      if (html.indexOf('<!--') == 0) {
        index = html.indexOf('-->')
        if (index >= 0) {
          // 如果handler有处理comment的方法
          if (handler.comment) {
            handler.comment(html.substring(4, index))
          }

          html = html.substring(index + 3)
          chars = false
        }
      } else if (html.indexOf('</') === 0) {
        // 结束标签
        match = html.match(endTag)

        if (match) {
          html = html.substring(match[0].length)
          match[0].replace(endTag, parseEndTag)
          chars = false
        }
      } else if (html.indexOf('<') == 0) {
        // * 对于正常html, 如果栈顶为空, 即刚开始解析, 通常从个else if块开始, 因为正常html的第一个字符为标签<...tagname
        match = html.match(startTag)

        if (match) {
          html = html.substring(match[0].length)
          match[0].replace(startTag, parseStartTag)
          chars = false
        }
      }

      if (chars) {
        index = html.indexOf('<')

        let text = index < 0 ? html : html.substring(0, index)

        html = index < 0 ? '' : html.substring(index)

        if (handler.chars) {
          handler.chars(text)
        }
      }
    } else {
      html = html.replace(
        new RegExp(`([\\s\\S]*?)<\/${stack.last()}[^>]*>`),
        function (all, text) {
          text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2')
          if (handler.chars) {
            handler.chars(text)
          }
          return ''
        }
      )

      parseEndTag('', stack.last())
    }

    if (html == last) {
      throw new Error('Parse Error: ' + html)
    }
    last = html
  }

  parseEndTag()

  function parseStartTag(tag, tagName, rest, unary) {
    tagName = tagName.toLowerCase()

    if (block[tagName]) {
      while (stack.last() && inline[stack.last()]) {
        parseEndTag('', stack.last())
      }
    }

    if (closeSelf[tagName] && stack.last() == tagName) {
      parseEndTag('', tagName)
    }

    // * 注: input属于空元素
    unary = empty[tagName] || !!unary

    if (!unary) {
      stack.push(tagName)
    }

    if (handler.start) {
      const attrs = []

      rest.replace(attr, function (match, name) {
        /**
         * arguments[1]为g1, 对应属性名name
         * arguments[2]为g2, 对应双引号类型的"<value>"属性值
         * arguments[3]为g3, 对应单引号类型的'<value>'属性值 g2为undefined, g3有值
         * arguments[4]为g4, 对应无引号类型的<value>属性值  g2, g3为undefined, g4有值
         *
         * 如果g2, g3, g4都为空, 则可能是无等号属性, 如disabled, 去fillAttrs中查看是不是这种属性, 如果不是则将value设置为空
         */
        const value = arguments[2]
          ? arguments[2]
          : arguments[3]
          ? arguments[3]
          : arguments[4]
          ? arguments[4]
          : fillAttrs[name]
          ? name
          : ''

        attrs.push({
          name,
          value,
        })
      })

      handler.start(tagName, attrs, unary)
    }
  }

  function parseEndTag(tag, tagName) {
    if (!tagName) {
      var pos = 0
    } else {
      for (var pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos] == tagName) break
      }
    }

    if (pos >= 0) {
      for (let i = stack.length - 1; i >= pos; i--) {
        if (handler.end) {
          handler.end(stack[i])
        }
      }
      stack.length = pos
    }
  }
}
