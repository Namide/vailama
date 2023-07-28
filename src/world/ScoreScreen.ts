import * as THREE from 'three';
import { Base } from './Base';
import { Mountain } from '../meshes/Mountain';
import { Controller } from '../utils/Controller';
import { Game } from './Game';

export class ScoreScreen {

  base: Base
  // mesh: THREE.Mesh
  mountain: Mountain

  controller: Controller

  private loadCount = 1

  onFinished: (intro: ScoreScreen) => unknown

  constructor (
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

    const ambiant = new THREE.AmbientLight(0x999999);
    this.base.scene.add(ambiant);

    // const dir = new THREE.DirectionalLight(0xFFFFFF, 0.5)
    // dir.target.position.set(5, -1, -1)
    // this.base.scene.add(dir);

    this.mountain = new Mountain(this.onAssetLoaded.bind(this))
    this.mountain.scale.multiplyScalar(4)
    this.mountain.position.y = -0.5
    this.base.scene.add(this.mountain)

    // const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    // const material = new THREE.MeshNormalMaterial();
    // this.mesh = new THREE.Mesh( geometry, material );

    this.base.mainLoop = this.tick.bind(this);

    this.controller = new Controller({ click: true })
  }

  startAnimation () {
    // const container = document.body.querySelector('.container')
    // container?.classList.add('is-appear')
    // container?.classList.remove('is-before-appear')
  }

  tick() {
    // this.mesh.rotation.x = time / 2000;
	  // this.mesh.rotation.y = time / 1000;

    if (this.controller.isTop ||
      this.controller.isBottom ||
      this.controller.isLeft ||
      this.controller.isRight ||
      this.controller.mousePosition
    ) {
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

  protected onAssetLoaded () {
    this.loadCount--
    if (this.loadCount === 0) {
      document.body.querySelector('.score-screen')?.classList.add('is-enabled')
      requestAnimationFrame(this.startAnimation.bind(this))
    }
    return void 0
  }
}
