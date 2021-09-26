```mermaid
flowchart TD
    %% style
    classDef vm fill:green
    classDef func stroke: #7b22b3
    classDef text fill: red
    classDef element fill: blue



    %% template
    subgraph template [template]
        dom["
<div>
    Hello, {{ name }}, this is your message
    <div> 
        <h1>scond degree</h1>
    </div>
</div>
        "]
    end

    %% 将template转为树结构的节点信息
    subgraph parseHTML ["@func: parseHTML(template)", note: ast解析]

    end

    subgraph ast ["ast: 以树结构展示的template信息"]
        textNode["textNode: {
            type: 3,
            text: ...(不解析模板语法{{}}), 
        }"]

        elementNode["elementNode: {
            type: 1,
            tagName: ...,
            attrs: [...],
            children: [
                ... elementNode or textNode
            ], 
        }"]

        两种节点 --> textNode & elementNode
    end

    subgraph generateRender ["@func generate: 创建render函数"]
    s
    end

    subgraph render ["@func render: 栈形式的嵌套函数"]
        render_func[" func body: 
            with(this)  {
                return _c('<tagName>', _v('<text piece> + _s(<mustache var>) + ...'), <children of elementNode>)
            }
        "]

    end

    template -->|输入| parseHTML:::func -->|输出|ast -->|输入|generateRender
    -->|输出|render

    %% init.js

    subgraph initModule ["@module init.js: 汇聚render相关的初始化方法"]
        subgraph initMixinFunc ["@func initMixin: 为Vue添加_init实例方法"]
            initMixin["@func initMixin"]
            _init["@func _init: 初始化vm实例"]
        end
    end
    style initModule stroke: yellow

    %% render.js

    subgraph renderModule ["@module render.js: 汇聚render相关的方法"]
        subgraph renderMixinFunc ["@func renderMixin: 为Vue挂载_render实例方法"]
            renderMixin["@func renderMixin"]
            _c["@method _c(tagName, attrs, _c..."]
            _v["@method _v( 'text...'+_s(...)+... )"]
            _s["@method _s(<mustache var)"]
            _render["@method _render: 生成虚拟节点树"]


        end

        createElement["@func createElement"]
        createTextNode["@func createTextNode"]

    end
    style renderModule stroke: yellow

    subgraph lifeCycleModule ["@module lifeCycle.js: 汇聚生命周期相关的方法"]
        subgraph lifeCycleMixinFunc ["@func lifeCycleMixin: 为Vue挂载_update方法"]
            lifeCycleMixin["@func lifeCycleMixin"]
           _update["@method _update(vm._render()): diff前后更新前后虚拟节点差异, 将虚拟节点树渲染成真实节点树"]
           _render -->|输入虚拟节点树|_update
        end

        mountComponent["@func mountComponent: 挂载元素到rootContainer当中"]
        mountComponent -->|调用|_update
    end
    style lifeCycleModule stroke: yellow

    subgraph vnodeFunc["@func vnode"]
        vnode_input[/"@param: name, data, children, text"/]
        vnode["@func vnode"]
        vnode_return[("@returns: {
            name,
            data,
            children,
            value
        }")]


        _c -->|调用|createElement -->|调用|vnode
        _v -->|调用|createTextNode -->|调用|vnode
        render_func -.->|概述: 嵌套调用, 合并变量数据, 生成规范化的虚拟dom|vnode 
    end


    %% Vue.js
    subgraph VueModule ["@module Vue: 只有一个构造函数, 实例方法由其他函数指定"]
        Vue["@contructor Vue: Vue构造函数"]
        vm["@instance vm: Vue实例"]

        _update -->|实例方法|Vue
        _c & _v & _s & _render --->|实例方法|Vue
        _init -->|实例方法|Vue

        render_func -.->|this目标指向|vm:::vm

        vm -->|调用实例方法|init
    end
    style VueModule stroke: yellow