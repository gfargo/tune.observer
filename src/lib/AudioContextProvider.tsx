import React, { createContext, useState, useContext, useCallback } from "react";

type AudioContextProviderProps = {
  children: React.ReactNode;
};

type AudioContextState = {
  audioContext: AudioContext | null;
  source: MediaStreamAudioSourceNode | null;
  stream: MediaStream | null;
};

type AudioContextValue = AudioContextState & {
  init: () => Promise<AudioContextState>;
  reset: (beforeResetCallback: () => Promise<void>) => Promise<void>;
  active: boolean;
};

const AudioContextState = createContext<AudioContextValue | undefined>(
  undefined
);

export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({
  children,
}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [source, setSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [active, setActive] = useState<boolean>(false);

  const init = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    setAudioContext(audioContext);
    setSource(source);
    setStream(stream);
    setActive(true);

    return {
      audioContext,
      source,
      stream,
    }
  };

  const reset = useCallback(
    async (beforeResetCallback: () => Promise<void>) => {
      if (beforeResetCallback) {
        await beforeResetCallback();
      }

      if (source) {
        source.disconnect();
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (audioContext) {
        await audioContext.close();
      }

      setAudioContext(null);
      setSource(null);
      setStream(null);
      setActive(false);
    },
    [audioContext, source, stream]
  );

  return (
    <AudioContextState.Provider
      value={{ audioContext, source, stream, init, reset, active }}
    >
      {children}
    </AudioContextState.Provider>
  );
};

export const useAudioContext = (): AudioContextValue => {
  const context = useContext(AudioContextState);
  if (context === undefined) {
    throw new Error(
      "useAudioContext must be used within an AudioContextProvider"
    );
  }
  return context;
};
