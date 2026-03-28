---
title: Dive into Vue：调度执行
date: 2024.12.18
intro: 如果说响应式系统中依赖收集解决了「谁依赖谁」的问题，那么调度执行机制就解决了「在何时、以何顺序」进行更新的问题
tags:
  - Vue
  - ES6
---

::callout
Previously on Dive into Vue: [响应式系统](vue-reactivity.md)
::

调度执行机制，指在响应式系统中`trigger`函数具备的，可以决定副作用执行的时机、次数和方式的能力。在 Vue 的响应式系统中，除了依赖追踪，调度机制也是一个至关重要的组成部分。它决定了副作用在何时、以何种顺序执行，以及如何避免不必要的计算。深入调度执行机制，是理解 Vue 响应式系统不可或缺的步骤。

## 为什么需要调度机制？

在当前版本的响应式系统视线中，代码不包含调度机制。当触发`trigger`函数时，会立即执行副作用。考虑下面的例子：

```js
const count = ref(0)

watchEffect(() => {
  console.log(count.value)
})

count.value++
count.value++
count.value++
```

如果没有调度机制，上述代码会输出：

```
0
1
2
3
```

而在 Vue 中，实际上只会输出：

```
0
3
```

即：数据只更新了一次。不难得出结论：在 Vue 中，实际上`trigger`并**不会**直接执行副作用，而是将更新任务统一交给了调度机制进行处理。这避免了大量中间无用状态导致的重复更新。

在[响应式系统](vue-reactivity.md)中的代码实现目前还无法做到这一点。在已有逻辑的基础上，可以模仿 Vue 实现简化的调度机制。

## 支持调度器

当前的任务，是需要`trigger`可以通过调度机制调用副作用。这就需要修改副作用函数的结构，使其支持传入一个自定义的调度器。

```ts
// 副作用函数注册时，允许传入`options`配置项，通过`options.scheduler`指定自定义调度器
type EffectRegisterOptions = {
  scheduler?: (fn: Function) => void
}
// 更新副作用函数的类型，使用`options`存储注册时的配置项
type EffectFn = Function & {
  deps: Deps[]
  options: EffectRegisterOptions
}

function effect(fn: Function, options: EffectRegisterOptions = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.options = options
  effectFn.deps = []
  effectFn()
}
```

调度器`options.scheduler`可由用户自定义。那么，如何实现上文中提到的省略中间状态、避免额外更新的调度器呢？可以利用微任务队列在事件循环中「延后执行」的特性。简单的实现代码如下：

```ts
// 任务队列
const queue = new Set<Function>()
// 利用 Promise 实现微任务队列
const p = Promise.resolve()
// 是否正在刷新任务队列
let isFlushing = false

function flushJob() {
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    // 将队列中的任务依次执行
    queue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}

effect(() => {
  console.log(proxyObj.count)
}, {
  scheduler: (fn) => {
    // 每次调度时，将副作用函数添加到队列中而非立即执行
    queue.add(fn)
    flushJob()
  }
})
```

这个调度器使用 Set 来实现一个任务队列。当[前文中](#为什么需要调度机制)多次调用`count.value ++`时，实际上只有一次更新操作会被添加到队列中；随后，`isFlusing`标志保证了`flushJob`在一个周期内无论被调用多少次，都只会执行一次。当队列执行完毕并最终被清空时，`isFlusing`标志会被重置为`false`，下一个周期又会重复以上过程。

::callout
该调度器只为演示 Vue 内部「连续多次修改响应式数据但只会触发一次更新」的基本原理，调度器可以由用户自定义来实现复杂的副作用执行策略。Vue 内部实现的调度器思路类似，但更加完善。
::

接着，在`trigger`函数中，当需要执行副作用时，如果副作用函数`effectFn`上指定了调度器，那么调用调度器函数而不是立即执行副作用。

```ts
function trigger(target: object, key: PropertyKey) {
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
  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
```

截至目前，响应式系统已经具备了调度能力，并且还实现了一个行为类似 Vue 的调度器。

## 计算属性`computed`

Vue 中的一个重要功能就是计算属性`computed`。计算属性接受一个 getter，返回计算结果。计算属性具有如下特性：

- **Lazy**：不会立即返回值，只在访问时进行计算；
- **缓存**：只有当计算属性依赖的响应式数据发生变化时，才会重新计算。

计算属性的这两点特性均可以通过调度机制实现。

### Lazy Effect

在计算属性中，计算是懒执行的。必须要实现一个同样懒执行的副作用函数，才能作为实现计算属性的基础。

观察当前版本的`effect`实现：

```ts {13}
function effect(fn: Function, options: EffectRegisterOptions = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.options = options
  effectFn.deps = []
  effectFn()
}

effect(() => console.log('effect run'))
```

在调用`effect`注册副作用时，由于高亮的第 13 行，副作用总是立即执行一次。若要实现懒执行，需要在 13 行执行前增加判断，表明是否立即执行副作用。因此，增加参数`options.lazy`，若为`true`，则不立即执行，而是返回副作用函数`effectFn`以便在后续的某个时刻手动调用求值。

```ts {3, 18-21}
type EffectRegisterOptions = {
  scheduler?: (fn: Function) => void
  lazy?: boolean
}

function effect(fn: Function, options: EffectRegisterOptions = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

effect(() => console.log('effect run'))
```

此时，当调用`effect`注册副作用且同时指定`lazy: true`时，副作用函数就不会立即执行了。

下面考虑一个使用计算属性的例子：

```ts
const fullName = computed(() => proxyObj.firstName + ' ' + proxyObj.lastName)
```

在这个例子中，副作用是一个 getter 函数。在这种情况下仅仅实现了手动调用副作用是不够的，还需要能够在手动调用副作用时获取返回值（即计算结果）。为了实现这个目标，需要对`effect`进行修改，增加可以保存和返回计算结果的能力。

```ts {6-7,10-11}
function effect(fn: Function, options: EffectRegisterOptions = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    // 使用变量保存计算结果
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    // 当手动调用副作用函数时，可以通过返回值获取计算结果
    return res
  }

  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}
```

接下来，基于 Lazy Effect 编写计算属性`computed`的实现函数：

```ts {3-4}
function computed(getter: Function) {
  const effectFn = effect(() => {
    // 增加一个输出，更好地识别计算属性在何时进行求值
    console.log('effectFn invoked')
    return getter()
  }, { lazy: true })
  
  const obj = {
    get value() {
      return effectFn()
    }
  }

  return obj
}

const obj = {
  firstName: 'John',
  lastName: 'Doe'
}
const proxyObj = new Proxy(obj, { /* get, set */ })

// ↓ 调用 computed 并不会触发
const fullName = computed(() => proxyObj.firstName + ' ' + proxyObj.lastName)
// ↓ 计算属性仅在访问 fullName.value 时才会进行求值
console.log(fullName.value)
```

### 缓存计算结果

上文已经实现了懒执行的计算属性。但当多次访问`fullName.value`时，即便依赖的响应式数据`proxyObj.firstName`和`proxyObj.lastName`没有发生变化，计算属性也会重新求值。为了避免重复计算，需要缓存计算结果。

在计算属性的实现中，增加一个变量`cache`，用于缓存计算结果；使用`dirty`标志位表示是否需要重新计算。当`dirty`为`true`时，才进行重新求值，否则当访问`value`时应当直接返回`cache`。

```ts {2-3,11-15}
function computed(getter: Function) {
  let cache: any
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true
  })

  const obj = {
    get value() {
      if (dirty) {
        cache = effectFn()
        dirty = false
      }
      return cache
    }
  }

  return obj
}
```

用于判断是否需要重新计算的根据就是`dirty`的值。可以看到`dirty`会在每一次重新计算后被标记为`false`。那么什么时候应当把`dirty`置为`true`呢？我们知道当响应式数据发生变化时`computed`应当重新求值。因此，在响应式数据发生变化时，就需要把`dirty`置为`true`。

此处可以利用`effect`的`scheduler`调度器选项来实现。当响应式数据发生变化时，会调用副作用的调度器函数（如有），因此可以在`computed`中调用`effect`注册副作用时传入调度器：

```ts
function computed(getter: Function) {
  let cache: any
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        cache = effectFn()
        dirty = false
      }
      return cache
    }
  }

  return obj
}
```

现在，尝试多次访问`fullName.value`：

```ts
console.log(fullName.value)
console.log(fullName.value)
proxyObj.firstName = 'Jane'
console.log(fullName.value)
console.log(fullName.value)
```

副作用仅执行了两次，说明计算属性返回的值是缓存的结果。

### 嵌套的副作用

考虑以下例子，即在副作用中读取计算属性的值：

```ts
const fullName = computed(() => proxyObj.firstName + ' ' + proxyObj.lastName)

effect(() => {
  console.log('effect run with value: ', fullName.value)
})

proxyObj.firstName = 'Jane'
// effect run with value: John Doe
```

可以看到，当`proxyObj.firstName`发生变化时，副作用会被触发，但计算属性的值依然是旧值。我们期望的结果是当`proxyObj.firstName`发生变化时，计算属性的值也会发生变化。

分析原因，这本质上是一个副作用的嵌套。外层的副作用读取`fullName.value`，而`fullName`目前并非响应式数据，访问其`.value`属性也不会触发`track`的依赖收集逻辑。最终，外层 effect 没有被收集到任何依赖里，即便改变了`proxyObj.firstName`，也不会重新执行外层 effect。

经过以上分析，不难得出结论：要使此例按预期工作，关键是需要在访问`fullName.value`时能够触发`track`的逻辑进行依赖收集。不妨手动调用`track`函数实现这一过程；此外前文已有叙述，当响应式数据发生变化时将调用副作用调度器函数，通过在调度器中手动调用`trigger`，即可触发外层 effect 的重新执行。

```ts {9-10,20-21}
function computed(getter: Function) {
  let cache: any
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      // 当计算属性依赖的响应式数据发生变化时，手动调用 trigger 触发依赖的 effect 重新执行
      trigger(obj, 'value')
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        cache = effectFn()
        dirty = false
      }
      // 当访问计算属性的值时，手动调用 track 进行依赖收集
      track(obj, 'value')
      return cache
    }
  }

  return obj
}
```

此时，再次执行本节中的例子，代码按预期工作。

## 侦听器`watch`

上面一节代码实现了计算属性，本节将实现侦听器`watch`。

回想侦听器的使用方法：

```ts
watch(target, (newVal, oldVal) => {
  console.log('count changed from', oldVal, 'to', newVal)
})
```

可以得出几个特性：

1. 侦听器侦听一个响应式数据或一个 getter；
2. 当侦听的目标发生变化时，执行传入的回调函数；
3. 传入回调时，可接收新值和旧值参数；
4. 可以传入`immediate`选项，在侦听器创建时立即执行回调；
5. 可以传入`flush`参数，指定回调函数的执行时机。

其中，第 5 条特性与 Vue 对 DOM 的更新机制相关。前 4 条特性目前可以被实现。

### 侦听对象，执行回调

Vue 中，`watch`的第一个参数可以是响应式数据或一个 getter 函数。首先考虑响应式数据的情况：假设需要侦听的响应式数据是`proxyObj`，当`proxyObj.count`被修改为 100 时应当执行回调函数。这天然符合前文中 effect 的调度器的特征（即在响应式数据发生变化时被调用）。因此要实现第 2 条功能，只需要在`watch`的实现逻辑中，于调度器函数内调用传入的回调函数即可。

```ts
function watch(target, cb: () => void) {
  effect(() => target.count, {
    scheduler() {
      cb()
    }
  })
}

watch(proxyObj, () => {
  console.log('count changed')
})

proxyObj.count ++
```

但是，代码中注册副作用的时候，硬编码了`target.count`，这使得`watch`只能侦听`count`属性。事实上，如果修改了`proxyObj`的其他属性，我们也期望侦听器的回调可以执行。若要实现这一点，需要对 effect 传入的副作用函数进行封装，递归地访问`target`中的所有属性：

```ts
function watch(target: object, cb: () => void) {
  effect(() => traverse(target), {
    scheduler() {
      cb()
    }
  })
}

function traverse(value: any, seen = new Set<any>) {
  // 基本数据类型或已经被访问过，则不递归
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  // 暂不考虑数组等其他数据结构
  // value 作为普通对象，递归访问其所有属性
  for (const k in value) {
    traverse(value[k], seen)
  }
  return value
}
```

接下来考虑传入的`target`是一个 getter 函数的情况。如果用户直接传入一个 getter，那么就不需要在`effect`中调用`traverse`函数，因为 getter 函数内部已经包含了对响应式数据的访问逻辑。此时需要增加一层判断：

```ts
function watch(target: object | Function, cb: () => void) {
  let getter: Function;
  if (typeof target === 'function') {
    getter = target
  } else {
    getter = () => traverse(target)
  }
  effect(() => getter(), {
    scheduler() {
      cb()
    }
  })
}
```

### 支持回调参数

在第 3 条功能特性中，侦听器的回调函数支持包含两个参数，分别是侦听对象发生变化后的新值和变化前的旧值，这需要能够在执行 getter 的时候保存其返回值。在实现计算属性时，已经实现了类似的缓存功能，通过启用`lazy`来实现手动调用获取返回值。在此处，可以使用类似的思路：

```ts {12-17,21-22}
function watch(target: object | Function, cb: (newVal?: any, oldVal?: any) => void) {
  let getter: Function;
  if (typeof target === 'function') {
    getter = target
  } else {
    getter = () => traverse(target)
  }
  let newVal: any, oldVal: any
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      // 副作用执行时，产生新值
      newVal = effectFn()
      // 调用回调函数
      cb(newVal, oldVal)
      // 更新旧值
      oldVal = newVal
    }
  })

  // 手动调用获取旧值
  oldVal = effectFn()
}

watch(() => proxyObj.count, (newVal, oldVal) => {
  console.log('count changed from', oldVal, 'to', newVal)
})
```

在上面的代码中，已知调度器会在侦听对象发生变化时被调用，因此可以在调度器中执行`effectFn`获取响应式数据变化后的新值。在调用`watch`时手动执行的`effectFn`发生于完成依赖收集后，此时响应式数据没有发生变化，获取到的就是初始值。此后，每次触发`cb`后，都更新旧值，避免在下次触发`cb`时得到到错误的旧值。

### 立即执行的`watch`

在 Vue 中，立即执行的`watch`指在创建侦听器时立即执行一次回调函数。这个功能相对比较简单，只需要在`watch`的实现逻辑中，增加一个判断：如果`immediate`选项为`true`，则在创建侦听器时手动调用一次回调函数即可。

```ts {26-28}
type WatchOptions = {
  immediate?: boolean
}

function watch(
  target: object | Function,
  cb: (newVal?: any, oldVal?: any) => void,
  options: WatchOptions = {}
) {
  let getter: Function;
  if (typeof target === 'function') {
    getter = target
  } else {
    getter = () => traverse(target)
  }
  let newVal: any, oldVal: any

  // 将调度器函数封装为 job
  const job = () => {
    newVal = effectFn()
    cb(newVal, oldVal)
    oldVal = newVal
  }

  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: job
  })

  // 如果传入了 immediate 选项，立即调用 job 函数
  if (options.immediate) {
    job()
  } else {
    oldVal = effectFn()
  }
}
```

值得注意的一点是，设置了立即执行并调用`job()`时，旧值应当是`undefined`。

## 目前为止的完整代码

响应式系统核心：

```ts
// 全局存储桶，保存每个对象的依赖关系
type Bucket = WeakMap<object, DepsMap>
// 响应式对象中，每个属性和其对应的副作用函数集合的依赖关系表
type DepsMap = Map<PropertyKey, Deps>
// 每个属性的副作用函数集合
type Deps = Set<EffectFn>
// 副作用函数注册时，允许传入`options`配置项，通过`options.scheduler`指定自定义调度器
type EffectRegisterOptions = {
  scheduler?: (fn: Function) => void
  lazy?: boolean
}
// 更新副作用函数的类型，使用`options`存储注册时的配置项
type EffectFn = Function & {
  deps: Deps[]
  options: EffectRegisterOptions
}

const obj: Record<PropertyKey, any> = {
  firstName: 'John',
  lastName: 'Doe'
}

const bucket: Bucket = new WeakMap()
let activeEffect: EffectFn
const effectStack: EffectFn[] = []

function cleanup(effectFn: EffectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function effect(fn: Function, options: EffectRegisterOptions = {}) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.deps = []
  effectFn.options = options
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
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
  console.log(activeEffect)
  // 错误：activeEffect.deps 是 undefined，activeEffect 是一个函数，并非预期的`EffectFn`类型
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
    effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
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

计算属性：

```ts
function computed(getter: Function) {
  let dirty = true
  let cache: any = undefined

  const effectFn = effect(() => {
    console.log('effectFn invoked')
    return getter()
  }, {
    lazy: true,
    scheduler() {
      dirty = true
      trigger(obj, 'value')
    }
  })
  
  const obj = {
    get value() {
      if (dirty) {
        cache = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return cache
    }
  }

  return obj
}
```

侦听器：

```ts
type WatchOptions = {
  immediate?: boolean
}

function watch(
  target: object | Function,
  cb: (newVal?: any, oldVal?: any) => void,
  options: WatchOptions = {}
) {
  let getter: Function;
  if (typeof target === 'function') {
    getter = target
  } else {
    getter = () => traverse(target)
  }
  let newVal: any, oldVal: any

  const job = () => {
    newVal = effectFn()
    cb(newVal, oldVal)
    oldVal = newVal
  }

  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: job
  })

  if (options.immediate) {
    job()
  } else {
    oldVal = effectFn()
  }
}

function traverse(value: any, seen = new Set<any>) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}
```