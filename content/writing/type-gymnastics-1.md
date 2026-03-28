---
title: TS Gymnastics 1 - Upfront Basics
date: 2022.02.12
intro: TS 的类型系统本质上可以被看做一门图灵完备的编译期语言
tags:
  - TypeScript
---

TS 的类型系统十分完备，本质上可以看做是一门[图灵完备](https://en.wikipedia.org/wiki/Turing_completeness)的编译期语言。而「类型体操 Type Gymnastics」指利用 TS 中的类型系统进行各类复杂操作甚至实现部分算法的技巧。

在基础篇中，将回顾 TS 类型系统的一些基本类型和行为。

## `never`与`{}`

`never`表示不存在的类型，是所有类型的子类型。利用 never 在类型层面的“空”特性，可以实现类型的筛选和排除。

```ts
function foo(x: string | number) {
  if (typeof x === 'string') return
  if (typeof x === 'number') return
  x // never（不可达分支）
}
```

但是，`{}`并非表示空类型，而是**所有非`null`/`undefined`的类型**。换言之，有下列类型结果：

```ts
type A = string extends {} ? true : false      // true
type B = number extends {} ? true : false      // true
type C = {} extends {} ? true : false          // true
type D = null extends {} ? true : false        // false
type E = undefined extends {} ? true : false   // false
```

## `keyof`：类型系统的「反射」

`keyof`经常被用于获取对象类中键的字面量联合类型，例如：

```ts
type T = {
  name: string
  age: number
}
// keyof T: 'name' | 'age'
```

`keyof`也可以被使用在类上，且**只会返回公有属性的键的类型**。

```ts
class User {
  readonly name: string
  private age: number
  protected address: string
  bio: string
}

// keyof User: "name" | "bio"
```

在其他类型上使用`keyof`，通常返回该类型索引签名和原型方法与属性的字面量。

```ts
keyof any[] // number | 'length' | 'toString' | 'push' | 'pop' | ...
keyof [string, number] // '0' | '1' | 'length' | 'push' | ...
keyof string // number | 'length' | 'charAt' | 'substring' | ...
keyof '字符串字面量' // 同 keyof string
```

这是因为，对于数组、字符串等类型，在 TS 里有如下的类型签名：

```ts
interface Array<T> {
  [index: number]: T
  length: number
  push(...items: T[]): number
  ...
}

interface String {
  readonly length: number
  charAt(pos: number): string
  substring(start: number, end?: number): string
  ...
}
```

遵循同样的规则，`keyof any`为`string | number | symbol`，因为任意键都可以是字符串、数字或 symbol 类型。

## 联合类型与交叉类型

联合类型`|`表示值可以是多种类型中的一种；交叉类型`&`表示值必须同时满足多个类型。这两个操作符是组合类型的基本方式。

```ts
type A = { key: string }
type B = { key: number }

A | B // { key: string } | { key: number }
A & B // never
```

## 条件类型

条件类型以类似三目表达式的形式，根据类型关系进行分支选择以决定最终的类型，能够实现类型系统中的`if-else`逻辑。

使用`extends`来实现条件类型，常用于类型过滤和类型分发。

::callout{title='分发与防止分发'}
当`T`是**裸类型参数**时，`T extends U`会判断构成`T`的每一个子类型是否满足`extends U`子句。需要防止这种分发时，可以将`T`包裹在元组中。

**裸类型参数**：指在泛型中未被包裹（即没有被如`Array<T>`、`[T]`、`Promise<T>`等类型修饰）的裸露的类型参数。
::

```ts
// 类型过滤，从联合类型中提取字符串类型
type ExtractString<T> = T extends string ? T : never
type A = ExtractString<string | number> // string

// 类型分发，当 T 是联合类型时，条件类型会分配给每个子类型
type ToArray<T> = T extends any ? T[] : never
type B = ToArray<string | number> // string[] | number[]
// 防止分发，将 T 包裹在元组中，避免条件类型分配给每个子类型
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type C = ToArrayNonDist<string | number> // (string | number)[]
```

## 类型推断`infer`

如果说`extends`实现了类型系统中的条件分支，那么`infer`就相当于结构赋值。`infer`只能在`extends`的字句中使用，它声明一个待推断的变量类型，并让类型系统自动推导出具体的类型赋给它。

`infer`常用于**提取函数、数组、Promise 等复杂类型的内部组成部分**，**实现模式匹配**（如取得函数返回值类型或取得元组的首个元素的类型）和实现类型系统中的**递归解构**。

```ts
// 推断函数 T 返回值的类型是 R，从而提取 R 的类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
// 推断数组 T 中的第一个元素的类型是 R，从而提取 R 的类型
type First<T> = T extends (infer R)[] ? R : never
// 推断 T 的类型是返回 R 的 Promise，从而提取 R 的类型
type UnwrapPromise<T> = T extends Promise<infer R> ? R : never
// 推断数组 T 的类型是 R 的数组，如果是则递归进行展开
type DeepFlatten<T> = T extends (infer R)[] ? DeepFlatten<R> : T
```

此外，一个语句中可以包含多次`infer`，用于分别提取多个类型。

```ts
// 推断函数 T 的参数类型是 R，返回值类型是 U，从而提取 R 和 U 的类型到一个元组中
type ExtractToTuple<T> = T extends (arg: infer R) => infer U ? [R, U] : never

type FuncParseInt = (arg: string) => number
type Result = ExtractToTuple<FuncParseInt>  // [string, number]
type FuncToString = (arg: boolean | number) => string
type Result2 = ExtractToTuple<FuncToString>  // [boolean | number, string]
```

## 映射类型

映射类型通过遍历键的联合类型，来生成新的类型，常用于**对于已有的属性进行批量转换**。

例如，批量修改属性：

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
type Partial<T> = {
  [P in keyof T]?: T[P]
}
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

或者，结合`as`子句，可以根据原有键名和属性值决定新键名，甚至返回`never`来删除属性。

```ts
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}
type Person = { name: string; age: number }
type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }

type Filter<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}
type Filtered = Filter<Person>
// { name: string }
```

## 元组类型

元组类型（Tuple）是数组类型的一种特化形式，它表示一个固定长度且每个位置元素类型已知的数组。与普通数组`T[]`不同，元组类型明确规定了每一索引处的类型，以及整体的长度。

```ts
// 普通数组：长度可变，所有元素类型相同
const arr: number[] = [1, 2, 3]

// 元组：长度固定，每个位置类型可不同
const tuple: [string, number, boolean] = ['hello', 42, true]
```

元组在 TypeScript 类型系统中扮演着“定长列表”的角色，是许多高级类型操作的基石。元组常用来表示坐标`[x, y]`、颜色`[r, g, b]`等结构固定的数据，且可以与下面的`as const`结合获得精确字面量类型。

与数组类型一样，通过`T[number]`可以获取元组中每个位置的类型，获取到的往往是一个联合类型。

```ts
const tuple = ['hello', 42, true]
type TupleElement = (typeof tuple)[number] // Type: string | number | boolean
const tuple = ['hello', 42, true] as const
type TupleElement = (typeof tuple)[number] // Type: "hello" | 42 | true
```

## `as`与`as const`

前文使用到`as`子句。除了常见的断言类型之外，还能用于改变映射类型中的键。

`as const`是一个特别的语句，可以用来将类型推断**缩窄到最明确的类型**；当用在对象或数组上时，可以**防止对象的属性或数组被修改**。

```ts
const status = "success" // Type: string
const literalStatus = "success" as const // Type: "success"

const routes = ['home', 'about', 'contact'] as const
type Routes = (typeof routes)[number] // Type: "home" | "about" | "contact"
routes.push('blog') // Error

const person = { name: 'Owen', age: 30 } as const
type Person = typeof person // Type: { name: "Owen"; age: 30 }
person.name = 'John' // Error
```

常见的使用方式是在项目中替代`enum`，例如：

```ts
const status = {
  SUCCESS: 'success',
  FAIL: 'fail',
} as const

type Status = typeof status[keyof typeof status]  // Type: "success" | "fail"
```

另一个常见的应用场景是在需要从值中提取类型，例如：

```ts
const routes = [
  { path: '/user/:id' },
  { path: '/biz/:app' }
] as const

type Route = typeof routes[number]
type Path = Route['path']

type ExtractParam<T> =
  T extends `${string}:${infer P}` ? P : never

type Param = ExtractParam<Path> // Type: "id" | "app"

// 在函数中，相对于使用`string`，使用更窄的`Param`类型
function parseParam(param: Param) {
  // ...
}
```

## 模板字面量类型

模板字面量类型（Template Literal Types）允许在类型层面拼接字符串。可以通过拼接的方式实现类型分发或映射。

```ts
type A = `${'a' | 'b'}_${1 | 2}`
// "a_1" | "a_2" | "b_1" | "b_2"

type Person = {
  name: string
  age: number
}
type PersonGetter = {
  [P in keyof Person as `get${Capitalize<string & P>}`]: () => Person[P]
}
// { getName: () => string; getAge: () => number }
```

结合内置类型和`infer`又可分别实现字符串的转和子串的提取。

```ts
// 结合`infer`，实现路由参数的提取
type ParseRoute<Route extends string> = 
  Route extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ParseRoute<Rest>
    : Route extends `${infer _Start}:${infer Param}`
    ? Param
    : never

type RouteParams = ParseRoute<"/user/:id/post/:postId"> // "id" | "postId"
```

## 递归类型

在类型定义中引用自身，称为递归类型。TypeScript 的类型系统具有图灵完备性，通过递归类型可以处理嵌套结构并模拟循环和递归算法。

常见的使用递归类型的场景是需要深度操作对象的时候，例如将深层对象中的每个属性进行修改。利用递归类型也能构建复杂的条件类型。

```ts
// 尾递归版本的字符串替换
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string,
  Result extends string = ''
> = S extends `${infer Head}${From}${infer Tail}`
  ? ReplaceAll<Tail, From, To, `${Result}${Head}${To}`>
  : `${Result}${S}`;
```

## 逆变与协变

协变与逆变是类型系统中的概念和性质，并非实际的语法。逆变与协变用来描述复杂类型（如函数、数组）在子类型关系中的变化方向。简单来说：

- **协变（Covariant）**：如果`A`是`B`的子类型，那么`Complex<A>`是`Complex<B>`的子类型。
- **逆变（Contravariant）**：如果`A`是`B`的子类型，那么`Complex<B>`是`Complex<A>`的子类型。
- **不变（Invariant）**：`Complex<A>`和`Complex<B>`之间没有子类型关系。

在 TypeScript 中，对象属性、数组、返回类型是协变的，函数参数类型是逆变的（严格模式下，`--strictFunctionTypes`启用）。

```ts
// 协变示例：返回值类型
type GetNumber = () => number;
type GetAny = () => any;
let getNumber: GetNumber = () => 1;
let getAny: GetAny = getNumber; // 安全，因为 number 是 any 的子类型
// GetNumber extends GetAny 是 true

// 逆变示例：参数类型
type HandleString = (x: string) => void;
type HandleUnion = (x: string | number) => void;
let handleUnion: HandleUnion = (x) => console.log(x);
let handleString: HandleString = handleUnion; // 安全？在严格函数类型下是允许的
// 因为参数是逆变：string | number 是 string 的超类型，所以 HandleUnion 是 HandleString 的子类型
// HandleUnion extends HandleString 是 true
```

以上是具体的函数类型。下面假设函数类型带有参数，因而无法直接判断的情况。

```ts
type A = <T>() => T[]
type B = <T>() => Array<T>
let a: A = () => []
let b: B = () => []
a = b // ? 是否可以安全赋值
// B extends A 吗？
```

在存在泛型参数的情况下，TS 会进行**全称量化**，即将`T`假设为任意类型，即对于**所有的类型 T 均必须满足 B<T> 可以被赋给 A<T>**。在这个例子中，显然将任意类型带入 T 均可满足条件，所以赋值的安全的，`B extends A`的结果为`true`。

## 扩展运算符

TS 的类型系统中也可以使用扩展运算符`...`，帮助分发类型到具体的泛型参数。可以作用于数组中的任意位置。

借助于扩展运算符，可以很方便地获取数组的第一个或最后一个元素，并在类型层面实现诸如`concat`、`push`等方法。

```ts
// 返回第一个元素
type FirstEl<T> = T extends [infer S, ...any] ? S : never
// 合并数组
type Concat<T1 extends any[], T2 extends any> = [...T1, ...T2]
// 从数组中移除最后一个元素
type Pop<T> = T extends [...infer S, any] ? S : []
```

从只读数组中提取元素时使用扩展运算符进行分发，可以用于去除数组的`readonly`：

```ts
const arr = [1, 2, 'hello'] as const
type Writable<T extends readonly any[]> = T extends readonly [...infer U] ? [...U] : T

Writable<typeof arr> // [1, 2, 'hello']
```

## Warm Up：实现`Pick`类型

`Pick<T, K>`类型用于从对象类型`T`中剔除`K`以外的属性，返回一个新的对象类型。

```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoTitle = Pick<Todo, 'title'>
// { title: string }
type TodoLite = Pick<Todo, 'title' | 'completed'>
// { title: string; completed: boolean }
type ErrorCase = Pick<Todo, 'title' | 'invalid'>
// 错误
```

可以看到：

- `K`类型应当是`T`中的属性名，通过为泛型参数`K`增加约束实现；
- 返回的类型中，只有`K`中指定的属性，因此需要使用`[P in K]`来映射`K`中的属性名；
- 最终需要将`T`中对应属性的类型映射到新的对象类型中。

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```