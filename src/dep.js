
function Dep() {
  this.subs = new Set(); // set结构可以自动去重,因为不可避免有些依赖会被重复添加
}
Dep.prototype = {
  addSub: function() {
    if (Dep.target) this.subs.add(Dep.target);
  },
  notify: function() { // 在某个属性发生变化时会执行其 dep.notify(),用来通知依赖这个属性的所有 watcher
    this.subs.forEach(function(watcher) {
      watcher.proxy.dirty = true // 标明数据脏了,当再次使用到这个值会重新计算
      watcher.update()
    });
  }
};
Dep.target = null; // 全局唯一收集容器

export default Dep;