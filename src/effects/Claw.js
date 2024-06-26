import Phaser from "phaser";
import { PLAYER_SPEED } from "../characters/Player";

export default class Claw extends Phaser.Physics.Arcade.Sprite {
  // scene의 startingPosition 위치에 데미지 damage와 크기 scale의 claw를 생성합니다.
  // isHeadingRight - 왼쪽을 보고있는지, 오른쪽을 보고있는지 확인해서 이미지 반전
  constructor(scene, startingPosition, isHeadingRight, damage, scale) {
    super(scene, startingPosition[0], startingPosition[1], "claw_white");

    // 화면 및 물리엔진에 추가합니다.
    scene.add.existing(this);
    scene.physics.world.enableBody(this);

    // Claw static 공격입니다. (플레이어 주변에만 발생하고 몹으로 이동하지 않음)
    scene.m_weaponStatic.add(this);

    // 공격 소리를 추가합니다.
    scene.m_scratchSound.play({ volume: 0.5 });

    // Claw 공격은 앞 1회, 뒤 1회가 한 세트입니다.
    // DURATION은 각 Claw 공격의 지속 시간(ms)입니다.
    this.DURATION = 500;

    // 데미지를 멤버 변수로 설정해줍니다.
    this.m_damage = damage;

    // 크기, 투명도, depth를 설정해줍니다.
    this.scale = scale;
    this.setDepth(30);

    // 애니메이션을 재생합니다.
    this.play("scratch_white");

    // 플레이어가 왼쪽을 보고 있을 경우 claw 이미지를 좌우 반전시킵니다.
    if (!isHeadingRight) {
      this.flipX = true;
    }

    // Claw는 DURATION만큼 지속됩니다.
    scene.time.addEvent({
      delay: Claw.DURATION,
      callback: () => {
        this.destroy();
      },
      loop: false,
    });
  }

  // 플레이어가 움직이면 Catnip도 따라 움직여야 하므로 move 메서드를 만들어주었습니다.
  move(vector) {
    this.x += vector[0] * PLAYER_SPEED;
    this.y += vector[1] * PLAYER_SPEED;
  }
}
