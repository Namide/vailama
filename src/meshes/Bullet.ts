import * as THREE from 'three';
import { BoundingBox } from '../utils/BoundingBox';
import { Explode } from './Explode';
import { Tween, easeOutExpo } from 'twon';

const size = [0.04, 0.15]

const map = new THREE.TextureLoader().load( '/assets/bullet.png' );
const material = new THREE.SpriteMaterial( {
  map: map,
  blending: THREE.AdditiveBlending,
  depthWrite: false,

  depthTest: false,
  transparent: true
} );

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
    
    const mesh = new THREE.Sprite( material );
    mesh.scale.set(1, 1, 1)
    this.add(mesh)

    new Tween(
      mesh.scale as { x: number, y: number, z: number },
      [{ x: 0.15, y: 0.15, z: 1 }, { x: 0.15, y: 0.5, z: 1 }],
      {
        duration: 500,
        ease: easeOutExpo,
      }
    )
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
