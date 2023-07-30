import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';

const PIXEL_RENDER = 1

export class Base {

  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera

  composer?: EffectComposer

  mainLoop: (time: number, delay: number) => unknown = (_1: number, _2: number) => void 0

  private lastTime = 0

  constructor(
    canvas: HTMLCanvasElement
  ) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFFFFF)

    this.renderer = new THREE.WebGLRenderer({ antialias: false, canvas });
    this.renderer.useLegacyLights = false
    this.renderer.setAnimationLoop(this.tick.bind(this));

    this.camera = this.pixelMode()

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  screenTo3dPos(x: number, y: number) {
    let vec = new THREE.Vector3();
    let pos = new THREE.Vector3();

    vec.set(x * 2 - 1, -y * 2 + 1, 0);
    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();

    let distance = -this.camera.position.z / vec.z;

    pos.copy(this.camera.position).add(vec.multiplyScalar(distance));

    return pos
  }


  pixelMode(green = true) {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 50);
    this.camera.position.z = 5;

    this.composer = new EffectComposer(this.renderer);
    const renderPixelatedPass = new RenderPixelatedPass(6, this.scene, this.camera);
    this.composer.addPass(renderPixelatedPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    if (green) {
      const colorify = new ShaderPass(ColorifyShader);
      colorify.uniforms['color'] = new THREE.Uniform(new THREE.Color(0x99c46e));
      this.composer.addPass(colorify);
    }

    this.onWindowResize()

    return this.camera
  }

  onWindowResize() {
    let { innerWidth: width, innerHeight: height } = window
    if (this.composer) {
      this.composer.setSize(width, height);
      width /= PIXEL_RENDER // 8
      height /= PIXEL_RENDER // 8
    }
    this.renderer.setSize(width, height, false);

    if (this.camera instanceof THREE.OrthographicCamera) {
      const rendererSize = this.renderer.getSize(new THREE.Vector2());
      const aspectRatio = rendererSize.x / rendererSize.y;
      const UNZOOM = 3
      this.camera.left = -aspectRatio * UNZOOM;
      this.camera.right = aspectRatio * UNZOOM;
      this.camera.top = 1.0 * UNZOOM;
      this.camera.bottom = - 1.0 * UNZOOM;
      this.camera.updateProjectionMatrix();
    } else {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  tick(time: number) {

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.mainLoop(time, time - this.lastTime)
    this.lastTime = time
  }

  removeChildren() {
    while (this.scene.children[0]) {
      this.scene.children[0].removeFromParent()
    }
  }
}
