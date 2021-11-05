import Dep from './dep.js'

function Observer(data) {
  this.data = data;
  this.walk(data);
}

Observer.prototype = {
  /**
   * 为 data每个属性添加响应式
   */
  walk: function(data) {
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  },

  /**
   * 为目标属性添加拦截
   */
  defineReactive: function(data, key, val) {
    var dep = new Dep(); // 创建 dep实例
    observeInit(val); // 如果 val为对象会一直递归下去添加响应拦截
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 在调用 data[key] 的时候会触发这里
        // 然后这边会将当前上下文与此属性绑定
        dep.addSub();
        return val;
      },
      set(newVal) {
        // 对 data[key] 赋值的时候会触发这里
        // 然后这边会遍历此属性绑定的所有上下文(也就是存在subs里的东西)
        // 并且触发他们的更新方法
        if (newVal === val) return;
        val = newVal;
        dep.notify();
      }
    });
  }
};

/**
 * 初始化响应
 */
function observeInit(value) {
  // 只有当 value为对象的时候才会初始化
  if (!value || typeof value !== 'object') return;
  return new Observer(value);
};


export { Observer, observeInit }