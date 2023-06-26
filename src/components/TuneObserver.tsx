"use client";

import React, { useEffect, useState } from "react";
import {
  BoltIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { FrequencyVisualizer } from "./FrequencyVisualizer";
import { usePitchAnalysis } from "@/lib/hooks/usePitchAnalysis";

import {
  AudioContextProvider,
  useAudioContext,
} from "@/lib/AudioContextProvider";
import { useBpmAnalysis } from "@/lib/hooks/useBpmAnalysis";
import { Note } from "tonal";
import { Card } from "./ui/card";
import { ClockIcon } from "@radix-ui/react-icons";

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

  console.log({ bpm, pitch, note, active });

  return (
    <>
      {active && <FrequencyVisualizer />}

      <Button
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

      <Card className="mt-4 p-3">
        <div className="flex justify-stretch gap-3">
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
    </>
  );
};

const TuneObserver: React.FC = () => (
  <AudioContextProvider>
    <TuneObserverWithAudioContext />
  </AudioContextProvider>
);

export default TuneObserver;
