"use client";

import React from "react";
import {
  BoltIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { usePitchAnalysis } from "@/lib/hooks/usePitchAnalysis";

import {
  AudioContextProvider,
  useAudioContext,
} from "@/lib/AudioContextProvider";
import { useBpmAnalysis } from "@/lib/hooks/useBpmAnalysis";
import { Note } from "tonal";
import { Card, CardTitle } from "./ui/card";
import { ClockIcon } from "@radix-ui/react-icons";
import AudioMotionVisualizer from "./AudioMotionVisualizer";
// import { useWhyDidYouUpdate } from "ahooks";

const TuneObserverWithAudioContext: React.FC = () => {
  const { init, reset, active } = useAudioContext();
  const { startPitchAnalysis, stopPitchAnalysis, note, pitch } =
    usePitchAnalysis();
  const bpm = useBpmAnalysis();

  const toggleListening = async () => {
    if (active) {
      // eslint-disable-next-line @typescript-eslint/require-await
      await reset(async () => {
        stopPitchAnalysis();
      });
    } else {
      await init();
      await startPitchAnalysis();
    }
  };

  // useWhyDidYouUpdate("TuneObserverWithAudioContext", {
  //   bpm,
  //   pitch,
  //   note,
  //   active,
  // });

  return (
    <>
      <AudioMotionVisualizer />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <Button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={toggleListening}
          variant={active ? "destructive" : "default"}
          size={"icon"}
          className="white box-content rounded-full p-4"
        >
          {active ? (
            <SpeakerXMarkIcon className="h-8 w-8" />
          ) : (
            <SpeakerWaveIcon className="h-8 w-8" />
          )}
        </Button>
      </div>

      <div className="absolute bottom-8">
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Tune.<span className="text-[hsl(280,100%,70%)]">observer</span>
        </h1>
        <Card className="p-3">
          <div className="flex justify-center gap-3">
            <div className="align-center items-center rounded-md border p-3">
              <div className="flex space-x-1 text-muted-foreground">
                <MusicalNoteIcon className="h-4 w-4" />
                <p className="text-sm leading-none">Note:</p>
              </div>
              <div className="mt-1 flex-1">
                <p className="text-sm font-medium">
                  {Note.pitchClass(Note.fromFreqSharps(pitch)) || "-"}
                </p>
              </div>
            </div>
            <div className="align-center items-center rounded-md border p-3">
              <div className="flex space-x-1 text-muted-foreground">
                <BoltIcon className="h-4 w-4" />
                <p className="text-sm leading-none">Pitch:</p>
              </div>
              <div className="mt-1 flex-1">
                <p className="text-sm font-medium">{pitch || "-"}</p>
              </div>
            </div>
            <div className="align-center items-center rounded-md border p-3">
              <div className="flex space-x-1 text-muted-foreground">
                <ClockIcon className="h-4 w-4" />
                <p className="text-sm leading-none">BPM:</p>
              </div>
              <div className="mt-1 flex-1">
                <p className="text-sm font-medium">{bpm || "-"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

const TuneObserver: React.FC = () => (
  <AudioContextProvider>
    <TuneObserverWithAudioContext />
  </AudioContextProvider>
);

export default TuneObserver;
