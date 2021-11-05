# vue-sound-mvvm
Vue-双向绑定实现(data, watch, computed)

## 简介
这套代码简单实现了 vue框架的双向绑定核心功能<br>
实现watch,实现data,computed的页面渲染以及创建计算属性的缓存节约性能<br>

### 项目运行
1. vscode内下载`Live Server`插件
2. 项目拉到本地后点开 www => index.html,右键选择`Open With Live Server`
3. 会自动打开网页,并且都是热更新的,开始你的调试之旅吧!

### 实现功能细节点
+ 模拟 Vue,通过创建 Vue实例对象的方式完成数据的渲染以及双向绑定的配置
+ v-model   {{data}}   v-on  功能的简单完成
+ data的渲染页面以及双向绑定
+ computed的渲染页面以及双向绑定以及相互引用
+ watch监听功能
+ methods方法的实现

### 关于模板字符串
内部的 v-model,事件以及模板字符串的实现可以先不用在意(这里只是简单应用,并不是vue实际实现方式)<br>
建议直接看 compole.js中compileText() 以及 compileModel()方法<br>
这俩个方法是将 v-model='title' 以及 {{ title }} 中的title转化为实际值并且渲染页面的关键方法<br>
如果对模板字符串感兴趣的话可以参考我关于这一块的源码实现 => https://github.com/M-cheng-web/vue-sound-mustache

### 什么是计算属性缓存?
例如当A计算属性 = B计算属性 + C计算属性, 而C计算属性 = dataA + dataB<br>
如果C计算属性先于A计算属性执行,那么运算A计算属性的时候并不会再次去运算C计算属性,而是去拿它的缓存(除非在这个过程中dataA或者dataB发生改变)<br>
如果A计算属性先于C计算属性执行,那么运算A计算属性的时候会去运算C计算属性,当其他地方用到C的时候同样也会去拿C的缓存,而不是再次运算(除非dataA或者dataB发生改变)<br>

### 注意事项
html中显示的属性必须是已存在的,我这边没有做处理~

## 功能实现
我这边就从几个实际应用场景出发,说明怎么把这些功能实现
1. data属性页面渲染,且更改这个属性后页面能实时响应
2. 计算属性页面渲染,且这个计算属性所依赖的data属性改变后页面能实时响应
3. 计算属性页面渲染,且这个计算属性所依赖的计算属性或者data属性改变后页面能实时响应
4. 监听data或者计算属性,发生改变后能给出旧值和新值

### 核心概念了解
#### Object.defineProperty
在目标值被获取或者更改时能劫持到的特性<br>
这里是用在了data以及计算属性上,关于更多特性相信网上资料也有很多,自行研究~<br>

#### Watcher
双向绑定核心对象<br>
主要完成以下功能:<br>
1. 融合data,computed,watch需要的功能(渲染,更改,获取,缓存)
2. 生成所有值的实例对象,在某个属性依赖其他属性时会将其属性的watcher实例放入自身,以此来实现查找功能

#### Dep
subs属性: 负责存储依赖,也就是存储watcher实例对象<br>
比如:A = B + C,A的watcher实例对象就会存在B和C的subs内,在B或者C发生改变时会执行A的相对应数据更新方法<br>

addSub()方法: 存储当前Dep.target到subs中<br>
notify()方法: 通知subs内的所有watcher实例更新数据<br>

Dep.target: 负责存储当前上下文(watcher),因为是静态属性所以是唯一的,这也正好符合了使用场景,运行时只存在一个上下文<br>

#### targetStack
对Dep.target静态属性操作的封装<br>

应用场景: A计算属性 = B计算属性 + C计算属性, B计算属性 = dataA + dataB, C计算属性 = dataC + dataD<br>
在算A的时候会将A的watcher实例放入Dep.target,然后再执行A的获取值的方法(B计算属性 + C计算属性)<br>
在算B的时候会将当前Dep.target存的值放入B的subs中(也就是存储了A的依赖,在B变化时会能通知到A也更新的操作)<br>
然后将B的watcher实例放入全局的Dep.target,注意,这个时候如果直接替换会把之前存入Dep.target的A的watcher实例给替换掉<br>
在计算(dataA + dataB)的过程中,这俩个值都能正确存储依赖他们的值<br>
最后再算C的时候,也会将当前Dep.target存的值放入C的subs中,但是这个时候Dep.target存的是B的watcher,按道理这个时候Dep.target应该存的是
A的watcher,这样C才能知道当C改变的时候需要通知A<br>

结论: 我们需要一个能自动控制当前Dep.target值的算法,且当前Dep.target有值的时候要存储起来,不能直接替换<br>
解决: targetStack利用栈原理很好的解决了这个问题

### 各个模块解析
#### index.js
项目入口<br>
MVVM实例对象(下面统称vue实例)的创建,在实例化对象中会初始化data,computed,watch<br>
会将data中的所有属性附加到vue实例上,并与data中所有属性互相绑定(vue实例中这个属性改变也会触发data的这个属性改变)

#### observer.js
为所有data属性添加响应式<br>
在data下某个属性被用到时,会将当前的Dep.target存放到其subs中,在这个属性被更改时会遍历subs触发用到这个属性的值更改

#### computed.js
为所有computed属性添加响应式<br>
在为所有computed属性生成watcher实例后,会开启对属性的监听,当这个属性被get的时候会判断这个属性的值是否为最新值<br>
如果是最新值则不需要再进行运算,直接取旧值(注意,取旧值也要将当前Dep.target所存的watcher实例放入这个计算属性的subs中)<br>
如果不是最新值则需要再次运算,先将当前Dep.target存入subs,然后再运算这个计算属性的值,在运算结束后会将这个值标记为最新值,且存储了这个最新值<br>
如果这个标记不变的话,以后会直接用这个存储的最新值(只有当这个值所依赖的值发生改变才会改变这个值的标记)

#### watcher.js
为所有的属性创建watcher实例<br>
使用targetStack数组来达到实时更新Dep.target上下文<br>
使用proxy{ value, dirty }来存储缓存和标记是否为最新值(value: 缓存值, dirty: 是否脏数据)

#### watch.js
实现监听<br>
遍历所有watch,将被watch的属性改变后需要触发的函数放入watcher的callback回调中<br>
在第一次加载的时候就会调用一次被监听的属性,以达到被这个属性存放在其subs中,当这个属性变化时自然能通知到watch

#### compile.js
html页面的功能实现,主要实现了v-model,v-on,{{title}}模板字符串功能

#### transit.js
中转作用<br>
因为在渲染的时候并不知道这个属性是data还是computed,所以要在这判断一下并且调用相对应的方法


