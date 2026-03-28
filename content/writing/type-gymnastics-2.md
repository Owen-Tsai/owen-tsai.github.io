---
title: TS Gymnastics 2 - Build Basic Types
date: 2022.07.7
intro: 借助第一篇的基础工具实现一些基本类型，包括部分内置类型和类型体操的常用类型
tags:
  - TypeScript
---

::callout
Previously on [TS Gymnastics](type-gymnastics-1.md).
::

## Built-in Types

利用基础的 TS 类型操作，可以创造某些常用的类型。这些类型也是 TS 类型系统内置的类型。

### `Readonly`

实现起来很简单，利用映射类型将`readonly`添加到所有属性上即可。

```ts
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

### `Exclude`

`Exclude<T, U>`用于从联合类型中`T`排除指定类型`U`。从联合类型中排除类型可以通过在`extends`子句中返回`never`实现，问题的关键是构建`extends`语句。

```ts
type MyExclude<T, U> = T extends U ? never : T
```

此处利用了`extends`的**分发性质**，在[上一篇](type-gymnastics-1.md#条件类型)中已有介绍。

### `Awaited`

`Awaited<T>`用于从`Promise<T>`中提取类型`T`，而提取类型正是`extends`和`infer`组合的常见适用场景。

```ts
type MyAwaited<T extends Promise<any>> = T extends Promise<infer R> ? R : never
```

如果考虑到`infer R`可能是`Promise`类型，需要递归调用`MyAwaited`。

```ts
type MyAwaited<T extends Promise<any>> =
  T extends PromiseLike<infer R>
    ? R extends Promise<any>
      ? MyAwaited<R>
      : R
    : never
```

### `Parameters`和`ReturnType`

`Parameters<T>`用于从函数类型`T`中提取参数的类型，而`ReturnType<T>`用于提取函数`T`的返回值的类型。这两个类型都是从函数中提取类型，依然同上面的问题一样需要使用`extends`和`infer`的组合。事实上，两者的唯一区别就在于`infer`推断的位置不同。

```ts
type MyParameters<T extends (...args: any[]) => any> =
  T extends (...args: infer R) => any ? R : never

type MyReturnType<T extends (...args: any[]) => any> =
  T extends (...args: any[]) => infer R ? R : never
```

值得一提的是，类型推断的结果与**泛型类型签名**有关。观察下面的例子：

```ts
const fn1 = (v: boolean) => v ? 1 : 2
const fn2 = (v: boolean): number => v ? 1 : 2

type P1 = MyReturnType<typeof fn1> // Type: 1 | 2
type P2 = MyReturnType<typeof fn2> // Type: number
```

### `Omit`

`Omit<T, K>`用于从类型`T`中排除指定属性`K`，与`Exclude`的区别在于`Omit`是排除`T`中的属性（键），而`Exclude`是排除联合类型中的类型。

在[上一篇](type-gymnastics-1.md#映射类型)中已经介绍过，通过在键上使用`never`可以排除该属性。

```ts
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}
```

## 常用类型

在复杂的类型体操（本系列不会涉及）中，往往需要封装一组常用的基本类型来实现某些算法。

### `If`

`If<C, T, F>`用于根据条件`C`判断是否返回类型`T`，否则返回类型`F`。

```ts
type If<C extends boolean, T, F> = C extends true ? T : F
```

### 元组转对象

将给定的元组（例如`['a', 'b', 'c']`）转换为对象（`{ a: 'a', b: 'b', c: 'c' }`）。

首先，需要确定输入的泛型元素为元组，且需要能够作为对象的键。

```ts
type TupleToObject<T extends readonly PropertyKey[]> = { /* */ }
```

接下来，需要构造映射类型：

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
  [K in <T中的每个值>]: K
}
```

最后的问题在于如何获取元组中的每个值。在[上一篇](type-gymnastics-1.md#元组类型)中提及，只需要使用`[number]`索引访问即可。

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
  [K in T[number]]: K
}
```

### 获取元组的长度

在前一篇介绍[keyof](type-gymnastics-1.md#keyof类型系统的反射)中提及，如果把数组看成是一个类型，那么`keyof`可以获取到数组的属性，其中也包括`length`。只要读取`length`属性，就能获取元组的长度。

```ts
type Length<T extends readonly any[]> = T['length']
```

### 获取数组的第一个/最后一个元素

这两个工具类型的实现较为相似。这也涉及到**从某个类型中提取一个类型**的操作，因此使用`infer`进行推断是自然而然的。

```ts
type First<T extends any[]> = T extends [infer F, ...infer _] ? F : never
type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never
```

### `Concat`

实现`Concat<T, U>`类型，用于将两个元组`T`和`U`拼接起来。利用扩展运算符即可实现拼接。

```ts
type Concat<T extends readonly any[], U extends readonly any[]> = [...T, ...U]
```

### `Push`和`Unshift`

与`Concat`类似，这两个类型都是在数组中增加元素。唯一的区别就是`U`不是数组，但依然使用扩展运算符实现。

```ts
type Push<T extends any[], U> = [...T, U]
type Unshift<T extends any[], U> = [U, ...T]
```

### `Pop`和`Shift`

这两个类型都是从数组中移除第一个或最后一个元素，需要先[#获取数组的第一个/最后一个元素](#获取数组的第一个最后一个元素)，然后返回`infer`推断的剩余部分。

```ts
type Pop<T extends any[]> = T extends [...infer R, infer _] ? R : []
type Shift<T extends any[]> = T extends [infer _, ...infer R] ? R : []
```

### `Equal`

`Equal<T, U>`用于判断类型`T`和`U`是否严格相等。这是一个非常经典的反直觉案例。它的核心是利用**函数参数的逆变**和条件类型构造的「严格类型等价判断」。在此直接给出实现：

```ts
type IsEqual<T, U> =
	(<G>() => G extends T ? 1 : 2) extends
	(<G>() => G extends U ? 1 : 2)
		? true
		: false
```

#### 错误实现

那么，为什么不能直接使用`T extends U`和`U extends T`来判断类型是否相等呢？考虑以下情况：

```ts
type IncorrectEqual<T, U> = T extends U
  ? U extends T
    ? true
    : false
  : false

// 含有 any
type A = IncorrectEqual<any, 1> // boolean, expected false
// 含有联合类型
type B = IncorrectEqual<1 | 2, 1> // boolean, expected false
```

在继续之前，需要分析一下为什么上面的例子中`A`和`B`会有这样的结果。首先看含有联合类型的`B`。当`T = 1 | 2`时，因为`T`是裸类型参数，所以`T extends U`会触发类型分发。带入分发可得到等价类型：

```ts
(1 extends 1 ? 1 extends 1 ? ...) | (2 extends 1 ? 1 extends 2 ? ...)

// 其中
1 extends 1 // true
2 extends 1 // false

// 合并结果
// true | false
// TS 自动合并为 boolean
```

再看类型`A`。因为`any`可能为任何类型，因此会“分裂”为两个分支分别进行判断。分支 1 中，`1 extends any`为`true`，分支 2 直接返回`false`。因此，同上进行合并后，`A`的类型为`boolean`。

#### 正确实现和原因

那为何使用函数进行比较就能得到正确的结果呢？`IsEqual`的核心是判断`<G>() => G extends T ? 1 : 2`是否为`<G>() => G extends U ? 1 : 2`的子类型。这是含有泛型参数的函数，且函数无参，按照[逆变与协变](./type-gymnastics-1.md#逆变与协变)中的介绍，若要使`<G>() => G extends T ? 1 : 2`为`<G>() => G extends U ? 1 : 2`的子类型，则需要**对于任意类型 G**，都有`(G extends T ? 1 : 2) extends (G extends U ? 1 : 2)`。

不妨进行倒推。T 和 U 要么相等，要么不相等。假设`T ≠ U`，那么必定存在某个 G，使得`G extends T ≠ G extends U`。可以轻松证明。假设`T = U`，那么对于任意 G 都应当有`G extends T = G extends U`。显然，这种情况下等式成立。

综上，判断两个类型是否相等的`Equal`的实现，是建立在泛型函数的全称量化特性之上的。普通的`T extends U`是在判断 T 是否是 U 的子集，而泛型函数的实现版本则是在判断 T 和 U 对于所有可能得输入 G，行为是否一致。

### `Includes`

有了`IsEqual`的实现，就可以在此基础上实现数组的`Includes`类型。需要用到递归类型，依次比较数组`T`中的每个类型是否与`U`相等。

```ts
type IsEqual<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false

type Includes<T extends readonly any[], U> = T extends [infer F, ...infer R]
  ? IsEqual<F, U> extends true
    ? true
    : Includes<R, U>
  : false
```

### 递归展开数组

`Flatten`用于递归展开数组，将嵌套的数组转换为平铺的数组。例如`Flatten<[1, [2, 3], 4, [5, 6]]]>`为`[1, 2, 3, 4, 5, 6]`。

实现方式和`Includes`类似，都是依次观察数组中每个元素是否是嵌套的，并递归地应用`Flatten`类型。

```ts
type Flatten<T extends any[]> = T extends []
  ? []
  : T extends [infer F, ...infer R]
    ? F extends any[]
      ? [...Flatten<F>, ...Flatten<R>]
      : [F, ...Flatten<R>]
    : never
```

需要注意的是，由于`Flatten<[]>`的结果应当为`[]`，且`[] extends [infer F, ...infer R]`的表达式为`false`，所以需要在递归中添加一个判断。

### 递归展开数组 N 次

在`Flatten`的实现中，总是递归地展开数组。现要实现类型`FlattenDepth<T, N>`，使得数组 T 被递归展开 N 层。即：

```ts
type A = FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2> // [1, 2, 3, 4, [5]]. 展开 2 层
type B = FlattenDepth<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, [[5]]]. 展开默认 1 层
```

问题的关键在于如何实现递归次数的累计。显然，N 作为`number`类型，无法像 JS 层面的变量那样直接进行增减操作。但是，在类型系统中，可以操作数组，通过向数组中增加元素的方式来实现递归次数的累计。只需要检查数组的长度是否等于 N 即可。

关键在于何时需要向计数数组`U`中增加元素。自然是需要在递归展开时。为了搞清楚展开发生在哪一步，不妨先观察上面`Flatten`的实现。如果`infer F`推断为`any[]`的子类型，那么需要对`F`进行展开，因此调用`Flatten<F>`的时候就是展开的时候。所以，在`FlattenDepth`的实现中，也应当在展开`F`时向`U`中增加元素。下面的代码中，以高亮行标出此处，向`U`中增加任意元素（此处为 1）。

```ts{8}
// 初始化 U 参数，用于记录递归次数
type FlattenDepth<T extends any[], N extends number = 1, U extends any[] = []>
  // 首先检查是否满足了迭代次数要求
  = U['length'] extends N
    ? T
    : T extends [infer F, ...infer R]
      ? F extends any[]
        ? [...FlattenDepth<F, N, [...U, 1]>, ...FlattenDepth<R, N, U>]
        : [F, ...FlattenDepth<R, N, U>]
      : T
 ```
