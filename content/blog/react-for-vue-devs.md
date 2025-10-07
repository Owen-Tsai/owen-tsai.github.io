---
title: 给 Vue 开发者的 React 指南
date: 2023-01-09
cover: react-for-vue.svg
tags:
  - React
  - Vue
---

## 渲染

我们将 Vue 与 React 中组件的组织方式、条件与循环渲染等放在一起讨论。

在渲染上，两者相似地采用了虚拟 DOM，即使用 JS 对象表示的树形结构。Vue 和 React 都通过调用各自的渲染函数实现对虚拟 DOM 树的创建和修改，从而影响真实 DOM 的结构。

### 组件的实质

在 Vue 中，组件是一个 JavaScript 对象。在 SFC 中，通过`export default`导出的即是当前的组件对象。组件中`data`，`computed`，`props`等都是对象的属性。在编译时，Vue 的编译器将`<template>`标签中的模板转换为渲染函数，在实例化的过程中与虚拟 DOM 协作用于描述 UI 结构。

而在 React 中，组件是一个 JavaScript 函数。React 不依赖于引入的自定义文件格式，而是直接支持使用 JSX 编写组件。JSX 通过 Babel 转译为调用`React.createElement`的渲染函数，操作虚拟 DOM 来实现最终的视图渲染。

### class 与 style 的绑定

在 React 中进行 class 绑定时，需要使用`className`，以此避免与保留字`class`的冲突——这也是[DOM属性](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)中的命名。

在 React 进行 style 绑定时，与 Vue 不同之处在于 Vue 支持绑定字符串或`CSSProperties`对象，而 React 中 style 只能够绑定对象。

```jsx
export default function Comp() {
  return <div style={{ textAlign: 'center' }}>Hello World</div>
}
```

### 条件渲染与列表渲染

Vue SFC 借助于编译器可以实现通过`v-if`、`v-show`和`v-for`的指令来执行条件渲染和列表渲染。在 React 中则必须借助 JavaScript 本身的能力。通常，我们通过`&&`实现简化的 if 逻辑，或使用三目表达式实现 if-else 的逻辑。

```jsx
export default function Awesome({ awesome }) {
  return (
    <article>
      {awesome && <h1>React is awesome!</h1>}
    </article>
  )
}

// OR
export default function Awesome({ awesome }) {
  return (
    <article>
      {awesome ? (
        <h1>React is awesome!</h1>
      ) : (
        <h1>Oops...</h1>
      )}
    </article>
  )
}
```

使用 JavaScript 数组的`map()`方法对列表执行渲染，或使用`Object.entries`遍历对象进行渲染：

```jsx
export default function List({ items }) {
  return (
    <ul>
      {items.map((item, idx) => (
        <li key={idx}>
          <a href={item.link}>{item.label}</a>
        </li>
      ))}
    </ul>
  )
}

export default function KeyValueList({ object }) {
  return (
    <ul>
      {Object.entries(object).map(([key, value]) => (
        <li key={key}>{value}</li>
      ))}
    </ul>
  )
}
```

与 Vue 类似，在 React 中处理循环渲染时，也需要为每一项设置独一无二的`key`值。但在 React 中，如果不显式地指定`key`值，那么数组项的索引会被默认作为`key`。React 和 Vue 中`key`的作用也是类似的，可以在众多兄弟元素中标识出某一项，从而方便对需要重新渲染的条目进行追踪。

## Props 与事件

一个 Vue 或 React 组件都依赖 props 实现父子组件间的通信。一个区别在于 Vue 中可以通过`inheritAttrs`（默认为`true`）使非 props 转变为普通的 HTML 标签属性被“继承”到 HTML 标签上，而 React 则不会继承未知的属性。

特殊地，在 React 中，props 是组件（函数）的唯一参数。换言之，即便是子组件或者事件，也需要通过 props 的方式从父组件传递到子组件内。名为`children`的特殊 prop 将代替 Vue 中默认插槽的概念，而具名插槽的效果可以通过向其他参数传递 React 组件或 JSX 元素实现。

```jsx
export default Alert({ children, title }) {
  return (
    <div className='alert'>
      <div className='title'>{ title }</div>
      {children}
    </div>
  )
}

export default App() {
  const title = <h1>This is named slot</h1>

  return (
    <Alert title={title}>
      <img src='/path/to/alert.svg' />
      <p>Lorem ipsum...</p>
    </Alert>
  )
}
```

在 Vue 中通过`emit`向父级派发的事件，在 React 中则需要通过在 props 中声明回调函数的形式使用。React 中也没有诸如`.stop`的修饰符，需要在事件回调函数内通过 JavaScript 的能力自主实现。

```jsx
export default function Child({ onClick }) {
  return <button onClick={onClick}>Click Me</button>
}

export default function Parent() {
  function handleChildClick() {
    // do something
  }

  return <Child onClick={handleChildClick} />
}
```

## Hooks 与 Composition API

::box{title='推荐资源'}
- [Mixins Considered Harmful](https://legacy.reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)，_React 博客，2016年_
- [Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html#what-is-composition-api)，_Vue.js 3.x 文档_
::

Vue3 引入了 composition API，从 React 的 hooks 中汲取了灵感。

曾经 React 和 Vue 都尝试过使用 mixins 来封装一组具有状态的可复用逻辑，但最后都被 hooks 取代，因为 mixins 存在着各种各样的问题，包括：

- **引入了隐式依赖**。如果一个 mixin 需要读取组件中的某个状态，而这个状态可能会在很久之后被转移到更高层的组件中，此时忘记更新对应的 mixin 的例子比比皆是。在 Vue 中，如果一个方法读取`this.state`，那么`state`可能存在于组件所引入的任何一个 mixin 中，开发和维护的体验极差。
- **滚雪球似的复杂度提升**。一个 mixin 内可能依赖另一个 mixin 的状态，造成 mixin 之间的强耦合关系。

在 React 中，hooks 的编写需要遵照规范，例如使用`use*`作为 hook 的名称前缀、只在组件的顶层调用（而非某一个 if 分支或其他 hooks 中）等。诸如[vueuse](https://vueuse.org/)之类的 Vue composition 函数库也承袭了 React hooks 的风格。

## 数据与状态

Vue 和 React 都将在组件的状态发生更新时重新渲染组件。数据的变更通常由用户的交互产生，随后驱动视图进行变化。

### 响应性

Vue 内置响应性数据系统，通过`ref`或`reactive`等函数创建响应性状态。而在 React 中，响应性状态通过调用一个特殊的 hook 实现。

`useState` hook 接收一个参数，即状态的初始值。返回一个包含两个元素的数组，分别是当前的状态值和设置状态的 setter。

```jsx
export default function Comp() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>{count}!</button>
}
```

在 Vue 中，表单 DOM 元素可以使用`v-model`进行数据绑定，使其看起来是双向的。但实际上，Vue 的数据绑定在底层的实现逻辑也是将 prop 传入表单元素中，通过触发`input`事件更新数据。

```vue
<template>
  <input v-model="username" />
  <!-- 实际上是 -->
  <input :value="username" @input="username = $event.target.value" />
</template>
```

在 React 中没有`v-model`指令对应的实现，需要显示地通过`useState`声明状态，并在事件回调中调用 state 的 setter 实现数据更新。

```jsx
export default function Comp() {
  const [username, setName] = useState('')

  return <input value={username} onChange={(e) => setName(e.target.value)} />
}
```

### Ref

Ref 是一个在 React 和 Vue 中都存在的名词，但概念上有一些区别。

在 Vue 中，ref 用于创建响应式数据对象。在 React 中，当需要组件“记住”某些信息，但又希望这些信息的变化不会触发重新渲染时使用 ref。例如：

- 存储 timeout ID；
- 存储和操作 DOM 元素；
- 存储不需要被用来计算 JSX 的其他对象。

在 React 中，通过`useRef`创建一个不需要渲染的值，返回值是一个包含`.current`属性的对象，这个对象既可以被写入，也可以读取，相比于`useState`而言“略为宽松”。

```jsx
const something = useRef('init value')

something.current = 'hello world'
```

当使用 ref 操作 DOM 元素时，React 和 Vue 的使用方式是类似的。在 React 中，需要先引入 hook `useRef`，将`useRef`的返回值绑定为 DOM 元素的`ref` prop，然后通过该值的`.current`属性访问 DOM 元素。

```jsx
export default function Comp() {
  const inputEl = useRef(null)

  const onClick = () => {
    inputEl.current.focus()
  }

  return (
    <>
      <input ref={inputEl} />
      <button onClick={onClick}>Focus On Input</button>
    </>
  )
}
```

在 React 中 ref 和 state 的一个显著的区别就是 ref 的修改**不会触发组件的重新渲染**。这意味着如果一个状态影响组件的渲染，那么它应当使用`useState`创建而不是`ref`。例如，下面的代码中，点击按钮时次数*不会*更新：

```jsx
export default function Comp() {
  const count = useRef(0)

  const onClick = () => {
    count.current = count.current + 1
  }

  return <button onClick={onClick}>{count.current}</button>
}
```

### 计算属性

Vue 中的计算属性有两个作用：

- 避免在模板中混合逻辑；
- 缓存复杂的运算结果以提升性能。

在 React 中，为了实现第一个作用只需要将渲染结果作为局部变量插入在渲染函数即可。但若要实现第二点即缓存复杂的计算结果，则需要使用一个特殊的 hook `useMemo`。

`useMemo`接收一个回调函数和一个数组作为参数，返回计算的结果。回调函数即类似 vue 中计算属性的参数，而数组则是此计算的依赖项。当依赖项发生变化时，`useMemo`将重新执行回调函数返回新的计算结果。

```jsx
export default function ReversedMessage({ message }) {
  const reversedMessage = useMemo(() => {
    return message.split('').reverse().join('')
  }, [message])

  return <p>{reversedMessage}</p>
}
```

### 监听

Vue 中的监听器是当某个依赖发生变化时将要执行的副作用。在 React 中，监听通过内置 hook `useEffect`实现。

`useEffect`接收一个回调函数和一个包含依赖的数组作为参数。当依赖数组发生变化时，回调函数重新执行。作为监听器使用时，只需要将需要监听的状态作为第二个参数传入即可。

```jsx
export default function Comp({ param }) {
  useEffect(() => {
    console.log('argument param has changed.')
  }, [param])
}
```

更详细的说明，参见下文[副作用与`useEffect`](#副作用与useeffect)。

### 传递状态

Vue 与 React 组件都靠从上至下的 props 传递实现通信。但当一个状态需要从祖先组件透传到后代一个或多个组件时，逐级转递往往过于麻烦。

Vue 通过`provide`和`inject`实现依赖注入。在 React 中，对应的策略是使用 context。

使用 context 时，首先需要创建 context，并从一个文件中导出以便组件使用：

```js
import { createContext } from 'react'

export default SomeContext = createContext('Hello World')
```

`createContext`接收一个参数，即 context 的默认值。返回值是一个 React 的上下文对象。该对象本身不包含信息，只表示其他组件读取或提供的那个上下文。一般来说，在组件上方使用`SomeContext.Provider`指定上下文的值，并在被包裹的下方组件内调用`useContext(SomeContext)`读取它。上下文对象有一些属性：

- `SomeContext.Provider` 让你为被它包裹的组件提供上下文的值。
- `SomeContext.Consumer` 是一个很少会用到的备选方案，它用于读取上下文的值。

当使用`SomeContext`时：

```jsx
import SomeContext from '/path/to/some-context.js'
import { useContext } from 'react'

export default function Comp() {
  return (
    <SomeContext.Provider>
      <ChildComp />
    </SomeContext.Provider>
  )
}

export default function ChildComp() {
  const ctx = useContext(SomeContext)
  return (
    <div>{ctx}</div>
  )
}

// should render <div>Hello World</div>
```

## 副作用与`useEffect`

副作用（Side Effect），指一个函数修改了不属于本身作用域内的数据。在 React 中，渲染函数必须是没有副作用的纯函数，所有的副作用都必须放置在`useEffect` hook 内执行。

React 内，副作用（Effect）可能是：

- 连接到外部系统，例如浏览器 API、第三方库等；
- 控制非 React 组件，例如地图、视频播放器等；
- 发送网络请求获取数据；

```jsx
export default function Comp({ id }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/endpoint', {
      params: { id }
    }).then((res) => {
      setData(res)
    })
  }, [id])

  return <pre>{data}</pre>
}
```

当没有向依赖数组传递任何依赖项时，意味着该 Effect 只会运行一次，即在组件挂载到 DOM 时——这类似于 Vue 中的`onMounted`生命周期 hook。

`useEffect`的第一个参数回调函数内可以返回一个清理函数，该函数在 Effect 重新运行之前调用，并在组件从 DOM 中卸载时进行最后一次调用。一般来说，当使用的第三方库在每一次 Effect 执行时实例化时，需要在清理函数中销毁创建的实例以避免重复创建多个实例导致内存泄露。

::box{theme='warning'}
在开发模式下，React 将重新渲染一次组件，以便发现潜在的 BUG。这是正常的行为，但同时也是一个 gotcha 陷阱。
::

在 Vue 中，副作用可以在多个 hook 中执行，例如`onMounted`, `onBeforeUnmount`等，或者可以通过`watch`和`watchEffect`来观察响应式数据的变化并执行副作用。相比于 React 的`useEffect`，Vue 提供的选择更多，粒度更细。

```ts
const { id } = defineProps({ /* ... */ })

const data = ref()

watch(id, (val) => {
  fetch('/api/endpoint', {
    params: { id }
  }).then((res) => {
    data.value = res
  })
})
```

对比 Vue 和 React 中关于副作用的处理，我们不难发现 Vue 将副作用与它的核心——响应式数据相结合，框架在运行时收集依赖；React 的心智模型则是将副作用与组件渲染周期同步，当组件渲染后，根据声明的依赖是否变化，来决定是否执行副作用代码。

总的来说，在副作用处理上，Vue 的响应式系统提供了更好的开发体验和更低的出错概率。React 的`useEffect`灵活性极高，但 Vue 的 API 也覆盖了几乎所有场景，即便抽象层级稍高也完全可以接受。

## 下一步？

虽然还有很多没有讨论到的东西，但对于熟悉 Vue 的开发者来说了解这些区别和相同点已经足够将一个简单的应用迁移到 React 了。

接下来。让我们对 Vue 和 React 从整体上进行一个对比：

| 概念     | Vue                           | React                                  |
| -------- | ----------------------------- | -------------------------------------- |
| 组件实质 | JavaScript 对象               | JavaScript 函数                        |
| 状态管理 | 响应式数据`ref`、`reactive`等 | 基于 hooks 状态管理，例如`useState`    |
| 数据流   | 支持双向绑定`v-model`         | 单向数据流，需要显式地通过事件更新数据 |
| 生命周期 | 包含挂载、卸载等钩子          | 通过`useEffect`和清理函数实现          |
| 编程范式 | 声明式、响应式                | 函数式编程，关注组合与灵活性           |

总的来说，Vue 中很多思想都是从 React 借鉴的，在通过对常用的模式进一步的包装，提供了陷阱更少、应用更方便的功能。React 相比之下更注重利用 JavaScript 本身的灵活性，通过建立规则和范式，提升在大型应用中的可靠性。
