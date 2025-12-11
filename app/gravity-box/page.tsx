"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

export default function GravityBox() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    // Create renderer
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

    // Create bodies
    const wallOptions = { isStatic: true, render: { fillStyle: "#334155" } };
    const width = window.innerWidth;
    const height = window.innerHeight;

    Composite.add(world, [
      Bodies.rectangle(width / 2, 0, width, 50, wallOptions),
      Bodies.rectangle(width / 2, height, width, 50, wallOptions),
      Bodies.rectangle(0, height / 2, 50, height, wallOptions),
      Bodies.rectangle(width, height / 2, 50, height, wallOptions),
    ]);

    // Add random shapes
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

    // Add mouse control
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

    // Run the engine
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
    };
  }, []);

  return (
    <div ref={sceneRef} className="fixed inset-0 overflow-hidden text-white">
      <div className="absolute top-4 left-4 pointer-events-none select-none bg-slate-800/80 p-4 rounded-xl border border-slate-600">
        <h1 className="font-bold text-xl text-blue-400">GRAVITY_SANDBOX</h1>
        <p className="text-sm text-slate-400">Drag shapes to throw them.</p>
      </div>
    </div>
  );
}
