import * as THREE from 'three';
import { BoundingBox } from '../utils/BoundingBox';
import { Explode } from './Explode';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const size = [0.04, 0.15]
const geometry = new THREE.BoxGeometry( size[0], size[1], size[0] );
const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

export class Bullet extends THREE.Group {

  bb: BoundingBox
  velocity: [number, number]
  height: number

  isOut = false

  constructor (
    {
      bb,
      velocity,
    }: { bb: BoundingBox, velocity: [number, number] }) {

    super()

    this.bb = bb
    this.velocity = velocity
    this.height = size[1]
    
    const mesh = new THREE.Mesh( geometry, material );
    this.add(mesh)
  }

  update(delay: number) {
    this.position.x += this.velocity[0] * delay / 1000
    this.position.y += this.velocity[1] * delay / 1000

	  this.rotation.y += delay / 100;
    
    if (this.position.y - this.height * 4 > this.bb.top) {
      this.isOut = true
    }
  }

  shoot() {
    const explode = new Explode({ size: 0.25 })
    explode.position.copy(this.position)
    this.parent?.add(explode)
    this.dispose()
  }

  dispose() {
    if (this.parent) {
      this.parent.remove(this)
    }
  }
}
