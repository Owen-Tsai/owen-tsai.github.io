import * as THREE from 'three'
import gsap from 'gsap'
import Char from './char'
import { debounce } from 'lodash-es'
import type { TextGeometry } from 'three/examples/jsm/Addons.js'

const CHARS = '架構動效極簡本格推理'.split('')

const dist = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
const map = (value: number, start1: number, stop1: number, start2: number, stop2: number) => {
  return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}

class Canvas {
  gutter = 4
  meshes: Array<Array<THREE.Mesh>> = []
  grid = {
    rows: 6,
    cols: 6,
  }
  width?: number
  height?: number
  mouse3D?: THREE.Vector2
  raycaster?: THREE.Raycaster
  geoms: any[] = []
  scene?: THREE.Scene
  renderer?: THREE.WebGLRenderer
  camera?: THREE.PerspectiveCamera
  spotLight?: THREE.SpotLight
  rotatingLight?: THREE.SpotLight
  floor?: THREE.Mesh
  groupMesh?: THREE.Object3D
  dom: HTMLElement
  mouseLeft = false

  constructor(dom: HTMLElement) {
    this.dom = dom
    this.setup()
    this.createScene()
    this.createGrid()
    this.createCamera()
    this.addFloor()
    this.addSpotLight(0x6eb9ff, { x: 10, y: -10, z: 3 })
    this.addRotatingLight(0xffffff, { x: 0, y: 0, z: 3 })
    this.animate()
    this.onMouseMove({ x: 0, y: 0 })
    window.addEventListener(
      'mousemove',
      (e) => this.onMouseMove({ x: e.clientX, y: e.clientY }),
      false,
    )
    window.addEventListener(
      'resize',
      debounce(() => this.onResize(), 200),
    )
    window.addEventListener('mouseleave', () => (this.mouseLeft = true))
    window.addEventListener('mouseenter', () => (this.mouseLeft = false))
  }

  cleanup() {
    window.removeEventListener(
      'mousemove',
      (e) => this.onMouseMove({ x: e.clientX, y: e.clientY }),
      false,
    )
    window.removeEventListener(
      'resize',
      debounce(() => this.onResize(), 200),
    )
    window.removeEventListener('mouseleave', () => (this.mouseLeft = true))
    window.removeEventListener('mouseenter', () => (this.mouseLeft = false))
  }

  setup() {
    this.gutter = 4
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.meshes = []
    this.geoms = [...CHARS.map((char) => new Char(char))]
    this.mouse3D = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
  }

  createScene() {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = false

    this.dom!.appendChild(this.renderer.domElement)
    this.scene.add(new THREE.AmbientLight(0x000000))
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.2)
    this.camera.position.set(15, -8, 40)
    this.camera.lookAt(-5, 0, 0)
    this.scene?.add(this.camera)
  }

  addSpotLight = (color: number, position: { x: number; y: number; z: number }) => {
    this.spotLight = new THREE.SpotLight(color, 1000, 2000, 1)
    this.spotLight.position.set(position.x, position.y, position.z)
    this.scene?.add(this.spotLight)
  }

  addRotatingLight = (color: number, position: { x: number; y: number; z: number }) => {
    this.rotatingLight = new THREE.SpotLight(color, 1000, 2000, 1)
    this.rotatingLight.position.set(position.x, position.y, position.z)
    this.scene?.add(this.rotatingLight)
  }

  addFloor() {
    const geom = new THREE.PlaneGeometry(100, 100)
    const material = new THREE.MeshLambertMaterial({
      opacity: 0,
      transparent: true,
    })
    this.floor = new THREE.Mesh(geom, material)
    this.renderer?.render(this.scene!, this.camera!)
    this.scene?.add(this.floor)

    const color = 0x09090b
    const near = 32
    const far = 45
    this.scene!.fog = new THREE.Fog(color, near, far)
  }

  getRandomGeometry(): Char {
    return this.geoms[Math.floor(Math.random() * this.geoms.length)]
  }

  createGrid() {
    this.groupMesh = new THREE.Object3D()
    const meshParams: THREE.MeshPhysicalMaterialParameters = {
      color: '#ababab',
      metalness: 1,
      emissive: '#ffffff',
      emissiveIntensity: 0.5,
      roughness: 0.2,
    }

    const material = new THREE.MeshPhysicalMaterial(meshParams)

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = []
      for (let index = 0; index < 1; index++) {
        for (let col = 0; col < this.grid.cols; col++) {
          const char = this.getRandomGeometry()
          const mesh = this.getMesh(char.geom, material)

          mesh.position.z = -1
          mesh.position.x = col + col * this.gutter
          mesh.position.y = row + row * this.gutter
          this.groupMesh?.add(mesh)
          this.meshes[row]![col] = mesh
        }
      }
    }

    const centerX = -(this.grid.cols / 2) * this.gutter - 1
    const centerY = -(this.grid.rows / 2) * this.gutter - 1
    this.groupMesh.position.set(centerX, centerY, 0)
    this.scene?.add(this.groupMesh)
  }

  getMesh(geom: TextGeometry, material: THREE.MeshPhysicalMaterial) {
    return new THREE.Mesh(geom, material)
  }

  draw() {
    // if (!this.shouldAnimate) {
    //   // 灯光平滑回正到中心 (y: 0)
    //   // gsap.to(this.rotatingLight!.position, { y: 0, duration: 2.5, overwrite: 'auto' })
    //   // gsap.to(this.spotLight!.position, { y: 0, duration: 2.5, overwrite: 'auto' })

    //   // 遍历矩阵，将所有文字平滑归位到默认的 z 轴 (-1)
    //   // for (let row = 0; row < this.grid.rows; row++) {
    //   //   for (let col = 0; col < this.grid.cols; col++) {
    //   //     const mesh = this.meshes[row]![col]
    //   //     // overwrite: "auto" 可以防止鼠标快速进出导致的 GSAP 动画冲突
    //   //     gsap.to(mesh!.position, { z: -1, duration: 1.5, overwrite: 'auto' })
    //   //   }
    //   // }
    //   return // 提前返回，跳过下方的射线检测逻辑
    // }
    this.rotatingLight!.position.x = 20
    gsap.to(this.rotatingLight!.position, {
      y: this.mouse3D!.y * 20,
      duration: 2.5,
    })

    this.spotLight!.position.x = -20
    gsap.to(this.spotLight!.position, {
      y: this.mouse3D!.y * 10,
      duration: 2.5,
    })

    this.raycaster?.setFromCamera(this.mouse3D!, this.camera!)
    const intersects = this.raycaster?.intersectObjects([this.floor!])

    if (intersects?.length) {
      const { x, y } = intersects[0]!.point

      for (let row = 0; row < this.grid.rows; row++) {
        for (let col = 0; col < this.grid.cols; col++) {
          const mesh = this.meshes[row]![col]
          const mouseDist = dist(
            x,
            y,
            mesh!.position.x + this.groupMesh!.position.x + this.gutter / 2,
            mesh!.position.y + this.groupMesh!.position.y + this.gutter / 2,
          )
          const z = map(mouseDist / 4, 0.3, 0, 0, 1) - 5
          let duration = mouseDist / 3
          if (duration < 0.5) {
            duration = 0.5
          } else if (duration > 1.5) {
            duration = 1.5
          }
          gsap.to(mesh!.position, {
            z,
            duration,
          })
        }
      }
    }
  }

  onMouseMove({ x, y }: { x: number; y: number }) {
    const boundaryX = this.width! / 4

    if (x < boundaryX || this.mouseLeft || y <= 0 || y >= this.height!) {
      x = (this.width! / 5) * 3
      y = this.height! / 2
    }
    this.mouse3D!.x = (x / this.width!) * 2 - 1
    this.mouse3D!.y = -(y / this.height!) * 2 + 1
  }

  onResize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.renderer!.setSize(this.width, this.height)
    this.camera!.aspect = this.width / this.height
    this.camera!.updateProjectionMatrix()
  }

  animate() {
    this.draw()
    this.renderer!.render(this.scene!, this.camera!)
    requestAnimationFrame(() => this.animate())
  }
}

export default Canvas
