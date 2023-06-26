import { useAudioContext } from "../AudioContextProvider";
import {
  createRealTimeBpmProcessor,
  getBiquadFilters,
} from "realtime-bpm-analyzer";
import { useCallback, useEffect, useState } from "react";

type BPM_EVENT = {
  message: "BPM" | "BPM_STABLE";
  result: {
    bpm: {
      tempo: number;
      confidence: number;
      count: number;
    }[]
    threshold: number;
  }
}

export const useBpmAnalysis = () => {
  const { audioContext, source } = useAudioContext();
  const [analyserBpm, setAnalyserBpmState] = useState<AudioWorkletNode | null>(
    null
  );
  const [bpm, setBpm] = useState<number>(0);

  const startBpmAnalysis = useCallback(async () => {
    if (!audioContext || !source) return;

    const analyser = await createRealTimeBpmProcessor(audioContext);
    const { lowpass, highpass } = getBiquadFilters(audioContext);
    source.connect(lowpass).connect(highpass).connect(analyser);

    analyser.port.postMessage({
      message: "ASYNC_CONFIGURATION",
      parameters: {
        continuousAnalysis: true,
        // stabilizationTime: 20_000, // Default value is 20_000ms after what the library will automatically delete all collected data and restart analysing BPM
      },
    });

    analyser.port.onmessage = ({data }: {data: BPM_EVENT}) => {
      if (data.message === "BPM") {
        if (data.result.bpm.length > 0 && data.result.bpm[0]) {
          // console.log("BPM", data.result);
          setBpm(data.result.bpm[0].tempo);
        }
      }
    };

    setAnalyserBpmState(analyser);
  }, [audioContext, source]);

  useEffect(() => {
    if (!analyserBpm) {
      void startBpmAnalysis();
    }

    return () => {
      if (analyserBpm) {
        analyserBpm.disconnect();
        analyserBpm.port.close();
      }
    };
  }, [analyserBpm, audioContext, source, startBpmAnalysis]);

  return bpm;
};
