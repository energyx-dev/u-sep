import "react-router-dom";

import { ROUTER_URL_PARAMS } from "@/constants/routes";

declare module "react-router-dom" {
  export declare function useParams(): Readonly<{
    [key in keyof typeof ROUTER_URL_PARAMS]: string | undefined;
  }>;
}
