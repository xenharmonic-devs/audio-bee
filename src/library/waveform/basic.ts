const TAU = 2 * Math.PI;

export function sine(phase: number) {
  return Math.sin(TAU * phase);
}

export function cosine(phase: number) {
  return Math.cos(TAU * phase);
}

export function semisine(phase: number) {
  return Math.abs(Math.cos(Math.PI * phase)) * 2 - 1;
}

export function sawtooth(phase: number) {
  return 2 * (phase - Math.floor(phase + 0.5));
}

export function triangle(phase: number) {
  return 1 - 4 * Math.abs(phase - Math.floor(phase + 0.25) - 0.25);
}

export function square(phase: number) {
  return Number(phase - Math.floor(phase) < 0.5) * 2 - 1;
}
