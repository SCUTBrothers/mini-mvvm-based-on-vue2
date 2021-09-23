import Vue from './src/intance/index.js'

const app = new Vue({
  el: '#app',
  template: `<div class="todolist-wrapper">
        Hello {{ fullname }}, this is tasks of today: 
        <ul class="todolist-container">
            <li class="done">{{ task1 }}</li>
            <li class="undo">{{ shoppingList[shoppingList.length - 1] }}</li>
            <li class="todo"></li>
        </ul>
        another text
    </div>`,
  data: {
    firstname: 'Nicholas',
    lastname: 'Zhaosi',
    task1: 'running',
    task2: 'reading',
    shoppingList: ['apple', 'water', 'bread'],
  },
  computed: {
    fullname() {
      return this.firstname + '.' + this.lastname
    },
  },
})

app.task1 = 'singing'
app.task1 = 'gaming'
app.task1 = '1'
app.task1 = '2'
app.task1 = '3'
app.task1 = '4'
