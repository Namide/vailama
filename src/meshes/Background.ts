import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Background extends THREE.Group {

  constructor (onLoaded = () => void 0) {
    super()
    const loader = new GLTFLoader();
    loader.load(
      '/assets/start-screen.glb',
      ( gltf ) => {
        (gltf.scene.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ vertexColors: true });
        (gltf.scene.children[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ vertexColors: true });

        this.add(gltf.scene.children[0], gltf.scene.children[1])
        onLoaded()
      },
    );

    const dir = new THREE.DirectionalLight(0xFFFFFF, 0.5)
    dir.target.position.set(5, -1, -1)

    this.add(dir);
  }
}
