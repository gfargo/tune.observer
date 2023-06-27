import { useAudioContext } from "@/lib/AudioContextProvider";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { useCallback, useEffect, useRef, useState } from "react";

export const AudioMotionVisualizer: React.FC = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const { source, audioContext } = useAudioContext();
  const [audioMotion, setAudioMotion] = useState<AudioMotionAnalyzer | null>(
    null
  );

  // eslint-disable-next-line @typescript-eslint/require-await
  const init = useCallback(async () => {
    if (!container.current || !audioContext || !source || audioMotion) return;

    const audioMotionAnalyzer = new AudioMotionAnalyzer(container.current, {
      audioCtx: audioContext,
      connectSpeakers: false,
      gradient: "rainbow",
      mode: 3,
      barSpace: 0.4,
      frequencyScale: "bark",
      alphaBars: true,
      overlay: true,
      radial: true,
      showBgColor: false,
      maxFreq: 20000,
      minFreq: 30,
    });

    audioMotionAnalyzer.connectInput(source);

    setAudioMotion(audioMotionAnalyzer);
  }, [audioContext, audioMotion, source]);

  useEffect(() => {
    // if (audioMotion) return;
    if (!audioMotion) {
      void init();
      return;
    }

    return () => {
      container.current?.children[0]?.remove();
      setAudioMotion(null);
    };
  }, [source, audioContext, init, audioMotion]);

  return (
    <div ref={container} className="absolute inset-0 z-0 h-screen w-screen" />
  );
};

export default AudioMotionVisualizer;
