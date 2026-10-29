import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	const supabaseUrl =
		process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
	const supabaseAnonKey =
		process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";

	return {
		resolve: { tsconfigPaths: true },
		define: {
			"import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
			"import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
		},
		plugins: [
			devtools(),
			tailwindcss(),
			tanstackStart({
				spa: {
					enabled: true,
					// Emit the SPA shell as index.html so Cloudflare Pages serves it as the fallback
					prerender: { outputPath: "/index" },
				},
			}),
			viteReact(),
		],
	};
});
