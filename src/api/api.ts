import axios, { AxiosResponse } from "axios";

import { TEngineSchema } from "@/schemas/engine.schema";
import { TResultSchemaV2 } from "@/schemas/result.schema";

const ELECTRON_MODE = import.meta.env.MODE === "electron";

// const ELECTRON_LOCAL_URL = "http://192.168.0.66:28000/"; // 개발자 PC
const ELECTRON_LOCAL_URL = "http://localhost:28000/"; // 패키지 환경
const DEV_URL = "http://192.168.0.62:28000/"; // 개발자 PC

export type TEnginePayload = {
  after: {
    item: TEngineSchema;
    name: string;
  };
  before: {
    item: TEngineSchema;
    name: string;
  };
};

export const api = axios.create({
  baseURL: ELECTRON_MODE ? ELECTRON_LOCAL_URL : DEV_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const postRunV3Engine = (
  payload: TEnginePayload,
): Promise<AxiosResponse<TResultSchemaV2>> => {
  return api.post("/v3/run-engine", payload);
};
