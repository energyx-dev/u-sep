import { createContext, ReactNode, useContext, useState } from "react";

export type VisualState = "input" | "visual";

type Ctx = {
  setInput: () => void;
  setVisual: () => void;
  state: VisualState;
};

const InputVisualContext = createContext<Ctx | null>(null);

type ProviderProps = { children: ReactNode };

export const InputVisualProvider = ({ children }: ProviderProps) => {
  const [state, setState] = useState<VisualState>("input");
  const setInput = () => setState("input");
  const setVisual = () => setState("visual");
  const value: Ctx = { setInput, setVisual, state };
  return <InputVisualContext.Provider value={value}>{children}</InputVisualContext.Provider>;
};

export const useInputVisualState = (): Ctx => {
  const ctx = useContext(InputVisualContext);
  if (!ctx) {
    throw new Error("useInputVisualState must be used within an InputVisualProvider");
  }
  return ctx;
};
