import {describe, it, expect} from 'vitest';

import {
  softSemisine,
  softSawtooth,
  softTriangle,
  softSquare,
  softSinh,
  softCosh,
  softTanh,
  softLog,
  softPulse,
  softTent,
} from '../library';

const PHASES = [-1.1, 0, 0.25, 0.5, 0.501, 1, 2.9];

function softSinh_(phase: number, sharpness: number) {
  return softSinh(phase, sharpness, 0.25);
}

function softPulse_(phase: number, sharpness: number) {
  return softPulse(phase, sharpness, 0.25);
}

function softTent_(phase: number, sharpness: number) {
  return softTent(phase, sharpness, 0.25);
}

describe.each([
  ['Soft semisine', softSemisine],
  ['Soft triangle', softTriangle],
  ['Soft sinh', softSinh_],
  ['Soft cosh', softCosh],
  ['Soft tanh', softTanh],
  ['Soft tent', softTent_],
])('%s', (name: string, fn: Function) => {
  it.each(PHASES)('is periodic across %s', (phase: number) => {
    expect(fn(phase, 0.5)).toBeCloseTo(fn(phase + 1, 0.5));
  });
  it.each(PHASES)(
    'is continuous around sharpness = 0 at %s',
    (phase: number) => {
      expect(fn(phase, 0.001)).toBeCloseTo(fn(phase, 0));
    }
  );
  it.each(PHASES)(
    'is continuous around sharpness = 1 at %s',
    (phase: number) => {
      expect(fn(phase, 0.9999)).toBeCloseTo(fn(phase, 1));
    }
  );
});

describe('Soft sawtooth', () => {
  it.each(PHASES)('is periodic across %s', (phase: number) => {
    expect(softSawtooth(phase, 0.5)).toBeCloseTo(softSawtooth(phase + 1, 0.5));
  });
  it.each(PHASES)(
    'is continuous around sharpness = 0 at %s',
    (phase: number) => {
      expect(softSawtooth(phase, 0.01)).toBeCloseTo(softSawtooth(phase, 0));
    }
  );
  it.each([-1.1, 0, 0.501, 1, 2.9])(
    'is continuous around sharpness = 1 at %s',
    (phase: number) => {
      expect(softSawtooth(phase, 0.9999)).toBeCloseTo(softSawtooth(phase, 1));
    }
  );
});

describe('Soft square', () => {
  it.each(PHASES)('is periodic across %s', (phase: number) => {
    expect(softSquare(phase, 0.5)).toBeCloseTo(softSquare(phase + 1, 0.5));
  });
  it.each(PHASES)(
    'is continuous around sharpness = 0 at %s',
    (phase: number) => {
      expect(softSquare(phase, 0.01)).toBeCloseTo(softSquare(phase, 0));
    }
  );
  it.each([-1.1, 0.01, 0.501, 1.01, 2.9])(
    'is continuous around sharpness = 1 at %s',
    (phase: number) => {
      expect(softSquare(phase, 0.99999)).toBeCloseTo(softSquare(phase, 1));
    }
  );
});

describe('Soft pulse', () => {
  it.each(PHASES)('is periodic across %s', (phase: number) => {
    expect(softPulse_(phase, 0.5)).toBeCloseTo(softPulse_(phase + 1, 0.5));
  });
  it.each(PHASES)(
    'is continuous around sharpness = 0 at %s',
    (phase: number) => {
      expect(softPulse_(phase, 0.01)).toBeCloseTo(softPulse_(phase, 0));
    }
  );
  it.each([-1.1, 0.01, 0.501, 1.01, 2.9])(
    'is continuous around sharpness = 1 at %s',
    (phase: number) => {
      expect(softPulse_(phase, 0.99999)).toBeCloseTo(softPulse_(phase, 1));
    }
  );
});

describe('Soft log', () => {
  it.each(PHASES)('is periodic across %s', (phase: number) => {
    expect(softLog(phase, 0.5)).toBeCloseTo(softLog(phase + 1, 0.5));
  });
  it.each(PHASES)(
    'is continuous around sharpness = 0 at %s',
    (phase: number) => {
      expect(softLog(phase, 0.001)).toBeCloseTo(softLog(phase, 0));
    }
  );
  // TODO: Assert continuity around sharpness = 1 if the limit exists
});
