/// <reference types='vitest' />
import * as path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	root: __dirname,
	cacheDir: "../../node_modules/.vite/packages/signal-react",
	plugins: [
		// @ts-ignore
		react(),
		dts({
			entryRoot: "src",
			copyDtsFiles: true,
			tsconfigPath: path.join(__dirname, "tsconfig.lib.json"),
		}),
	],
	build: {
		outDir: "./dist",
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		lib: {
			// Could also be a dictionary or array of multiple entry points.
			entry: "src/index.ts",
			name: "@alette/signal-react",
			fileName: "index",
			// Change this to the formats you want to support.
			// Don't forget to update your package.json as well.
			formats: ["es" as const],
		},
		rollupOptions: {
			// External packages that should not be bundled into your library.
			external: ["@alette/signal", "@alette/pulse", "react"],
		},
	},
	test: {
		watch: false,
		globals: true,
		environment: "happy-dom",
		include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		reporters: ["default"],
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			reportsDirectory: "./test-output/vitest/coverage",
			provider: "v8" as const,
		},
	},
});
