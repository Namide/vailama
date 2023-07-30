import './styles/index.css'
import { Intro } from './world/Intro'
import { Base } from './world/Base'
import { StartScreen } from './world/StartScreen'
import { ScoreScreen } from './world/ScoreScreen'
import { Game } from './world/Game'
import { FIRST_SCREEN } from './config.json'

const canvas = document.body.querySelector('canvas')
if (canvas) {
  const base = new Base(canvas)
  switch(FIRST_SCREEN) {
    case 1:
      switchToMenu(base)
    break;
    case 2:
      switchToGame(base)
    break;
    case 3:
      switchToScore({ score: 30, life: 1, base } as Game)
    break;
    default:
      startIntro(base)
  }
} else {
  throw new Error('Canvas not found')
}

function startIntro (base: Base) {
  new Intro(
    base,
    () => switchToMenu(base)
  )
}

function switchToMenu (base: Base) {
  new StartScreen(
    base,
    () => switchToGame(base)
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