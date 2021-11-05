// 中转作用
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
