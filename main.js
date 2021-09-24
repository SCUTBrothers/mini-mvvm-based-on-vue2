import Vue from './src/intance/index.js'

const app = new Vue({
  el: '#app',
  template: `<div class="todolist-wrapper">
        Hello {{ fullname }}, this is tasks of today: 
        <ul class="todolist-container">
            <li class="undo">{{ shoppingList[shoppingList.length - 1] }}</li>
            <li class="todo"></li>
        </ul>
        another text
    </div>`,
  data: {
    firstname: 'Nicholas',
    lastname: 'Zhaosi',
    isNeedFirst: true,
    shoppingList: ['apple', 'water', 'bread'],
  },
  computed: {
    fullname() {
      if (this.isNeedFirst) {
        return this.firstname + '.' + this.lastname
      } else {
        return this.lastname
      }
    },
  },
})

app.isNeedFirst = false
app.firstname = 'Jack'
