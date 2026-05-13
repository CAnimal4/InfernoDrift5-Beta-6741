import type { InfernoDriftSim } from "@infernodrift4/game-core";

export type Telemetry = ReturnType<InfernoDriftSim["serialize"]>;

export type MenuView =
  | "home"
  | "campaign"
  | "modes"
  | "garage"
  | "matchmaking"
  | "social"
  | "settings"
  | "controls"
  | "credits"
  | "stats";
