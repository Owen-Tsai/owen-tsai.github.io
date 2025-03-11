---
title: TypeScript 类型体操（下）
date: 2025.03.01
---

::Box
续：[TypeScript 类型体操（上）](./type-gymnasium-1.md)
::


几个我认为有趣的 TS 类型体操姿势：

## 递归

在 TS 的类型系统中，需要对元组中每个类型进行遍历处理时，往往要依靠递归的方式实现。

```ts
type Flatten<T> = T extends []
  ? [] 
  : T extends [infer First, ...infer Rest]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [T]
```

类似地，如果需要对字符串中的每一个字符进行处理：

```ts
type StrintToUnion<T extends string> = T extends `${infer Letter}${infer Rest}`
  ? Letter | StrintToUnion<Rest>
  : never
```

## 元组转对象

[原题地址](https://tsch.js.org/11/zh-CN)

对数组类型，使用索引访问`T[number]`将得到数组中所有元素构成的联合类型。

```ts
const arr = [1, 2, '3', true]
type T = (typeof arr)[number] // string | number | boolean
```

使用`as const`修饰数组时，将：

- 数组中个元素的类型不会被扩展。即类型`1`不会被扩展为类型`number`，类型`true`也不会被扩展为类型`boolean`；
- 对象字面量获得只读属性；
- 数组变为只读元组，即`[1, '3', true] as const`会变为`readonly [1, '3', true]`。

此时，使用`T[number]`索引访问，将得到一个包含只读元组中所有字面量构成的类型。

```ts
const arr = [1, 2, '3', true] as const
type T = (typeof arr)[number] // 1 | 2 | '3' | true
```

利用这个特性，可以将元组转为对象：

```ts
type TupleToObject<T extends readonly any[]> = {
  [K in T[number]]: K
}

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
```

## 获取数组的第一个元素

TS 中也可以利用扩展运算符，“解构”数组类型。配合`infer`可以实现推断。

```ts
type First<T> = T extends [infer S, ...any] ? S : never
```

## 实现数组的`includes`方法

在类型系统中实现`includes`方法需要判断两个类型是否严格相等，方法如下：

```ts
type IsEqual<T, U> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2)
    ? true
    : false
```

这也是[type-fest](https://github.com/sindresorhus/type-fest/blob/main/source/is-equal.d.ts)等 TS 类型工具库的实现方式。

然后，通过递归的方式实现`Includes`：

```ts
type Includes<T extends any[], U> =
  IsEqual<T[0], U> extends true
    ? true
    : U extends [T[0], ...infer Rest]
      ? Includes<Rest, U>
      : false
```

## 可串联构造器

[原题地址](https://tsch.js.org/12/zh-CN)

`Chainable`类型允许串联，则意味着`option`方法必须返回一个`Chainable`类型；此外，最后返回的类型需要是经过串联之后完整的对象字面量，因此在若干次的`option`调用时，应当将最终返回的类型透传给下一次调用。可以利用泛型达到这一效果。

```ts
// 定义 T 为最终返回的对象字面量，并标识其为可选泛型参数
type Chainable<T = {}> = {
  option: <K extends string, V>(
    key: K extends keyof T ? never : K,
    val: V
  ) => Chainable<Omit<T, K> & Record<K, V>>
  get: () => T
}
```

## Trim 和 Replace

对于类型`Trim<T>`，希望移除字符串收尾两端的空格，可以将空格声明为一个类型，结合模板和推导：

```ts
type Space = ' '
// 移除字符串首的空格
type TrimLeft<T extends string> = T extends `${Space}${infer R}` ? Trim<R> : T
// 移除字符串两端的空格
type Trim<T extends string> =
  T extends `${Space}${infer R}`
    ? Trim<R>
    : T extends `${infer L}${Space}`
      ? Trim<L>
      : T
```

类似地，可以实现`Replace`和`ReplaceAll`：

```ts
type Replace<T extends string, From extends string, To extends string> = 
  From extends ''
    ? T
    : T extends `${infer L}${From}${infer R}`
      ? `${L}${To}${R}`
      : T

type ReplaceAll<T extends string, From extends string, To extends string> =
  From extends ''
    ? T
    : T extends `${infer L}${From}${infer R}`
      ? `${L}${To}${ReplaceAll<R, From, To>}`
      : T
```

## 增加函数参数

对于一个函数`Fn`，增加参数`A`到其参数的最后。

[原题链接](https://dev.to/macsikora/advanced-typescript-exercises-question-4-495c)

```ts
type AppendArgument<Fn extends (...args: any) => any, A> =
  Fn extends (...args: [...infer Args]) => infer R
    ? (...args: [...Args, x: A]) => R
    : false
```

## 求字符串的长度

对于元组类型，使用`T['length']`可以获取元组的长度。但是对于字符串类型，`S['length']`的返回结果是`number`类型，而非字符串本身的长度。

可以使用递归的方式将字符串转为数组，然后获取数组的长度。

```ts
type StringToArray<S extends string> = S extends `${infer L}${infer R}`? [L, ...StringToArray<R>] : []
type LengthOfString<S extends string> = StringToArray<S>['length']
```

## KebabCase

参考对字符串的字符遍历处理：

```ts
type KebabCase<S extends string> = S extends `${infer L}${infer R}`
  ? R extends Uncapitalize<R>
    ? `${Uncapitalize<L>}${KebabCase<R>}`
    : `${Uncapitalize<L>}-${KebabCase<R>}`
  : S

type Case1 = KebabCase<'fooBarBaz'>
```

- 首先，`infer L`匹配第一个字符`f`，`infer R`匹配剩余子串`ooBarBaz`。显然`ooBarBaz`与`Uncapitalize<'ooBarBaz'>`相同，因此不进行处理，递归地对`R`子串分配`KebabCase`类型；
- 在第二次类型分配时，`infer L`匹配`o`，`infer R`子串为`oBarBaz`。以此类推。
- 当下一次递归分配类型时，`infer L`匹配`o`，`infer R`为`BarBaz`。此时显然`R extends Uncapitalize<R>`应当进入 falsy 的分支，因此在`o`与`BarBaz`之间插入连字符。
- 在下一次递归时，`infer L`为`B`，大写字母被处理为小写。`R`子串依照上面的规则进行下一步处理。
- 最后，当递归调用至`KebabCase<''>`时，已经不满足`${infer L}${infer R}`的类型推断，因此返回`S`，递归终止。

## 任一真值的检测

[原题地址](https://tsch.js.org/949/zh-CN)

通过索引访问`T[number]`，可以获得泛型参数中所有数组元素组成的联合类型：

```ts
type Members<T> = T[number]
type A = Members<[1, '2', false, [3], { 4: '5' }]>
// false | 1 | [3] | { 4: "5" } | "2"
```

结合[`extends`的规则](./type-gymnasium-1.md#extends的使用)，当`extends`前面是一个泛型，且传入的泛型是联合类型时，则依次判断该联合类型中所有子类型能否分配给后面的类型。**如果联合类型中所有子类型都可以被分配给的类型**才视为真。

因此：

```ts
type FalsyType = 0 | '' | false | [] | {[key: string]: never} | null | undefined
type AnyOf<T extends readonly any[]> = T[number] extends FalsyType ? false : true
```

## 判断是否是某一类型

### `IsNever`

首先需要明确`never`类型的特殊性。

- **所有类型的子类型**：`never`可以被分配给任何类型；
- **没有实例**：没有属于`never`类型的值。

其次，单纯地依靠`T extends never`无法判断一个类型是否是`never`。回忆[`extends`的规则](./type-gymnasium-1.md#extends的使用)，当`T extends never`时，泛型参数`T`触发分发机制，在分发时发现`never`是空的联合类型无法被拆解，因而直接返回`never`。

因此，依靠将`T`包裹的方式，可以实现判断`T`是否是`never`:

```ts
type IsNever<T> = [T] extends [never] ? true : false
```

### `IsUnion`

比较一个类型是否是联合类型的基本方式也是通过`extends`的分发机制实现。通过`T extends any`可以强制触发分发机制。此时如果`T`是联合类型，则会对`T`中的每一个子类型进行逐个处理。

如果`T`是联合类型，则意味着分发机制中，`T`不可以被赋给`T`的子类型。我们引入一个泛型`U`，使其等于原联合类型。

```ts
type IsUnion<T, U = T> = 
  // 处理 never 的特殊情况
  [T] extends [never] ? false :
  // 触发分发机制
  T extends any ?
    // 比较原始类型 U 和当前分发成员 T
    [U] extends [T] ? false : true
  : never;
```

### `IsTuple`

元组包含特殊的性质。比较以下 A~F 各类型的`length`属性：

```ts
type A = []
type B = [number]
type C = [number, string]
type D = [1, 2]
const e = [1, 'hello'] as const
type F = number[]

type T1 = A['length'] // 0
type T2 = B['length'] // 1
type T3 = C['length'] // 2
type T4 = D['length'] // 2
type T5 = typeof e['length'] // 2
type T5 = F['length'] // number
```

不难发现：

- 元组类型的`length`值即为构成元组的类型个数；
- 数组类型的`length`值是`number`。

因此，可以通过`number extends T['length']`完成判断。

```ts
type IsTuple<T> = [T] extends [never] ? false :
  T extends readonly any[]
    ? number extends T['length']
      ? false
      : true
    : false
```

### 是字符串字面量类型

已知`Record<K, V>`的特殊性质：

- 当`K`是一个无限集时，例如`Record<string, any>`中`K`为`string`，此时所有的键都是可选的。这也是为什么声明`const obj: Record<string, unknown> = {}`时可以赋予空对象；
- 当`K`是一个有限集时，例如`Record<'a' | 'b', any>`，此时所有的键都**需要**出现。这就是为什么`const obj: Record<'name' | 'age', any> = {}`会报告一个错误。

利用这条性质，可以通过`{} extends Record<S, any>`的方式判断`S`是否是有限集：

```ts
type IsFixedStringLiteralType<S extends string> = {} extends Record<S, 1>
  ? false
  : Equal<[S], S extends unknown ? [S] : never>
```

