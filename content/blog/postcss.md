---
title: 每个人都该了解的 PostCSS
date: 2021-12-18
cover: postcss.svg
tags:
  - PostCSS
---

PostCSS 是一个时常被提起的词，但与它的知名度不相匹配的则是相当多的对 PostCSS 认知上的错误。尤其是对于习惯了使用样式预处理器（例如 Sass、Less 或 Stylus）的开发者而言，熟悉并且在一定程度上享受这样的预处理器带来的便利时，对同类型工具和技术也就感到不那么好奇了。

但事实上，这也是对 PostCSS 的一个**主要的误解**，即把 PostCSS 当作和 Sass 等语言一样的样式预处理器。而当我们得知长久以来的印象被这样一行文字纠正时，很多人可能又会对 PostCSS 燃起兴趣。而我认为，每一个编写 CSS 的人都应当了解 PostCSS，认识它是什么、不是什么，以及在它的能力范围内能做到什么。

## PostCSS 是什么？

::box
PostCSS **不是**像 sass 或 less 那样的样式预处理器（style preprocessor）。
::

PostCSS 不是一门语言，没有定义一种语法规则，也不是预处理器的替代方案。

PostCSS 可以读取你的样式表（很可能包含额外的语法和特殊的内容），处理它并输出标准的、可以被浏览器所接受的 CSS。任何 _类似于 CSS 的语法_ 的文件均可以被 PostCSS 所处理。

> 我已经拥有了样式预处理器（例如 Sass），所以我其实不需要 PostCSS？

这个想法很合理，在大多数情况下，样式预处理器带来的条件判断、循环、`mixin`、嵌套选择器和函数等足够有效和强大。但当预处理器无法施展拳脚的场合，PostCSS 却可以帮忙。

一个最流行的例子就是 [Autoprefixer](https://github.com/postcss/autoprefixer)，一个 PostCSS 插件。在 npm 上，Autoprefixer 每周有超过 **1100 万**次的安装，并被包括阿里巴巴、推特和谷歌等在内的企业采用。它解析用户的 CSS，并使用来自于 [Can I Use](https://caniuse.com/) 的数据自动为部分样式规则添加浏览器前缀。

PostCSS 的插件并不总是需要转换和输出 CSS。例如 [stylelint](https://stylelint.io/) 就是一个依托 PostCSS 解析能力开发的样式检查器（当然它也包含纠正错误的能力）。

通过对样式规则的转换，可以将自定义的、浏览器不能识别的语法转换为可以正常工作的样式规则。这允许开发者们定制额外的样式声明和可能的值。例如 [Lost Grid](https://lostgrid.org/lostgrid-example.html) 通过`lost-column`，`lost-align`和`lost-offset`等属性实现了栅格布局（虽然现在可以通过`flex`和`grid`实现，但在以前人们需要使用`float`浮动来实现相同的布局，相比之下基于 PostCSS 的这种语法将大大减少工作量并且使页面结构更清晰）。

总而言之，PostCSS 承担了一个框架的角色和职能——允许用户在它之上构建用于调整和改变样式表的工具。

## 从 CSS 到 AST

这是一个来自于 PostCSS 文档中的图，展示了整个 PostCSS 的工作流程。

![PostCSS 工作流程](/img/postcss/postcss-flow.png)

其中，Parser（解析器）具备识别输入的源代码，并且创建一个可以描述源代码结构的对象表达的能力。在很多源代码的编译和解释器中这一步都是必不可少的。通常，我们将经过解析器创建的用于描述源代码结构的对象称为 AST（Abstract Syntax Tree，抽象语法树）。显然，几乎所有编程语言都可以做到轻松操作树型结构的数据，这正是 PostCSS 的插件处理用户样式的第一步。

### Tokenizer

Tokenizer（或称为 Lexer，_“词法分析器”_）在语法解析中扮演了十分重要的角色。它将输入的字符串转换为由标记构成的列表。

例如，考虑下面的 CSS 作为输入

```css
.className {
  color: #fff;
}
```

PostCSS 得到的标记列表将是这样的：

```js
;[
  ['word', '.className', 1, 1, 1, 10][('space', ' ')][('{', '{', 1, 12)][('space', ' ')][
    ('word', 'color', 1, 14, 1, 18)
  ][(':', ':', 1, 19)][('space', ' ')][('word', '#FFF', 1, 21, 1, 23)][(';', ';', 1, 24)][
    ('space', ' ')
  ][('}', '}', 1, 26)],
]
```

我们可以看到对于每一个标记或单词，标记列表中均有一个子数组对其进行了描述，包括标记的类型（`word`、`space`等）、标记的内容以及标记的位置（单个符号如`{`，标记位置`1, 12`标识其位置是输入代码中第 1 行第 12 列；而对于多个符号如`#FFF`，标记位置`1, 21, 1, 23`表示其位置是第 1 行第 21 列开始到第 1 行第 23 列结束）。

标记化的实现方式和承载 token 的数据结构可以有多种选择，PostCSS 选择了看起来很“脏”的列表式。但事实上，标记化的过程将占据整个语法分析中约 90% 的时间，因此速度和性能至关重要，任何更复杂的高级构造（例如类）都会显著拖慢速度。

::box{title='扁平的结构'}
事实上，采用扁平结构进行语法分析的项目还有不少，除了出于性能的考虑，扁平结构也意味着不需要树形结构复杂的遍历和递归操作。一个典型的例子是用于构造富文本编辑器的 [prosemirror](https://prosemirror.net/)，依赖于扁平的数据结构可以更方便地实现诸如拆分和更改内容样式的操作。
::

### Parser

Parser（解释器）是 PostCSS 中对 CSS 进行语法分析的主要结构，它消费 Tokenizer 输出的 token，并构建 AST 供 PostCSS 的插件在随后进行处理。

### Processor

Processor（处理器）在 PostCSS 中负责初始化插件和执行语法转换。它的职能和做所暴露的 API 有限。

### Stringifier

由图可知当 PostCSS 完成了语法转换后，经过插件处理得到的新的 AST 需要被转换为字符串并输出为新的 CSS 文件。Stringifier 负责遍历 AST 树，并输出字符串以实现这一最后的步骤。

## 插件：PostCSS 的灵魂

毫无疑问，单独安装的一份 PostCSS 并不能帮助到开发者——几乎所有的情况下，PostCSS 插件才是开发者真正需要接触的东西，也是PostCSS 的灵魂。

社区内已经有[非常多的插件](https://postcss.org/docs/postcss-plugins)，涵盖了几乎各个方向和使用场景。不过为了真正了解 PostCSS 以及它如何在众多的项目中发挥作用，不妨尝试编写一个允许用户在样式表中使用`mixin`的插件。

### 从使用方式入手

Mixin 是指若干条可复用的样式，通过`@include`语法可以快速插入到样式声明中。例如，对于频繁使用的几条样式，定义一个名为`flex-center`的 mixin：

```css
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 使用时 */
.selector {
  @include flex-center;
  color: #212121;
  /* ...... */
}

/* 输出 */
.selector {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #212121;
}
```

在此例中，构建 PostCSS 插件的目的是识别输入的 CSS 文件中所有的`@mixin`和`@include`，并进行相应的规则替换。因此，我们只需要遍历所有的`AtRule`声明即可达到目的。

简单的 PostCSS 插件代码实现如下：

```js
const mixins = new Map()

return {
  // 对于所有 @~:
  AtRule: {
    // 对于所有 @mixin:
    mixin: (node) => {
      mixins.set(node.params, node.nodes)
      node.remove()
    },
    // 对于所有 @include
    include: (node) => {
      const name = node.params
      if (mixins.get(name)) {
        node.replaceWith(mixins.get(name))
      }
    },
  },
}
```

::box{title='潜在的问题'}
上面的代码着重于介绍 PostCSS 强大的能力，而忽略了生产环境下的可用性。例如，设一个 mixin 所定义的物理位置在一条引用了该 mixin 的样式规则的下方，即：

```css
.selector {
  @include test;
}

@mixin test {
  color: blue;
}
```

那么这条 mixin 无法被正确的处理。

此外，一个真正好用的 mixin 插件还应当包括错误捕获并允许接收参数等。作为参考，可以查看PostCSS 官方 Repo 的 [mixin 插件](https://github.com/postcss/postcss-mixins)。
::

### 插件设计准则

PostCSS 的插件开发十分简单，大众对于处理 CSS 的需求又是五花八门的，因此 PostCSS 插件种类繁多，包括既可以被正式用于生产项目的例子（前面已然列举了不少），也包括单纯为了好玩而被创造的（例如[PostCSS Australian Stylesheets](https://github.com/dp-lewis/postcss-australian-stylesheets)）。

对于需要从头开发一个插件的用户来说，有一些需要遵守的准则。

- **Do one thing, and do it well.** PostCSS 要求不创造“多目的性”的插件，而是将多个更小的、目标单一的插件集成为一个插件包。
- 将`postcss`添加到插件的`peerDependencies`中。
- 必须至少使用最新的 node.js LTS 测试插件。
- 在所有场合尽量使用异步方法。例如，使用`fs.readFile`代替`fs.readFileSync`。
- 使用更快的节点扫描方式。例如，如果明确知道要处理的样式规则是属性`color`，那么使用`Declaration: { color: /**/ }`要比调用`walkDeclaration`快得多。
- 使用`node.error`报告错误，使用`result.warn`输出警告。
