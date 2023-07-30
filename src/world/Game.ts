import * as THREE from 'three';
import { Base } from './Base';
import { Player } from '../meshes/Player';
import { BoundingBox } from '../utils/BoundingBox';
import { Controller } from '../utils/Controller';
import { Bullet } from '../meshes/Bullet';
import { GameBackground } from '../meshes/GameBackground';
import { Tween, easeOutExpo, easeInExpo, easeInOutExpo } from "twon"
import { BadShip } from '../meshes/BadShip';
import { GAME_DISABLE_INTRO, GAME_FIRST_WAVE } from '../config.json';

const APPEAR_TIME = GAME_DISABLE_INTRO ? 100 : 5000

export class Game {

  base: Base
  bb: BoundingBox
  controller: Controller | undefined

  player: Player
  bg: GameBackground

  shootIntervalId?: ReturnType<typeof setInterval>
  appearIntervalId?: ReturnType<typeof setInterval>

  private _life = 3
  private _score = 0
  private wave = GAME_FIRST_WAVE
  private loadCount = 3

  onFinished: (game: Game) => unknown

  constructor (
    base: Base,
    onFinished: (game: Game) => unknown
  ) {
    this.onFinished = onFinished

    this.bb = new BoundingBox({
      left: -1.5,
      right: 1.5,
      top: 3,
      bottom: -3,
    })

    this.base = base
    this.base.pixelMode()
    this.base.scene.background = new THREE.Color(0x637e53)


    this.addLight()

    BadShip.loadMeshes(this.onAssetLoaded.bind(this))

    this.player = new Player(this.onAssetLoaded.bind(this), { bb: this.bb })
    this.player.position.y = this.bb.bottom * 2
    this.base.scene.add(this.player)

    this.bg = new GameBackground(this.onAssetLoaded.bind(this))
    this.bg.position.z = 40
    this.bg.scale.multiplyScalar(20)
    this.base.scene.add(this.bg)

    this.base.mainLoop = this.tick.bind(this);
  }

  get life () {
    return this._life
  }

  set life (life: number) {
    (document.body.querySelector('.ui .life') as HTMLDivElement).innerHTML =
      '<span class="heart"></span>'.repeat(life > -1 ? life : 0)
    this._life = life
    if (life < 1) {
      this.lose()
    }
  }

  get score () {
    return this._score
  }

  set score (score: number) {
    (document.body.querySelector('.ui .score') as HTMLDivElement).innerHTML =
      score.toFixed(0) + ' PTS'
    this._score = score
  }

  addLight () {
    const ambiant = new THREE.AmbientLight(0x666666);
    this.base.scene.add(ambiant);

    const dir = new THREE.DirectionalLight(0xFFFFFF, 1)
    dir.position.set(10, -1, 1)
    dir.target.position.set(0, 0, 0)
    this.base.scene.add(dir);
  }

  startAnimation () {
    
    // Appear
    this.player.position.x = -5
    this.player.position.y = -2
    this.player.position.z = 4
    const t1 = new Tween(
      this.player.position as { x?: number, y: number, z: number },
      [{ x: 2, y: -1, z: 2 }, { x: 0, y: 0, z: 0 }],
      {
        duration: APPEAR_TIME,
        ease: easeOutExpo,
      }
    )

    this.player.rotation.x = 0
    this.player.rotation.y = Math.PI / 4
    this.player.rotation.z = 0
    const t2 = new Tween(
      this.player.rotation as { x?: number, y: number, z: number },
      [{ x: 0, y: -Math.PI / 2, z: 0 }, { x: 0, y: 0, z: 0 }],
      {
        delay: APPEAR_TIME / 10,
        duration: APPEAR_TIME * 3 / 5,
        ease: easeOutExpo,
      }
    )

    setTimeout(() => {
      t1.dispose()
      t2.dispose()
      this.startPlay()
    }, APPEAR_TIME)
  }

  shoot() {
    if (this.player.invincible) {
      return void 0
    }

    const bullet1 = new Bullet({
      bb: this.bb,
      velocity: [0, 7]
    })
    const bullet2 = new Bullet({
      bb: this.bb,
      velocity: [0, 7]
    })
    const { x, y, z } = this.player.position
    bullet1.position.set(x + 0.2, y, z)
    bullet2.position.set(x - 0.2, y, z)
    this.base.scene.add(bullet1, bullet2)
  }

  addBadShip () {
    const badShip = new BadShip({ bb: this.bb, type: this.wave })
    this.base.scene.add(badShip)
  }

  startPlay () {
    this.controller = new Controller({ joystick: true })
    this.shootIntervalId = setInterval(this.shoot.bind(this), 750)
    this.changeWave(GAME_FIRST_WAVE)

    this.life = 3
    this.score = 0
    document.body.querySelector('.ui')?.classList.add('is-enabled')
    return void 0
  }

  changeWave(num: number) {
    this.wave = num

    if (num < 2) {
      clearInterval(this.appearIntervalId)
      this.appearIntervalId = setInterval(this.addBadShip.bind(this), 1000 * (num + 1))
    }

    if (num > 2) {
      clearInterval(this.appearIntervalId)
    }
  }

  outro() {
    clearInterval(this.shootIntervalId)
    this.controller?.dispose()

    const t1 = new Tween(
      this.player.position as { x: number, y: number, z: number },
      { x: 0, y: 4, z: 2 }
      ,
      {
        duration: 2000,
        ease: easeInExpo,
      }
    )

    const t2 = new Tween(
      this.player.rotation as { y: number },
      { y: 2 * Math.PI },
      {
        delay: 500,
        duration: 2000,
        ease: easeInOutExpo,
      }
    )

    setTimeout(() => {
      t1.dispose()
      t2.dispose()
      this.dispose()
      this.onFinished(this)
    }, 5000)
  }

  lose() {
    clearInterval(this.shootIntervalId)
    this.controller?.dispose()

    this.player.destroy()

    setTimeout(() => {
      this.dispose()
      this.onFinished(this)
    }, 5000)
  }

  tick(time: number, delay: number) {
    this.bg.rotation.x = -time / 10000

    const badShips = this.base.scene.children.filter(mesh => mesh instanceof BadShip) as BadShip[]
    const bullets = this.base.scene.children.filter(mesh => mesh instanceof Bullet) as Bullet[]

    if (this.wave === 3 && badShips.length < 1) {
      this.wave = 4
      this.outro()
    }

    bullets.forEach(bullet => {
      bullet.update(delay)
      if (bullet.isOut) {
        bullet.dispose()
      } else {
        const collide = badShips.find(badShip => badShip.position.distanceTo(bullet.position) < badShip.size / 2)
        if (collide) {
          this.score += 10
          if (this.score % 100 === 0 && this.wave < 3) {
            this.changeWave(this.wave + 1)
          }
          bullet.shoot()
          collide.life--
        }
      }
    })

    if (this.player && this.controller && this.life > 0) {
      if (this.controller.vector) {
        this.player.moveJoypad(this.controller.vector.x, this.controller.vector.y, delay)
      } else {
        this.player.moveTranslate(
          this.controller.isLeft ? -1 : this.controller.isRight ? 1 : 0,
          this.controller.isTop ? 1 : this.controller.isBottom ? -1 : 0,
          delay
        )
      }
  

      if (!this.player.invincible) {
        const collide = badShips.find(badShip => badShip.position.distanceTo(this.player.position) < badShip.size / 2)
        if (collide) {
          this.player.setInvincible()
          this.life--
          collide.life--
        }
      }
    }
  }

  dispose() {
    document.body.querySelector('.ui')?.classList.remove('is-enabled')
    clearInterval(this.shootIntervalId)
    clearInterval(this.appearIntervalId)
    this.base.removeChildren()
  }

  protected onAssetLoaded () {
    this.loadCount--
    if (this.loadCount === 0) {
      requestAnimationFrame(this.startAnimation.bind(this))
    }
    return void 0
  }
}
