import Vue from "./src/intance/index.js"

const app = new Vue({
    el: "#app",
    template: `<div class="todolist-wrapper">
        Hello {{ name }}, this is tasks of today: 
        <ul class="todolist-container">
            <li class="done">{{ task1 }}</li>
            <li class="undo">{{ task2 }}</li>
            <li class="todo"></li>
        </ul>
        another text
    </div>`,
    data: {
        name: "Nicholas",
        task1: "running",
        task2: "reading"
    }
})

app.task2 = "swimming"