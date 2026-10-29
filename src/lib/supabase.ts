import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const isServer = typeof window === "undefined";

const url =
	import.meta.env.VITE_SUPABASE_URL ||
	(typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : "") ||
	(isServer ? "https://placeholder.supabase.co" : "");

const anonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY ||
	(typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : "") ||
	(isServer ? "placeholder-anon-key" : "");

if (!url || !anonKey) {
	throw new Error(
		"Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong môi trường.",
	);
}

export const supabase = createClient<Database>(url, anonKey);
