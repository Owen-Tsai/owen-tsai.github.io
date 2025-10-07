---
title: Vue 的设计思路 / 1
date: 2024-02-12
cover: vue-1.svg
tags:
  - Vue
  - Virtual DOM
---

从整体上来看，框架的演变始终在向着更加**声明式**的方向发展。在 jQuery 的时代，人们通过命令式的语句实现视图层的逻辑，而在 vue 的时代，人们将关注点从底层逻辑如何实现逐步转移到顶层设计上，以声明式的方式实现同样的业务需求。在现在和未来，人们将可能采用更加声明式的方式：以图形化界面和自然语言搭建业务系统。

然而在日常开发中享受声明式框架的便利性时，我们会难以避免地忽略框架内部的设计与实现。诸如 Vue 之类的框架封装了过程，帮助用户隐藏了细节，但其实不难想象，在其内部一定包含大量设计上的巧妙思考。

## 描述 UI

一个视图层框架的主要任务之一就是用一种方式对 UI 进行描述。Vue 采用的方案是使用单文件组件（SFC）或者一个 JavaScript 对象。

在 Vue SFC 中，我们使用与 HTML 中类似的方式描述元素和属性。同时，Vue 为我们扩展了语法，可以使用`v-bind`和`v-on`来分别描述动态绑定的属性与事件。同时，元素之间的父子关系和层级结构也通过与 HTML 相同的树形方式表示。

```html
<template>
  <div @click="handleClick">
    <h1 :class="cls">{{ title }}</h1>
  </div>
</template>
```

我们也可以直接使用 JavaScript 对象描述 UI。事实上，使用`<template>`描述的 UI 会在编译阶段被编译器处理成 JavaScript 对象（参见下文）。

在使用 JavaScript 对象描述 UI 时则更加灵活，因为在使用 JS 对象描述 UI 时可以使用 JS 的编程能力。例如假设我们需要表示一个标题，根据级别的不同渲染 h1~h6 这几个不同的标签，在使用 SFC 时我们不得不穷举，使用`v-if`和`v-else-if`列举所有情况。而当我们使用 JS 对象描述时，就非常简单了：

```ts
const title = (level: number) => ({
  tag: `h${level}`,
})

title(3) // // => h3 标签
```

通过使用 JS 数据结构来表示 UI 的方式就是虚拟 DOM。

在 Vue 的虚拟 DOM 中包含了很多属性，与 DOM 树中节点的属性类似。我们可以通过`h`函数构建一个包含`class`属性的虚拟 DOM 的节点（或称为 VNode）：

```ts
import { h } from 'vue'

const node = h('div', { class: 'test-block' }, 'hello world')

// 产生的 VNode（已简化）：
{
  "__v_isVNode": true, // 标识一个 VNode
  "__v_skip": true,
  "type": "div", // 节点类型
  "props": {
    "class": "test-block",
  },
  "children": "hello world", // 子节点，可能是字符串（文本节点）、VNode 数组等
  "el": {}, // 关联的真实 DOM 元素，即 div.test-block。挂载后才会赋值
  "shapeFlag": 9, // 节点类型标记
  "patchFlag": 0, // 优化标记
}
```

实际上，我们完全可以设计自己的 VNode 结构，只需要确保在渲染器中，我们能够将这个结构正确地转换为用户可以与之交互的真实 DOM 就可以了。

::box{title='结论'}
1. 虚拟 DOM 实际上是一个 JS 对象（称为 VNode）；
2. 构成虚拟 DOM 的 VNode 中包含用于描述和构造真实 DOM 的属性；
3. `h`函数的返回值就是一个 JS 对象，即 VNode；
::

## 渲染器

一个 JS 对象，最终必须要经过某种处理变成用户可以交互的真正的 UI。这个处理过程可以被称为渲染，而将虚拟 DOM 转换为真实 DOM 的模块就是渲染器。

首先我们需要明确，将一个 JS 变成 DOM 元素，是需要使用 DOM 操作进行元素的创建的。VNode 是一个树形结构，只需要对`vnode.children`递归地调用渲染方法就可以完成整个 DOM 树的渲染。

设 VNode 的模式与结构如下：

```js
const vnode = {
  tag: 'div',
  props: {
    style: 'padding: 100px; background-color: red;',
  },
  children: [
    {
      tag: 'button',
      props: {
        onClick: () => {
          alert('clicked')
        },
      },
      children: 'Click me',
    },
  ],
}
```

当创建 DOM 元素时，我们需要做这样几件事：

- 在父容器内创建对应的元素；
- 将 VNode `props`中的属性赋给创建的对应元素；
- 如果有`on`开头的属性，我们认为这是一个事件，因此需要绑定时间监听器到创建的元素上；
- 如果 VNode `children`是一个字符串，则我们将文字内容添加到元素下；否则，递归地对子 VNode 进行渲染。

于是我们可以编写渲染器的核心代码如下：

```ts
export const renderer = (vnode: VNode, container: HTMLElement) => {
  const { tag, children, props } = vnode

  const element = document.createElement(tag)

  if (props) {
    for (const key in props) {
      if (key.startsWith('on')) {
        element.addEventListener(key.slice(2).toLowerCase(), props[key])
      } else {
        element.setAttribute(key, props[key])
      }
    }
  }

  if (typeof children === 'string') {
    element.textContent = children
  } else if (Array.isArray(children)) {
    children.forEach((child) => renderer(child, element))
  }

  container.appendChild(element)
}
```

### 如果是组件呢？

上面的例子中，渲染器可以创建 HTML 标签，并为其添加属性与事件。但在现实中，Vue 往往需要渲染用户创建或引用的组件。为了能够渲染组件，首先需要知道组件可以怎样被描述。

事实上一个组件是一组 VNode 的封装。在上文中 VNode 的结构里，`tag`用于表示虚拟节点对应真实节点的 HTML 标签名称。只需稍加修改，使`tag`属性支持传入 VNode 对象即可。

接下来，修改渲染器方法，通过判断`tag`属性为字符串或对象的方式支持组件的渲染：

```ts
function renderElement(vnode, container) {
  // 与原`renderer`方法一致
}

function renderComponent(vnode, container) {
  const subTree = vnode.tag
  renderer(subTree, container)
}

function renderer(vnode, container) {
  if (typeof vnode.tag === 'string') {
    renderElement(vnode, container)
  } else {
    renderComponent(vnode, container)
  }
}
```

假设有如下 VNode:

```js
const comp: VNode = {
  tag: 'button',
  props: {
    onClick: () => {
      alert('clicked')
    }
  },
  children: 'Click me'
}

const vnode: VNode = {
  tag: 'div',
  props: {
    style: 'padding: 100px; background-color: red;'
  },
  children: [
    {
      tag: comp,
    }
  ]
}

renderer(vnode, document.querySelector('#app')!)
```

经过测试，我们的渲染函数现在已经支持渲染组件了。

::box{title='关于渲染器'}
这只是一个剥离了复杂逻辑的渲染器示例。实际上，渲染器还需要处理很多任务，例如当虚拟 DOM 发生变化时，以最低代价更新真实 DOM 等。

现阶段来说，只需了解渲染器是什么，以及它做了哪些工作就可以了。
::

## 编译器

我们在日常工作中并不使用直接编写虚拟 DOM 节点的方式开发组件。在项目中，常见的方式是编写 SFC，即单文件组件，使用一个`.vue`文件表示一个组件。

在 SFC 中，组件被分为`template`，`script`和`style`，一个组件的结构、行为和外观以关注点分离的方式集中在一个文件中。我们知道浏览器只能执行 JavaScript，必然无法直接运行`.vue`文件。这个时候就需要编译器了。

编译器在构建过程中发挥作用，将`.vue`文件中的模板编译为渲染函数，然后交由渲染器负责渲染。

例如，对于一个组件：

```vue
<template>
  <div @click="handler">Click me</div>
</template>

<script>
export default {
  data: () => ({
    /* ... */
  }),
  method: {
    handler: () => {
      /* ... */
    },
  },
}
</script>
```

编译器读取模板，并且转化为渲染函数，拼接在`<script>`标签的组件对象上。经过编译器处理后，最终浏览器可以执行的代码实际上就是下面的 JS 对象：

```js
export default {
  data: () => ({
    /* ... */
  }),
  method: {
    handler: () => {
      /* ... */
    },
  },
  render() {
    return h('div', { onClick: handler }, 'Click me')
  },
}
```

::box{title='关于编译器'}
编译器也包含很多额外的功能，例如 AST 的构造和转换，以及下面要提到的`patchFlag`等信息的收集等。在现阶段只需要了解编译器的大概职能即可。
::

### 当属性是动态的

我们知道渲染器最终根据渲染函数创建 DOM，并跟踪状态的变化来更新 DOM。设有如下模板：

```html
<button id="foo" :class="bar">Click Me</button>
```

此时编译器会将模板转化为渲染函数如下：

```ts
render() {
  return {
    tag: 'button',
    props: {
      id: 'foo',
      class: cls,
    },
    children: 'Click Me',
  }
}
```

渲染器在创建了`button`元素之后，还需要跟踪可能的变化。在这个例子中，可能发生变化的是`cls`这个变量。当`cls`的值变更时，渲染器需要重新渲染变更点。

当然，我们可以直接让渲染器直接按照新的渲染函数创建新的 DOM，或者使用 diff 算法比较两个虚拟 DOM 树的差异来进行更新，但这两种方式带来的性能损耗都过大。渲染器（显而易见地）在运行时工作，低下的效率将大大降低用户体验。

实际上，我们并非等到运行时的渲染阶段才能知道哪些属性是动态的、需要跟踪的。在编译阶段，我们就能获取到相关的信息。Vue 的做法是在虚拟 DOM 节点上创建一个标志位`patchFlags`，以其值来标识虚拟节点属性中可能发生变化的部分。

例如，当`class`是动态的，而其他属性（例如`id`）都是静态的时，编译器可以在生成代码时就设置`patchFlags = 2`，这样当渲染器在寻找变更点时，可以跳过这个 VNode 的 props 中除了`class`之外的部分的比较。

```ts
render() {
  return {
    tag: 'button',
    props: {
      id: 'foo',
      class: cls,
    },
    patchFlags: 2,
    children: 'Click Me',
  }
}
```

更多关于编译器的处理和优化逻辑可参见编译器专题。

## 小结

来自 Vue 文档中的图很好地总结了模板`<template>`是如何最终变成 UI 界面的：

![Vue 渲染机制](https://cn.vuejs.org/assets/render-pipeline.CwxnH_lZ.png)

在这一系列专题中，我们的讨论范围将涵盖以下内容：

- **数据的响应性（reactivity）**，探讨如何实现一个简单的响应性系统，以及 Vue 是如何实现的；
- **深入渲染器**，探讨渲染器与响应性的结合，以及虚拟 DOM 的 diff 算法实现等；
- **组件化**，组件的实现原理，包括异步组件和 Vue 的内置组件；
- **深入编译器**，探讨编译器的核心技术与编译优化。
