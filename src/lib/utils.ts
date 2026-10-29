import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[đĐ]/g, "d")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function formatDate(dateString?: string | null): string {
	if (!dateString) return "";
	try {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) return dateString;
		return new Intl.DateTimeFormat("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(d);
	} catch {
		return dateString;
	}
}

export function formatDateTime(dateString?: string | null): string {
	if (!dateString) return "";
	try {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) return dateString;
		return new Intl.DateTimeFormat("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(d);
	} catch {
		return dateString;
	}
}
