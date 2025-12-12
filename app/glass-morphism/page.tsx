"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Sliders } from "lucide-react";

export default function GlassSynthesizer() {
  const [blur, setBlur] = useState(16);
  const [opacity, setOpacity] = useState(0.25);
  const [saturation, setSaturation] = useState(180);
  const [radius, setRadius] = useState(24);
  const [border, setBorder] = useState(0.3);
  const [copied, setCopied] = useState(false);

  const cssCode = `background: rgba(255, 255, 255, ${opacity});
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border-radius: ${radius}px;
border: 1px solid rgba(255, 255, 255, ${border});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans bg-[#111]">
      {/* Rich Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            backgroundPosition: ["50% 50%", "50% 45%", "50% 50%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-80"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/30 rounded-full blur-[80px] mix-blend-screen"
        />
      </div>

      {/* Main Interface Grid */}
      <div className="relative z-10 w-full max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        {/* Editor Controls */}
        <div className="bg-gray/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-white space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <Sliders className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-violet-400">
              Glass Synthsizer
            </h2>
          </div>

          {/* Slider Group */}
          <div className="space-y-6">
            <Control
              label="Blur"
              value={blur}
              setValue={setBlur}
              min={0}
              max={40}
              suffix="px"
            />
            <Control
              label="Opacity"
              value={opacity}
              setValue={setOpacity}
              min={0}
              max={1}
              step={0.01}
            />
            <Control
              label="Saturation"
              value={saturation}
              setValue={setSaturation}
              min={0}
              max={200}
              suffix="%"
            />
            <Control
              label="Border Radius"
              value={radius}
              setValue={setRadius}
              min={0}
              max={100}
              suffix="px"
            />
            <Control
              label="Border Alpha"
              value={border}
              setValue={setBorder}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* CSS Output */}
          <div className="bg-gray-900/10 rounded-xl p-4 font-mono text-xs text-gray-100 relative group border border-white/5">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
            <pre className="overflow-x-auto whitespace-pre-wrap">{cssCode}</pre>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 h-[600px] flex items-center justify-center relative perspective-1000">
          <p className="absolute top-0 text-white/70 text-sm font-mono tracking-widest uppercase mb-4 w-full text-center">
            Interactive Preview &bull; Drag Me
          </p>
          <motion.div
            drag
            dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
            whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
            style={{
              backgroundColor: `rgba(255, 255, 255, ${opacity})`,
              backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
              WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
              borderRadius: `${radius}px`,
              border: `1px solid rgba(255, 255, 255, ${border})`,
            }}
            className="w-96 h-64 shadow-2xl flex flex-col items-start justify-between p-8 text-white cursor-grab active:cursor-grabbing"
          >
            {/* Mock Content */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm" />
              <div className="h-3 w-32 bg-white/20 rounded-full" />
            </div>

            <div className="w-full space-y-3">
              <div className="h-3 w-full bg-white/20 rounded-full" />
              <div className="h-3 w-2/3 bg-white/20 rounded-full" />
            </div>

            <div className="w-full flex justify-end">
              <div className="h-8 w-24 bg-white/30 rounded-lg backdrop-blur-md" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const Control = ({
  label,
  value,
  setValue,
  min,
  max,
  step = 1,
  suffix = "",
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) => (
  <div>
    <div className="flex justify-between text-sm mb-2 font-medium">
      <span className="text-white">{label}</span>
      <span className="text-gray-100">
        {Math.round(value * 100) / 100}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => setValue(parseFloat(e.target.value))}
      className="w-full h-4 bg-gray-900/10 rounded-lg appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
    />
  </div>
);
