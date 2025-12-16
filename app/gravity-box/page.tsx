"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

export default function GravityBox() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Events = Matter.Events,
      Body = Matter.Body;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#0f172a",
      },
    });

    const width = window.innerWidth;
    const height = window.innerHeight;

    Events.on(engine, "beforeUpdate", () => {
      const allBodies = Composite.allBodies(engine.world);

      allBodies.forEach((body) => {
        if (body.isStatic) return;

        // If body is outside the screen bounds, reset it
        if (
          body.position.x < -50 ||
          body.position.x > width + 50 ||
          body.position.y < -50 ||
          body.position.y > height + 50
        ) {
          Body.setPosition(body, {
            x: width / 2,
            y: height / 2,
          });
          Body.setVelocity(body, { x: 0, y: 0 });
        }
      });
    });

    const wallOptions = { isStatic: true, render: { fillStyle: "#334155" } };

    Composite.add(world, [
      Bodies.rectangle(width / 2, -1000, width, 2000, wallOptions),

      Bodies.rectangle(width / 2, height + 1000, width, 2000, wallOptions),

      Bodies.rectangle(-1000, height / 2, 2000, height, wallOptions),

      Bodies.rectangle(width + 1000, height / 2, 2000, height, wallOptions),
    ]);

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * (width - 100) + 50;
      const y = Math.random() * (height - 100) + 50;
      const size = Math.random() * 40 + 20;
      const color = ["#ff006e", "#8338ec", "#3a86ff", "#fb5607", "#ffbe0b"][
        Math.floor(Math.random() * 5)
      ];

      let body;
      if (Math.random() > 0.5) {
        body = Bodies.rectangle(x, y, size, size, {
          render: { fillStyle: color },
          restitution: 0.9,
        });
      } else {
        body = Bodies.circle(x, y, size / 2, {
          render: { fillStyle: color },
          restitution: 0.9,
        });
      }
      Composite.add(world, body);
    }

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
    };
  }, []);

  const addShape = () => {
    if (!engineRef.current) return;
    const width = window.innerWidth;
    const x = Math.random() * (width - 100) + 50;
    const y = 50;
    const size = Math.random() * 40 + 20;
    const color = ["#ff006e", "#8338ec", "#3a86ff", "#fb5607", "#ffbe0b"][
      Math.floor(Math.random() * 5)
    ];

    let body;
    if (Math.random() > 0.5) {
      body = Matter.Bodies.rectangle(x, y, size, size, {
        render: { fillStyle: color },
        restitution: 0.9,
      });
    } else {
      body = Matter.Bodies.circle(x, y, size / 2, {
        render: { fillStyle: color },
        restitution: 0.9,
      });
    }
    Matter.Composite.add(engineRef.current.world, body);
  };

  const removeShape = () => {
    if (!engineRef.current) return;
    const allBodies = Matter.Composite.allBodies(engineRef.current.world);
    // Filter out static bodies (walls) and constraints
    const dynamicBodies = allBodies.filter((b) => !b.isStatic);
    if (dynamicBodies.length > 0) {
      const lastBody = dynamicBodies[dynamicBodies.length - 1];
      Matter.Composite.remove(engineRef.current.world, lastBody);
    }
  };

  const throwShapes = () => {
    if (!engineRef.current) return;
    const allBodies = Matter.Composite.allBodies(engineRef.current.world);
    allBodies.forEach((body) => {
      if (body.isStatic) return;
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50,
      });
    });
  };

  return (
    <div ref={sceneRef} className="fixed inset-0 overflow-hidden text-white">
      <div className="absolute bottom-6 left-6 pointer-events-none select-none opacity-30 hover:opacity-100 transition-opacity duration-300">
        <h1 className="font-black text-2xl tracking-tighter text-slate-500">
          GRAVITY_SANDBOX
        </h1>
      </div>

      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50 transition-transform duration-300 hover:scale-105">
        <button
          onClick={addShape}
          className="group flex flex-col items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all duration-200 w-12 h-12 md:w-14 md:h-14 md:hover:w-32 md:hover:rounded-2xl overflow-hidden relative"
          title="Add Shape"
        >
          <span className="absolute md:group-hover:opacity-0 transition-opacity duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          <span className="hidden md:flex opacity-0 group-hover:opacity-100 absolute text-xs font-bold whitespace-nowrap">
            Add Shape
          </span>
        </button>

        <button
          onClick={removeShape}
          className="group flex flex-col items-center justify-center p-3 rounded-full bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 active:scale-90 transition-all duration-200 w-12 h-12 md:w-14 md:h-14 md:hover:w-32 md:hover:rounded-2xl overflow-hidden relative"
          title="Remove Shape"
        >
          <span className="absolute md:group-hover:opacity-0 transition-opacity duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </span>
          <span className="hidden md:flex opacity-0 group-hover:opacity-100 absolute text-xs font-bold whitespace-nowrap">
            Remove Shape
          </span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1"></div>

        <button
          onClick={throwShapes}
          className="group flex flex-col items-center justify-center p-3 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 transition-all duration-200 w-12 h-12 md:w-14 md:h-14 md:hover:w-32 md:hover:rounded-2xl overflow-hidden relative"
          title="Chaos Mode"
        >
          <span className="absolute md:group-hover:opacity-0 transition-opacity duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </span>
          <span className="hidden md:flex opacity-0 group-hover:opacity-100 absolute text-xs font-bold whitespace-nowrap">
            CHAOS
          </span>
        </button>
      </div>
    </div>
  );
}
