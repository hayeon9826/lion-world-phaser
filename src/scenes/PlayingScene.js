import { Scene } from "phaser";
import Player from "../characters/Player";
import { setBackground } from "../utils/backgroundManager";
import Config from "../Config";

export class PlayingScene extends Scene {
  constructor() {
    super("playGame");
  }

  create() {
    console.log("playGame");
    // 사용할 sound들을 추가해놓는 부분입니다.
    // load는 전역적으로 어떤 scene에서든 asset을 사용할 수 있도록 load 해주는 것이고,
    // add는 해당 scene에서 사용할 수 있도록 scene의 멤버 변수로 추가할 때 사용하는 것입니다.

    this.sound.pauseOnBlur = false;
    this.m_beamSound = this.sound.add("audio_beam");
    this.m_scratchSound = this.sound.add("audio_scratch");
    this.m_hitMobSound = this.sound.add("audio_hitMob");
    this.m_growlSound = this.sound.add("audio_growl");
    this.m_explosionSound = this.sound.add("audio_explosion");
    this.m_expUpSound = this.sound.add("audio_expUp");
    this.m_hurtSound = this.sound.add("audio_hurt");
    this.m_nextLevelSound = this.sound.add("audio_nextLevel");
    this.m_gameOverSound = this.sound.add("audio_gameOver");
    this.m_gameClearSound = this.sound.add("audio_gameClear");
    this.m_pauseInSound = this.sound.add("audio_pauseIn");
    this.m_pauseOutSound = this.sound.add("audio_pauseOut");

    // player를 m_player라는 멤버 변수로 추가
    this.m_player = new Player(this);

    // 키보드 키를 m_cursorKeys라는 멤버 변수로 추가해줍니다.
    // @see - https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Input.Keyboard.CursorKeys
    this.m_cursorKeys = this.input.keyboard.createCursorKeys();

    // camera가 player를 따라오도록 하여 뱀파이어 서바이벌처럼 player가 가운데 고정되도록 합니다.
    this.cameras.main.startFollow(this.m_player);

    setBackground(this, "background1");
  }

  update() {
    this.movePlayerManager();

    // camera가 가는 곳으로 background가 따라 움직이도록 해줍니다.
    this.m_background.setX(this.m_player.x - Config.width / 2);
    this.m_background.setY(this.m_player.y - Config.height / 2);

    this.m_background.tilePositionX = this.m_player.x - Config.width / 2;
  }

  movePlayerManager() {
    if (
      this.m_cursorKeys.left.isDown ||
      this.m_cursorKeys.right.isDown ||
      this.m_cursorKeys.up.isDown ||
      this.m_cursorKeys.down.isDown
    ) {
      if (!this.m_player.m_moving) {
        this.m_player.play("player_anim");
      }
      this.m_player.m_moving = true;
    } else {
      if (this.m_player.m_moving) {
        this.m_player.play("player_idle");
      }
      this.m_player.m_moving = false;
    }

    // vector를 사용해 움직임을 관리할 것입니다.
    // vector = [x좌표 방향, y좌표 방향]입니다.
    // 왼쪽 키가 눌려있을 때는 vector[0] += -1, 오른쪽 키가 눌려있을 때는 vector[0] += 1을 해줍니다.
    // 위/아래 또한 같은 방법으로 벡터를 수정해줍니다.
    let vector = [0, 0];
    if (this.m_cursorKeys.left.isDown) {
      vector[0] += -1;
    } else if (this.m_cursorKeys.right.isDown) {
      vector[0] += 1;
    }

    if (this.m_cursorKeys.up.isDown) {
      vector[1] += -1;
    } else if (this.m_cursorKeys.down.isDown) {
      vector[1] += 1;
    }

    // vector를 player 클래스의 메소드의 파라미터로 넘겨줍니다.
    this.m_player.move(vector);
  }
}
