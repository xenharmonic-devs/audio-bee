import {describe, it, expect} from 'vitest';
import {ftom, mtof, triangle} from '../library';

describe('MIDI to frequency converter', () => {
  it('converts a known value', () => {
    expect(mtof(60)).toBeCloseTo(261.625565);
  });
});

describe('Unrestricted Frequency to MTS converter', () => {
  it('converts known frequency values (based on MIDI Tuning Spec)', () => {
    expect(ftom(8.175799)).toBeCloseTo(0);
    expect(ftom(8.175828)).toBeCloseTo(0.000062);
    expect(ftom(8.661957)).toBeCloseTo(1);
    expect(ftom(16.351598)).toBeCloseTo(12);
    expect(ftom(261.625565)).toBeCloseTo(60);
    expect(ftom(277.182631)).toBeCloseTo(61);
    expect(ftom(439.998449)).toBeCloseTo(68.999939);
    expect(ftom(440)).toBeCloseTo(69);
    expect(ftom(440.001551)).toBeCloseTo(69.000061);
    expect(ftom(8372.01809)).toBeCloseTo(120);
    expect(ftom(8372.047605)).toBeCloseTo(120.000061);
    expect(ftom(12543.853951)).toBeCloseTo(127);
    expect(ftom(12543.898175)).toBeCloseTo(127.000061);
    expect(ftom(13289.656616)).toBeCloseTo(127.999878);
    expect(ftom(13289.656616)).toBeCloseTo(127.999878);
  });

  it('does not clamp values above the specified MTS frequency range if ignoreLimit is true', () => {
    expect(ftom(1)).toBeCloseTo(-36.37631656229583);
    expect(ftom(14080)).toBeCloseTo(129);
    expect(ftom(28980)).toBeCloseTo(141.496923, 4);
  });
});

describe('Triangle waveform', () => {
  it('goes up and down linearly', () => {
    expect(triangle(0)).toBe(0);
    expect(triangle(0.125)).toBe(0.5);
    expect(triangle(0.25)).toBe(1);
    expect(triangle(0.5)).toBe(0);
    expect(triangle(0.75)).toBe(-1);
    expect(triangle(1)).toBe(0);
  });
});
