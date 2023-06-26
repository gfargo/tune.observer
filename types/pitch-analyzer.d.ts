declare module 'pitch-analyser' {
  type PitchAnalyserOptions = {
    microphone?: boolean;
    audioFile?: boolean;
    callback?: (returnValue: PitchAnalyserReturnValue) => void;
    returnNote?: boolean;
    returnCents?: boolean;
    decimals?: number;
  };

  type PitchAnalyserReturnValue = {
    frequency: number;
    note?: string;
    cents?: number;
  };

  class PitchAnalyser {
    audioContext: AudioContext;

    constructor(args: PitchAnalyserOptions);

    initAnalyser(callback?: () => void): Promise<void>;

    startAnalyser(callback?: () => void): void;

    resumeAnalyser(callback?: () => void): void;

    pauseAnalyser(callback?: () => void): void;

    stopAnalyser(callback?: () => void): void;
  }

  export default PitchAnalyser;
}
