import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GameBackground extends THREE.Group {

  constructor (onLoaded = () => void 0) {
    super()
    const loader = new GLTFLoader();
    loader.load(
      '/assets/game-background.glb',
      ( gltf ) => {
        const mesh = gltf.scene.children[0] as THREE.Mesh
        mesh.material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC })
        this.add(mesh)
        onLoaded()
      },
    );  
  }
}
