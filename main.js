import Vue from "./src/intance/index.js"

const app = new Vue({
    el: "#app",
    template: `<div class="todolist-wrapper">
    here is some text
    <ul class="todolist-container">
        <li class="done"></li>
        <li class="todo"></li>
        <li class="todo"></li>
    </ul>
    another text
</div>`
    
})