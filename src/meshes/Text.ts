import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export class Text extends THREE.Group {

  constructor (text: string, { size = 0.2, color = 0x99C46E } = {}, onLoaded = () => void 0) {
    super()

    const loader = new FontLoader();
    loader.load( '/assets/VT323_Regular.json', ( font ) => {

      const geometry = new TextGeometry(text, {
        font,
        size: size,
        height: 0,
        curveSegments: 1,

        bevelEnabled: false,
        // bevelThickness: 10,
        // bevelSize: 8,
        // bevelOffset: 0,
        // bevelSegments: 5
      } );
      const material = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh( geometry, material );

      const boundingBox = new THREE.Vector3()
      geometry.computeBoundingBox()
      geometry.boundingBox?.getSize(boundingBox)

      mesh.position.x = -boundingBox.x / 2
      mesh.position.y = -boundingBox.y / 2
      mesh.position.z = -boundingBox.z / 2

      this.add( mesh );
      onLoaded()
    } );
  }
}
