"use client";

import { useAsyncEffect } from "ahooks";
import { useEffect, useRef, useState } from "react";
import {
  createRealTimeBpmProcessor,
  getBiquadFilters,
} from "realtime-bpm-analyzer";
import PitchAnalyser from "pitch-analyser";
import type { RealTimeBpmAnalyzer } from "realtime-bpm-analyzer";
import { set } from "zod";
import { Button } from "../ui/button";

type AudioContextState = {
  audioContext: AudioContext | null;
  stream: MediaStream | null;
  source: MediaStreamAudioSourceNode | null;
  analyserCore: AnalyserNode | null;
  analyserBpm: AudioWorkletNode | null;
  analyserPitch: PitchAnalyser | null;
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
    analyserBpm: null,
    analyserCore: null,
    analyserPitch: null,
  });

  // Waveform Canvas Ref
  const analyserCanvas = useRef<HTMLCanvasElement>(null);
  // const audioSourceRef = useRef<HTMLAudioElement>(null);

  const startAnalysis = async () => {
    let audioContextState = context;
    if (!audioContextState?.audioContext) {
      audioContextState = await getAudioContext();
      console.log("audioContextState", audioContextState);
    }

    if (!audioContextState?.analyserCore || !audioContextState?.analyserBpm) {
      audioContextState = await getAudioAnalyser(audioContextState);
    }

    setIsAnalyzing(true);
  };

  const getAudioContext = async (): Promise<AudioContextState> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      const newState = {
        ...context,
        audioContext,
        stream,
        source,
      };
      setAudioContext(newState);
      return newState;
    } catch (err) {
      console.log(err);
    }
  };

  const getAudioAnalyser = async (
    audioContextState: AudioContextState
  ): Promise<AudioContextState> => {
    if (
      audioContextState.audioContext &&
      audioContextState.source &&
      audioContextState.stream &&
      !audioContextState.analyserBpm &&
      !audioContextState.analyserCore
    ) {
      const analyserCore = audioContextState.audioContext.createAnalyser();

      const analyserBpm = await createRealTimeBpmProcessor(
        audioContextState.audioContext
      );

      const analyserPitch = new PitchAnalyser({
        callback({ frequency, note }) {
          console.log({ frequency, note });
        },
      });

      const newState = {
        ...audioContextState,
        analyserBpm,
        analyserCore,
        analyserPitch,
      };
      setAudioContext(newState);
      return newState;
    }
  };

  // useAsyncEffect(getAudioAnalyser, [context.audioContext, context.source]);

  //
  // Setup Core Analyzer
  //
  useEffect(() => {
    if (context.analyserCore && context.source && context.audioContext) {
      console.log("Setting up Core Analyzer");
      context.source.connect(context.analyserCore);
      const data = new Uint8Array(context.analyserCore.frequencyBinCount);

      if (!analyserCanvas.current) return;

      const ctx = analyserCanvas.current.getContext("2d");

      if (!ctx) return;

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
        if (context.analyserCore === null) return;
        context.analyserCore.getByteFrequencyData(data);
        ctx.clearRect(
          0,
          0,
          analyserCanvas?.current?.width || 0,
          analyserCanvas?.current?.height || 0
        );

        draw(data);
      };

      if (isAnalyzing) {
        requestAnimationFrame(loopingFunction);
      }
    }
  }, [context.analyserCore, context.source, context.audioContext]);

  //
  // Setup BPM Analyzer
  //
  useAsyncEffect(async () => {
    if (
      context.source &&
      context.audioContext &&
      context.analyserCore &&
      context.analyserBpm &&
      context.analyserPitch
    ) {
      console.log("Setting up BPM Analyzer");

      // The library provides built in biquad filters, so no need to configure them
      const { lowpass, highpass } = getBiquadFilters(context.audioContext);

      // lowpass.gain.value = 3;
      // lowpass.type = "lowpass";
      // lowpass.frequency.value = 1000;

      // Connect nodes together
      context.source.connect(context.analyserCore);
      context.source
        .connect(lowpass)
        .connect(highpass)
        .connect(context.analyserBpm);

      // context.source.connect(lowpass);
      // lowpass.connect(highpass);
      // highpass.connect(context.analyserBpm);

      // context.source.connect(context.audioContext.destination);

      context.analyserBpm.port.postMessage({
        message: "ASYNC_CONFIGURATION",
        parameters: {
          continuousAnalysis: true,
          // stabilizationTime: 20_000, // Default value is 20_000ms after what the library will automatically delete all collected data and restart analysing BPM
        },
      });

      context.analyserBpm.port.onmessage = (event) => {
        if (event.data.message === "BPM") {
          if (event.data.result.bpm.length > 0) {
            console.log("BPM", event.data.result);
            setBpm(event.data.result.bpm[0].tempo);
          }
        }

        if (event.data.message === "BPM_STABLE") {
          console.log("BPM_STABLE", event.data.result);
        }

        if (
          event.data.message !== "BPM" &&
          event.data.message !== "BPM_STABLE"
        ) {
          console.log("Other Event:", event.data);
        }
      };

      await context.analyserPitch.initAnalyser(() => {
        console.log("Pitch analyzer initialized");
      });

      context.analyserPitch.startAnalyser(() => {
        console.log("Pitch analyzer started");
      });

      // Unsubscribe from the analyzer
      return () => {
        stopAnalysis();
      };
    }
  }, [context.source, context.audioContext, context.analyserCore]);

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setBpm(0);
    setKeys([]);

    if (context.analyserBpm) {
      context.analyserBpm.disconnect();
      context.analyserBpm.port.close();
    }

    if (context.analyserCore) {
      context.analyserCore.disconnect();
    }

    if (context.source) {
      context.source.disconnect();
    }

    if (context.stream) {
      context.stream.getTracks().forEach((track) => track.stop());
    }

    if (context.analyserPitch) {
      context.analyserPitch.stopAnalyser(() => {
        console.log("Pitch analyzer stopped");
      });
    }

    setAudioContext({
      audioContext: null,
      source: null,
      stream: null,
      analyserBpm: null,
      analyserCore: null,
      analyserPitch: null,
    });
  };

  return (
    // transparent tailwind background
    <>
      <Button onClick={isAnalyzing ? stopAnalysis : startAnalysis}>
        {isAnalyzing ? "Stop" : "Start"} Listening
      </Button>

      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-[hsla(0,0%,100%,0.5)] p-4 shadow-md backdrop-blur-md backdrop-saturate-150 backdrop-filter">
        {/* <audio
          src="https://ssl1.viastreaming.net:7005/;listen.mp3"
          ref={audioSourceRef}
          id="track"
        ></audio> */}

        {isAnalyzing && (
          <div>
            <p>BPM: {bpm}</p>
            <p>
              Keys:{" "}
              {keys &&
                keys.length &&
                keys.every((key) => !!key) &&
                keys.join(", ")}
            </p>
          </div>
        )}

        <canvas ref={analyserCanvas} className="w-full" />
      </div>
    </>
  );
};

export default AudioAnalyzer;
