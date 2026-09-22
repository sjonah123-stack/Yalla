import { defineConfig } from "vitest/config";

// Only the pure reminder logic is tested; the scheduled handler itself is exercised by deploy logs.
export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
