import * as THREE from 'three';
import { BoundingBox } from '../utils/BoundingBox';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Explode } from './Explode';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player extends THREE.Group {

  bb: BoundingBox
  velocity = 2
  invincible = false

  constructor (
    onLoaded = () => void 0,
    {
      bb
    }: { bb: BoundingBox }) {

    super()

    const loader = new GLTFLoader();
    loader.load(
      '/assets/ships.glb',
      ( gltf ) => {

        const mesh = gltf.scene.children.find(mesh => mesh.name === 'ShipPlayer') as THREE.Mesh
        mesh.material = new THREE.MeshBasicMaterial({ vertexColors: true })
        mesh.scale.multiplyScalar(0.2)
        mesh.rotation.z = Math.PI

        this.add(mesh)

        onLoaded()
      },
    );

    this.bb = bb
    
    onLoaded()
  }

  moveJoypad (x: number, y: number, delay: number) {
    const inclination = Math.PI / 8
    this.rotation.y = x * inclination
    this.rotation.x = -y * inclination
    
    this.position.x += x * this.velocity * delay / 1000
    this.position.y += y * this.velocity * delay / 1000
    this.fixPosition()
  } 

  moveTarget(x: number, y: number, delay: number) {
    const vec2d = new THREE.Vector2(x - this.position.x, y - this.position.y)

    if (Math.sqrt(vec2d.x ** 2 + vec2d.y ** 2) < 0.05) {
      return void 0
    }

    vec2d.normalize()

    const inclination = Math.PI / 8
    this.rotation.y = x * inclination
    this.rotation.x = -y * inclination

    this.position.x += vec2d.x * this.velocity * delay / 1000
    this.position.y += vec2d.y * this.velocity * delay / 1000
    this.fixPosition()
  }

  moveTranslate(x: -1 | 0 | 1, y: -1 | 0 | 1, delay: number) {
    const diag = x !== 0 && y !== 0 ? Math.sqrt(2) / 2 : 1
    const inclination = Math.PI * diag / 8
    this.position.x += diag  * x * this.velocity * delay / 1000
    this.position.y += diag  * y * this.velocity * delay / 1000
    this.rotation.y = x * inclination
    this.rotation.x = -y * inclination
    this.fixPosition()
  }

  setInvincible (time: number = 2000) {
    this.invincible = true
    this.visible = false
    const intervalId = setInterval(() => {
      this.visible = !this.visible
    }, 100)

    setTimeout(() => {
      clearInterval(intervalId)
      this.visible = true
      this.invincible = false
    }, time)
  }

  destroy() {

    const shift = new THREE.Vector3()
    const parent = this.parent
    for (let i = 0; parent && i < 12; i++) {
      setTimeout(() => {
        shift.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        shift.normalize()
        shift.multiplyScalar(0.3)

        const explode = new Explode({ size: 0.5 * (Math.random() * 0.2 + 0.9) })
        explode.position.copy(this.position)
        explode.position.add(shift)

        parent.add(explode)
      }, i * 50)
    }

    if (this.parent) {
      this.parent.remove(this)
    }
  }

  fixPosition() {
    if (this.position.x < this.bb.left) {
      this.position.x = this.bb.left
    } else if (this.position.x > this.bb.right) {
      this.position.x = this.bb.right
    }

    if (this.position.y > this.bb.top) {
      this.position.y = this.bb.top
    } else if (this.position.y < this.bb.bottom) {
      this.position.y = this.bb.bottom
    }
  }
}
