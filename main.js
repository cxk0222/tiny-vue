import { ToyVue as Vue } from './toy-vue.js'

// var app = new Vue({
//   el: '#app',
//   data: {
//     message: 'Hello Vue!'
//   }
// })

// var app2 = new Vue({
//   el: '#app-2',
//   data: {
//     message: '页面加载于 ' + new Date().toLocaleString()
//   }
// })

var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
    }
  }
})