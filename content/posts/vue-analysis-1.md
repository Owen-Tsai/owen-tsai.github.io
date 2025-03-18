---
title: Vue 的设计思路 / 1
date: 2024.02.12
---

从整体上来看，框架的演变始终在向着更加**声明式**的方向发展。在 jQuery 的时代，人们通过命令式的语句实现视图层的逻辑，而在 vue 的时代，人们将关注点从底层逻辑如何实现逐步转移到顶层设计上，以声明式的方式实现同样的业务需求。在现在和未来，人们将可能采用更加声明式的方式：以图形化界面和自然语言搭建业务系统。

然而在日常开发中享受声明式框架的便利性时，我们会难以避免地忽略框架内部的设计与实现。诸如 Vue 之类的框架封装了过程，帮助用户隐藏了细节，但其实不难想象，在其内部一定包含大量设计上的巧妙思考。

## 描述 UI

一个视图层框架的主要任务之一就是用一种方式对 UI 进行描述。Vue 采用的方案是使用单文件组件（SFC）或者一个 JavaScript 对象。

在 Vue SFC 中，我们使用与 HTML 中类似的方式描述元素和属性。同时，Vue 为我们扩展了语法，可以使用`v-bind`和`v-on`来分别描述动态绑定的属性与事件。同时，元素之间的父子关系和层级结构也通过与 HTML 相同的树形方式表示。

而在使用 JavaScript 对象描述 UI 时则更加灵活，因为在使用 JS 对象描述 UI 时可以使用 JS 的编程能力。例如假设我们需要表示一个标题，根据级别的不同渲染 h1~h6 这几个不同的标签，在使用 SFC 时我们不得不穷举，使用`v-if`和`v-else-if`列举所有情况。而当我们使用 JS 对象描述时，就非常简单了：

```ts
const title = (level: number) => ({
  tag: `h${level}`
})

title(3) // // => h3 标签
```

这种描述形式实际上就是虚拟 DOM。

在 Vue 的虚拟 DOM 中包含了很多属性，与 DOM 树类似，这些属性构成了一个树形结构，用于描述组件构成的 UI。我们可以通过`h`函数构建一个虚拟 DOM 的节点（或称为 VNode）：

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

::Box{title='结论'}
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
    style: 'padding: 100px; background-color: red;'
  },
  children: [
    {
      tag: 'button',
      props: {
        onClick: () => {
          alert('clicked')
        }
      },
      children: 'Click me'
    }
  ]
}
```

当创建 DOM 元素时，我们需要做这样几件事：

- 在父容器内创建对应的元素；
- 将 VNode `props`中的属性赋给创建的对应元素；
- 如果有`on`开头的属性，我们认为这是一个事件，因此需要绑定时间监听器到创建的元素上；
- 如果 VNode `children`是一个字符串，则我们将文字内容添加到元素下；否则，递归地对子 VNode 进行渲染。

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
    children.forEach(child => renderer(child, element))
  }

  container.appendChild(element)
}
```
