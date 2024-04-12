import { PlayingScene } from "./scenes/PlayingScene";
import { LoadingScene } from "./scenes/LoadingScene";
import GameOverScene from "./scenes/GameOverScene";
import MainScene from "./scenes/MainScene";

const Config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  backgroundColor: 0x000000,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: process.env.DEBUG === "true",
    },
  },
  scene: [LoadingScene, PlayingScene, GameOverScene, MainScene],
};

export default Config;
