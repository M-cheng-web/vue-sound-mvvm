import Watcher from './watcher.js'

/**
 * 计算属性响应式
 * vm:  Vue实例
 * exp: 计算属性名
 * cb:  渲染函数(更改DOM内容的方法)
 */
function computed(vm, exp, cb) {
  // 创建监听实例
  const computedWatcher = new Watcher(vm, exp, cb, { computed: true })
  // 往 Vue实例中添加计算属性并监听
  Object.defineProperty(vm, exp, {
    configurable: true,
    enumerable: true,
    get() {
      if (computedWatcher.proxy.dirty) {
        // 代表这个属性已经脏了,需要更新(重新运算)
        console.log('取新值', exp)
        computedWatcher.depend() // 添加上下文与此属性绑定
        return computedWatcher.get();
      } else {
        // 代表这个属性不需要重新运算
        console.log('取旧值', exp)

        // 取旧值的时候也要添加上下文绑定
        // 因为其他值在依赖这个计算属性的时候,有可能会依赖到旧的值
        // 所以在依赖到旧值时也要添加上下文绑定,从而当这个计算属性被改变时也能通知到对方改变
        // 一开始我就是没进行这一步,从而导致莫名bug
        computedWatcher.depend()
        return computedWatcher.proxy.value
      }
    }
  })
}

/**
 * 计算属性初始化
 */
function computedInit(value, vm) {
  if (!value || typeof value !== 'object') return;
  Object.keys(value).forEach(key => new computed(vm, key))
}

export { computed, computedInit }