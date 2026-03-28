---
title: Dive into Vue：依赖追踪
date: 2024.07.07
intro: 响应式系统是 Vue 的核心模块，其原理建立在简单的 JS 语言特性上，却实现了复杂且巧妙的特性。
tags:
  - Vue
  - ES6
---

在 Vue 中，响应式系统自动跟踪 JavaScript 状态并在其发生变化时响应式地更新 DOM。假如一个副作用函数中读取了某个对象的属性，当这个属性变化时，副作用函数重新执行，那么我们就称这个对象是响应式对象。

```js
const obj = { count: 0 }
function effect() {
  el.innerText = obj.count
}
effect()

obj.count = 3 // 自动执行 effect()，将 el.innerText 更新为 3
```

## 响应性实现方式

我们不难得出想要数据具备响应特性，就需要在数据更新时执行更新操作。只需要通过某种方式，拦截数据的设置操作就可能实现。

在 Vue 2 中，拦截数据的设置操作是通过`Object.defineProperty`实现的；在 Vue 3 中，利用的是`Proxy`对象的特性。Proxy 允许对对象的底层操作进行「拦截」，对外提供统一的访问入口，并在此过程中加入自定义逻辑。

```js
const obj = { count: 0 }
const proxyObj = new Proxy(obj, {
  get: (o, k) => {
    return o[k]
  },
  set: (o, k, v) => {
    o[k] = v
    return true
  },
})

proxyObj.count = 1
console.log(obj.count) // 1
```

通过 Proxy 的语法特性，我们就能实现数据的响应性。现在问题的关键是如何构建一个响应性系统运行所需的数据结构。

## 存储副作用

在响应式系统中，需要将响应式数据与副作用函数进行关联，以便能够知道在数据发生变化时需要执行哪些副作用。我们将这个过程称为「依赖收集」。那么应该什么时候收集依赖呢？显然是触发响应式数据的读取操作时。

要存储收集的依赖，可以使用一个`Map`结构，其中的键是响应式对象的属性，值是一个集合，用于存储所有依赖该属性的副作用函数。对于响应式对象`target`，假设有两个属性`prop1`和`prop2`，存储的依赖关系可以以下图表示：

![依赖收集的存储结构](/img/vue-reactivity/dependency-structure.png)

在有多个 target 的情况下，最顶层还需要一个`WeakMap`，用于存储每个对象的依赖关系。

我们定义存储结构如下：

```ts
// 全局存储桶，保存每个对象的依赖关系
type Bucket = WeakMap<object, DepsMap>
// 响应式对象中，每个属性和其对应的副作用函数集合的依赖关系表
type DepsMap = Map<PropertyKey, Deps>
// 每个属性的副作用函数集合
type Deps = Set<Function>
```

::callout{title='WeakMap 与 Map'}
WeakMap 和 Map 都是用于存储键值对的数据结构，但它们在内存管理、键的类型以及可操作性上存在本质的区别。

|<div style="min-width: 80px">特性</div>|Map|WeakMap|
|--|--|--|
|键的类型|任意类型|仅限对象或 ES2023 后的 Symbol|
|引用类型|强引用：只要 Map 存在，键值对就不会被垃圾回收|弱引用：若无其他引用，键及其关联值会被自动回收|
|迭代/枚举|支持（`keys()`、`values()`、`entries()`、`forEach()`等）|不支持任何迭代方法|
|大小获取|支持（`size`属性）|无`size`属性|
|清除|支持（`clear()`方法）|不支持`clear()`|

在进行依赖管理的时候，WeakMap 恰好可以存储响应式对象作为键；当响应式对象在业务代码中不再使用时，由于 WeakMap 的弱引用特性，响应式对象及其关联的依赖关系也会被自动回收，避免内存泄漏。
::

## 初步实现响应式

假设副作用函数为`activeEffect`，我们可以初步实现响应式系统：

```ts
const bucket: Bucket = new WeakMap()

const proxyObj = new Proxy(obj, {
  get: (target, key) => {
    // 没有 activeEffect，直接返回值
    if (!activeEffect) return target[key]
    let depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    return target[key]
  },
  set: (target, key, value) => {
    target[key] = value
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    if (!deps) return
    deps.forEach(effectFn => effectFn())
    return true
  }
})
```

使用时：

```ts
const obj = { count: 0 }

const activeEffect = () => {
  console.log('effect run:', proxyObj.count)
}

const proxyObj = new Proxy(obj, { /*... */ })

activeEffect() // 执行副作用，触发读取

proxyObj.count = 1 // 输出：effect run: 1
proxyObj.count = 3 // 输出：effect run: 3
```

当改变响应式对象`proxyObj`中`count`属性时，副作用函数会自动执行。此时，`count`就是一个响应式数据了。

## 分支切换

在当前的实现中，响应式对象上任何属性的读取操作，都会导致当前的副作用被收集到对应的属性的依赖集合中。这在大部分情况下是符合预期的。但是，假设存在以下情况：

```ts
const obj = { enabled: true, count: 0 }
const activeEffect = () => {
  el.innerText = proxyObj.enabled ? proxyObj.count : 'N/A'
}
```

执行副作用后将触发`proxyObj.enabled`和`proxyObj.count`的读取操作，建立如下图所示的依赖关系：

![错误的依赖收集](/img/vue-reactivity/incorrect-collect.png)

此时，再次修改`proxyObj.enabled = false`，触发副作用函数再次执行；执行后，`el.innerText`将被设置为`'N/A'`。此后，无论`proxyObj.count`如何变化，`el.innerText`都将保持为`'N/A'`。也就是说，`proxyObj.count`的变化不应当再次触发副作用函数的执行。

不过目前的实现并不能做到这一点。即便分析后可以认定`el.innerText`和`proxyObj.count`不再有依赖关系，但副作用函数依然会执行。这种遗留的副作用在生产中往往会构成不必要的更新。我们知道 Vue 中相当多的特性依靠响应式系统才得以实现，例如计算属性、侦听器等。如果这些特性在依赖收集时没有正确处理，就会导致性能问题。

观察副作用函数。当`proxyObj.enabled`变为`false`时，就不会再触发`proxyObj.count`的读取操作。因此，想要去除遗留的副作用，只需要在每次副作用执行后，都重新建立依赖关系即可。换句话说，响应式系统需要在副作用函数再次执行前，能够把`activeEffect`从`proxyObj.count`的依赖集合中移除。

为了支持这种移除，需要重新设计副作用函数。

当前，示例使用一个名为`activeEffect`的全局变量表示当前正在执行的副作用函数。在实际使用时，用户也必须提供一个名为`activeEffect`的副作用并手动调用一次触发响应式对象的读取操作，这样很不灵活。改进的方法是保留`activeEffect`为内部使用，面向用户提供一个用于注册副作用函数的函数`effect`。`effect`可以接受一个函数作为参数（即用户传入的真正的副作用函数），将其赋值给`activeEffect`，立刻执行一次。

```ts
function effect(fn: Function) {
  activeEffect = fn
  fn()
}
```

其次，为了能够将`activeEffect`从响应式对象属性的依赖集合中移除，需要为副作用函数保存与其关联的依赖集合。因此，定义`effectFn`，为其增加`.deps`属性保存依赖集合，并新增`cleanup`方法用于清除依赖。

```ts
function effect(fn: Function) {
  const effectFn = (): Function & { deps: Deps[] } => {
    // 新增清除依赖的方法 cleanup
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
  }
  effectFn.deps = []
  return effectFn
}

function cleanup(effectFn: Function & { deps: Deps[] }) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps: 所有关联该副作用函数的依赖集合
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}
```

现在，依赖集合不仅保存在响应式对象的`depsMap`中，还保存在副作用函数的`.deps`属性中。在 getter 中为响应式对象收集依赖时，可一并将依赖集合 push 到副作用函数的`.deps`数组中。

```ts
const proxyObj = new Proxy(obj, {
  get: (target, key) => {
    if (!activeEffect) return target[key]
    let depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    effectFn.deps.push(deps)
    return target[key]
  },
  /* ... */
})
```

对依赖关系的收集如下图所示：

![分支依赖收集](/img/vue-reactivity/branch-dependency.png)

下面是完整的代码。其中将 Proxy 的 getter 中收集依赖的逻辑提取出来，封装为一个函数`track`，将 setter 中触发依赖执行的逻辑提取出来，封装为一个函数`trigger`。

```ts
// 全局存储桶，保存每个对象的依赖关系
type Bucket = WeakMap<object, DepsMap>
// 响应式对象中，每个属性和其对应的副作用函数集合的依赖关系表
type DepsMap = Map<PropertyKey, Deps>
// 每个属性的副作用函数集合
type Deps = Set<EffectFn>
// 副作用函数。新增`deps`存储包含该副作用的所有依赖集合
type EffectFn = Function & { deps: Deps[] }

const bucket: Bucket = new WeakMap()
let activeEffect: EffectFn

const obj: Record<string, any> = { count: 0, enabled: true }

function cleanup(effectFn: EffectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function effect(fn: Function) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
  }
  effectFn.deps = []
  effectFn()
}

function track(target: object, key: PropertyKey) {
  // 没有 activeEffect，直接返回
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target: object, key: PropertyKey): void {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  if (!deps) return
  deps.forEach(effectFn => effectFn())
}

const proxyObj = new Proxy(obj, {
  get: (target, key: PropertyKey) => {
    track(target, key)
    return target[key]
  },
  set: (target, key: PropertyKey, value) => {
    target[key] = value
    trigger(target, key)
    return true
  }
})

effect(() => {
  el.innerText = proxyObj.enabled ? proxyObj.count : 'N/A'
})
```

此时，执行代码会进入死循环。原因是在`trigger`中执行`deps.forEach`语句时，执行`effectFn`会触发`cleanup`，试图将当前执行的副作用函数从`deps`中移除；但随后，副作用函数的执行又会导致触发 getter，从而重新收集依赖，又将当前副作用函数添加到`deps`中。

解决的方法是在`trigger`中依次调用副作用函数前，先构造一个新的集合，将`deps`中的副作用函数复制到新集合中，然后遍历新集合执行副作用函数。

修改过的`trigger`函数如下：

```ts
function trigger(target: object, key: PropertyKey): void {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  if (!deps) return
  // 新增：构造新集合，避免触发时修改 deps 导致死循环
  const effectsToRun = new Set(deps)
  effectsToRun.forEach(effectFn => effectFn())
}
```

经过调整后的响应式系统，在更改`proxyObj.enabled = false`后，无论`proxyObj.count`的值被设置为几，都不会再次触发副作用函数的运行了。

## 解决无限循环（again）

与上面提到的依赖集合被反复修改类似，还有一种情况也会造成无限循环。考虑下面的副作用：

```ts
effect(() => {
  proxyObj.count++
})
```

自增操作相当于`proxyObj.count = proxyObj.count + 1`。在这个语句中，同时包含了对`proxyObj`的`count`属性的读取和写入。当读取`proxyObj.count`时，会触发`track`收集依赖；然后，将`proxyObj.count`的值增加 1 并赋给`proxyObj.count`，会触发`trigger`执行副作用函数本身。但此时，副作用函数正在执行中，尚未执行完毕就触发了下一次副作用函数的执行，从而无限递归地调用自己。

想要避免第二次调用，需要在执行副作用函数的`trigger`中增加守卫：如果需要执行的副作用函数与当前正在执行的副作用函数相同，则不执行，即：

```ts
function trigger(target: object, key: PropertyKey): void {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  if (!deps) return
  // 新增：构造新集合，避免触发时修改 deps 导致死循环
  const effectsToRun = new Set<EffectFn>()
  deps.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => effectFn())
}
```

## 嵌套的副作用

在目前为止的例子中，副作用以全局变量`activeEffect`的方式存在。但在实际场景中，副作用是应当支持嵌套的。例如，一个父组件的渲染过程中渲染了子组件，就发生了副作用的嵌套。

嵌套的副作用函数看上去是这样的：

```ts
effect(function effectFn1() {
  console.log('effectFn1 run')
  effect(function effectFn2() {
    console.log('effectFn2 run')
    el.innerText = obj.foo
  })
  el.innerText = obj.bar
})
```

假设以这个嵌套的副作用函数为例，当外层的副作用执行时，`activeEffect`的值被修改为 effectFn1；当执行内侧的副作用时，`activeEffect`的值被修改为 effectFn2。但当执行完内侧副作用、返回外层继续执行 effectFn1 时，`activeEffect`的值并不会重新恢复到 effectFn1。这意味着当修改`obj.bar`时，重新执行的副作用还是 effectFn2 而非预期中的 effectFn1。

要支持嵌套的副作用，显然需要使用栈结构来存储当前正在执行的副作用函数，将`activeEffect`指向栈顶元素。当副作用函数执行时压入栈中，当执行完成后进行出栈。

```ts
let activeEffect: EffectFn
const effectStack: EffectFn[] = []

function effect(fn: Function) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn()
}
```

## 目前为止的完整代码

```ts
// 全局存储桶，保存每个对象的依赖关系
type Bucket = WeakMap<object, DepsMap>
// 响应式对象中，每个属性和其对应的副作用函数集合的依赖关系表
type DepsMap = Map<PropertyKey, Deps>
// 每个属性的副作用函数集合
type Deps = Set<EffectFn>
// 副作用函数。新增`deps`存储包含该副作用的所有依赖集合
type EffectFn = Function & { deps: Deps[] }

const bucket: Bucket = new WeakMap()
let activeEffect: EffectFn
const effectStack: EffectFn[] = []

const obj: Record<PropertyKey, any> = { count: 0, enabled: true }

function cleanup(effectFn: EffectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function effect(fn: Function) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn()
}

function track(target: object, key: PropertyKey) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target: object, key: PropertyKey): void {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  if (!deps) return
  const effectsToRun = new Set<EffectFn>()
  deps.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach((effectFn) => effectFn())
}

const proxyObj = new Proxy(obj, {
  get: (target, key: PropertyKey) => {
    track(target, key)
    return target[key]
  },
  set: (target, key: PropertyKey, value) => {
    target[key] = value
    trigger(target, key)
    return true
  }
})
```