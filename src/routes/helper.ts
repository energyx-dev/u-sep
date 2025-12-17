import { SIMULATION_BEFORE_AFTER_STEP_PATH, STEP_PATH } from "@/constants/routes";

export const getBeforeAfterStepPath = (key: keyof typeof SIMULATION_BEFORE_AFTER_STEP_PATH) => {
  const { label, path } = SIMULATION_BEFORE_AFTER_STEP_PATH[key];
  return { key, label, path };
};

export const getStep = <T extends keyof typeof STEP_PATH>(key: T) => {
  const { label, path } = STEP_PATH[key];
  return { key, label, path };
};
