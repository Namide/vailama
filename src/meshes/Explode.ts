import * as THREE from 'three';
import { Tween, easeOutExpo } from 'twon';

const geometry = new THREE.IcosahedronGeometry(1, 0);
const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

type TweenObject = { x?: number, y?: number, z?: number }

export class Explode extends THREE.Group {

  constructor ({ size = 0.1 } = {}) {
    super()
    
    const mesh = new THREE.Mesh( geometry, material );
    mesh.scale.setScalar(size)
    this.add(mesh)

    new Tween(
      this.scale as TweenObject,
      [
        { x: size * 5, y: size * 5, z: size * 5 },
        { x: 0, y: 0, z: 0 },
      ],
      {
        delay: 0,
        duration: 2000 * size,
        ease: easeOutExpo
      }
    )
    setTimeout(this.dispose.bind(this), 2000 * size)
  }

  dispose() {
    if (this.parent) {
      this.parent.remove(this)
    }
  }
}
