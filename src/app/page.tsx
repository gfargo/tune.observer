import React from "react";

import TuneObserver from "@/components/TuneObserver";

const Home: React.FC = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center flex-1 justify-center gap-8 px-4 py-16">
          <div className="flex flex-col items-center flex-1 justify-center">
            <TuneObserver />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
