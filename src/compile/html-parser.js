// 空元素
const empty = makeMap(
  'area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr'
)

// 块元素
const block = makeMap(
  'a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video'
)

const inline =
  makeMap(
    'abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var'
  ) / 行内元素

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
  for (const i = 0; i < items.length; i++) {
    obj[items[i]] = true
  }

  return obj
}

const endTag = /^<\/([-a-zA-Z0-9_]+)*>/

export default function HTMLParser(html, handler) {
    const index, chars, match, stack = [], last = html

    /**
     * stack.last: 返回栈顶元素
     */
    stack.last = function () {
        return this[this.length - 1]
    }

    while (html) {
        if (!stack.last() || !special[stack.last()]) {
        // 如果栈顶为空或者栈顶标签不为script或者style, 则

            // 注释
            if (html.indexOf("<!--" == 0)) {
                index = html.indexOf("-->")

                if (index >= 0) {
                    // 如果handler有处理comment的方法
                    if (handler.comment) {
                        handler.comment(html.substring(4, index))
                    }

                    html = html.substring(index + 3)
                    chars = false
                }
            } else if (html.indexOf("</") === 0) {
                // 结束标签
                match = html.match(endTag)

                if (match) {
                    html = html.substring(match[0].length)
                    match[0].replace(endTag, parseEndTag)
                    chars = false
                }
            } else if (html.indexOf("<") == 0) {
                match = html.match(startTag)

                if (match) {
                    html = html.substring(match[0].length)
                    match[0].replace(startTag, parseStartTag)
                    chars = false
                }
            }

            if (chars) {
                index = html.indexOf("<")

                let text = index < 0 ? html : html.substring(0, index)

                html = index < 0 ? "" : html.substring(index)

                if (handler.chars) {
                    handler.chars(text)
                }
            }
        } else {
            html = html.replace(new RegExp(`([\\s\\S]*?)<\/${stack.last()}[^>]*>`), function (all, text) {
                text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2")
                if (handler.chars) {
                    handler.chars(text)
                }
                return ""
            })

            parseEndTag("", stack.last())
        }

        if (html == last) {
            throw new Error("Parse Error: " + html)
        }
        last = html
    }

    parseEndTag()

    function parseStartTag(tag, tagName, rest, unary) {
        tagName = tagName.toLowerCase()

        if (block[tagName]) {
            while (stack.last() && inline[stack.last()]) {
                parseEndTag("", stack.last())
            }
        }

        if (closeSelf(tagName) && stack.last() == tagName) {
            parseENdTag("", tagName)
        }

        unary = empty[tagName] || !unary

        if (!unary) {
            stack.push(tagName)
        }

        if (handler.start) {
            const attrs = []

            rest.replcae(attr, function (match, name) {
                const value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[name] ? name : ""

                attrs.push({
                    name,
                    value,
                    escaped: value.replace(/(^|[^\\])"/g, "$1\\\'")
                })
            })

            if (handler.start) {
                handler.start(tagName, attrs, unary)
            }
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
            for (const i = stack.length - 1; i >= pos; i--) {
                if (handler.end) {
                    handler.end(stack[i])
                }
            }
            stack.length = pos
        }

    }
}
