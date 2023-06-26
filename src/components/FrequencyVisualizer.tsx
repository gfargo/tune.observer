import { useCoreAnalysis } from "@/lib/hooks/useCoreAnalysis";
import React, { useRef, useEffect } from "react";

export const FrequencyVisualizer: React.FC = () => {
  const analyserCore = useCoreAnalysis();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !analyserCore) return;

    const data = new Uint8Array(analyserCore.frequencyBinCount);
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const draw = (dataParm: any) => {
      dataParm = [...dataParm];
      ctx.fillStyle = "white"; //white background
      ctx.lineWidth = 2; //width of candle/bar
      ctx.strokeStyle = "hsl(280,100%,70%)"; //color of candle/bar
      const space = canvas.width / dataParm.length;
      dataParm.forEach((value: number, i: number) => {
        ctx.beginPath();
        ctx.moveTo(space * i, canvas.height); //x,y
        ctx.lineTo(space * i, canvas.height - value); //x,y
        ctx.stroke();
      });
    };

    const loopingFunction = () => {
      requestAnimationFrame(loopingFunction);
      if (analyserCore === null) return;
      analyserCore.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width || 0, canvas.height || 0);

      draw(data);
    };

    requestAnimationFrame(loopingFunction);
  }, [analyserCore]);

  return <canvas ref={canvasRef} />;
};
