import { useCallback, useState } from "react";
import { useThrottleFn, useUnmount } from "ahooks";
import PitchAnalyser, { type PitchAnalyserOptions } from "pitch-analyser";

type PitchAnalyserPayload = {
  frequency: number;
  note: string;
};

type UsePitchAnalysisProps = {
  throttle: number;
};

type UsePitchAnalysisOutput = {
  startPitchAnalysis: () => Promise<void>;
  stopPitchAnalysis: () => void;
  pitch: number;
  note: string;
  active: boolean;
};

export const usePitchAnalysis = (
  { throttle }: UsePitchAnalysisProps = { throttle: 750 }
): UsePitchAnalysisOutput => {
  const [analyserPitch, setAnalyserPitch] = useState<PitchAnalyser | null>(
    null
  );
  const [active, setActive] = useState<boolean>(false);
  const [pitch, setPitch] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    run: throttledCallback,
    cancel: cancelThrottledCallback,
  } = useThrottleFn(
    ({ frequency, note }: PitchAnalyserPayload) => {
      if (!active) return;
      setPitch(frequency);
      setNote(note);
    },
    { wait: throttle }
  );

  const startPitchAnalysis = async () => {
    if (!active && !analyserPitch) {
      const analyserPitch = new PitchAnalyser({
        callback: throttledCallback as PitchAnalyserOptions["callback"],
      });

      await analyserPitch.initAnalyser(() => {
        analyserPitch.startAnalyser(() => {
          setAnalyserPitch(analyserPitch);
          setActive(true);
        });
      });
    }
  };

  const stopPitchAnalysis = useCallback(() => {
    if (active && analyserPitch) {
      // Stop the analyser
      if (
        analyserPitch.audioContext &&
        analyserPitch.audioContext.state === "running"
      ) {
        analyserPitch.stopAnalyser();
      }

      cancelThrottledCallback();

      // Reset State
      setAnalyserPitch(null);
      setPitch(0);
      setNote("-");
      setActive(false);
    }
  }, [active, analyserPitch, cancelThrottledCallback]);

  useUnmount(() => {
    if (!active) return;
    stopPitchAnalysis();
  });

  return {
    startPitchAnalysis,
    stopPitchAnalysis,
    pitch,
    note,
    active,
  };
};
