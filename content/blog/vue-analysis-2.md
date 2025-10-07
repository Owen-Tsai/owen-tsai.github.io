---
title: Vue 的设计思路 / 2 - 响应性
date: 2024-07-07
cover: vue-2.svg
tags:
  - Vue
  - Reactivity
---

::box
[Previously on the&nbsp;**Vue Analysis**](/blog/vue-analysis-1)
::

---

## 响应性的实现方式

数据的响应特性是指在数据发生变化时，可以自动更新依赖于该数据的其他部分。仅从字面意思上进行判断，我们不难得出想要数据具备响应特性，则需要在写入数据时执行更新它的 dependants 的逻辑。这需要拦截对数据的写入操作。

即便没有专门了解过 Vue 的设计原理，或多或少也都听说过 Vue 响应性的实现方式。在 Vue 2.x 时代，通过`Object.defineProperty`实现；在 Vue 3 时代，通过 Proxy 实现。

不妨首先来回顾一下 JS 语法层面的知识。

### `Object.defineProperty`

`Object.defineProperty()`静态方法会直接在一个对象上定义一个新属性，或修改其现有属性，并返回此对象。其本身没有什么值得特殊说明的，但方法的第三个参数允许传入 getter 和 setter。

在 Vue 中，我们知道当数据发生变化时，渲染器会更新 DOM。数据发生变化时必然会触发数据的 setter，而在读取数据时又会触发 getter。所以，只需要在数据发生变化时，执行对 DOM 的更新就可以初步实现响应性的效果了。

```js
let count = 1

// 更新 DOM 的副作用函数
const effectFn = () => {
  someElement.innerText = count
}

// 假设 obj 具有响应性
const obj = {}

Object.defineProperty(obj, 'key', {
  get() {
    return count
  },
  set(newCount) {
    count = newCount
    // 当 obj.key 被改变时，执行副作用函数
    effectFn()
  },
  enumerable: true,
  configurable: true,
})

// someElement 的文本将更新为 0
obj.key = 0
// someElement 的文本将更新为 100
obj.key = 100
```

### Proxy

在 ES2015+ 中，使用 Proxy 也可以实现相同的效果。Proxy 提供了一种更为明确的方式，允许通过代理对象实现对操作（如设置和读取值）的拦截。

```js
// 更新 DOM 的副作用函数
const effectFn = () => {
  someElement.innerText = obj.key
}

// 假设 obj 具有响应性
const obj = {}

const proxyObj = new Proxy(obj, {
  get: (o, k) => {
    return o[k]
  },
  set: (o, k, v) => {
    o[k] = v
    effectFn()
  },
})

// someElement 的文本将更新为 0
proxyObj.key = 0
// someElement 的文本将更新为 100
proxyObj.key = 100
```

## 副作用的数据结构

在上面的例子中，我们使用`effectFn`来代表与某个具有响应性的数据所关联的副作用。这个副作用在什么时候收集呢？我们通过拦截 setter 执行副作用，自然也可以通过拦截 getter 来收集副作用。

其次，在现实情况中，与一个响应性数据关联的副作用可能有多个。例如，在一个进制换算的应用中，用户输入的十进制数字可能被转换成二进制、八进制、十六进制，此时关联用户输入的响应性数据的副作用有三个。我们需要一个**合理的数据结构**来保存副作用。

最后，我们需要明确**状态与副作用的关联**。在使用 Vue 2 的写法时，我们明确地创建了副作用函数与`obj.key`的关联；而在使用 Proxy 的版本时，当我们修改`proxyObj`的其他属性，甚至是添加一个不存在的属性时，也会导致 setter 的执行，从而触发副作用函数。我们希望**只在`proxyObj.key`变化**的时候才执行副作用函数。

另外，我们还要想到一个应用中可能包含多个响应性对象。如果要收集程序中所有的响应性对象、每个对象的键关联的副作用函数的信息，我们还需要一个最顶层的数据结构。

整个结构应该是树形的，可表示如下：

![Reactivity](/img/vue-2/reactivity.png)

综合以上三点要求，我们可以使用一个 Set 表示一个响应性数据关联的所有副作用，使用一个 Map 结构来维护这种关联；在最顶层，使用一个 Weak Map 作为承载整个应用中响应性关系的“桶”。

使用 TS 的类型可简单表示如下：

```ts
// 副作用函数
type EffectFunction = () => void
// 某个响应性对象的某个属性所关联的所有副作用函数的集合
type Effects = Set<EffectFunction>
// 某个响应性对象中各属性和其对应的副作用函数集合的依赖关系表
type DepsMap = Map<string, Effects>
// 存储响应性对象的桶
type Bucket = WeakMap<Object, DepsMap>
```

::box{title='WeakMap'}
与 Map 不同，WeakMap 仅支持使用对象作为键。同时，WeakMap 对键是弱引用，当没有其他引用时，键值对会被回收无法访问。

```ts
const map = new Map();
const weakmap = new WeakMap();

(function () {
  const foo = { k: 1 }
  const bar = { k: 2 }

  map.set(foo, 'foo')
  weakmap.set(bar, 'bar')
})();

console.log(map) // { k: 1 } => 'foo'
console.log(weakmap) // 无属性 {}
```

因此，WeakMap 常用于储存那些当键存在时才有价值的信息。
::

## 响应性的初步实现

下面，提供一个全局变量`activeEffect`，表示当前的副作用函数；同时提供一个用于注册副作用函数的函数`effect`，该函数接受副作用函数本身（例如传入一个匿名函数）作为参数。则我们可以编写如下代码：

```ts
const bucket: Bucket = new WeakMap()
let activeEffect: Function

function effect(fn: Function) {
  activeEffect = fn
  fn()
}

const proxyObj = new Proxy(obj, {
  get(target, key) {
    if (!activeEffect) return target[key]

    const depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }

    const effects = depsMap.get(key)
    if (!effects) {
      depsMap.set(key, (effects = new Set()))
    }

    effects.add(activeEffect)

    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    const depsMap = bucket.get(target)
    if (!depsMap) return

    const effects = depsMap.get(key)
    effects && effects.forEach((fn) => fn())
  },
})
```

对上面的简易实现进行重构，可以将收集副作用的部分封装成一个函数`track`，将执行副作用的部分封装成另一个函数`trigger`。则优化后的代码如下：

```ts
let activeEffect: Function

function effect(fn: Function) {
  activeEffect = fn
  fn()
}

function track(target, key) {
  if (!activeEffect) return target[key]

  const depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  const effects = depsMap.get(key)
  if (!effects) {
    depsMap.set(key, (effects = new Set()))
  }

  effects.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)
  effects && effects.forEach((fn) => fn())
}

const bucket: Bucket = new WeakMap()

const proxyObj = new Proxy(obj, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
  },
})
```

在使用时：

```ts
const data = {
  /* ... */
}
const proxyObj = new Proxy(data, {
  /* getter, setter */
})

// 注册副作用函数
effect(() => {
  someElement.innerText = proxyObj.someKey
})
// 触发数据的修改
proxyObj.someKey = 'new value'
```

::box
以上设计思路在 Vue 源代码中的详细实现：[`track`和`trigger`方法](https://github.com/vuejs/core/blob/main/packages/reactivity/src/dep.ts)。
::

## 更完善的响应性系统

### 分支切换

在上文中，我们解决了当试图为对象添加一个不存在的属性时依然会导致副作用函数执行的问题。现在，让我们在这个方向上多迈出一步。是不是还有一些情况会导致原本不需要执行的副作用函数被执行呢？

答案是肯定的。

考虑含有三元运算的情况：

```js
const activeEffect = () => {
  console.log('effect run')
  someElement.innerText = data.disabled ? 'Not Available' : data.label
}

const data = {
  disabled: false,
  label: 'Submit',
}
const proxyObj = new Proxy(data, {
  /* ... */
})
```

首先，`proxyObj.disabled`的值为`false`，此时会触发`proxyObj.disabled`和`proxyObj.label`这两个属性的读取操作，然后在 bucket 中建立如下关联：

![Reactivity](/img/vue-2/reactivity-2.png)

当`proxyObj.disabled`被设置为`true`时，无论`proxyObj.label`的值被怎样修改，都不会影响 someElement 元素内的文本。换句话说，当 someElement 的文本不需要更新时，副作用函数也没必要执行。

但当我们设置`proxyObj.label`时，会发现副作用函数依然执行了，“effect run”的消息被输出了三次。

```js
// someElement 的文本将更新为 'hello'
proxyObj.label = 'hello' // "effect run" 第一次输出
proxyObj.disabled = true // "effect run" 第二次输出
// someElement 的文本将更新为 "Not Available"
proxyObj.label = 'some text' // "effect run" 第三次输出
```

如何避免并不必要的更新呢？

在这个例子中，如果`disabled`属性切换为`false`，则应当断开`label`属性与副作用函数的关联；当`disabled`属性切换为`true`，则应当重新建立这种关联。

所以，一个可行方案是在副作用函数执行前**为每个副作用函数维护一个列表（数组）**，来记录与这个副作用关联的所有的依赖集合。在副作用函数执行前，先清空这个依赖列表；在`track`中再创建新的依赖关系。当`disabled`切换为`false`时，由于不触发`label`属性的读取，因此新创建的依赖集合中将只包括`disabled`的关联。

```ts
// 为每个副作用增加 deps 数组，用于记录自己存在于哪个依赖集合中
interface EffectFunction extends Function {
  deps: Array<Set<EffectFunction>>
}

let activeEffect: EffectFunction

function effect(fn: Function) {
  const effectFn: EffectFunction = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
  }

  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn: EffectFunction) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }

  effectFn.deps.length = 0
}

function track(target: Record<string, any>, key: string) {
  if (!activeEffect) return target[key]

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

function trigger(target: Record<string, any>, key: string) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)
  effects && effects.forEach((fn) => fn())
}
```

`cleanup`函数将遍历副作用函数的`deps`数组，把副作用函数从所有包含它的集合中移除，然后重置`deps`数组。在改造后的`track`函数中，为`deps`数组进行赋值。

### 解决无限循环

用下面的例子对代码进行测试。假设副作用函数是修改 someElement 内的文本为响应性对象`proxyObj`的`label`属性。4 秒后，模拟响应性数据的修改，写入`proxyObj.label = 'hello'`。

```ts
effect(() => {
  someElement.innerText = proxyObj.label
})

setTimeout(() => {
  proxyObj.label = 'hello'
}, 4000)
```

期望情况下，someElement 的文本应当首先是`proxyObj.label`的默认值，并且在 4 秒后变为 hello。

不过如果实际运行一下，得到的结果却是浏览器失去响应，意味着代码中包含可能引发无限循环的部分。

问题出在`trigger`中。定位到`const effects = depsMap.get(key)`。在副作用函数执行前，`effects`是一个包含当前副作用函数的集合。当`cleanup`执行时，我们从这个集合内剔除了当前副作用函数；但当副作用函数执行后，会触发`track`里跟踪依赖的逻辑，从而导致副作用函数又被增加到了集合中。

程序运行的步骤如下：

1. 初始化阶段
   - `effect()`首次执行，注册副作用函数。创建`effectFn`并赋予`deps`为初始空值`[]`。
   - 执行`cleanup()`。此时还没有建立依赖表，因此这一步不会有实际效果。
   - 执行副作用函数`fn()`，触发`proxyObj.label`的 getter。
   - getter 被触发后，`track`收集依赖，将`effectFn`（实际是 activeEffect，两者相同）存入`bucket`内对应的集合`effects`中。同时，修改`effectFn.deps`。**此时`effectFn.deps`包含当前的集合`effects`**。
2. 4 秒后数据更新
   - `proxyObj.label = 'hello'`触发 setter，调用`trigger`方法。
   - `trigger()`执行，从`bucket`中取出`proxyObj.label`对应的副作用集合`effects`。**此时`effects`包含`effectFn`**。
   - 依次执行（实际上此例的集合中只有`effectFn`一个副作用函数）副作用函数。
3. 副作用函数执行时
   - 执行`effectFn`，调用`cleanup()`，清空`effectFn.deps`并移除所有依赖关系。**此时`effects`集合内删除了`effectFn`**。
   - 执行副作用函数`fn()`，再次触发`proxyObj.label`的 getter。
   - `track()`执行，手机依赖并**再次将`effectFn`加入`effects`集合中**。
   - 此时原 effects 被修改（**`effectFn`先被删除后又被添加**）。

解决这个问题的方法也很简单，创建一个`effects`集合的副本，并遍历这个不会被修改的副本即可。

```js
// trigger 函数中
const effectsToRun = new Set(effects)
effectsToRun && effectsToRun.forEach((fn) => fn())
```

::box{title='Set'}
每次删除并重新添加元素时，集合的内存结构被修改，但迭代器仍会尝试遍历「原始的容量分布」，导致无限循环。

创建的原集合的副本`effectsToRun`是对`effects`的**深拷贝**，有独立的内存空间（尽管元素是浅拷贝）。遍历副本时，迭代器基于副本独立的内存结构运行，即使原集合`effects`被修改，副本的迭代器仍按照初始状态完成遍历。
::

### 嵌套的副作用

现在的实现方案使用一个简单的变量`activeEffect`来存储当前的副作用函数。这样是有一定缺陷的。

考虑如下场景：

```js
const data = { key1: 'value', key2: 'value' }
const proxyObj = new Proxy(data, {
  /* ... */
})

effect(() => {
  console.log('effect 1')

  effect(() => {
    console.log('effect 2')
    someElement2.innerText = proxyObj.key2
  })

  someElement1.innerText = proxyObj.key1
})

// 模拟数据的修改
proxyObj.key1 = 'new value'
```

这是副作用嵌套的情形。什么时候会出现嵌套的副作用呢？显然，父子组件嵌套的时候就会出现副作用的嵌套。在这个例子里，我们将内部的副作用称为`effectFn2`，外部的称为`effectFn1`。在内部的副作用中读取`proxyObj.key2`，在外部的副作用中读取`proxyObj.key1`。最后，修改`proxyObj.key1`的值。

分析程序的执行步骤如下：

1. 当外部副作用执行时，`effectFn1`被创建，此时`activeEffect`的值是`effectFn1`。
2. 当内部副作用执行时，`effectFn2`被创建，此时`activeEffect`的值被覆盖，变为`effectFn2`。此时触发`proxyObj.key1`的读取，执行`track()`
3. 内部副作用执行完毕，回到`effectFn1`中。此时触发`proxyObj.key1`的读取，执行`track()`。但是`activeEffect`的值依然是`effectFn2`，此时导致了**依赖收集的错误**，因为`key1`的依赖集合中本来应当存储`effectFn1`。
4. 修改`proxyObj.key1`，导致错误关联的`effectFn2`执行。

解决这个问题，其实就是解决上面第 2 点中出现的`activeEffect`被覆盖的问题。显然单一结构的变量无法支撑嵌套的使用环境，我们需要使用数组来代表一个栈，按顺序存储嵌套的副作用中每一嵌套层级的“activeEffect”。

```ts
let activeEffect: Function
const effectStack: Function[] = []

functon effect(fn: Function) {
  const effectFn: EffectFunction = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn) // 入栈
    fn()
    effectStack.pop() // 出栈
    activeEffect = effectStack[effectStack.length - 1] // 还原
  }

  effectFn.deps = []
  effectFn()
}
```

### 解决无限循环（再次）

在上面，我们解决了因为重复添加和删除依赖导致的无限循环。现在，我们需要研究另一种情况。

考虑下面的副作用函数：

```js
const data = { count: 1 }
const proxyObj = new Proxy(data, {
  /* ... */
})

effect(() => {
  proxyObj.count++
})
```

`proxyObj.count++`等价于`proxyObj.count = proxyObj.count + 1`，既会读取`proxyObj.count`的值，又会设置`proxyObj.count`的值。当执行副作用时首先触发 getter，收集该函数到 bucket 中；然后触发 setter，将该函数从 bucket 中取出并执行。副作用函数还没有执行完成就要开始下一次执行，从而陷入了无限递归调用自己的循环中，最终产生堆栈溢出。

需要解决这个问题，就要厘清`trigger()`执行的条件。如果在执行副作用前增加一个守卫条件，当发现要执行的副作用与当前正在执行的副作用相同就跳过，问题就可以得到解决了。

```js
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)
  const effectsToRun = new Set()

  effects &&
    effects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })

  effectsToRun.forEach((effectFn) => effectFn())
}
```

## 完整代码

完整的代码如下：

```ts
/* 类型声明 */
interface EffectFunction extends Function {
  deps: Array<Set<EffectFunction>>
}

type Effects = Set<EffectFunction>
type DepsMap = Map<string, Effects>
type Bucket = WeakMap<Object, DepsMap>

/* 模拟元素 */
let someElement: HTMLElement
/* 模拟数据 */
const data: Record<string, unknown> = {
  key: 'value',
}

/* 初始化 */
const bucket: Bucket = new WeakMap()
let activeEffect: EffectFunction
const effectStack: EffectFunction[] = []

function cleanup(effectFn: EffectFunction) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }

  effectFn.deps.length = 0
}

function effect(fn: Function) {
  const effectFn: EffectFunction = () => {
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

function track(target: Record<string, unknown>, key: string): void {
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

  effectsToRun.forEach((effectFn) => effectFn())
}

const proxyObj = new Proxy(data, {
  get(target, key: string) {
    track(target, key)
    return target[key]
  },
  set(target, key: string, newValue) {
    trigger(target, key)
    target[key] = newValue
    return true
  },
})

/* 注册副作用函数 */
effect(() => {
  someElement.innerText = proxyObj.key as string
})

/* 模拟数据变化 */
setTimeout(() => {
  proxyObj.key = 'hello'
}, 4000)
```

到目前为止程序已经实现了响应性系统的基本功能。我们已经知道了当响应性数据`data`发生变化后，如何触发视图的更新。接下来我们还需要讨论其他的场景，例如`computed`、`watch`等的实现原理，最终建立一个（更更）完善的响应系统。
