import { MAX_POPULATION, MAX_SEPARATION_FORCE } from "../constants";
import type { BoidsSettings } from "../types";

export type ParameterControl = {
  key: keyof BoidsSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
};

export const PARAMETER_CONTROLS: ParameterControl[] = [
  {
    key: "count",
    label: "Population",
    min: 100,
    max: MAX_POPULATION,
    step: 100,
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    key: "movementAccuracy",
    label: "Movement accuracy",
    min: 16,
    max: 160,
    step: 8,
    format: (value) => value.toFixed(0),
  },
  {
    key: "boidVision",
    label: "Boid vision",
    min: 24,
    max: 140,
    step: 2,
    format: (value) => `${value}px`,
  },
  {
    key: "alignmentForce",
    label: "Alignment force",
    min: 0,
    max: 2.5,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "cohesionForce",
    label: "Cohesion force",
    min: 0,
    max: 2,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "separationForce",
    label: "Separation force",
    min: 0,
    max: MAX_SEPARATION_FORCE,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "steeringForce",
    label: "Steering force",
    min: 0.01,
    max: 0.12,
    step: 0.002,
    format: (value) => value.toFixed(3),
  },
  {
    key: "minSpeed",
    label: "Min speed",
    min: 0.2,
    max: 10,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "maxSpeed",
    label: "Max speed",
    min: 0.5,
    max: 10,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
];
