import * as THREE from 'three';
import { GameBoy } from '../meshes/GameBoyMesh';
import { Tween, easeInExpo } from "twon"
import { Base } from './Base';

export class Intro {

  base: Base
  gameBoy: GameBoy

  private loadCount = 1

  onFinished: (intro: Intro) => unknown

  constructor (
    base: Base,
    onFinished: (intro: Intro) => unknown
  ) {
    this.onFinished = onFinished

    this.base = base
    this.base.pixelMode(false)
    this.base.camera.position.z = 5;
    this.base.scene.background = new THREE.Color(0xFFFFFF)
    
    this.gameBoy = new GameBoy(this.onAssetLoaded.bind(this))
    this.gameBoy.position.y = -10
    this.gameBoy.position.z = -3
    this.gameBoy.rotation.y = Math.PI / 2
    this.gameBoy.rotation.z = 0
    this.base.scene.add( this.gameBoy )

    // this.addLight()
  }

  // addLight () {
  //   const ambiant = new THREE.AmbientLight(0x666666);
  //   this.base.scene.add(ambiant);

  //   const dir = new THREE.DirectionalLight(0xFFFFFF, 1)
  //   dir.position.set(this.base.camera.position.x, this.base.camera.position.y, this.base.camera.position.z)
  //   dir.target.position.set(0, 0, 0)
  //   this.base.scene.add(dir);
  // }

  startAnimation () {
    const topTime = 5000
    const topEase = [.36,.54,.68,.99] as [number, number, number, number]
    const zoomTime = 1000
    new Tween(
      this.gameBoy.position as { x?: number, y: number, z: number },
      { z: -3, y: 0 },
      {
        duration: topTime,
        ease: topEase,
      }
    ).to(
      { x: 0, y: -5, z: 0 },
      {
        duration: zoomTime,
        ease: easeInExpo,
      });

    new Tween(
      this.gameBoy.scale as { x: number, z: number, y: number },
      { x: 5, y: 5, z: 5 },
      {
        delay: topTime,
        duration: zoomTime,
        ease: easeInExpo,
      }
    )

    new Tween(
      this.gameBoy.rotation as { x: number, z: number, y: number },
      { x: 0, y: -9 * Math.PI / 2, z: 0 },
      {
        delay: 0,
        duration: topTime,
        ease: topEase,
      }
    );

    setTimeout(this.onFinished.bind(this, this), topTime + zoomTime + 500)
  }

  dispose() {
    this.base.scene.remove( this.gameBoy )
  }

  protected onAssetLoaded () {
    this.loadCount--
    if (this.loadCount === 0) {
      requestAnimationFrame(this.startAnimation.bind(this))
    }
    return void 0
  }
}
