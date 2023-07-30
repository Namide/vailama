import * as THREE from 'three';
import { Base } from './Base';
import { Background } from '../meshes/Background';
import { Controller } from '../utils/Controller';
import { Game } from './Game';

export class ScoreScreen {

  base: Base
  background: Background

  controller: Controller

  private loadCount = 1

  onFinished: (intro: ScoreScreen) => unknown

  constructor(
    game: Game,
    onFinished: (intro: ScoreScreen) => unknown
  ) {
    this.onFinished = onFinished

    this.base = game.base
    this.base.pixelMode()
    this.base.scene.background = new THREE.Color(0x637e53)

    document.body.style.background = '#637e53'

    {
      (document.body.querySelector('.final-score') as HTMLSpanElement).innerText = String(game.score + game.life * 10)
    }

    this.background = new Background(this.onAssetLoaded.bind(this))
    this.base.scene.add(this.background)

    this.base.mainLoop = this.tick.bind(this);

    this.controller = new Controller({ click: true })
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
      setTimeout(this.onFinished.bind(this, this), 500)
    }
  }

  dispose() {
    this.controller.dispose()
    document.body.querySelector('.score-screen')?.classList.remove('is-enabled')
    this.base.removeChildren()
  }

  protected onAssetLoaded() {
    this.loadCount--
    if (this.loadCount === 0) {
      document.body.querySelector('.score-screen')?.classList.add('is-enabled')
    }
    return void 0
  }
}
