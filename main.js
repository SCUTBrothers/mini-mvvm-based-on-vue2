import Vue from './src/intance/index.js'

const app = new Vue({
  el: '#app',
  template: `<div class="todolist-wrapper">
        Hello {{ fullname }}, these are tasks of today: 
        <ul class="todolist-container" v-if = "isDone" >
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
    isDone: false,
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

app.shoppingList.pop()
