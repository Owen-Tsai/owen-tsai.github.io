import * as THREE from 'three'
import { Font, FontLoader, type FontData } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import font from './words'

class Char {
  font: Font
  geom: TextGeometry
  constructor(char: string) {
    this.font = new FontLoader().parse(font as any)
    this.geom = new TextGeometry(char, {
      font: this.font,
      size: 3,
      depth: 13,
      curveSegments: 1,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: -0.1,
    })
  }
}

export default Char
