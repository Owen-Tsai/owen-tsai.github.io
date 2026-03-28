---
title: 每个人都该了解的 PostCSS
date: 2021.12.18
intro: 每一个编写 CSS 的人都应该了解 PostCSS，它是什么、不是什么，以及在它的能力范围内能做到什么
tags:
  - Engineering
  - CSS
---

PostCSS 是一项时常被提起的技术，但与它的知名度不相匹配的则是相当多的对 PostCSS 的误解。对于习惯了使用样式预处理器的我们而言，熟悉并且在一定程度上享受 Sass、Less 或 Stylus 提供的变量、嵌套和混合等程序化特性时，往往也就忽视了 CSS 领域的其他技术。对于 PostCSS，即便不使用它，对每一个编写 CSS 的人而言也都应当对 PostCSS 有基本的了解，认识它是什么、不是什么，以及在它的能力范围内能做到什么。

## PostCSS？

PostCSS 不是一门语言，没有定义一种语法规则，也不是预处理器的替代方案。PostCSS 是一个用 JavaScript 编写的工具，提供转换 CSS 代码的能力。PostCSS 就像是 CSS 界的 Babel——本身不直接改变 CSS，而是提供一个解析、分析和重构 CSS 抽象语法树（AST）的平台。

::callout{icon='Ban' title='PostCSS 不是什么'}
- PostCSS 不是像 sass 或 less 那样的样式预处理器（style preprocessor），但可以借助 PostCSS 的能力实现类似的功能；
- PostCSS 不是样式后处理器。尽管名字带有「Post」，但它并不局限于后处理。PostCSS 可以作用于开发时、构建时甚至运行时；
- PostCSS 不是一种语言或单一工具，而是一个平台，由插件系统实现特定功能。
::

换句话说，PostCSS 的核心是一个CSS 解析器 + 插件系统。它接收 CSS 源码，解析成 AST，然后将 AST 交给一系列插件依次处理，最后将修改后的 AST 重新生成为 CSS 代码。PostCSS 可以读取样式表（很可能包含额外的语法和特殊的内容），处理它并输出标准的、可以被浏览器所接受的 CSS。任何 _类似于 CSS 的语法_ 的文件均可以被 PostCSS 所处理。

社区内已经有[非常多的插件](https://postcss.org/docs/postcss-plugins)，涵盖了几乎各个方向和使用场景。下面这些插件的名气甚至超过了 PostCSS 本身：

- [Autoprefixer](https://github.com/postcss/autoprefixer)：自动为部分样式规则添加浏览器前缀。
- [Stylelint](https://stylelint.io/)：一个检查和修复 CSS 样式错误的工具。
- [cssnano](https://cssnano.co/)：一个用于压缩 CSS 代码的工具。
- [postcss-import](https://github.com/postcss/postcss-import)：一个用于处理 CSS 中的`@import`规则的插件。它将样式内联以优化加载速度。
- [postcss-preset-env](https://github.com/csstools/postcss-preset-env)：用于将现代 CSS 转为浏览器可以识别的规则的插件。
- [TailwindCSS](https://tailwindcss.com/)：著名的原子化 CSS 框架，它提供了一套预定义的、可组合的类名，用于快速构建自定义的、响应式的用户界面。

## 工作原理：从 CSS 到 AST，再到 CSS

这是一个来自于 PostCSS 文档中的图，展示了整个 PostCSS 的工作流程。

![PostCSS 工作流程](/img/postcss/workflow.png)

大体上，PostCSS 使用 Parser 识别输入的源代码，并且创建一个可以描述源代码结构的对象；随后，PostCSS 将这个对象逐级传递给各个插件，每个插件都可以根据需要调整这个对象；最后，Stringifier 将这个对象重新生成为 CSS 代码。

### Tokenizer

Tokenizer（或称为 Lexer，_“词法分析器”_）在语法解析中扮演了十分重要的角色。它将输入的字符串转换为由标记构成的列表。

例如，考虑下面的 CSS 作为输入

```css
.className { color: #fff }
```

PostCSS 得到的标记列表将是这样的：

```js
[
  ["word", ".className", 1, 1, 1, 10]
  ["space", " "]
  ["{", "{", 1, 12]
  ["space", " "]
  ["word", "color", 1, 14, 1, 18]
  [":", ":", 1, 19]
  ["space", " "]
  ["word", "#FFF" , 1, 21, 1, 23]
  [";", ";", 1, 24]
  ["space", " "]
  ["}", "}", 1, 26]
]
```

对于每一个标记或单词，标记列表中均有一个子列表对其进行了描述。每个子列表的构成为：

```
[标记类型, 标记内容, 行号, 列号, (结束行号, 结束列号)]
```

其中，子列表下标 0 的位置标记了 token 的类型，包括词`word`、空格`space`、冒号`:`等；下标 1 的位置则是 token 本身。对于标记位置，不部分 token 具有不止 1 个字符长度，因此包含额外的下标 4~5 的元素，用于指示 token 结束的位置。

标记化的实现方式和承载 token 的数据结构可以有其他选择，PostCSS 选择了看起来很“脏”的列表式。但事实上，标记化的过程将占据整个语法分析中约 90% 的时间，因此速度和性能至关重要，任何更复杂的高级构造（例如类）都会显著拖慢速度。

::callout{title='扁平化语法结构' icon='FilePenLine'}
事实上，采用扁平结构进行语法分析的项目还有不少，扁平结构意味着不需要进行树形结构复杂的递归操作。用于构造富文本编辑器的 [prosemirror](https://prosemirror.net/)就采用扁平序列存储表示文档内容的数据。依赖于扁平的数据结构可以更方便地实现诸如拆分段落、更改内容样式等操作。
::

### Parser

Parser（解释器）是 PostCSS 中对 CSS 进行语法分析的主要结构，它消费 Tokenizer 输出的 token，并构建 AST 供 PostCSS 的插件在随后进行处理。

### Processor

Processor（处理器）在 PostCSS 中负责初始化插件和执行语法转换。通过每个插件依次处理 AST，最终得到经过转换的树状结构。

### Stringifier

当 PostCSS 完成了语法转换后，经过插件处理得到的新的 AST 需要被转换为字符串并输出为新的 CSS 文件。Stringifier 负责遍历 AST 树，并输出字符串以实现这一最后的步骤。

## 插件：PostCSS 的灵魂

毫无疑问，单独安装的一份 PostCSS 并不能帮助到开发者。PostCSS 的魅力在于它提供了一整套工具和无限的想象力，我们可以编写自己的插件来实现一些有趣或有用的想法。

### 自动生成色板文档

在大型项目中，设计系统的颜色分散在各处。可以编写一个插件，提取所有用到的颜色，并且在 CSS 文件的末尾生成一份注释形式的报告。

**实现思路**：

- 遍历所有声明；
- 如果属性值包含颜色，那么提取颜色的值（通过正则表达式匹配 RGB、HEX 或者 HSL 格式）；
- 收集并统计；
- 在 CSS 文件最后输出注释，列出各颜色及使用次数。

```js
export default postcss.plugin("postcss-palette-doc", () => {
  const paletteMap = new Map();

  const toComment = () => {
    let str = "\n * 色板统计 \n";
    paletteMap.forEach((v, k) => {
      str += ` * ${k}: 使用${v.length}次（${v.join(", ")}）\n`;
    });
    return str;
  };

  return (root) => {
    root.walkRules((rule) => {
      rule.walkDecls((decl) => {
        const matched = decl.value.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\)/gi);
        if (matched && matched.length > 0) {
          matched.forEach((color) => {
            if (!paletteMap.has(color)) {
              paletteMap.set(color, [rule.selector]);
            } else {
              paletteMap.get(color).push(rule.selector);
            }
          });
        }
      });
    });

    const comment = toComment();
    root.append(postcss.comment({ text: comment }));
  };
});
```

### mixin

Mixin 指可以被混入其他声明规则中的 CSS 代码，sass 等预处理器支持使用这种方式进行样式的复用。

**实现思路**：

- 使用`@mixin`定义一个 mixin；
- 使用`@include`调用 mixin；
- 将`@mixin`定义的样式规则插入到`@include`的位置。

```js
export default postcss.plugin("postcss-mixin", (options = {}) => {
  const mixins = new Map()
  return {
    // 对于所有 @~:
    AtRule: {
      // 对于所有 @mixin:
      mixin: (node) => {
        mixins.set(node.params, node.nodes);
        node.remove();
      },
      // 对于所有 @include
      include: (node) => {
        const name = node.params;
        if (mixins.get(name)) {
          node.replaceWith(mixins.get(name));
        }
      }
    }
  };
});
```

### 插件设计准则

PostCSS 的插件开发十分简单，大众对于处理 CSS 的需求又是五花八门的，因此 PostCSS 插件种类繁多，包括既可以被正式用于生产项目的例子（前面已然列举了不少），也包括单纯为了好玩而被创造的（例如[PostCSS Australian Stylesheets](https://github.com/dp-lewis/postcss-australian-stylesheets)）。

对于需要从头开发一个插件的用户来说，有一些需要遵守的准则。

- **Do one thing, and do it well.** PostCSS 要求不创造“多目的性”的插件，而是将多个更小的、目标单一的插件集成为一个插件包。
- 将`postcss`添加到插件的`peerDependencies`中。
- 必须至少使用最新的 node.js LTS 测试插件。
- 在所有场合尽量使用异步方法。例如，使用`fs.readFile`代替`fs.readFileSync`。
- 使用更快的节点扫描方式。例如，如果明确知道要处理的样式规则是属性`color`，那么使用`Declaration: { color: /**/ }`要比调用`walkDeclaration`快得多。
- 使用`node.error`报告错误，使用`result.warn`输出警告。
