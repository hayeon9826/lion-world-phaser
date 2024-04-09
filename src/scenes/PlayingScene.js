import { Scene } from "phaser";
import Config from "../Config";
import Player from "../characters/Player";
import { setBackground } from "../utils/backgroundManager";
import Mob from "../characters/Mob";
import { addMobEvent } from "../utils/mobManager";
import { addAttackEvent } from "../utils/attackManager";

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

    // m_mobs는 physics group으로, 속한 모든 오브젝트에 동일한 물리법칙을 적옹할 수 있습니다.
    // m_mobEvents는 mob event의 timer를 담을 배열로, mob event를 추가 및 제거할 때 사용할 것입니다.
    // addMobEvent는 m_mobEvents에 mob event의 timer를 추가해줍니다.
    this.m_mobs = this.physics.add.group();
    // 처음에 몹이 없어서 에러가 나는 것을 방지
    this.m_mobs.add(new Mob(this, 0, 0, "mob1", "mob1_anim", 10, 0.9));
    this.m_mobEvents = [];

    // scene, repeatGap, mobTexture, mobAnim, mobHp, mobDropRate
    addMobEvent(this, 1000, "mob1", "mob1_anim", 10, 0.9);
    // addMobEvent(this, 500, "mob2", "mob2_anim", 20, 0.6);
    // addMobEvent(this, 800, "mob3", "mob3_anim", 30, 0.5);
    // addMobEvent(this, 400, "mob4", "mob4_anim", 40, 0.3);

    // attacks
    // 정적인 공격과 동적인 공격의 동작 방식이 다르므로 따로 group을 만들어줍니다.
    // attack event를 저장하는 객체도 멤버 변수로 만들어줍니다.
    // 이는 공격 강화등에 활용될 것입니다.
    this.m_weaponDynamic = this.add.group();
    this.m_weaponStatic = this.add.group();
    this.m_attackEvents = {};
    // PlayingScene이 실행되면 바로 beam attack event를 추가해줍니다.
    // scene, attackType, attackDamage, attackScale, repeatGap
    addAttackEvent(this, "beam", 10, 1, 1000);

    /**
     * 어떤 오브젝트들이 충돌했을 때 동작을 발생시키려면 physics.add.overlap 함수를 사용합니다.
     * 자바스크립트의 addEventListener와 비슷한 작용을 하는 함수
     * @param object1 오버랩되는지 검사할 오브젝트 1
     * @param object2 오버랩되는지 검사할 오브젝트 2
     * @param collideCallback 오브젝트 1과 오브젝트 2가 충돌하면 실행될 콜백함수입니다.
     * @param processCallback 두 오브젝트가 겹치는 경우 추가 검사를 수행할 수 있는 선택적 콜백 함수입니다. 이것이 설정되면 이 콜백이 true를 반환하는 경우에만 collideCallback이 호출됩니다.
     * @param callbackContext 콜백 스코프입니다. (this를 사용하시면 됩니다.)
     */

    // Player와 mob이 부딪혔을 경우 player에 데미지 10을 줍니다.
    // (Player.js에서 hitByMob 함수 확인)
    this.physics.add.overlap(
      this.m_player,
      this.m_mobs,
      () => this.m_player.hitByMob(10),
      null,
      this
    );

    // mob이 dynamic 공격에 부딪혓을 경우 mob에 해당 공격의 데미지만큼 데미지를 줍니다.
    // (Mob.js에서 hitByDynamic 함수 확인)
    this.physics.add.overlap(
      this.m_weaponDynamic,
      this.m_mobs,
      (weapon, mob) => {
        mob.hitByDynamic(weapon, weapon.m_damage);
      },
      null,
      this
    );

    // mob이 static 공격에 부딪혓을 경우 mob에 해당 공격의 데미지만큼 데미지를 줍니다.
    // (Mob.js에서 hitByStatic 함수 확인)
    this.physics.add.overlap(
      this.m_weaponStatic,
      this.m_mobs,
      (weapon, mob) => {
        mob.hitByStatic(weapon, weapon.m_damage);
      },
      null,
      this
    );

    // exp up item들을 담을 physics group을 추가해줍니다.
    this.m_expUps = this.physics.add.group();

    // player와 expUp이 접촉했을 때 pickExpUp 메소드가 동작하도록 합니다
    this.physics.add.overlap(
      this.m_player,
      this.m_expUps,
      this.pickExpUp,
      null,
      this
    );
  }

  update() {
    this.movePlayerManager();

    // camera가 가는 곳으로 background가 따라 움직이도록 해줍니다.
    this.m_background.setX(this.m_player.x - Config.width / 2);
    this.m_background.setY(this.m_player.y - Config.height / 2);

    this.m_background.tilePositionX = this.m_player.x - Config.width / 2;
    this.m_background.tilePositionY = this.m_player.y - Config.width / 2;

    // player로부터 가장 가까운 mob을 구합니다.
    // 가장 가까운 mob은 mob, player의 움직임에 따라 계속 바뀌므로 update 내에서 구해야 합니다.
    // getChildren: group에 속한 모든 객체들의 배열을 리턴하는 메소드입니다.
    const closest = this.physics.closest(
      this.m_player,
      this.m_mobs.getChildren()
    );
    this.m_closest = closest;
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

  // player와 expUp이 접촉했을 때 실행되는 메소드입니다.
  pickExpUp(player, expUp) {
    // expUp을 비활성화하고 화면에 보이지 않게 합니다.
    expUp.disableBody(true, true);
    // expUp을 제거합니다.
    expUp.destroy();

    // 소리를 재생합니다.
    this.m_expUpSound.play();
    // 일단 콘솔로 상승한 경험치를 출력합니다.
    console.log(`경험치 ${expUp.m_exp} 상승!`);
  }
}
