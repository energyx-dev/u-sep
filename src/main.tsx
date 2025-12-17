import "@/index.css";
import "@/styles/font.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OverlayProvider } from "@toss/use-overlay";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { router } from "@/routes/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <Toaster />
        <RouterProvider router={router} />
      </OverlayProvider>
    </QueryClientProvider>
  </StrictMode>,
);
