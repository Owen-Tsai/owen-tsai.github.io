---
title: CSS：BEM 还是原子化
date: 2022-02-16
cover: bem-vs-atomic.svg
tags:
  - CSS
  - Atomic CSS
---

Web 应用开发技术在过去的日子里得到了突飞猛进的发展，各类开发框架日新月异，极大地降低了 Web 应用开发和维护的难度与所需要的成本。我们无法否认的一点是，无论技术怎样发展，始终无法改变浏览器只能够识别并运行 HTML、CSS 和 JS 的事实。

随着经手的项目越来越多，对于样式这个绕不开的话题也已经有了不少探索。CSS 严格来讲不是编程语言，因此存在很多问题。其中有一些，即便使用诸如 Sass 或 Less 之类的预处理器，也无法完全绕过或消除。于是在过去的十年里，人们对于如何降低样式的开发和维护难度进行了几乎不间断的、持续至今的讨论。

::box{title='强烈推荐！'}
[CSS Zen Garden](http://www.csszengarden.com/) 是 SoC 的绝妙展现。这个网站上的设计成果向大家展示了一个遵循 SoC 的页面仅仅只靠更换样式表就能实现几乎完全不同的外观和风格。
::

## BEM 命名约定

事实上，如果你在一个**注重编码标准**的团队，那么你们大概率已经采用过这套规范——BEM，即 Block-Element-Modifier。

在 BEM 的观点中，所有元素都可以采用一种有规律可循的模式进行描述。Block 指可以独立存在的实体，例如`header`，`container`，`checkbox`，`input`等。Element 则是 block 的一部分，依赖于 block 存在，例如`menu item`，`list item`，`checkbox caption`等。Modifier 是 block 或 element 上采用的修饰，用于修改元素的外观和表现。

```css
.container {
}
.container__header {
}
.container__action {
}
.container__action--disabled {
}
```

BEM 似乎消除了 CSS 中经常会遇到的问题。它通过`block__element--modifier`的方式最大程度地避免了命名碰撞，同时 block 和 element 的组合提供了一定程度的复用可能，有相当多的 UI 组件库采用这样的方式复用样式；此外，BEM 方法产出的 CSS 结构也更清晰。

## 从 BEM 到 Atomic CSS

在很长一段时间里，我也坚持在每一个项目中贯彻 BEM 的方法论。但事实上，任何一个项目团队在长期使用 BEM 的过程中都会遇到一些具有共性的问题。每个团队对这些问题的解决方案和策略有的时候将使他们对严格贯彻 BEM 的方法论发起挑战。

让我们从 _Author Card_ 的例子开始。

![author-card](/img/atomic-css/author.png)

如图所示是一个名为 _Author Card_ 的组件。如果采用 BEM 规范，那么该组件对应的 HTML 如下：

```html
<div class="author-card">
  <img src="/example/img.png" class="author-card__image" />
  <div class="author-card__content">
    <div class="author-card__title">Agatha Christie</div>
    <div class="author-card__bio">...</div>
    <button class="author-card__cta">MORE</button>
  </div>
</div>
```

随后，我们可能发现我们需要一个表示作家的作品的组件 _Book Card_，但其外观和 _Author Card_ 几乎一致。

![book-card](/img/atomic-css/book.png)

显然，直接使用`.author-card`这个 class 来组织 _Book Card_ 可以实现最大程度的复用 CSS。但这违反了语义化的原则，并不是非常可取的做法。而直接将`.author-card`的所有样式规则复制一份并命名为`.book-card`又破坏了复用性，违反了 DRY 原则。

假如我们使用 Sass 之类的预处理器，那么可以考虑采用`@extend`来使`.book-card`继承`.author-card`的样式。但这在无形之中创建了一种在编码过程中难以被 IDE 追溯的潜在依赖关系。一旦依赖的某一方发生变化，那么最坏的情况下开发者需要人工和跟踪、识别和修改所有继承该依赖的样式声明。

那有没有什么办法可以在不违反语义化、DRY 和 SoC 的原则下实现样式的复用呢？

### 越具体，越难复用

::box
一个组件承担的职能越多，越具体，它就越难以被复用。
::

考虑到我们在面向对象的程序设计中所适用的一系列理论知识，我们可以尝试将 _Book Card_ 和 _Author Card_ 提高一个抽象层次，用`.card`来组织两个相类的组件：

```html
<div class="card">
  <img src="/example/img.png" class="card__image" />
  <div class="card__content">
    <div class="card__title">Agatha Christie</div>
    <div class="card__bio">...</div>
    <button class="card__cta">MORE</button>
  </div>
</div>

<div class="card">
  <img src="/example/img.png" class="card__image" />
  <div class="card__content">
    <div class="card__title">And Then There Were None</div>
    <div class="card__bio">...</div>
    <button class="card__cta">MORE</button>
  </div>
</div>
```

这样一来，我们可以复用样式，并且没有违反任何的原则。同时，假如需求需要进行修改，我们可以通过为这两个组件添加`is-author`或`is-book`等修饰符来实现差异化样式的编写。

于是，随着越来越多的组件被引入，我们的 class 会越来越抽象，以便实现更高的复用程度和更小的产物体积。最终我们难免会遇到这样的情况：

1. `.card__cta`和页面中其他的按钮需要采用相同的样式，于是将它们全部改为`.btn`；
2. _Author Card_ 中的标题需要限制为单行，而 _Book Card_ 中的标题则需要限制为两行；
3. _Author Card_ 中需要添加一个额外的按钮，并且距离已经存在的按钮有一定的间距；
4. 两个组件需要支持 RTL（从右到左书写的语言，例如阿拉伯语）；

于是我们的 HTML 和 CSS 最终会变成这个样子：

```html
<!-- author -->
<div class="card card--is-author">
  <img src="/example/img.png" class="card__image" />
  <div class="card__content">
    <div class="card__title">Agatha Christie</div>
    <div class="card__bio">...</div>
    <button class="card__action-item btn btn--primary btn--large">MORE</button>
    <button class="card__action-item btn btn--secondary btn--large">WORKS</button>
  </div>
</div>

<!-- book -->
<div class="card card--is-book">
  <img src="/example/img.png" class="card__image" />
  <div class="card__content">
    <div class="card__title">And Then There Were None</div>
    <div class="card__bio">...</div>
    <button class="card__action-item btn btn--primary btn--large">MORE</button>
  </div>
</div>
```

```css
/* 省略 */
.card__title {
  /* ellipses */
}
.card--is-author .card__title {
  /* 覆盖 .card__title */
}

.card__action-item {
  margin-right: 1rem;
}
.card__action-item:last-child {
  margin-right: 0; /* 覆盖 .card__action-item */
}
/* 支持 RTL 语系 */
.rtl .card {
  /* 覆盖 .card */
}
```

经过上面的修改，我们发现为了同时实现 1. 和 3. 的需求，我们不得已创造了一个`.card__action-item`的子概念；为了实现 2~4 的需求，我们则需要在样式表中进行很多规则的覆盖——只要我们依然采用这种继承的方式编写样式，那么就一定会产生样式覆盖，因为覆盖样式规则的行为正好对应了面向对象概念中的“多态”。

而假设 3. 中的需求更进一步，要求两个按钮分别在最左边和最右边呢？难道我们需要再创造两个用于修饰的类`.card__action-item--left`和`.card__action-item--right`吗？**这显然违反了 SoC 原则，我们把设计上的决定带到了 HTML 中！** 退一步讲，即便我们创建了这两个类，这两个类也仅仅只包含`text-align`一个属性值而已。

试想这个例子的规模扩大十倍，我们的代码中会充满大量又臭又长的 class，而它们唯一的目的就是实现诸如`margin`，`text-align`，`padding`等简单的规则。这些规则不仅重复，而且过度依赖上下文——即便两个完全不相干的元素都需要应用`text-align: left`的规则，但由于它们处于不同的上下文中，按照 BEM 的规范我们必定要用两个不同的声明去描述这两个元素。

似乎我们组织代码的方式又出现了问题。

### 组合，而不是继承

在一个大型项目中，始终尝试想出和记忆这些 class 的名称是十分困难的。而我们也提到了，增加`card__action-item--left`这样的名称已经违反了语义化法则。于是我们不妨大胆地对 BEM 发起挑战。假如有另一个元素也需要居左对齐或右对齐的修饰符，不妨一概使用诸如`.align-left`和`.align-right`。

通过收集和复用通用的修饰类，我们会得到一个原子 CSS 库，这个库中包含提前定义的诸如`text-center`，`flex`，`mt-4`之类的 class 和所对应的样式。我们通过**组合**原子 CSS 而非以创建组件并进行继承的方式编写样式表。

同时，在采用了这些原子化 CSS 后，我们可以**删除无意义的抽象**。因为类名、选择器和样式规则的覆盖现象大大减少，最终 CSS 构建产物将只包括原子 CSS 库中的样式规则。通过在构建阶段进行提取，我们可以保证只有实际被使用到的 class 被添加进最终的产物中，进一步减小构建体积。

```html
<!-- book -->
<div class="card flex gap-4">
  <img src="/example/img.png" class="w-1/3 object-cover" />
  <div class="w-2/3">
    <div class="text-lg text-gray-8">And Then There Were None</div>
    <div class="text-gray-5">...</div>
    <button class="btn btn--primary btn--large">MORE</button>
  </div>
</div>
```

### 有限的选择

在一些不那么规范的老项目里，下面这些情况非常普遍：

- 段落文字在一个页面上是 16px，但在另一个页面上则是 14px；
- 页面上两个标识主要操作的按钮的颜色不一致；
- 有的按钮是块级元素，有的按钮是行内块级元素，有的按钮则采用`display: flex`布局；
- 可交互元素在一些页面上采用`lighten()`或`darken()`等实现鼠标悬浮和激活的效果，但在另一些页面上则使用颜色表示；
- ...

毫无疑问，在一个成熟的商业产品中出现这些现象违反了产品设计一致性（Consistency）的准则。而借助原子化 CSS（以及 IDE 的插件）则可以解决这个问题。团队配置好统一的原子 CSS 库，只从产品的设计规范速所支持的字号、间距、颜色等 class 中选择并进行组合，可以避免项目组成员“任意发挥“。

::box
事实上这也是原子 CSS 与内联样式的主要区别——有限的选择范围意味着遵循设计规范非常容易。
::

### CSS 与 HTML 的关系

在 SoC 中，我们倾向于认为一个页面由“结构—表达—功能”构成。结构是 HTML，表达是 CSS，功能则是 JavaScript。

因此，一个标准的、传统意义上的页面应当由互相独立和分离的一个 HTML，若干个 CSS 与 JS 共同构成。

长久以来，人们对于“关注点分离”的看法也是非黑即白的，采用了这样传统的开发方式则一定是好的，反之则一定是不好的。似乎长久以来人们机械地按照文件类型划分关注点：对于一个网页，它的结构、表现和功能应当分离。

但事实上，前端开发的关注点不是完全基于文件类型分离的。**前端工程化的最终目的都是为了能够更好地维护代码。**关注点分离不应该是教条式地将其视为文件类型的区别和分离，仅仅这样并不够帮我们在日益复杂的前端应用的背景下提高开发效率。

::box{title='关于 SoC（关注点分离）'}
在现代的 UI 开发中，我们发现与其将代码库划分为三个巨大的层，相互交织在一起，不如将它们划分为松散耦合的组件，再按需组合起来。在一个组件中，其模板、逻辑和样式本就是有内在联系的、是耦合的，将它们放在一起，实际上使组件更有内聚性和可维护性。
—— Vue.js 文档
::

我们可以想象一下编写 HTML 和对应的 CSS 的两种形式：我们编写 BEM 风格的 HTML，暴露出`.author-card`之类的 class。HTML 并不需要知道在 CSS 文件中`.author-card`将会采用哪些样式。或者，我们编写原子风格的样式，在 HTML 中我们组合这些 class。CSS 并不需要知道在 HTML 文件中这些 class 将会被怎样组合。

所以事实上，前者的“语义化”与“关注点分离”，与后者更像是一体两面。HTML 和 CSS 在这两种情况下都更像是相互依存的依赖关系，选用哪种方式其实应当取决于设计者本身。

## 反对的声音

从[TailwindCSS](https://tailwindcss.com/)问世以来，支持者和反对者都各抒己见。时至今日，Tailwind 已经被应用于无数项目。新技术的引入总是为了解决某些问题，但也无法避免地会引入新的问题。

其中有一些问题实际上可以通过引入新的工具解决——例如被很多人诟病的 class 难以记忆的问题，实际上通过安装 Tailwind 的 VSCode 插件就可以在一定程度上缓解；此外，从个人的体验上讲，这个问题在真正使用 Tailwind 开发过一两个项目之后便荡然无存了，所以这部分讨论将不会涉及这样的批评。

### 降低了可读性，提升了维护难度

如果用浏览器开发者工具的审查功能查看使用 Tailwind 开发的应用，很可能会发现里面的某个元素上堆砌着几十个 class。如果单独拿出一段来，很难凭借阅读 HTML 来确定它是页面上的哪一部分。这无疑会给维护和修改带来额外的成本。假设有一天设计上的决定发生了变更，有一部分文本需要从居中调整为居左，那么分辨哪些`text-center`应当被调整为`text-left`的过程自然不如在语义化的 CSS 文件中直接修改来的方便快捷。

同时，在开发中，过长的 class 无法换行的问题也会影响阅读和编码。且不说 class 中换行的方式是否可取，单说使用了 prettier 之类的工具后，即便手动进行了换行，也会导致代码在提交或保存时被格式化。

### 组件的困局

使用 Tailwind 之类的原子 CSS 框架时，面对可复用的组件（一组结构、表现和逻辑功能的合集）时也会捉襟见肘。

例如有一个按钮，使用 Tailwind 实现如下：

```html
<button class="bg-blue-6 text-white px-4 py-2 rounded">...</button>
```

如果这个按钮在页面上将会出现多次呢？如果在这个场景下采用 BEM 命名法，`.button .button--primary`之类的名称显然更适合应对组件。而相比之下，使用原子 CSS 组合时似乎只能够重复地复制代码。

是的，虽然 Tailwind 提供了`@apply`的 AtRule 可以在这个场景下发挥作用，但是 Tailwind 的发起人 Adam 本人也[极力反对](https://twitter.com/adamwathan/status/1226511611592085504?lang=en)过度使用`@apply`。在面对一个按钮的场景下为了消除重复的代码使用`@apply`是可以接受的，但假设我们面对一个复杂的场景：

```scss
// written in scss
.card {
  @apply p-4 flex flex-col md:flex-row gap-4 md:gap-6;
  &__title {
    @apply text-lg font-bold text-gray-8 dark:text-gray-2 my-4;
  }
  &__content {
    // ...
  }
}
```

我们固然可以用`@apply`去编写样式，但这样做我们又会回到故事的开头——我们必须要再去通过创造抽象层级的方式为元素命名，这似乎违反了使用原子化 CSS 的初衷。

这个时候似乎只有考虑采用一个组件化框架（Vue、React）才能够真正解决问题。

## 没有银弹

就如同技术领域中大量的其他问题一样，如何优雅地编写 CSS 也是一个没有银弹的问题。原子化 CSS 和贯彻 SoC 的 BEM 命名法实际上只是一个问题的两个方面，而这个问题就是如何高效开发、维护和修改 CSS。

就目前来看，至少我本人对于使用类似 Tailwind 的框架感到舒适与满意。也许在将来，Tailwind 将做出更多的优化，进一步提高性能，同时也带来新的能力。
