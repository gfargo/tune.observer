import React from "react";

import { MicrophoneIcon } from "@heroicons/react/24/outline";
import AudioAnalyzer from "~/components/AudioAnalyzer/AudioAnalyzer";

const Home: React.FC = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Tune.<span className="text-[hsl(280,100%,70%)]">observer</span>
          </h1>

          <div className="flex flex-col items-center justify-center gap-4">
            {/* <button className="w-full max-w-[20rem] rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-lg font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[hsl(280,100%,60%)] flex flex-row items-center">
              Listen
              <MicrophoneIcon className="h-6 w-6 ml-2" />
            </button> */}
            <AudioAnalyzer />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
