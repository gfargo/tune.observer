import React from "react";

import TuneObserver from "@/components/TuneObserver";

const Home: React.FC = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Tune.<span className="text-[hsl(280,100%,70%)]">observer</span>
          </h1>

          <div className="flex flex-col items-center justify-center gap-4">
            <TuneObserver />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
