import './style.css'
import { Intro } from './world/Intro'
import { Base } from './world/Base'
import { StartScreen } from './world/StartScreen'
import { ScoreScreen } from './world/ScoreScreen'
import { Game } from './world/Game'
import { FIRST_SCREEN } from './config.json'

const canvas = document.body.querySelector('canvas')

function switchToMenu (base: Base) {
  new StartScreen(
    base,
    (startScreen) => {
      startScreen.dispose()
      switchToGame(base)
    }
  )
}

function switchToGame (base: Base) {
  new Game(
    base,
    (game) => switchToScore(game)
  )
}

function switchToScore (game: Game) {
  new ScoreScreen(
    game,
    (score) => switchToMenu(score.base)
  )
}

if (canvas) {
  const base = new Base(canvas)
  new Promise<Intro | void>((resolve) => {
    if (FIRST_SCREEN < 1) {
      new Intro(
        base,
        (intro) => {
          resolve(intro)
        }
      )
    } else if (FIRST_SCREEN > 0) {
      resolve()
    }
  }).then((intro) => {
    if (FIRST_SCREEN < 2) {
      switchToMenu(base)
      if (intro) {
        intro.dispose()
      }
    } else if (FIRST_SCREEN < 3) {
      switchToGame(base)
      if (intro) {
        intro.dispose()
      }
    } else {
      switchToScore({ score: 30, life: 1, base } as Game)
    }
  })
}
