import Vue from "./src/intance/index.js"

const app = new Vue({
    el: "#app",
    template: `<div class="todolist-wrapper">
        Hello {{ name }}, this is tasks of today: 
        <ul class="todolist-container">
            <li class="done"></li>
            <li class="todo"></li>
            <li class="todo"></li>
        </ul>
        another text
    </div>`,
    data: {
        name: "Nicholas"
    }
})

app.name = "Jack"
app.name = "Daisy"