import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GameBoy extends THREE.Group {

  // mesh: THREE.Mesh

  constructor (onLoaded = () => void 0) {
    super()
    const loader = new GLTFLoader();
    loader.load(
      '/assets/gameboy.gltf',
      ( gltf ) => {
        const gameBoy = gltf.scene.children[0] as THREE.Mesh
        // const glass = gltf.scene.children[1] as THREE.Mesh
        // glass.material = new THREE.MeshStandardMaterial({
        //   color: 0xFF0077,
        //   emissive: 0x000000
        //   // transparent: true,
        //   // opacity: 0.5
        // })
        this.add( gameBoy );
        // this.add( glass );
        onLoaded()
      },
    );  
  }
}
