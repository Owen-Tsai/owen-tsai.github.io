---
title: Vue 的设计思路 / 3 - 调度
date: 2025-07-13
cover: vue-2.svg
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
// 扩展副作用注册函数的类型


const jobQueue = new Set()
const p = Promise.resolve()

let isFlushing = false

const flushJobQueue = () => {
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}
```