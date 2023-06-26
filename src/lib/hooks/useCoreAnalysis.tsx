import { useAudioContext } from "../AudioContextProvider";
import { useCallback, useEffect, useState } from "react";

type useCoreAnalysisReturn = AnalyserNode | null;

export const useCoreAnalysis = (): useCoreAnalysisReturn => {
  const { audioContext, source } = useAudioContext();
  const [analyserCore, setAnalyserCore] = useState<AnalyserNode | null>(null);

  // eslint-disable-next-line @typescript-eslint/require-await
  const init = useCallback(async () => {
    if (!audioContext || !source) return;

    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    setAnalyserCore(analyser);
  }, [audioContext, source]);

  useEffect(() => {
    if (!analyserCore) {
      void init();
    }

    return () => {
      if (analyserCore) {
        analyserCore.disconnect();
      }
    };
  }, [audioContext, source, init, analyserCore]);

  return analyserCore;
};
