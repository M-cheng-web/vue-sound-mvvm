
function Dep() {
  this.subs = new Set();
}
Dep.prototype = {
  addSub: function() {
    if (Dep.target) this.subs.add(Dep.target);
  },
  notify: function() {
    this.subs.forEach(function(watcher) {
      watcher.proxy.dirty = true
      watcher.update()
    });
  }
};
Dep.target = null;

export default Dep;