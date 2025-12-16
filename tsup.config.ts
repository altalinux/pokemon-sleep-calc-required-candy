import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["cjs"],
  platform: "node",
  target: "node18",
  outDir: "dist-cli",
  clean: true,
  banner: { js: "#!/usr/bin/env node" }, // shebang
});
