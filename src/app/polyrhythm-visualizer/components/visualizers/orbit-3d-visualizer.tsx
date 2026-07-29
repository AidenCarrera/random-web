"use client";

import { memo, useEffect, useRef } from "react";
import * as THREE from "three";

import { TAU } from "../../constants";
import { useLatest } from "../../hooks/use-latest";
import { disposeObject } from "../../lib/three-cleanup";
import type { PulseKey, VisualizerProps } from "../../types";
import { pulseKey, range } from "../../utils";

type Orbit3DVisualizerProps = Pick<VisualizerProps, "rhythms" | "activePulses">;

type PulseNode = THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;

type SceneState = {
  group: THREE.Group;
  nodes: Map<PulseKey, PulseNode>;
};

/** A raised three-quarter view, so stacked rings read as concentric orbits. */
const CAMERA_START = { x: 7.4, y: 6.1, z: 9.6 };
const CAMERA_ORBIT_RADIUS = 12.1;
const LOOK_AT_Y = 0.15;
const RING_SEGMENTS = 144;

/**
 * Renders the rhythms as orbiting rings of glowing nodes. Only the pulses and
 * the rhythm set matter here; the cycle progress is deliberately ignored so the
 * camera can drift on wall-clock time.
 */
export const Orbit3DVisualizer = memo(function Orbit3DVisualizer({
  rhythms,
  activePulses,
}: Orbit3DVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pulsesRef = useLatest(activePulses);
  const sceneRef = useRef<SceneState | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // Match the stage surface so distant nodes fade into it, not to a
    // different dark that would outline the canvas.
    scene.fog = new THREE.Fog(0x141219, 9, 22);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(CAMERA_START.x, CAMERA_START.y, CAMERA_START.z);
    camera.lookAt(0, LOOK_AT_Y, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group, new THREE.AmbientLight(0xfaf9f6, 1.05));
    const accentLight = new THREE.PointLight(0x55c991, 24, 24);
    accentLight.position.set(1, 5, 6);
    const coolLight = new THREE.PointLight(0x40c4bb, 16, 20);
    coolLight.position.set(-5, 1, -3);
    scene.add(accentLight, coolLight);

    const state: SceneState = { group, nodes: new Map() };
    sceneRef.current = state;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const timer = new THREE.Timer();
    timer.connect(document);
    const initialOrbitAngle = Math.atan2(CAMERA_START.x, CAMERA_START.z);
    let frame = 0;
    const animate = (timestamp?: number) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const orbitAngle = initialOrbitAngle + elapsed * 0.13;

      // Use wall-clock time rather than musical progress so this orbit never
      // snaps back when a polyrhythm cycle wraps around.
      camera.position.set(
        Math.sin(orbitAngle) * CAMERA_ORBIT_RADIUS,
        CAMERA_START.y + Math.sin(elapsed * 0.24) * 0.45,
        Math.cos(orbitAngle) * CAMERA_ORBIT_RADIUS,
      );
      camera.lookAt(0, LOOK_AT_Y, 0);
      group.rotation.set(
        -0.42 + Math.sin(elapsed * 0.18) * 0.06,
        elapsed * 0.075,
        0,
      );

      state.nodes.forEach((mesh, key) => {
        const active = pulsesRef.current.has(key);
        const base = Number(mesh.userData.baseScale ?? 1);
        const target = active ? base * 2.25 : base;
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, target, 0.22));
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
          mesh.material.emissiveIntensity,
          active ? 2.8 : 0.55,
          0.18,
        );
      });

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      timer.dispose();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, [pulsesRef]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;

    disposeObject(state.group);
    state.group.clear();
    state.nodes.clear();

    const geometry = new THREE.SphereGeometry(0.11, 24, 16);
    rhythms.forEach((rhythm, index) => {
      const color = new THREE.Color(rhythm.color);
      const radius = 1.45 + index * 0.34;
      const offset = index - (rhythms.length - 1) / 2;
      const y = offset * 0.18;
      const zTilt = offset * 0.045;
      const positionAt = (angle: number) =>
        new THREE.Vector3(
          Math.cos(angle) * radius,
          y + Math.sin(angle) * zTilt,
          Math.sin(angle) * radius,
        );

      const ringPoints = range(RING_SEGMENTS).map((point) =>
        positionAt((point / RING_SEGMENTS) * TAU),
      );
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(ringPoints),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 }),
      );
      state.group.add(ring);

      range(rhythm.count).forEach((pulse) => {
        const downbeat = pulse === 0;
        const node: PulseNode = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: downbeat ? 0xfaf9f6 : color,
            emissive: color,
            emissiveIntensity: downbeat ? 1.15 : 0.55,
            roughness: 0.28,
            metalness: 0.35,
          }),
        );
        node.position.copy(
          positionAt((pulse / rhythm.count) * TAU - Math.PI / 2),
        );
        node.userData.baseScale = downbeat ? 1.35 : 1;
        node.scale.setScalar(node.userData.baseScale);
        state.nodes.set(pulseKey(rhythm.count, pulse), node);
        state.group.add(node);
      });
    });

    return () => {
      disposeObject(state.group);
      state.group.clear();
      state.nodes.clear();
    };
  }, [rhythms]);

  return (
    <div className="relative h-full min-h-140 w-full overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
});
