---
title: Vue 的设计思路 / 3 - 调度
date: 2025-07-13
cover: vue-3.png
tags:
  - Vue
  - Reactivity
---

::box
[Previously on the&nbsp;**Vue Analysis**](/blog/vue-analysis-2)
::

## 调度机制

在使用 jQuery 和 ajax 拼接 DOM 串时，我们被告知需要减少 DOM 操作的次数，减少频繁的 DOM 操作对性能造成影响。Vue 实现了一种以异步的方式更新 DOM 的批处理机制，当我们在一个事件循环内多次修改响应式数据时，最终只会以最新的数据状态进行一次 DOM 更新。

这个过程是这样的：

- Vue 的响应式系统发现数据变更。
- Vue 不立即执行副作用，而是将副作用放入一个队列中等候“批处理”。
- 本轮事件循环中的同步代码执行完毕后，清空队列，执行副作用。
- DOM 更新完成后，调用`nextTick`中注册的回调函数。

假设我们有如下代码：

```js
const data = { count: 1 }
const obj = new Proxy(data, {
  /** ... */
})

effect(() => {
  console.log(obj.count)
})

obj.count++
obj.count++
```

按照已经实现过的、[没有调度机制的响应式系统](/blog/vue-analysis-2)，以上代码会输出：

```txt
1
2
3
```

在实际的场景中，我们往往不关心中间状态，只关心最终的数值`3`。如何使本例中的输出不包含中间状态呢？

### 事件循环

JavaScript 是一门单线程语言，这意味着只有一个主线程执行代码。如果遇到一个耗时的操作（例如异步请求、加载大文件等），线程就会被阻塞，后续的所有任务都必须等待，导致页面卡顿乃至无法响应。

为了解决这个问题，JavaScript 使用了[异步模型](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS)，事件循环（Event Loop）就是实现异步的核心机制。它允许 JavaScript 在执行异步操作时不会阻塞主线程，通过将异步操作“托管”给其他线程（或系统内核），然后在未来的某个时间点再回来处理这些操作的结果。

简单来说，事件循环就是一个持续不断的循环过程，负责监听调用栈（Call Stack）和任务队列（Task Queue）。当调用栈为空时，就会从任务队列中取出任务并执行。其中，任务队列中的任务又可以细分为宏任务（Macro Task）和微任务（Micro Task）。

- 宏任务：由浏览器或 Node.js 环境发起的任务，如 UI 渲染、文件 I/O、`setTimeout`和`setInterval`回调等。
- 微任务：由 JavaScript 引擎发起的任务，优先级更高，如 Promise 的回调、MutationObserver 回调、process.nextTick（Node.js）等。

一个完整的事件循环 tick 过程工作顺序如下：

1. 执行一个宏任务。从宏任务队列中取出最老的一个宏任务，将其压入调用栈执行。如果宏任务队列为空，则直接进行步骤 2。
2. 执行所有微任务。执行一个宏任务后，**不**立即执行下一个宏任务，而是依次从微任务队列中取出并执行**所有微任务**。如果在微任务的执行期间又产生了新的微任务（如`.then`中创建了新的 Promise），则将其加入微任务队列的末尾，**也在本次循环中被执行**。
3. 进行 UI 渲染。如果在浏览器环境中且需要进行 repaint 或 reflow，会在这个时机进行。
4. 最后，准备开启下一个 tick 的循环。

用一段经典代码演示这个过程，就是：

```js
console.log('start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

Promise.resolve().then(() => {
  console.log('Promise')
})

console.log('end')

/**
 * 输出：
 * start
 * end
 * Promise
 * setTimeout
 */
```

回到刚才的问题中，不难得出结论：想要实现批处理机制，可以利用微任务队列的特性，将副作用的执行放到微任务队列中。

### 实现调度器

利用事件循环机制实现一个调度器的核心思路是：

- 维护一个任务队列，并且对加入队列的副作用任务进行去重；
- 通过创建 Promise 实例来创建微任务队列，在微任务队列中执行副作用任务；
- 设置一个标志位，如果微任务队列正在执行，则不重复执行。

```ts
// 注册副作用函数时，允许传入第二个参数`options`指定调度规则
type EffectOptions = {
  scheduler?: Function
}
type EffectFunction = Function & {
  deps: Array<Set<EffectFunction>>
  options: EffectOptions
}

// 注册副作用函数的方法`effect`
function effect(fn: Function, options: EffectOptions = {}) {
  const effectFn: EffectFunction = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  // 将`options`属性挂载到`effectFn`上，
  // 当副作用被 trigger 时，可直接执行 options.scheduler 函数
  effectFn.options = options
  effectFn.deps = []
  effectFn()
}

function trigger(target: Record<string, unknown>, key: string): void {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)
  const effectsToRun = new Set<EffectFunction>()

  effects &&
    effects.forEach((effectFn) => {
      if (activeEffect !== effectFn) {
        effectsToRun.add(effectFn)
      }
    })

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      // 如果副作用函数有调度器，则调用调度器并将副作用函数作为参数传递
      // 由用户控制副作用函数`effectFn`的执行
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
```

修改后的`trigger`函数会在需要执行副作用函数时检查该副作用函数是否有调度器。如有，则调用调度器而非直接执行副作用函数。在这个基础上，可以通过创建副作用队列并利用事件循环中的微任务队列来实现前文提到的对副作用的批处理机制。

```ts
// 创建一个任务队列用于储存副作用，利用集合的特性避免重复
const jobQueue = new Set<EffectFunction>()
// 创建一个 Promise 实例，用于创建微任务队列
const p = Promise.resolve()
// 任务队列是否正在刷新
let isFlushing = false

const flushJobQueue = () => {
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    // 执行微任务队列中的副作用
    jobQueue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}

effect(() => {
  console.log('effect run')
}, {
  scheduler: (effectFn: EffectFunction) => {
    // 副作用每次触发时，执行调度器，将副作用函数加入任务队列
    jobQueue.add(effectFn)
    // 刷新任务队列，
    flushJobQueue()
  }
})
```

在上面的代码中，通过传入`effect`方法的第二个参数制定了调度器。调度函数将副作用加入任务队列`jobQueue`，然后执行`flushJobQueue`函数。

在`flushJobQueue`函数中，会检查`isFlushing`标志位。当`flushJobQueue`开始执行时，`isFlushing`就会被设置为`true`，这样无论`flushJobQueue`被调用多少次，在一个周期内都只会执行一次，直到副作用队列中副作用执行完毕，触发`finally`后重置`isFlusing`。

## 实现计算属性

计算属性（`computed`）的特性是：假设其计算所依赖的数据**没有**发生变化，那么多次访问计算属性时，也不会触发重新计算。也就是说，实现`computed()`需要保证：

- 当计算属性被读取时才会触发计算；
- 当计算属性依赖的数据发生变化时，才会触发重新计算；
- 返回一个对象，其中`.value`是传入的 getter 的计算结果。

首先，定义`computed`函数。它需要返回一个对象，因此定义含有`.value`属性的`obj`对象。

```ts
function computed(getter: Function) {
  // 定义返回的对象
  const obj = {
    get value() {
      return getter()
    }
  }

  return obj
}

const data = { firstName: 'John', lastName: 'Doe' }
const person = new Proxy(data, /*... */)

const name = computed(() => {
  return person.firstName + ' ' + person.lastName
})
```

现在的代码中，注册副作用的方法`effect`会执行一次`effectFn()`（即传入的 getter）。这是与 Vue 的行为不符的，违反了计算属性的第 1 条特性。为了能够不立即执行 getter，需要对`effect`进行修改，当接收到的第二个参数所指定的调度机制为懒执行`{ lazy: true }`时，不立即执行`effectFn()`。

```ts
// 注册副作用函数时，允许传入第二个参数`options`指定调度规则
type EffectOptions = {
  scheduler?: Function
  lazy?: boolean
}
type EffectFunction = Function & {
  deps: Array<Set<EffectFunction>>
  options: EffectOptions
}

// 注册副作用函数的方法`effect`
function effect(fn: Function, options: EffectOptions = {}): EffectFunction {
  const effectFn: EffectFunction = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn() // 将计算结果储存
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }

  // 将`options`属性挂载到`effectFn`上，
  // 当副作用被 trigger 时，可直接执行 options.scheduler 函数
  effectFn.options = options
  effectFn.deps = []
  // 如果是懒执行，则不立即执行`effectFn`
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function computed(getter: Function) {
  // 将 getter 作为副作用注册
  const effectFn = effect(getter, {
    lazy: true
  })
  // 定义返回的对象
  const obj = {
    get value() {
      // 当访问`.value`时，触发计算
      return effectFn()
    }
  }

  return obj
}

const data = { firstName: 'John', lastName: 'Doe' }
const person = new Proxy(data, /*... */)

const name = computed(() => {
  return person.firstName + ' ' + person.lastName
})
```

现在的代码已经实现了计算属性的第 1 特性：当访问`.value`时才触发计算。但假设多次访问`name.value`，会触发多次计算。这是与 Vue 的实际行为不符的。为了避免这种情况，需要在`computed`中添加缓存机制。缓存机制的思路是将计算结果储存起来，并且仅在需要的时候重新计算。为此，设置`dirty`标志位，如果为`true`意味着数据变「脏」，需要重新计算。

那么如何判断什么时候需要改变`dirty`标志位？

首先，`dirty`的初值应当为`true`，以便进行初次计算。当计算完成时，将计算结果赋值给缓存变量后，就应当将`dirty`设为`false`，表示数据不再「脏」。问题的重点在于，何时将`dirty`再次设为`true`。

观察现有代码，不难发现：当响应式数据发生变化，即需要触发重新计算时，会触发`trigger`方法。在`trigger`方法中代码判断副作用是否有调度函数`options.scheduler`，如果有，就调用它。显然，我们可以利用这一点，将`dirty = true`写在调度函数中。

修改后的代码如下：

```ts
function computed(getter: Function) {
  // 添加缓存变量，保存上一次计算的值
  let cacheValue: any
  // 标志位，如果为 true 意味着数据脏，需要重新计算
  let dirty = true

  // 将 getter 作为副作用注册
  const effectFn = effect(getter, {
    lazy: true,
    // 当响应式数据发生变化时，将`dirty`设为`true`
    // 下次访问时重新计算
    scheduler: () => {
      dirty = true
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        // 如果数据脏，需要重新计算
        cacheValue = effectFn()
        dirty = false
      }
      return cacheValue
    }
  }

  return obj
}
```

再次回顾一下代码，在`computed`的实现中，我们创建了一个类型为`EffectFunction`的副作用函数`effectFn`。当读取`person.firstName`或`person.lastName`时，会触发`track`的执行，为响应式数据`person`收集依赖的副作用。此时收集到的副作用是`computed`内部的`effectFn`。

而假设我们有另一个副作用，我们在这个副作用中读取`name.value`：

```ts
const person = new Proxy(data, /*... */)

const name = computed(() => {
  return person.firstName + ' ' + person.lastName
})

// 设为 effect2
effect(() => {
  console.log(name.value)
})

person.firstName = 'Jane'
```

此时，effect2 并没有自动执行并输出`Jane Doe`。原因在于计算属性的 getter 所访问的响应式数据在收集依赖时，只能收集到`computed`内部的`effectFn`，而不会收集到外部的`effect2`。解决的方案是当读取计算属性`name.value`时，手动调用`track`进行追踪；当计算属性依赖的数据发生变化时，手动调用`trigger`触发响应。

完整的代码实现如下：

```ts
type EffectOptions = {
  scheduler?: Function
  lazy?: boolean
}
type EffectFunction = Function & {
  deps: Array<Set<EffectFunction>>
  options: EffectOptions
}
type Effects = Set<EffectFunction>
type DepsMap = Map<string, Effects>
type Bucket = WeakMap<Object, DepsMap>

const bucket: Bucket = new WeakMap()
let activeEffect: EffectFunction
const effectStack: EffectFunction[] = []
const el = document.querySelector('#some-element') as HTMLElement

function cleanup(effectFn: EffectFunction) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }

  effectFn.deps.length = 0
}

function track(target: Record<string, unknown>, key: string): void {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  let effects = depsMap.get(key)
  if (!effects) {
    depsMap.set(key, (effects = new Set()))
  }

  effects.add(activeEffect)
  activeEffect.deps.push(effects)
}

function trigger(target: Record<string, unknown>, key: string): void {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)
  const effectsToRun = new Set<EffectFunction>()

  effects &&
    effects.forEach((effectFn) => {
      if (activeEffect !== effectFn) {
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

function effect(fn: Function, options: EffectOptions = {}): EffectFunction {
  const effectFn: EffectFunction = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn() // 将计算结果储存
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }

  // 将`options`属性挂载到`effectFn`上，
  // 当副作用被 trigger 时，可直接执行 options.scheduler 函数
  effectFn.options = options
  effectFn.deps = []
  // 如果是懒执行，则不立即执行`effectFn`
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function computed(getter: Function) {
  // 添加缓存变量，保存上一次计算的值
  let cacheValue: any
  // 标志位，如果为 true 意味着数据脏，需要重新计算
  let dirty = true

  // 将 getter 作为副作用注册
  const effectFn = effect(getter, {
    lazy: true,
    // 当响应式数据发生变化时，将`dirty`设为`true`
    // 下次访问时重新计算
    scheduler: () => {
      if (!dirty) {
        dirty = true
        // 手动触发响应，执行副作用
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        // 如果数据脏，需要重新计算
        cacheValue = effectFn()
        dirty = false
      }
      // 手动触发追踪依赖
      track(obj, 'value')
      return cacheValue
    }
  }

  return obj
}

//====================
const data: Record<string, any> = { firstName: 'John', lastName: 'Doe' }
const person = new Proxy(data, {
  get(target, key: string) {
    track(target, key)
    return target[key]
  },
  set(target, key: string, value) {
    target[key] = value
    trigger(target, key)
    return true
  }
})

const fullName = computed(() => {
  return person.firstName + ' ' + person.lastName
})

console.log(fullName.value)
console.log(fullName.value)

effect(() => {
  el.innerText = fullName.value
})

setTimeout(() => {
  person.firstName = 'Jane'
  console.log(fullName.value)
}, 4000)
```

## 实现侦听器

在上面的代码中，当响应式数据发生变化并触发`trigger`时，程序会依次检查副作用函数，对于有调度函数的副作用会执行其调度函数。这就为`watch`提供了基础的实现方式。

### 实现侦听器

实现一个简单的侦听器`watch`，需要接受两个参数，分别是侦听对象`source`和回调`cb`。此时暂时仅考虑`source`为对象的情况。当`source`中的属性发生变化时，需要调用`cb`函数。

需要注意的是，`source`必须是一个响应式对象（显然），否则无法触发其 getter 和`track`函数，也就无法侦听其变化。这也与 Vue 中的行为一致。

```ts
function watch(source: Record<string, any>, cb: Function) {
  effect(
    () => traverse(source),
    {
      scheduler: () => {
        cb()
      }
    }
  )
}

function traverse(value: Record<string, any>, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}
```

上面的代码包含`watch`的实现和一个`traverse`函数，用于遍历`source`对象的所有属性。虽然`traverse`看起来并没有实际用处，返回的还是`value`对象本身，但只有通过`traverse`来访问响应式数据的每一个属性，才能触发它们的 getter，从而由`track`函数完成依赖的收集。

在使用时：

```ts
watch(person, () => {
  console.log('fullName changed')
})
```

实际上，Vue 中的`watch`的第一个参数还允许传入 getter，例如`() => person.firstName`。对此进行简单判断即可：

```ts
function watch(source: Record<string, any> | Function, cb: Function) {
  let getter: Function
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  effect(
    () => getter(),
    {
      scheduler: () => {
        cb()
      }
    }
  )
}
```

### 获取当前值和旧值

Vue 中`watch`的回调中可以获取到响应式数据的旧值和新值，这在部分场景下十分有用。那么如何在实现`watch`的时候对外暴露这两个值呢？

可以发现，`effect`会返回`effectFn`，而`effectFn`最后返回的是副作用`fn()`的计算结果。我们可以像计算属性那样，在`watch`中创建一个懒执行的`effectFn`，手动调用`effectFn`来获取旧值，在调度器中调用来获取新值。

```ts
function watch(source: Record<string, any> | Function, cb: Function) {
  let getter: Function
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  // 定义旧值和新值
  let oldValue: any, newValue: any
  const effectFn = effect(
    () => getter(),
    {
      // 不立即执行
      lazy: true,
      scheduler: () => {
        newValue = effectFn()
        cb(oldValue, newValue)
        // 更新旧值
        oldValue = newValue
      }
    }
  )

  // 手动触发一次副作用，初始化旧值
  oldValue = effectFn()
}
```

### 立即执行`immediate`的实现

不难发现，`watch`其实就是对`effect`的封装，且实现过程中依赖调度机制，控制了副作用的执行时机。那么更进一步地，Vue 中的侦听器还允许传入第三个参数，指定回调函数的执行时机。例如`immediate`控制是否在侦听器刚创建时就执行回调函数，`flush`指定回调函数的执行时机为`pre`（默认行为）、`sync`（同步执行）、`post`（DOM 更新后执行）。

当前版本的`watch`实际上相当于启用了`{ flush: 'sync' }`，回调函数在响应式数据发生变化时立即执行。由于`pre`涉及父组件的更新，此处暂时不讨论。而想要实现`{ flush: 'post' }`的效果，只需要参考前文中所讲述的任务队列机制，将回调函数加入任务队列即可。

对于`immediate`，只需要在`watch`中判断是否传入`true`，如果是，则手动触发一次副作用即可。

修改后的代码如下：

```ts
type WatchOptions = {
  immediate?: boolean
  flush?: 'sync' | 'post'
}

function watch(
  source: Record<string, any> | Function,
  cb: Function,
  options: WatchOptions = {}
) {
  let getter: Function
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue: any, newValue: any
  // 即前面的调度器函数
  const job = () => {
    newValue = effectFn()
    cb(oldValue, newValue)
    // 更新旧值
    oldValue = newValue
  }

  const effectFn = effect(
    () => getter(),
    {
      // 不立即执行
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          // 'sync'
          job()
        }
      }
    }
  )

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}
```