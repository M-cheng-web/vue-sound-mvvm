// 中转作用 (因为在渲染的时候并不知道这个属性是data还是computed,所以要在这判断一下并且调用相对应的方法)
// 区分data和 computed 分别调用两种

import Watcher from './watcher.js'
import { computed } from './computed.js'

function transit(vm, exp, cb) {
  if (vm.data[exp]) {
    new Watcher(vm, exp, cb);
  } else {
    new computed(vm, exp, cb);
  }
}

export default transit
