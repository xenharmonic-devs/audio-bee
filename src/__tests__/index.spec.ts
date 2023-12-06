/* eslint-disable @typescript-eslint/no-unused-vars */
import {describe, it, expect, vi} from 'vitest';
import {type AudioBeeOptions, evalSource, sawtooth, sine} from '..';

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

function basicOptions(): AudioBeeOptions {
  const reportProgress = vi.fn();
  return {
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
    locals: new Map(),
  };
}

describe('Audio Buffer Expression Evaluator', () => {
  it('evaluates source code producing audio buffers (single)', async () => {
    const options = basicOptions();
    const source = 'v * sin(TAU * f * t) * exp(-5 * t)';
    const factories = await evalSource(source, options);
    expect(factories).toHaveLength(1);
    const factory = factories[0];
    expect(factory.velocity).toBe(0.5);
    expect(factory.frequency).toBe(100);
    expect(factory.buffer.numberOfChannels).toBe(1);
    const data = factory.buffer.getChannelData(0);
    for (let i = 0; i < 2000; ++i) {
      const t = i / 1000;
      const value = 0.5 * Math.sin(2 * Math.PI * 100 * t) * Math.exp(-5 * t);
      expect(data[i]).toBeCloseTo(value);
    }
    expect(options.reportProgress).toBeCalledWith(0);
    expect(options.reportProgress).toBeCalledWith(1);
  });

  it('handles errors gracefully', () => {
    const options = basicOptions();
    const source = 'v * sin(TAU * f * t * exp(-5 * t)';
    const resolve = vi.fn();
    const reject = vi.fn();
    const promise = evalSource(source, options);
    promise
      .then(resolve)
      .catch(reject)
      .then(() => {
        expect(resolve).not.toBeCalled();
        expect(reject).toBeCalled();
      });
  });

  it('support provision of external parameters', async () => {
    const options = basicOptions();
    options.locals.set('index', 5);
    const source = 'v * sin(TAU * f * t + sin(TAU * f * index * t))';
    const factories = await evalSource(source, options);
    expect(factories).toHaveLength(1);
    const factory = factories[0];
    const data = factory.buffer.getChannelData(0);
    for (let i = 0; i < 2000; ++i) {
      const t = i / 1000;
      const value =
        0.5 * Math.sin(2 * Math.PI * 100 * t + Math.sin(2 * Math.PI * 500 * t));
      expect(data[i]).toBeCloseTo(value);
    }
  });

  it('has a library of functions', async () => {
    const options = basicOptions();
    const source = 'sawtooth(t)';
    const data = (await evalSource(source, options))[0].buffer.getChannelData(
      0
    );
    for (let i = 0; i < 2000; ++i) {
      const t = i / 1000;
      const value = ((2 * t + 1) % 2) - 1;
      expect(data[i]).toBeCloseTo(value);
    }
  });

  it('has parametrized soft versions of basic waveforms', async () => {
    const options = basicOptions();
    const source = 'softSawtooth(10*t, 0.5*t)';
    const data = (await evalSource(source, options))[0].buffer.getChannelData(
      0
    );
    for (let i = 0; i < 2000; ++i) {
      const t = i / 1000;
      const sin = sine(10 * t);
      const saw = sawtooth(10 * t);
      if (i <= 30) {
        expect(data[i]).toBeCloseTo(sin);
      } else if (i <= 211) {
        expect(data[i]).toBeCloseTo(sin, 1);
      } else if (i > 1975) {
        expect(data[i]).toBeCloseTo(saw, 1);
      }
    }
  });
});
