---
title: 为什么 headless 组件库是更好的组件库
date: 2023.10.10
---

## 从 Headless UI 开始...

2022 年，我被指派主导开发一款基于 electron 的桌面应用程序。正是在为项目选择 UI 组件库时，顺着 TailwindCSS，我第一次接触到 [Headless UI](https://headlessui.com/)。

彼时经历了 Element UI 的审美疲劳和客制化难题，我一眼就认定 Headless UI 是我理想中的技术方案。配合 Tailwind 进行了一段时间的开发之后——虽然由于组件数量偏少和开发周期有限导致我不得不再次引入 Element UI，但 Headless UI 的设计理念让我认为这是未来开发和维护组件库更好的方案。

## 组件是如何构成的

通常情况下，我们认为一个组件由**行为**和**样式**共同构成。

行为指的是一个组件的交互表现和内在的逻辑，例如一个下拉菜单组件可以被点击或被键盘触发以展开额外的菜单，用户可以点击菜单中的某一项或者使用键盘进行导航和选中操作；样式——顾名思义——指的是组件的视觉效果，在鼠标悬浮、交互、聚焦、激活和禁用状态下的视觉体现。

大多数组件库的诞生都是为了在编码层面实现一套设计体系。例如 Ant Design 或 Element UI，提供的组件都遵循了各自的设计体系和标准。这些组件兼具行为和样式，最适合用于统一体系内产品的开发，其中又以中、后台场景最为适用。

### 当样式需要定制

面对传统的组件，样式定制无外乎想方设法覆盖其出厂提供的样式规则。

一些组件库在这一点上有着更进一步的设计，例如 Ant Design 提供了一套[梯度色彩生成算法](https://zhuanlan.zhihu.com/p/32422584)，并且允许通过 less 覆盖少量变量实现样式的定制。Element UI 则是通过简单的明暗函数计算产生梯度色，允许用户使用 sass 覆盖变量；另一些组件库则需要完整覆盖所有梯度颜色和其他变量才可以实现样式的定制。

但这样的定制有的时候并不能够完全满足用户的需求。有的样式并没有暴露对应的样式变量，这个之后只能通过编写额外的 HTML class 名称和 CSS 规则去覆盖原先的样式，有些情况下甚至只能通过`!important`实现“定制”。

### 当 DOM 需要修改

假设我们有一个 Dropdown 组件，接收`menu`参数，允许传入树形的菜单项：

```tsx
const menu = [
  {
    label: '文件',
    children: [
      { label: '新建' },
      { label: '打开' },
      { label: '保存' },
      { label: '另存为' },
      { label: '退出' },
    ]
  },
]

import { Dropdown } from 'some-ui-lib'

function App() {
  return (
    <Dropdown menu={menu} />
  )
}
```

一周后，我们遇到了新的需求：下拉选项的菜单中，如果某菜单项过长，则截断其文本，并在鼠标悬浮超过 333 毫秒时使用 Tooltip 组件显示完整的内容。

显然，这需要修改组件的渲染逻辑和对应的 DOM 结构。Dropdown 组件若没有提供这样的定制方式，而必须要重新开发。而我们有理由相信，我们总会遇到没有办法简单通过扩展定制实现的需求。

## 也许应该自己动手

如果我们没法 100% 完整地掌控传统组件库，那么我们也许应该自己动手维护一个？

我们或多或少都有过这个想法，其中一部分人付诸实施。不过事实是，在我们的本职工作是造车的前提下，造轮子的投入产出比显然太不合实际。随着用例的逐渐复杂和组件代码量的提升，仅凭我们个人的努力难以支撑组件库的维护。结果是我们自己开发的组件库在易用性上欠缺考虑，使用键盘和屏幕阅读器的用户几乎无法操作，更别提还有来自 Mac/IOS 或其他设备其他浏览器用户反馈的 BUG。

最终我们大部分人会暂时放弃，对自己说好吧，项目结束之后我再来好好研究。

![Dropdown组件花费的时间](/img/headless-ui/dropdown.png)

暂时的放弃无法改变事实：一个即便简单如 Dropdown 一样的组件，都可能花费大量的时间。Next.js Conf 2021 会议上，Pedro Duarte 的一张幻灯片展示了 Radix UI 团队开发一个在所有浏览器上正确运行、完全可用且支持所有屏幕阅读器的 Dropdown 所付出的成本：

- 2000 多个小时；
- 6 个月；
- 50 次代码走查；
- 1000 余条 commit。

一些更复杂的组件——数据表格、表单等，将花费更多的时间，也更加难以测试。

## Headless？

说来惭愧，第一次听说“headless”的概念是读大一在玩 [Arma3（武装突袭 3）](https://community.bistudio.com/wiki/Arma_3:_Headless_Client)的时候。在创建公开游戏时，有”无头客户端“的概念。

在 UI 组件库的 scope 内，所谓的 headless 其实是指剥离了**样式**之后的**行为**。也就是说，headless 组件库是指具有基本的行为，但没有套用任何样式、不以还原某个设计系统或遵循固定的设计标准为目的的“行为库”。其实，Ant Design 也建立在这样一个行为库（[react-component](https://react-component.github.io/badgeboard/)）上。

> 简而言之，Headless 组件库是**无预设样式的纯逻辑（Unstyled + Functional）组件**。

Headless 组件库具有以下特点：

- 仅提供交互逻辑与 a11y；
- 不强制任何样式规范，甚至不进行 reset/normalize；
- 暴露完整控制权。

一个 Headless 组件通常包含若干个子组件，每一个构成组件的原子都可以进行定制，甚至根据实际情况更换和重写，因此开发者可以保持对组件的完整控制权。

其次，Headless 组件允许开发者自行使用任何 CSS 技术，无论是使用 CSS Modules 还是 TailwindCSS，无论是使用 Sass 还是 Less，都可以对组件添加样式。

## 流行的 Headless 组件库

**Vue**：

- [Radix Vue](https://www.radix-vue.com/)
- [Prime Vue](https://primevue.org/)
- [Shadcn Vue](https://www.shadcn-vue.com/)

**React**：

- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)


