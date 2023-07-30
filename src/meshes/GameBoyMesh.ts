import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GameBoy extends THREE.Group {

  constructor (onLoaded = () => void 0) {
    super()
    const loader = new GLTFLoader();
    loader.load(
      '/assets/gameboy.gltf',
      ( gltf ) => {
        const gameBoy = gltf.scene.children[0] as THREE.Mesh
        this.add( gameBoy )
        onLoaded()
      },
    );  
  }
}
