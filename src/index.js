import Compile from './compile.js'
import { watchInit } from './watch.js'
import { observeInit } from './observer.js'
import { computedInit } from './computed.js'

function MVVM(options) {
  this.data = options.data;
  this.methods = options.methods;
  this.computed = options.computed;
  this.watch = options.watch;

  Object.keys(this.data).forEach((key) => {
    // 遍历 data中所有的属性放入到 Vue实例中
    // 相当于是给 data的一个代理
    // 这样的目的是能让外部t通过 this[key] 的方式直接调用 this.data里的值
    this.proxyKeys(key);
  });

  // 将 data 中所有属性变为响应式
  // 之所以进行这一步是因为程序内部其他地方都是通过 data[key]的方式调用 data属性, 并不是通过 this[key] 的方式
  observeInit(this.data); 

  // 将 computed 中所有属性变为响应式
  // 当所有的计算属性都被挂载到DOM了,这一步可以不用
  // 因为在 transit.js中依然会对其进行初始化
  // 但这样依旧不会影响,也不会重复,因为 Object.defineProperty会替换
  computedInit(this.computed, this);

  // 监听 watch 中所有的属性
  watchInit(this.watch, this);

  // 将 html中的 name 与 data值对应起来, 然后展示在页面上(在数据发生变化时会触发相对应的更改DOM值的事件)
  // 还有一些点击事件,v-model的处理
  new Compile(options.el, this);
}

MVVM.prototype = {
  proxyKeys: function(key) {
    var self = this;
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get() {
        return self.data[key];
      },
      set(newVal) {
        self.data[key] = newVal;
      }
    });
  },
}

export default MVVM;
// module.exports = MVVM;

