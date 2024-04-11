import Beam from "../effects/Beam";
import Catnip from "../effects/Catnip";
import Claw from "../effects/Claw";

// 해당 파일에서는 '공격'과 관련된 이벤트들을 처리함

/**
 * scene에 attackType 타입의 공격(데미지 damage, 크기 attackScale) 이벤트를 추가해줍니다.
 * 공격은 repeatGap ms 간격으로 계속해서 발생합니다.
 * @param {Phaser.Scene} scene - attack을 발생시킬 scene
 * @param {String} attackType - attack의 유형
 * @param {Number} damage - attack이 mob에 입히는 데미지
 * @param {Number} attackScale - attack의 크기
 * @param {Number} repeatGap - attack 반복 간격 (ms단위)
 */
// catnip의 경우 repeatGap이 없으므로 repeatGap의 기본값을 0으로 설정해주었습니다.
export function addAttackEvent(
  scene,
  attackType,
  damage,
  scale,
  repeatGap = 0
) {
  // 다양한 attackType이 생길 것을 대비하여 switch case 문을 사용합니다.
  switch (attackType) {
    // beam, claw는 일정 시간 간격마다 공격이 발생합니다.
    // scene.time.addEvent를 사용해 repeatGap(ms)마다 한 세트의 공격이 발생하도록 했고 (doAttackOneSet)
    // m_attackEvents에 { timer, damage, scale, repeatGap } 객체를 저장해 주었습니다.
    case "beam":
    case "claw":
      const timer = scene.time.addEvent({
        delay: repeatGap,
        callback: () => {
          // 해당 함수 아래에 작성
          // shootBeam(scene, damage, attackScale);
          doAttackOneSet(scene, attackType, damage, scale);
        },
        loop: true, // 무한반복
      });
      // PlayingScene의 m_attackEvents 객체에 키는 'beam', 밸류는 beam 공격의 timer로 프로퍼티를 추가해줍니다.
      // scene.m_attackEvents.beam = timerBeam;
      scene.m_attackEvents[attackType] = { timer, damage, scale, repeatGap };
      break;
    // catnip의 경우 일정 시간 간격으로 연속해서 발생하는 공격이 아니라
    // 추가되면 계속해서 존재하는 공격이므로 beam, claw와 처리 방식이 다릅니다.
    // m_attackEvents에도 catnip 객체를 그대로 넣어주었습니다.
    case "catnip":
      const catnip = new Catnip(
        scene,
        [scene.m_player.x, scene.m_player.y + 20],
        damage,
        scale
      );
      // scene.m_attackEvents[attackType] = catnip;
      scene.m_attackEvents[attackType] = { object: catnip, damage: damage };
      break;
  }
}

// Beam을 쏘는 함수입니다.
function shootBeam(scene, damage, scale) {
  // scene, startingPosition, damage, scale
  new Beam(scene, [scene.m_player.x, scene.m_player.y - 16], damage, scale);
}

// attackType 공격의 한 세트를 수행하는 함수입니다.
// shootBeam는 이 함수의 case "beam"에 통합됩니다.
function doAttackOneSet(scene, attackType, damage, scale) {
  switch (attackType) {
    // beam은 하나를 쏘는 것이 한 세트입니다.
    case "beam":
      new Beam(scene, [scene.m_player.x, scene.m_player.y - 16], damage, scale);
      break;
    case "claw":
      // claw는 플레이어의 앞쪽 공격 1번, 뒤쪽 공격 1번이 한 세트입니다.
      // isHeadingRight은 플레이어가 바라보는 방향에 따라 claw 이미지를 적절히 나타내기 위한 변수입니다.
      const isHeadingRight = scene.m_player.flipX;
      new Claw(
        scene,
        [scene.m_player.x - 60 + 120 * isHeadingRight, scene.m_player.y - 40],
        isHeadingRight,
        damage,
        scale
      );

      // 앞쪽 공격, 뒤쪽 공격 사이의 시간 간격은 0.5s로 설정했습니다.
      scene.time.addEvent({
        delay: 500,
        callback: () => {
          new Claw(
            scene,
            [
              scene.m_player.x - 60 + 120 * !isHeadingRight,
              scene.m_player.y - 40,
            ],
            !isHeadingRight,
            damage,
            scale
          );
        },
        loop: false,
      });
      break;
    default:
      break;
  }
}

// scene에 있는 attackType의 공격을 제거해주는 함수입니다.
export function removeAttack(scene, attackType) {
  if (!scene.m_attackEvents[attackType]) return;
  // catnip의 경우 object를 제거합니다.
  if (attackType === "catnip") {
    scene.m_attackEvents[attackType].object.destroy();
    return;
  }
  // 다른 공격(beam, claw)의 경우 설정했던 timer를 비활성화합니다.
  scene.time.removeEvent(scene.m_attackEvents[attackType].timer);
}

// scene에 있는 attackType 공격의 damage를 재설정해주는 함수입니다.
export function setAttackDamage(scene, attackType, newDamage) {
  const scale = scene.m_attackEvents[attackType].scale;
  const repeatGap = scene.m_attackEvents[attackType].repeatGap;
  removeAttack(scene, attackType);
  addAttackEvent(scene, attackType, newDamage, scale, repeatGap);
}

// scene에 있는 attackType 공격의 scale을 재설정해주는 함수입니다.
export function setAttackScale(scene, attackType, newScale) {
  const damage = scene.m_attackEvents[attackType].damage;
  const repeatGap = scene.m_attackEvents[attackType].repeatGap;
  removeAttack(scene, attackType);
  addAttackEvent(scene, attackType, damage, newScale, repeatGap);
}

// scene에 있는 attackType 공격의 repeatGap을 재설정해주는 함수입니다.
export function setAttackRepeatGap(scene, attackType, newRepeatGap) {
  // catnip의 경우 repeatGap이 없으므로 예외처리해 줍니다.
  if (attackType === "catnip") {
    console.error("Cannot set catnip's repeat gap");
    return;
  }

  const damage = scene.m_attackEvents[attackType].damage;
  const scale = scene.m_attackEvents[attackType].scale;
  removeAttack(scene, attackType);
  addAttackEvent(scene, attackType, damage, scale, newRepeatGap);
}

// // Beam의 지속시간을 설정해주는 함수입니다. (ms단위)
// export function setBeamDuration(duration) {
//   Beam.DURATION = duration;
// }
