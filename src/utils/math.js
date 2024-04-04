import Config from "../Config";

/**
 * (x, y)로부터 r만큼 랜덤하게 떨어진(각도랜덤) 좌표를 반환합니다.
 * @param {Number} x
 * @param {Number} y
 */
export function getRandomPosition(x, y) {
  // Math.random() 함수를 사용하여 0부터 1 사이의 임의의 난수를 생성하고, 이를 0부터 2π 사이의 각도로 변환합니다.
  // 이 각도는 원의 둘레를 따라 임의의 위치를 선택하는 데 사용됩니다.
  const randRad = Math.random() * Math.PI * 2;
  // _r은 주어진 너비 Config.width와 높이 Config.height를 가진 사각형의 대각선 길이의 절반을 나타냅니다.
  // 이는 주어진 사각형의 대각선 길이의 절반이 곧 원의 반지름과 같다는 원의 특성을 이용한 것으로 보입니다.
  const _r =
    Math.sqrt(Config.width * Config.width + Config.height * Config.height) / 2;
  // _x는 원 중심의 x 좌표에 _r을 더한 후, 랜덤한 각도 randRad의 코사인 값을 곱하여 구해집니다.
  // 이것은 원 위의 임의의 점의 x 좌표입니다.
  const _x = x + _r * Math.cos(randRad);
  // _y는 원 중심의 y 좌표에 _r을 더한 후, 랜덤한 각도 randRad의 사인 값을 곱하여 구해집니다.
  //   _y는 원 중심의 y 좌표에 _r을 더한 후, 랜덤한 각도 randRad의 사인 값을 곱하여 구해집니다. 이것은 원 위의 임의의 점의 y 좌표입니다.이것은 원 위의 임의의 점의 y 좌표입니다.
  const _y = y + _r * Math.sin(randRad);

  return [_x, _y];
}
