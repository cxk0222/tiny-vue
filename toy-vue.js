const re = /^{{([\s\S]+)}}$/

export class ToyVue {
  constructor(config) {
    this.template = document.querySelector(config.el)
    this.data = reactive(config.data)

    for (const name in config.methods) {
      this[name] = () => {
        config.methods[name].apply(this.data)
      }
    }

    this.traversal(this.template)
  }
  traversal(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim().match(re)) {
        const name = RegExp.$1.trim()
        effect(() => node.textContent = this.data[name])
      }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const attributes = node.attributes
      for (const attribute of attributes) {
        if (attribute.name === 'v-model') {
          const value = attribute.value
          effect(() => node.value = this.data[value])
          node.addEventListener('input', e => {
            this.data[value] = e.target.value
          })
        }
        if (attribute.name.match(/^v-bind:([\s\S]+)$/)) {
          const attrName = RegExp.$1
          const value = attribute.value
          effect(() => node.setAttribute(attrName, this.data[value]))
        }
        if (attribute.name.match(/^v-on:([\s\S]+)$/)) {
          const eventName = RegExp.$1
          const fnName = attribute.value
          effect(() => node.addEventListener(eventName, this[fnName]))
        }
      }
    }
    if (node.childNodes && node.childNodes.length) {
      for (const child of node.childNodes) {
        this.traversal(child)
      }
    }
  }
}

const effects = new Map()

let currentEffect = null

function effect(fn) {
  currentEffect = fn
  fn()
  currentEffect = null
}

function reactive(object) {
  const observed = new Proxy(object, {
    get(object, property) {
      // 依赖收集
      if (currentEffect) {
        if (!effects.has(object)) {
          effects.set(object, new Map())
        }
        if (!effects.get(object).has(property)) {
          effects.get(object).set(property, new Array())
        }
        effects.get(object).get(property).push(currentEffect)
      }
      return object[property]
    },
    set(object, property, value) {
      object[property] = value
      if (effects.has(object) && effects.get(object).has(property)) {
        for (const effect of effects.get(object).get(property)) {
          effect()
        }
      }
      return true
    }
  })
  return observed
}

let dummy

const counter = reactive({ num: 0 })

effect(() => (dummy = counter.num))

console.log('dummy', dummy)

counter.num = 7

console.log('dummy', dummy)