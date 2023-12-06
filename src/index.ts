import {EvaluationContext, evalIncremental} from 'eval-math';

export type AudioBeeOptions = {
  quantizePeriod: boolean;
  quantizeLoopEnd: boolean;
  sampleRate: number;
  length: number;
  frequencies: number[];
  velocities: number[];
  numberOfChannels: number;
  loopStartT: number;
  loopEndT: number;
  reportProgress: (value: number) => void;
  locals: EvaluationContext;
};

export class BufferSourceFactory {
  buffer: AudioBuffer;
  velocity: number;
  frequency: number;
  loopStartT: number;
  loopEndT: number;

  constructor(
    buffer: AudioBuffer,
    velocity: number,
    frequency: number,
    loopStartT: number,
    loopEndT: number
  ) {
    this.buffer = buffer;
    this.velocity = velocity;
    this.frequency = frequency;
    this.loopStartT = loopStartT;
    this.loopEndT = loopEndT;
  }

  makeBufferSource(context: AudioContext, frequency: number) {
    const node = new AudioBufferSourceNode(context, {
      playbackRate: frequency / this.frequency,
    });
    node.buffer = this.buffer;
    node.loopStart = this.loopStartT;
    node.loopEnd = this.loopEndT;
    return node;
  }
}

export function roundFrequency(frequency: number, sampleRate: number) {
  const periodSamples = sampleRate / frequency;
  return sampleRate / Math.round(periodSamples);
}

export function quantizeLoopDuration(duration: number, frequency: number) {
  const period = 1 / frequency;
  const numPeriods = duration / period;
  return Math.round(numPeriods) * period;
}

export function evalSource(
  source: string,
  options: AudioBeeOptions
): Promise<BufferSourceFactory[]> {
  return new Promise((resolve, reject) => {
    try {
      // Dummy output to calculate ambient context
      const dummy = new Float64Array(options.length);

      const sampleRate = options.sampleRate;

      // TODO: Library functions.

      // Ambient context
      const N = dummy.length;
      const T = 1 / sampleRate;
      const n = dummy.map((_, i) => i);
      const t = n.map(i => i * T);

      const context: EvaluationContext = new Map(options.locals);
      context.set('N', N);
      context.set('T', T);
      context.set('n', n);
      context.set('t', t);

      const totalWork =
        options.velocities.length *
        options.frequencies.length *
        options.numberOfChannels;
      let done = 0;
      options.reportProgress(done / totalWork);

      const result: BufferSourceFactory[] = [];

      for (const velocity of options.velocities) {
        context.set('v', velocity);
        for (const frequency of options.frequencies) {
          let f = frequency;
          if (options.quantizePeriod) {
            f = roundFrequency(f, sampleRate);
          }
          context.set('f', f);

          // Computed config
          const loopStart = Math.round(sampleRate * options.loopStartT);
          let loopEnd = Math.round(sampleRate * options.loopEndT);
          if (options.quantizeLoopEnd) {
            const loopDurationT = quantizeLoopDuration(
              (loopEnd - loopStart) * T,
              f
            );
            loopEnd = Math.round(loopStart + loopDurationT * sampleRate);
          }
          context.set('loopStart', loopStart);
          context.set('loopEnd', loopEnd);

          // Buffer content will be calculated asynchronously.
          const buffer = new AudioBuffer({
            numberOfChannels: options.numberOfChannels,
            length: N,
            sampleRate,
          });
          result.push(
            new BufferSourceFactory(
              buffer,
              velocity,
              f,
              loopStart * T,
              loopEnd * T
            )
          );

          for (let i = 0; i < options.numberOfChannels; ++i) {
            const c = i;
            const channelContext = new Map(context);
            channelContext.set('c', c);
            setTimeout(() => {
              try {
                const output = new Float64Array(N);
                evalIncremental(source, output, channelContext);
                buffer.getChannelData(c).set(output);
                done++;
                options.reportProgress(done / totalWork);
                if (done === totalWork) {
                  resolve(result);
                }
              } catch (e) {
                reject(e);
              }
            }, 0);
          }
        }
      }
    } catch (e) {
      reject(e);
    }
  });
}
