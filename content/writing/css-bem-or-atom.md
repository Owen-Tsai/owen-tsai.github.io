---
title: 当谈论 CSS 架构时，我们在谈论什么
date: 2023.02.16
intro: 从 BEM 到 Tailwind，实用主义是如何重塑 CSS 的
tags:
  - CSS
  - engineering
---

无论 web 开发框架如何层出不穷、日新月异，浏览器始终只能识别 HTML、CSS 和 JS。前端工程师们对于 CSS 的讨论逐渐从「选择器优雅」「语义化类名」迁移到了「可组合性」「构建时优化」和「工程效率」。在过去 [BEM](https://getbem.com/)（Block-Element-Modifier）代表了对中大型协作项目中可维护性的工程化回答；但在近年来，以 Tailwind 为代表的 utility-first 工具异军突起，Tailwind 也成为了社区中最受欢迎的 CSS 技术之一。两者的策略和风格截然不同，但随着越来越多的项目使用了 Tailwind，我们不得不认同它正在重塑 CSS 的架构。

::callout{title='强烈推荐！'}
[CSS Zen Garden](http://www.csszengarden.com/) 是关注点分离 SoC 的绝妙展现。这项工程的所有示例页面均使用了完全相同的 HTML 结构，仅靠替换 CSS 文件就能实现完全不同的外观和视觉风格。
::

## 回顾：BEM 的工程承诺

在 SPA 尚未普及的时代，全局 CSS 在提供了共享样式的便利的同时，也使样式冲突、层叠和可预测性差等问题变得更加显著。BEM 的核心理念十分明确：使用更长但容易预料、遵循模式的类名来组织 CSS。

在 BEM 的观点中，所有的类名应当是`block__element--modifier`的格式。其中，B（Block）指可以独立存在的实体，例如菜单 menu、列表 list、复选框 checkbox 等；E（Element）是指 block 的一部分，依赖于 block 存在，例如 menu item，list entry，checkbox caption 等；M（Modifier）则是表示元素状态的修饰，例如 disabled、active、hover 等。

```css
.container {}
.container__header {}
.container__action {}
.container__action--disabled {}
```

BEM 的贡献在于，它提供了一套足够简单易懂的规范，让团队可以以统一的模式进行样式层面的管理。增加了长度和复杂性的类名很大程度上避免了命名冲突，进一步化解了层叠性和优先级的问题。在团队全部遵循严格的命名规范后，样式“看起来”像是局部的，使所有成员可以在不同模块间独立工作。从结果上讲，这些优点在大型团队中十分实用。很长一段时间里，甚至直到组件化框架已经成型后，BEM 方法论依然被无数团队采纳。

## BEM 的缺陷

BEM 本质上是一种**约定式架构**，把复杂性转移到了约定与命名成本上。随着项目规模的扩大和组件化框架的诞生，这种成本催生了其他的问题。

### 越具体，越难复用

BEM 在使用一种类似面向对象的概念编写样式。假设需要实现的两个组件：_Author Card_ 和 _Book Card_，如下图所示。其中，_Author Card_ 和 _Book Card_ 均有横排和竖排两种布局形式，且 _Book Card_ 拥有一种促销状态。

![cards](/img/atomic-css/cards.png)

采用 BEM 规范时，两个组件的 HTML 结构也许是下面这样的：

```html
<div class="author-card">
  <div class="author-card__image"></div>
  <div class="author-card__content">
    <div class="author-card__title">Agatha Christie</div>
    <div class="author-card__intro">...</div>
    <div class="author-card__actions">
      <button class="author-card__action--primary">MORE</button>
    </div>
  </div>
</div>

<div class="book-card">
  <div class="book-card__image"></div>
  <div class="book-card__content">
    <div class="book-card__title">And Then There Were None</div>
    <div class="book-card__intro">...</div>
    <div class="book-card__actions">
      <button class="book-card__action--primary">Add to Cart</button>
      <button class="book-card__action--secondary">MORe</button>
    </div>
  </div>
</div>
```

此时我们发现，用相似的结构可以描述两个组件，且两个组件的风格大部分相同。此时开发者有两个选项：要么复制几乎完全相同的两份 CSS 并且违反 DRY 原则，要么将两个组件中的相同样式「抽象」成更通用的类。随着这种情况越来越多，我们的“通用类”也会越来越多，逐渐演变成这样：

```css
.box {}
.has-ribbon {}
.shadow {}
```

```html
<div class="box shadow author-card"></div>
<div class="box has-ribbon shadow book-card"></div>
```

此时，我们又破坏了 BEM 的语义体系：我们创建了`.box`、`.shadow`等 utility class，而这本质上正是 Tailwind 之类的原子化框架诞生的意义。

### 变体（variants）爆炸

在上面的例子中，卡片组件存在多种「变体」：横版、竖版、促销态、常规态等等。对应的 CSS 类名在 BEM 的规范下应当是：

```css
.card--horizontal {}
.card--vertical {}
.card--promotional {}
.card--normal {}
```

这些变体之间可以组合，例如一个卡片可以既是竖版也是促销态。当多个 modifier 同时存在时，样式可能存在覆盖。

```css
.card--vertical.card--promotional {}
```

随着变体的数量越来越多，可能的 modifiers 的组合也越来越多。此时 CSS 的规则也越来越复杂。BEM 指出 modifier 不应当互相依赖，但在现实世界中，一个最简单的组件都可能包含多个同时作用的 modifier。

更进一步地，考虑竖版卡片的样式。当卡片的布局出现改变，不可避免地将会影响内部元素的样式：MORE 按钮的宽度占据了 100% 容易宽度、介绍文字移动到了下方，且卡片标题和 MORE 按钮呈现上下两端布局。于是 CSS 结构中，element 的样式开始受到 modifier 的影响，CSS 的结构出现了层级耦合。

```css
.card--vertical .card__title {}
.card--vertical .card__intro {}
.card--vertical .card__action--primary {}
```

此时的 CSS 文件中不可避免地会出现大量的样式覆盖，CSS 声明的数量将迅速增长。

### 重复的样式与维护困难

在践行 BEM 的过程中，我们始终在**创造概念**。随着系统规模的进一步扩大，这又会暴露出其他问题：

其一是修改样式影响面难以确定，CSS 认知成本不断上升。`.card__title`类的样式规则可能有多个组件共同使用，开发者缺少静态分析工具来保障自己的修改或删除始终是安全的。相比于在 HTML 中使用`.card__title`，开发者们会倾向于创建自己的`.custom-card__title`来避免自己的代码受到这个问题的影响。于是在这种情况下，CSS 规则只增不减，概念越来越多，起名的负担越来越重，维护性越来越差。

其次是重复样式的问题。随着类名越来越长、越来越多，相当多的规则可能只是实现了诸如`margin-left: 8px`之类的简单样式。选择器的长度甚至远远大于样式规则，大量重复的样式代码在不同的组件中反复出现，对开发者的开发体验和构建产物都造成了影响。

### 组件化的发展

BEM 诞生于静态页面时代，它在大型项目中反映出来的问题，归根结底是因为 BEM 对关注点分离的坚守。这一点在组件化时代显得与我们主流的认识「格格不入」。当我们把 UI 拆分为可复用的组件时，HTML 和 CSS 其实共同构成了一个组件的外观。强行将它们按照文件类型进行分离反而增加了维护负担。

在 Vue.js 的文档中，有这样一句话：

> separation of concerns is not equal to the separation of file types. The ultimate goal of engineering principles is to improve the maintainability of codebases.
> 
> 关注点并不按照文件类型分离。工程化的终极目标应当是提升代码库的可维护性。

在规范的要求下，我们编写了一个 BEM 风格的 HTML；紧接着，我们转到 CSS 文件中，又为相同的 DOM 结构编写样式。实际上这两者从未真正地分离，我们只是在不同文件中以不同方式描述了相同的树。面对组件化的发展，前端 CSS 迫切需要一种新的指导思想。

## Utility-first：原子化 CSS 的崛起

原子化 CSS（Atomic CSS）是指将样式拆分为最小的、不可再分的单元，使每个简短的类名只对应一条属性。

```html
<!-- book -->
<div class="flex gap-4">
  <img src="..." class="w-1/3" />
  <div class="w-2/3">
    <div class="text-lg text-slate-8 line-clamp-2">And Then There Were None</div>
    <div class="text-slate-5 mt-4">...</div>
    <button class="bg-slate-800 text-white uppercase mt-4">MORE</button>
  </div>
</div>
```

对比两种范式，BEM 整体建立在「约定」的基础上，而原子化 CSS 的理念则是组合优先。通过组合已有的类名实现 UI 的构建，在此过程中不会创造新的概念，也避免了无意义的抽象。这种思想也被叫做 utility-first。

原子化 CSS 被大规模使用，背后有几条工程驱动的原因：

- **构建工具的成熟**。Bootstrap 的 CSS 中层含有非常少量的 utility class，因为完全通过类名来还原几乎所有常见样式声明所导致的 CSS 体积必然是巨大的。只有在通过使用 WebPack、Rollup、PostCSS 等构建工具在构建阶段进行分析、扫描与优化，使得未使用的样式可以被剔除出构建产物，原子化 CSS 的方案才能真正发展起来。
- 使得原子化 CSS 方案脱颖而出的另一点，就是**现代产品越来越依赖于设计系统**。固有的空间尺度、色板与排版尺度使得「一组可复用原子」变得非常有价值。Tailwind 所提供的预设设计令牌可以作为设计系统的基底，看似限制了开发者的自由度，但在产品的宏观层面保证了设计的一致性，降低了决策成本。

## 重塑工程化边界

从 BEM 到 Tailwind 的演进，不仅是一种 CSS 编写方式和思路的转变，也触及了前端工程化的核心问题：我们如何组织代码，以平衡开发效率、可维护性与可扩展性。在实用主义的驱动下，Tailwind 越来越受欢迎，工程化边界也得到了重新定义。

在 Tailwind 之前，样式库的维护——包括命名规范、样式复用和样式覆盖策略——是前端工程团队的核心任务。在 utility-first 指导的设计与开发中，这部分工作被抽象成设计 tokens 与类集，维护在诸如`tailwind.config.js`之类的配置文件里。这些 tokens 天然易于导出，且可与设计软件同步，使得跨端一致性更容易落地，也在某种程度上降低视觉回归的难度。

当然，使用 Tailwind 后，开发者也会遇到各种挑战与新的问题。借助原子 CSS 框架预定义的 tokens，开发者更多参与视觉的实现，设计稿与代码之间的反馈回路变短；但这也要求开发者必须具备 token 意识，避免随意增加 token。更重要的是，由于用户界面是组合而成的，一个原子 CSS 类的辐射面可能很大，因此在设计规范变更时，需要团队调整至更细致和严格的审查流程。最后，过度的抽象也依然是潜在的风险，如果开发者滥用`@apply`将类名组合进行「封装」，就不知不觉走了 BEM 的老路（事实上，就连 Tailwind 的创造者 Adam Wathan 本人也[极其反对](https://x.com/adamwathan/status/1226511611592085504?lang=en)使用`@apply`）。

从 BEM 到 Tailwind 的演进，核心并非“语义好不好”或“类名美学”的胜负，而是前端工程化的一系列决策：谁负责定义视觉规则、这些规则在何时被计算、以及团队如何在速度与一致性之间取得平衡。BEM 把复杂性放在明确的约定与语义层上，而 Tailwind 把复杂性放在构建时与 token 管理上，并把组合能力交给最终代码作者。

现实世界里的最佳实践往往是混合的：让设计 tokens 成为稳定的单一事实源（source of truth），在组件边界上保留语义化 API，同时在组件内部使用实用类获得开发速度与一致性。这种折衷既能保留 BEM 在协作与可读性上的价值，也能享受 Tailwind 在工程效率与构建优化上的好处。
