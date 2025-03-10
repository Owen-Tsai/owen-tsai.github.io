---
title: TypeScript 类型体操（上）
date: 2025.02.20
---

> TypeScript 的类型系统十分强大并且是图灵完备的。“类型体操”则是建立在这种基础之上，利用 TypeScript 的类型系统来实现一些复杂的工具类型甚至模拟某些算法。

## `keyof`操作符

通常使用`keyof`操作符从对象类型中获取键的字符串或数字字面量联合类型。也可以作用于 class 上，但**只会返回公有属性的键的类型**。

```ts
class User {
  readonly name: string
  private age: number
  protected address: string
  bio: string
}

keyof User // "name" | "bio"
```

使用`T[keyof T]`获得 T 类型下公有属性的键所允许的值的类型。

```ts
class User {
  readonly name: string
  private age: number
  protected address: string
  bio: string
  enable: boolean
}

User[keyof User] // string | boolean，因为`age`是私有的
```

在其他类型上使用`keyof`——例如数组和字符串——都将返回包含该类型 JS 对象的属性在内的联合类型。例如：

```ts
const arr = [1, 2, true]
const readonlyArr = [1, 2, true] as const
const str = 'hello world'

keyof typeof arr // 返回 number | 'includes' | 'concat' | ...
keyof typeof readonlyArr // 返回 '0' | '1' | '2' | 'includes' | 'concat' | ... 
keyof typeof str // 返回 number | 'charAt' | 'indexOf' | ...
```

## 合并类型

使用`&`合并一个类型，取所有被合并类型的并集。如果两个被合并的类型具有相同的键，但是键所对应的值的类型不同，则合并后该键的类型为`never`。

```ts
type T1 = {
  key: string
}

type T2 = {
  key: number
}

T1 & T2 // { key: never }
```

## `extends`的使用

`extends`的第一个用法是对接口 interface 进行扩展。当被扩展的接口与扩展后的接口具有相同的键，但键的类型不一致时，编辑器会直接报告一个类型错误：

```ts
interface T1 {
  key: string
}

interface T2 extends T1 { // throws error: Interface 'T2' incorrectly extends interface 'T1'.
  key: number
}

T2.key // number
```

`extends`更为关键的用法是用于实现条件类型，其用法类似于三元运算。

```ts
type T0 = 'x' extends 'x' | 'y' ? 1 : 2
// T0 = 1

type T1 = 'x' | 'y' extends 'x' ? 1 : 2
// T1 = 2

type T2<G> = G extends 'x' ? 1 : 2
T2<'x' | 'y'> // 1 | 2
```

其中，注意到 T1 和 T2 的结果不一致。这与`extends`的工作原理有关：

- 如果`extends`用于比较两个简单类型，则单纯地判断前面的类型能否分配给后面的类型。
- 如果`extends`前面是一个[裸类型参数（Naked Type Parameter）](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types)，且传入的泛型是联合类型时，则**触发分发机制**。此时依次判断该联合类型中所有子类型能否分配给后面的类型，然后将所有结果合并为一个**联合类型**返回。
- 若要阻止分发机制，可以通过包裹简单的元组类型实现：`type T2<G> = [G] extends ['x'] ? 1 : 2`，此时`T2<'x' | 'y'>`的结果为 2。

### `Exclude`的实现

借助于`extends`的性质，可以理解`Exclude`是如何实现的：

```ts
type Exclude<T, U> = T extends U ? never : T
```

因为`extends`前面的类型`T`是一个联合类型的泛型，因此会依次判断`T`中的子类型是否可以分配给`U`。如果可以则返回`never`过滤掉该类型，从而实现`Exclude`的行为。

### 模板字面量与`extends`

对字符串字面量类型使用`extends`时，需要注意`'ab'`并不是`'aab'`的子类型。`'ab'`是一个字符串字面量，`'aab'`是另一个字符串字面量，前者并不能赋给后者。

```ts
type T1 = 'ab' extends 'aab' ? true : false // expected to be: false
type T2 = 'ab' extends 'ab' | 'aab' ? true : false // true

type T3<S> = S extends `ab${infer R}` ? R : never
T3<'abc'> // 'c'
```

## `as` 的使用

### 重映射

当类型存在歧义时，使用`as`可以进行断言以明确具体的类型。除此之外，`as`还可以在键名中使用以实现键的重映射。

```ts
type User = { name: string; age: number }

type NewUser = {
  // 将键名重新映射为 new_原键名 的形式
  [K in keyof User as `new_${K}`]: User[K]
}
type UpperCaseUser = {
  // 将键名重新映射为大写字母
  [K in keyof User as `${Uppercase<K>}`]: User[K]
}
```

此外，在键名中使用时，还可以通过将某个键重映射为`never`类型来过滤此键。

```ts
type T = {
  onClick: () => void
  onHover: () => void
  id: string
}

type FilterEvents = {
  // 过滤掉不以 on + 字符串为键名的属性
  [K in keyof T as K extends `on${string}` ? K : never ]: T[K]
}
```

### 常量断言

常量断言`as const`可以将变量标记为不可变的字面量，阻止 TypeScript 将值推断为更广泛的类型。`as const`可以被用在：

- 数组后；
- 对象后；
- 返回值后。

```ts
const colorsConst = ["red", "green", "blue"] as const;
// 类型推断为 readonly ["red", "green", "blue"]
const user = {
  name: "Alice",
  age: 25,
} as const;
// 类型为 { readonly name: "Alice"; readonly age: 25 }
function getConfig() {
  return {
    apiUrl: "https://api.example.com",
    timeout: 5000,
  } as const;
}
// 返回类型为 { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }
```

## 类型兼容性

在集合中，如果一个集合 A 的所有元素都存在于集合 B 中，则 A 是 B 的子集。

在 TypeScript 中，类似地，更具体的类型是更宽泛的类型的子类型，即**子类型更具体**。

### 类型分配

更具体的类型可以被分配给更宽泛的类型。

```ts
type T1 = string | number | boolean
type T2 = string | number

let t1: T1
let t2: T2

t1 = t2 // √ 允许
t2 = t1 // × 不允许

interface Animal {
  name: string
}
interface Cat extends Animal {
  sleep: () => void
}

let animal: Animal
let cat: Cat

animal = cat // √ 允许
cat = animal // × 不允许
```

### 协变 Covariance

协变：如果类型`A`是类型`B`的子类型（即`A extends B`），那么泛型类型`G<A>`是`G<B>`的子类型。换句话说，当泛型参数被替换为更具体的类型时，整个泛型类型也变得更具体。

在 TS 中，诸如数组`Array`就是协变的。

```ts
interface Animal {
  name: string
}
interface Cat extends Animal {
  sleep: () => void
}

let animals: Array<Animal>
let cats: Array<Cat>

animals = cats
```

### 逆变 Contravariance

逆变：如果类型`A`是类型`B`的子类型（即`A extends B`），那么泛型类型`G<A>`是`G<B>`的父类型。换句话说，当泛型参数被替换为更具体的类型时，整个泛型类型变得更通用。

在 TS 中，函数参数就是逆变的。

```ts
interface Animal {
  name: string
}
interface Cat extends Animal {
  sleep: () => void
}

type AnimalHandler = (a: Animal) => void
type CatHandler = (c: Cat) => void

let animalHandler: AnimalHandler
let catHandler: CatHandler = (c) => {}

animalHandler = catHandler // × 协变，不允许
catHandler = animalHandler // √ 逆变，允许
```

上面的例子中，`Cat`是`Animal`的子类型，但`AnimalHandler`类型可以被分配给`CatHandler`类型，即`AnimalHandler`是`CatHandler`的子类型。

即：**`Cat`和`Animal`在经过 type Fn<T> = (arg: T) => void 构造后，父子关系发生了逆转**。

此外，我们已知`MouseEvent`是`Event`的子类型。在调用`window.addEventListener('click', (e) => {})`时，`e`是`MouseEvent`类型的。但此时，即便将`e`标注为`Event`类型也不会产生错误。

```ts
interface Event {}
interface MouseEvent extends Event {}

interface EventListener {
  (evt: Event): void
}

interface Window {
  addEventListener: (evt: string, listener: EventListener)
}

window.addEventListener('click', (e: MouseEvent) => {})
// √ 允许
window.addEventListener('click', (e: Event) => {})
```

## `infer`的使用

`infer`用于条件类型的推断，与`extends`一起使用。`infer S`的作用是从某个类型中提取出某个部分的类型，并分配给 S。

例如下面的代码中，从`SomeType`中提取泛型参数，分配给`U`。此时如果`T`是`SomeType<U>`的子类型，则返回`U`，否则返回`never`。

```ts
type Example = T extends SomeType<infer U> ? U : never
```

`infer`的几个常用场景分别是：

- 提取函数返回值的类型；
- 提取数组或元组的元素类型；
- 提取 Promise 的解析值类型；
- 提取对象属性的类型。

```ts
// 提取函数返回值
type ReturnType<T> = T extends (...args: any) => infer S ? S : never

function foo() { return 42 }

ReturnType<typeof foo> // number

// 提取数组元素类型
type ElementType<T> = T extends Array<infer S> ? S : never
// 提取 Promise 的解析值类型
type UnwrapPromise<T> = T extends Promise<infer S> ? S : never
// 提取对象属性的类型
type PropertyType<T, K extends keyof T> = T extends { [k in K]: infer U } ? U : never

PropertyType<{ name: string, age: number }, 'name'> // string
```

### `infer`与逆变

`infer`推导处于**逆变**位置，且分配的泛型变量名称相同时（例如都分配给`S`），推导的结果是**交叉类型**。

```ts
type Foo<T> = T extends {
  propA: (x: infer S) => void
  propB: (x: infer S) => void
} ? S : never

// type T1 = string
type T1 = Foo<{ propA: (x: string) => void, propB: (x: string) => void }>
// type T2 = never
type T2 = Foo<{ propA: (x: string) => void, propB: (x: number) => void }>
```

### `infer`与协变

`infer`推导处于**协变**位置，且分配的泛型变量名称相同时（例如都分配给`S`），推导的结果是**联合类型**。

```ts
type Bar<T> = T extends {
  propA: infer S
  propB: infer S
} ? S : never

// type T1 = string
type T1 = Bar<{ propA: string, propB: string }>
// type T2 = string | number
type T2 = Bar<{ propA: string, propB: number }>
```

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
