import React from "react";

import TuneObserver from "@/components/TuneObserver";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tune.observer",
  description: "Tool to help identify the notes, pitch, and BPM of a song.",
};

const Home: React.FC = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
          <div className="flex flex-1 flex-col items-center justify-center">
            <TuneObserver />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
