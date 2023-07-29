import * as THREE from 'three';
import { BoundingBox } from '../utils/BoundingBox';
import { Tween, linear } from 'twon';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Explode } from './Explode';

type TweenObject = { x?: number, y?: number, z?: number }

export class BadShip extends THREE.Group {

  bb: BoundingBox
  tweens: Tween<TweenObject>[] = []
  size: number = 0

  private _life = 1

  static count = 1
  static geometries = [
    new THREE.BoxGeometry( 0.4, 0.4, 0.4 ),
    new THREE.BoxGeometry( 0.6, 0.6, 0.6 ),
    new THREE.BoxGeometry( 1, 1, 1 ),
  ]
  static meshes: [ THREE.BufferGeometry, THREE.Material ][] = []
  static loadMeshes (onLoaded = () => void 0) {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/ships.glb',
      ( gltf ) => {
    
        // const mesh = gltf.scene.children.find(mesh => mesh.name === 'ShipPlayer') as THREE.Mesh
        // mesh.material = material
        // mesh.scale.multiplyScalar(0.2)
        // mesh.rotation.z = Math.PI

        const mine = gltf.scene.children.find(mesh => mesh.name === 'Mine') as THREE.Mesh
        const boule = gltf.scene.children.find(mesh => mesh.name === 'Boule') as THREE.Mesh
        const cross = gltf.scene.children.find(mesh => mesh.name === 'Cross') as THREE.Mesh

        BadShip.meshes[0] = [ boule.geometry, new THREE.MeshBasicMaterial({ vertexColors: true }) ]
        BadShip.meshes[1] = [ cross.geometry, new THREE.MeshBasicMaterial({ vertexColors: true }) ]
        BadShip.meshes[2] = [ mine.geometry, new THREE.MeshBasicMaterial({ vertexColors: true }) ]
    
        onLoaded()
      },
    );
  }

  constructor ({
      bb,
      type
    }: { bb: BoundingBox, type: number }) {

    super()

    BadShip.count++

    this.bb = bb
    

    if (type === 0) {
      this.patternTypeBoule()
    } else if (type === 1) {
      this.patternTypeCross()
    } else if (type === 2) {
      this.patternMine()
    }
  }

  patternTypeBoule () {
    this.size = 0.4

    this.add( new THREE.Mesh( ...BadShip.meshes[0] ) );
    this.scale.multiplyScalar(0.2)

    this.position.x = this.bb.left * 2
    this.position.y = this.bb.top * 1.3
    this.tweens.push(new Tween(
      this.position as TweenObject,
      [0, 0.3, 0.5, 0.7, 0.8, 0.9, 1.1, 1.2]
      .map((y, index) => ({
        x: this.bb.width * (index % 2) + this.bb.left,
        y: this.bb.top - y * this.bb.height
      })),
      {
        delay: 0,
        duration: 20000,
        ease: linear,
        path: {
          checkpoint: true,
          step: 4
        }
      }
    ))

    this.tweens.push(new Tween(
      this.rotation as TweenObject,
      { x: 10, y: 7 },
      {
        delay: 0,
        duration: 20000,
        ease: linear
      }
    ))

    setTimeout(this.dispose.bind(this), 20000)
  }

  patternTypeCross () {
    this.size = 0.6
    this.life = 3

    this.add( new THREE.Mesh( ...BadShip.meshes[1] ) );
    this.scale.multiplyScalar(0.4)

    const baseX = (BadShip.count % 4) * this.bb.width / 3 + this.bb.left

    this.position.x = baseX
    this.position.y = this.bb.top * 1.3

    this.tweens.push(new Tween(
      this.position as TweenObject,
      (new Array(13)).fill(1).map((_, index) => index * 0.1)
      .map((y, index) => ({
        x: baseX + this.bb.width / 2 * (index % 2) - this.bb.width / 4,
        y: this.bb.top - y * this.bb.height
      })),
      {
        delay: 0,
        duration: 15000,
        ease: linear,
        path: {
          checkpoint: true,
          step: 1
        }
      }
    ))


    this.tweens.push(new Tween(
      this.rotation as TweenObject,
      { x: 10, y: 7 },
      {
        delay: 0,
        duration: 15000,
        ease: linear
      }
    ))

    setTimeout(this.dispose.bind(this), 15000)
  }

  patternMine () {
    this.size = 1
    this.life = 6

    this.add( new THREE.Mesh( ...BadShip.meshes[2] ) );
    this.scale.multiplyScalar(0.5)

    this.position.x = this.bb.left
    this.position.y = this.bb.top * 1.5

    this.tweens.push( new Tween(
      this.position as TweenObject,
      [
        { x: 0, y: this.bb.top / 2 },
        { x: this.bb.right, y: 0 },
        { x: 0, y: this.bb.bottom / 2 },
        { x: this.bb.left, y: 0 },
        { x: 0, y: this.bb.top / 2 },
        { x: this.bb.right, y: 0 },
        { x: 0, y: this.bb.bottom / 2 },
        { x: this.bb.left, y: this.bb.bottom * 1.5 },
      ],
      {
        delay: 0,
        duration: 15000,
        ease: linear,
        path: {
          checkpoint: true,
          step: 4
        }
      }
    ))

    this.tweens.push(new Tween(
      this.rotation as TweenObject,
      { x: 10, y: 7 },
      {
        delay: 0,
        duration: 15000,
        ease: linear
      }
    ))

    setTimeout(this.dispose.bind(this), 15000)
  }

  get life () {
    return this._life
  }

  set life (life: number) {
    this._life = life
    if (this._life < 1) {
      this.destroy()
    }
  }

  destroy() {

    const shift = new THREE.Vector3()
    const parent = this.parent
    for (let i = 0; parent && i < Math.round(this.size * 6); i++) {
      setTimeout(() => {
        shift.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        shift.normalize()
        shift.multiplyScalar(this.size * 0.5)

        const explode = new Explode({ size: (0.2 + this.size * 0.5) * (Math.random() * 0.2 + 0.9) })
        explode.position.copy(this.position)
        explode.position.add(shift)

        parent.add(explode)
      }, i * 50)
    }

    this.dispose()
  }

  dispose () {
    this.tweens.forEach(tween => tween.dispose())
    if (this.parent) {
      this.parent.remove(this)
    }
  }
}
