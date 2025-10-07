import type P5 from 'p5'

type BoundingBox = {
  x: number
  y: number
  x2: number
  y2: number
  width: number
  height: number
  center?: P5.Vector
  boxes?: BoundingBox[]
}

export const useHero = () => {
  const { $p5 } = useNuxtApp()

  const borderPercentage = computed(() => (isMobile.value ? 0.1 : 0.25))

  const isDistorted = ref(false)
  const isMounted = useMounted()

  const sketch = (p: P5) => {
    let font: P5.Font, font2: P5.Font
    let mouse: Mouse
    let time = 0
    let lastTickTime = 0
    let textBox: TextBox

    const texts = ['PLEASE HAVE/A LOOK AT/MY RESUME']

    const LERP_FACTOR = 0.1
    const DISTORTION_RESOLUTION = 0.002 // 噪声分辨率（控制噪声粒度）
    const DISTORTION_STRENGTH = 0.1 // 扭曲强度（画布尺寸的百分比）
    // const BORDER_PERCENTAGE = 0.25
    const LINE_HEIGHT = 0.75 // 并非行高，而是行高的比例，此处取文字大小的75%
    const TEXT_SIZE = 100

    const createText = () => {
      const text = texts[0]

      textBox = new TextBox(p.width / 2, p.height / 2, TEXT_SIZE, text!, font)
    }

    // p.preload = () => {
    //   font = p.loadFont('/ruigslay.ttf')
    //   font2 = p.loadFont('/montserrat.ttf')
    // }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
      textBox.placeOnCanvas()
      textBox.restore()
    }

    p.setup = async () => {
      font = await p.loadFont('/ruigslay.ttf')
      font2 = await p.loadFont('/montserrat.ttf')
      p.createCanvas(p.windowWidth, p.windowHeight)
      mouse = new Mouse(p.max(p.floor(p.height / 4), 180))
      createText()
      // lastTickTime = p.millis()
      p.blendMode(p.DIFFERENCE)
    }

    p.draw = () => {
      p.clear()
      p.fill('#cdd5df')
      p.stroke('#cdd5df')
      mouse.update()
      textBox.draw()

      p.textSize(isMobile.value ? 12 : 14)
      ;(p as any).textFont(font2, {
        fontVariationSettings: '"wght" 400',
      })

      if (isMobile.value) {
        p.text('Tap for random distortion', textBox.boundingBox.x, textBox.boundingBox.y - 20)
      } else {
        p.text(
          'Hover over or press D to distort',
          textBox.boundingBox.x + 4,
          textBox.boundingBox.y - 20
        )
        const t = 'Press R to restore so that you know to read my resume'
        p.text(t, textBox.boundingBox.x2 - p.textWidth(t), textBox.boundingBox.y2 + 30)
      }

      time += 0.01
      if (p.millis() - lastTickTime > 2000 && isDistorted.value && isMobile.value) {
        lastTickTime = p.millis()
        textBox.restore()
      }
    }

    p.keyReleased = () => {
      if (isMobile.value) {
        return
      }
      if (p.key === 'r' || p.key === 'R') {
        textBox.restore()
        isDistorted.value = false
      }
      if (p.key === 'd' || p.key === 'D') {
        textBox.randomDistort()
        isDistorted.value = true
      }
    }

    p.mouseClicked = () => {
      if (isMobile.value) {
        textBox.randomDistort()
        isDistorted.value = true
        lastTickTime = p.millis()
      }
    }

    class Mouse {
      // 当前鼠标位置
      pos: P5.Vector
      // 鼠标移动速度
      vel: P5.Vector
      // 鼠标作用范围
      radius: number
      radiusSquared: number

      constructor(radius: number) {
        this.pos = p.createVector(0, 0)
        this.vel = p.createVector(0, 0)
        this.radius = radius
        this.radiusSquared = radius * radius
      }

      update() {
        if (isMobile.value) {
          return
        }
        // 速度 = 当前位置 - 上一帧位置
        this.vel.set(p.mouseX - this.pos.x, p.mouseY - this.pos.y)
        this.pos.set(p.mouseX, p.mouseY)
      }
    }

    class Point {
      currentPosition: P5.Vector
      targetPosition: P5.Vector
      originalPosition: P5.Vector

      constructor(pos: P5.Vector) {
        this.currentPosition = pos.copy()
        this.targetPosition = pos.copy()
        this.originalPosition = pos.copy()
      }

      update() {
        if (Math.abs(mouse.vel.x) > 300 || Math.abs(mouse.vel.y) > 300) {
          return
        }
        const dx = this.currentPosition.x - mouse.pos.x
        const dy = this.currentPosition.y - mouse.pos.y
        const distanceSquared = dx * dx + dy * dy

        if (distanceSquared < mouse.radiusSquared) {
          const distance = p.sqrt(distanceSquared)
          // 按照距离鼠标的远近程度赋予扭曲力度因子
          const factor = p.map(distance, 0, mouse.radius, 0.3, 0)
          // 根据鼠标速度添加位移
          this.targetPosition.x += mouse.vel.x * factor
          this.targetPosition.y += mouse.vel.y * factor
          // 标记为扭曲状态
          // isDistorted.value = true
        }

        // 使用线性插值平滑移动到目标位置
        this.currentPosition.x = p.lerp(this.currentPosition.x, this.targetPosition.x, LERP_FACTOR)
        this.currentPosition.y = p.lerp(this.currentPosition.y, this.targetPosition.y, LERP_FACTOR)
      }

      restore() {
        this.targetPosition.set(this.originalPosition)
        // isDistorted.value = false
      }

      randomDistort() {
        const angle = p.map(
          p.noise(
            this.originalPosition.x * DISTORTION_RESOLUTION,
            this.originalPosition.y * DISTORTION_RESOLUTION,
            time
          ),
          0,
          1,
          -p.TWO_PI,
          p.TWO_PI
        )

        const strength = p.min(p.width, p.height) * DISTORTION_STRENGTH
        // 根据角度生成方向向量
        const randomVector = $p5.Vector.fromAngle(angle).mult(strength)

        // 应用随机向量到目标位置
        this.targetPosition.set(
          this.originalPosition.x + randomVector.x,
          this.originalPosition.y + randomVector.y
        )
      }

      translate(vector: P5.Vector) {
        this.currentPosition.add(vector)
        this.targetPosition.add(vector)
        this.originalPosition.add(vector)
      }

      scale(factor: number) {
        this.currentPosition.mult(factor)
        this.targetPosition.mult(factor)
        this.originalPosition.mult(factor)
      }

      setX(x: number) {
        this.currentPosition.set(x, this.originalPosition.y)
        this.targetPosition.set(x, this.originalPosition.y)
        this.originalPosition.set(x, this.originalPosition.y)
      }

      drawVertex() {
        p.vertex(this.currentPosition.x, this.currentPosition.y)
      }
    }

    class Path {
      points: Point[] = []

      constructor(points: P5.Vector[]) {
        this.points = points.map((point) => new Point(point))
      }

      draw() {
        this.points.forEach((point) => point.drawVertex())
      }
    }

    // 单个字符的形状。单个字符可能包含多个 Path
    class Shape {
      paths: Path[] = []
      points: Point[] = []
      boundingBox: BoundingBox

      constructor(points: P5.Vector[]) {
        this.paths = this.orgnizePaths(points)
        this.points = this.getAllPoints()
        this.boundingBox = this.getBoundingBox()
      }

      orgnizePaths(points: P5.Vector[]) {
        const paths: Path[] = []
        let currentPath = [p.createVector(points[0]!.x, points[0]!.y)]

        for (let i = 1; i < points.length; i++) {
          const prevPoint = p.createVector(points[i - 1]!.x, points[i - 1]!.y)
          const currPoint = p.createVector(points[i]!.x, points[i]!.y)
          const distance = $p5.Vector.sub(currPoint, prevPoint).mag()
          // 距离过大则表示应当开启一个新的路径（字符中断开的部分）
          if (distance > 5) {
            paths.push(new Path(currentPath))
            currentPath = []
          }

          currentPath.push(currPoint)
        }

        paths.push(new Path(currentPath))
        return paths
      }

      getAllPoints() {
        return this.paths.flatMap((path) => path.points)
      }

      getBoundingBox() {
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        this.points.forEach((point) => {
          const x = point.originalPosition.x
          const y = point.originalPosition.y
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        })

        return {
          x: minX,
          y: minY,
          x2: maxX,
          y2: maxY,
          width: maxX - minX,
          height: maxY - minY,
        }
      }

      translate(vector: P5.Vector) {
        this.points.forEach((point) => point.translate(vector))
        this.boundingBox.x += vector.x
        this.boundingBox.y += vector.y
        this.boundingBox.x2 += vector.x
        this.boundingBox.y2 += vector.y
      }

      draw() {
        p.beginShape()

        this.paths.forEach((path, i) => {
          // 如果是第二个及以后的路径，开始轮廓（用于镂空效果）
          if (i !== 0) p.beginContour()
          path.draw()
          // 结束轮廓
          if (i !== 0) p.endContour()
        })

        p.endShape(p.CLOSE)
      }
    }

    // 单行字符。一行字符包含多个 Shape
    class TextLine {
      x: number
      y: number
      size: number
      text: string
      font: P5.Font
      shapes: Shape[]
      points: Point[]
      boundingBox: BoundingBox
      isReferenceLine: boolean

      constructor(x: number, y: number, size: number, text: string, font: P5.Font) {
        this.x = x
        this.y = y
        this.size = size
        this.text = text
        this.font = font
        this.isReferenceLine = false

        this.shapes = this.textToShapes()
        this.points = this.getAllPoints()
        this.boundingBox = this.getBoundingBox()
      }

      textToShapes() {
        p.textSize(this.size)
        p.textFont(this.font)

        const shapes: Shape[] = []
        let currX = this.x

        // 遍历文本中的每个字符
        for (let i = 0; i < this.text.length; i++) {
          const char = this.text.charAt(i)

          // 手动字距调整（特殊字符处理）
          if (char === '<') {
            currX -= this.size * 0.02 // 左移（紧缩字距）
          } else if (char === '>') {
            currX += this.size * 0.02 // 右移（扩大字距）
          } else if (char !== ' ') {
            // 忽略空格
            // 将字符转换为点集
            const points = this.font.textToPoints(char, currX, this.y, this.size, {
              sampleFactor: 0.9, // 采样因子（控制点密度）
              simplifyThreshold: 0.0, // 简化阈值（0表示不简化）
            })

            // 创建形状对象
            shapes.push(new Shape(points))

            // 移动到下一个字符位置（考虑字宽）
            currX += p.textWidth(char) // 95%字宽（轻微重叠）
          } else {
            // 空格：只移动位置不创建形状
            currX += p.textWidth(' ')
          }
        }

        return shapes
      }

      getAllPoints() {
        return this.shapes.flatMap((shape) => shape.paths.flatMap((path) => path.points))
      }

      getBoundingBox() {
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        this.points.forEach((point) => {
          const x = point.originalPosition.x
          const y = point.originalPosition.y
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        })

        return {
          x: minX,
          y: minY,
          x2: maxX,
          y2: maxY,
          width: maxX - minX,
          height: maxY - minY,
        }
      }

      setWidth(referenceBox: BoundingBox) {
        this.points.forEach((point) => {
          const newX = p.map(
            point.originalPosition.x,
            this.boundingBox.x,
            this.boundingBox.x2,
            this.boundingBox.x,
            referenceBox.x2
          )
          point.setX(newX)
        })
      }

      translate(vector: P5.Vector) {
        this.boundingBox.x += vector.x
        this.boundingBox.y += vector.y
        this.boundingBox.x2 += vector.x
        this.boundingBox.y2 += vector.y
      }

      scale(factor: number) {
        this.boundingBox.x *= factor
        this.boundingBox.y *= factor
        this.boundingBox.x2 *= factor
        this.boundingBox.y2 *= factor
        this.boundingBox.width *= factor
        this.boundingBox.height *= factor
      }

      draw() {
        // p.fill(255)
        p.noStroke()
        this.shapes.forEach((shape) => shape.draw())
      }
    }

    // 多行字符。包含多个 TextLine
    class TextBox {
      x: number
      y: number
      size: number
      text: string
      font: P5.Font
      lines: TextLine[]
      points: Point[]
      boundingBox: BoundingBox

      constructor(x: number, y: number, size: number, text: string, font: P5.Font) {
        this.x = x
        this.y = y
        this.size = size
        this.text = text
        this.font = font

        this.lines = this.createLines()
        this.points = this.getAllPoints()
        this.setLinesWidth()
        this.boundingBox = this.getBoundingBox()
        this.placeOnCanvas()
      }

      createLines() {
        const textLines = this.text.split('/')
        const lines: TextLine[] = []
        let currY = this.y // 当前Y坐标，用于逐行下移渲染
        let maxWidth = 0 // 最大行的宽度，将所有行的宽度调整到这个宽度

        textLines.forEach((str) => {
          const line = new TextLine(this.x, currY, this.size, str, this.font)
          lines.push(line)

          currY += this.size * LINE_HEIGHT

          if (line.boundingBox.width > maxWidth) {
            maxWidth = line.boundingBox.width
            line.isReferenceLine = true
          }
        })

        return lines
      }

      getAllPoints() {
        return this.lines.flatMap((line) =>
          line.shapes.flatMap((shape) => shape.paths.flatMap((path) => path.points))
        )
      }

      setLinesWidth() {
        // 找到最宽的行作为参考
        const widestLine = this.lines.find((line) => line.isReferenceLine)
        if (widestLine) {
          this.lines.forEach((line) => line.setWidth(widestLine.boundingBox))
        }
      }

      getBoundingBox() {
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        const boxOfAllLines: BoundingBox[] = []

        this.lines.forEach((line) => {
          boxOfAllLines.push(line.boundingBox)

          minX = Math.min(minX, line.boundingBox.x)
          minY = Math.min(minY, line.boundingBox.y)
          maxX = Math.max(maxX, line.boundingBox.x2)
          maxY = Math.max(maxY, line.boundingBox.y2)
        })

        const w = maxX - minX
        const h = maxY - minY
        const center = p.createVector((minX + maxX) / 2, (minY + maxY) / 2)

        return {
          x: minX,
          y: minY,
          x2: maxX,
          y2: maxY,
          width: w,
          height: h,
          center,
          boxes: boxOfAllLines,
        }
      }

      translate(vector: P5.Vector) {
        this.boundingBox.x += vector.x
        this.boundingBox.y += vector.y
        this.boundingBox.x2 += vector.x
        this.boundingBox.y2 += vector.y
        this.lines.forEach((line) => line.translate(vector))
        this.points.forEach((point) => point.translate(vector))
      }

      scale(factor: number) {
        this.boundingBox.x *= factor
        this.boundingBox.y *= factor
        this.boundingBox.x2 *= factor
        this.boundingBox.y2 *= factor
        this.boundingBox.width *= factor
        this.boundingBox.height *= factor
        this.lines.forEach((line) => line.scale(factor))
        this.points.forEach((point) => point.scale(factor))
      }

      placeOnCanvas() {
        // 1.移动到原点
        this.translate(p.createVector(-this.boundingBox.x, -this.boundingBox.y))
        // 2.计算缩放比例，保持纵横比
        const border = p.min(p.width, p.height) * borderPercentage.value
        const scaleWidth = (p.width - border * 2) / this.boundingBox.width
        const scaleHeight = (p.height - border * 2) / this.boundingBox.height
        const scale = p.min([scaleWidth, scaleHeight])
        // 3.缩放
        this.scale(scale)
        // 4.居中定位；如果是竖屏模式，略微向上移动
        const yPos =
          p.height > p.width
            ? p.height * 0.35 - this.boundingBox.height * 0.5
            : p.height / 2 - this.boundingBox.height / 2

        const translation = p.createVector(p.width / 2 - this.boundingBox.width / 2, yPos)

        this.translate(translation)
      }

      restore() {
        this.points.forEach((point) => point.restore())
      }

      randomDistort() {
        this.points.forEach((point) => point.randomDistort())
      }

      toggleDistortion() {
        if (isDistorted.value) {
          this.restore()
        } else {
          this.randomDistort()
        }
      }

      draw() {
        this.points.forEach((point) => point.update())
        this.lines.forEach((line) => line.draw())
      }
    }
  }

  return {
    sketch,
    isMounted,
    isMobile,
  }
}
