import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Mountain extends THREE.Group {

  // mesh: THREE.Mesh

  constructor (onLoaded = () => void 0) {
    super()
    const loader = new GLTFLoader();
    loader.load(
      '/assets/mountain.gltf',
      ( gltf ) => {
        (gltf.scene.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ vertexColors: true })
        this.add((gltf.scene.children[0] as THREE.Mesh))
        onLoaded()
      },
    );  
  }
}
