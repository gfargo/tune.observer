"use client";

import { useAsyncEffect } from "ahooks";
import { useEffect, useRef, useState } from "react";
import {
  createRealTimeBpmProcessor,
  getBiquadFilters,
} from "realtime-bpm-analyzer";
import type { RealTimeBpmAnalyzer } from "realtime-bpm-analyzer";

type AudioContextState = {
  audioContext: AudioContext | null;
  stream: MediaStream | null;
  source: MediaStreamAudioSourceNode | null;
  analyzerCore: AnalyserNode | null;
  analyzerBpm: AudioWorkletNode | null;
};

const AudioAnalyzer = () => {
  // Basic State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bpm, setBpm] = useState<number>(0);
  const [keys, setKeys] = useState<string[]>([]);

  // AudioStream Context
  const [context, setAudioContext] = useState<AudioContextState>({
    audioContext: null,
    source: null,
    stream: null,
    analyzerBpm: null,
    analyzerCore: null,
  });

  // Waveform Canvas Ref
  const analyserCanvas: any = useRef(null);

  const startAnalysis = async () => {
    if (!context?.audioContext) {
      await getAudioContext();
    }

    if (!context?.analyzerCore || !context?.analyzerBpm) {
      await getAudioAnalyser();
    }

    setIsAnalyzing(true);
  };

  const getAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      setAudioContext({
        ...context,
        audioContext,
        stream,
        source,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getAudioAnalyser = async () => {
    if (!context?.analyzerCore || !context?.analyzerBpm) {
      if (
        context.audioContext &&
        context.source &&
        context.stream &&
        !context.analyzerBpm &&
        !context.analyzerCore
      ) {
        const analyzerCore = context.audioContext.createAnalyser();

        const analyzerBpm = await createRealTimeBpmProcessor(
          context.audioContext
        );

        setAudioContext({
          ...context,
          analyzerBpm,
          analyzerCore,
        });
      }
    }
  };

  useAsyncEffect(getAudioAnalyser, [context]);

  //
  // Setup Core Analyzer
  //
  useEffect(() => {
    if (context.analyzerCore && context.source && context.audioContext) {
      context.analyzerCore.fftSize = 2048;
      context.source.connect(context.analyzerCore);
      const data = new Uint8Array(context.analyzerCore.frequencyBinCount);

      // Do stuff...

      const ctx = analyserCanvas.current.getContext("2d");

      const draw = (dataParm: any) => {
        dataParm = [...dataParm];
        ctx.fillStyle = "white"; //white background
        ctx.lineWidth = 2; //width of candle/bar
        ctx.strokeStyle = "hsl(280,100%,70%)"; //color of candle/bar
        const space = analyserCanvas.current.width / dataParm.length;
        dataParm.forEach((value: number, i: number) => {
          ctx.beginPath();
          ctx.moveTo(space * i, analyserCanvas.current.height); //x,y
          ctx.lineTo(space * i, analyserCanvas.current.height - value); //x,y
          ctx.stroke();
        });
      };

      const loopingFunction = () => {
        requestAnimationFrame(loopingFunction);
        if (context.analyzerCore === null) return;
        context.analyzerCore.getByteFrequencyData(data);
        ctx.clearRect(
          0,
          0,
          analyserCanvas.current.width,
          analyserCanvas.current.height
        );
        draw(data);
      };

      /* "requestAnimationFrame" requests the browser to execute the code during the next repaint cycle. This allows the system to optimize resources and frame-rate to reduce unnecessary reflow/repaint calls. */
      requestAnimationFrame(loopingFunction);
    }
  }, [context.analyzerCore]);

  //
  // Setup BPM Analyzer
  //
  useEffect(() => {
    if (context.analyzerBpm && context.source && context.audioContext) {
      // The library provides built in biquad filters, so no need to configure them
      const { lowpass, highpass } = getBiquadFilters(context.audioContext);

      // Connect nodes together
      context.source
        .connect(lowpass)
        .connect(highpass)
        .connect(context.analyzerBpm);

      context.source.connect(context.audioContext.destination);

      context.analyzerBpm.port.onmessage = (event) => {
        if (isAnalyzing) {
          if (event.data.message === "BPM") {
            console.log("BPM", event.data.result);
            setBpm(event.data.result.bpm);
            setKeys(event.data.result.keys);
          }

          if (event.data.message === "BPM_STABLE") {
            console.log("BPM_STABLE", event.data.result);
          }

          if (
            event.data.message !== "BPM" ||
            event.data.message !== "BPM_STABLE"
          ) {
            console.log("Other Event:", event.data.message);
          }
        }
      };

      // Unsubscribe from the analyzer
      return () => {
        stopAnalysis();
      };
    }
  }, [context.analyzerBpm]);

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    if (context.analyzerBpm) {
      context.analyzerBpm.disconnect();
      context.analyzerBpm.port.close();
    }
    if (context.analyzerCore) {
      context.analyzerCore.disconnect();
    }
  };

  return (
    // transparent tailwind background
    <>
      <button
        onClick={isAnalyzing ? stopAnalysis : startAnalysis}
        className="flex max-w-[20rem] flex-row items-center rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-lg font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[hsl(280,100%,60%)]"
      >
        {isAnalyzing ? "Stop" : "Start"} Listening
      </button>

      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-[hsla(0,0%,100%,0.5)] p-4 shadow-md backdrop-blur-md backdrop-saturate-150 backdrop-filter">
        {/* <audio id="track"></audio> */}

        {isAnalyzing && (
          <div>
            <p>BPM: {bpm}</p>
            <p>Keys: {keys && keys.length && keys.join(", ")}</p>
          </div>
        )}
        
        <canvas ref={analyserCanvas} className="w-full" />
      </div>
    </>
  );
};

export default AudioAnalyzer;
