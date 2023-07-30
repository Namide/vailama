import * as THREE from 'three';
import type { Base } from './Base';
import { Background } from '../meshes/Background';
import { Controller } from '../utils/Controller';

export class StartScreen {

  base: Base
  background: Background
  controller: Controller

  onFinished: (intro: StartScreen) => unknown

  private loadCount = 1

  constructor(
    base: Base,
    onFinished: (intro: StartScreen) => unknown
  ) {
    this.onFinished = onFinished

    this.base = base
    this.base.pixelMode()

    document.body.style.background = '#637e53'
    document.body.querySelector('.container')?.classList.add('is-before-appear')
    this.base.scene.background = new THREE.Color(0x637e53)
    this.base.mainLoop = this.tick.bind(this);

    this.background = new Background(this.onAssetLoaded.bind(this))
    this.base.scene.add(this.background)

    this.controller = new Controller({ click: true })
  }

  startAnimation() {
    const container = document.body.querySelector('.container')
    container?.classList.add('is-appear')
    container?.classList.remove('is-before-appear')
  }

  tick() {
    if (this.controller.isTop ||
      this.controller.isBottom ||
      this.controller.isLeft ||
      this.controller.isRight ||
      this.controller.mousePosition
    ) {
      this.base.mainLoop = () => void 0
      this.controller.dispose()
      this.dispose()
      this.onFinished(this)
    }
  }

  dispose() {
    this.controller.dispose()
    document.body.querySelector('.start-screen')?.classList.remove('is-enabled')
    this.base.removeChildren()
  }

  protected onAssetLoaded() {
    this.loadCount--
    if (this.loadCount === 0) {
      document.body.querySelector('.start-screen')?.classList.add('is-enabled')
      requestAnimationFrame(this.startAnimation.bind(this))
    }
    return void 0
  }
}
