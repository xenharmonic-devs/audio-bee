import {
  cosine,
  sawtooth,
  semisine,
  sine,
  square,
  triangle,
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
} from './waveform';

export * from './waveform';

const SEMITONE = 2 ** (1 / 12);
const ILOG_SEMITONE = 1 / Math.log(SEMITONE);
const FTOM_OFFSET = Math.log(1 / 440) * ILOG_SEMITONE + 69;

/**
 * Unrestricted frequency to MIDI index conversion.
 * @param frequency Frequency in Hertz.
 * @returns Index of corresponding MIDI note / MTS value, likely fractional.
 */
export function ftom(frequency: number) {
  return Math.log(frequency) * ILOG_SEMITONE + FTOM_OFFSET;
}

const MTOF_OFFSET = ftom(1);

/**
 * Convert MIDI note number to frequency.
 * @param index MIDI note number or MTS value.
 * @returns Frequency in Hertz.
 */
export function mtof(index: number) {
  return SEMITONE ** (index - MTOF_OFFSET);
}

export const LIBRARY_FUNCTIONS: Record<string, Function> = {
  ftom,
  mtof,
  sine,
  cosine,
  semisine,
  sawtooth,
  triangle,
  square,
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
};
