/* eslint-disable @typescript-eslint/no-unused-vars */
import {describe, it, expect, vi} from 'vitest';
import {type AudioBeeOptions, evalSource} from '..';

class MockAudioBuffer implements AudioBuffer {
  options: AudioBufferOptions;
  _channelData: Float32Array[];
  constructor(options: AudioBufferOptions) {
    this.options = options;
    this._channelData = [];
    for (let i = 0; i < this.numberOfChannels; ++i) {
      this._channelData.push(new Float32Array(this.length));
    }
  }

  get length() {
    return this.options.length;
  }

  get numberOfChannels() {
    return this.options.numberOfChannels ?? 1;
  }

  get sampleRate() {
    return this.options.sampleRate;
  }

  get duration() {
    return this.options.length / this.options.sampleRate;
  }

  getChannelData(channel: number): Float32Array {
    return this._channelData[channel];
  }

  copyFromChannel(
    destination: Float32Array,
    channelNumber: number,
    bufferOffset?: number | undefined
  ): void {
    throw new Error("I'm just a mock you silly goose");
  }

  copyToChannel(
    source: Float32Array,
    channelNumber: number,
    bufferOffset?: number | undefined
  ): void {
    throw new Error("I'm just a mock you silly goose");
  }
}

vi.stubGlobal('AudioBuffer', MockAudioBuffer);

describe('Audio Buffer Expression Evaluator', () => {
  it('evaluates source code producing audio buffers (single)', async () => {
    const reportProgress = vi.fn();
    const options: AudioBeeOptions = {
      sampleRate: 1000,
      length: 2000, // Two 'seconds'
      quantizePeriod: false,
      quantizeLoopEnd: false,
      frequencies: [100],
      velocities: [0.5],
      numberOfChannels: 1,
      loopStartT: 0,
      loopEndT: 0,
      reportProgress,
    };
    const source = 'v * sin(TAU * f * t) * exp(-5 * t)';
    const factories = await evalSource(source, options);
    expect(factories).toHaveLength(1);
    expect(factories[0].buffer.numberOfChannels).toBe(1);
    const data = factories[0].buffer.getChannelData(0);
    for (let i = 0; i < 2000; ++i) {
      const t = i / 1000;
      const value = 0.5 * Math.sin(2 * Math.PI * 100 * t) * Math.exp(-5 * t);
      expect(data[i]).toBeCloseTo(value);
    }
    expect(reportProgress).toBeCalledWith(0);
    expect(reportProgress).toBeCalledWith(1);
  });
});
