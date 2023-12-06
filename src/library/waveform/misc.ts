export function twine(phase: number) {
  const x = phase - Math.floor(phase + 0.5);
  return 4 * x * Math.sqrt(1 - 4 * x * x);
}

export function halfCircleDC(phase: number) {
  const x = phase - Math.floor(phase + 0.5);
  return Math.sqrt(1 - 4 * x * x);
}

export function halfCircle(phase: number) {
  const x = phase - Math.floor(phase + 0.5);
  return Math.sqrt(1.6211389382774044 - 6.484555753109618 * x * x) - 1;
}

export function tang(phase: number) {
  const x = phase - Math.floor(phase + 0.5);
  return Math.abs(x) < 0.499
    ? (Math.tanh(Math.tan(Math.PI * phase)) - 2 * x) * 3.5686502577037404
    : 7.137300515407481 * (0.5 - phase + Math.floor(phase));
}

export function pinch(phase: number) {
  const x = phase - Math.floor(phase + 0.5);
  return (
    Math.atan(Math.atanh(0.99 - 1.98 * Math.abs(x + x))) * 0.82675935153194158
  );
}

export function tooth(phase: number, tension = 1) {
  return Math.tanh(tension * Math.tan(Math.PI * phase) ** 2) * 2 - 1;
}

export function tri(phase: number, tension = 1) {
  const x = phase - Math.floor(phase + 0.5);
  return Math.tanh(
    Math.abs(tension) * Math.tan(2 * Math.PI * Math.abs(x) - 0.5 * Math.PI)
  );
}
