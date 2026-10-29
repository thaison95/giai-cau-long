import { useEffect, useState } from "react";

export default function ThemeToggle() {
	const [dark, setDark] = useState(false);
	useEffect(
		() => setDark(document.documentElement.classList.contains("dark")),
		[],
	);
	function toggle() {
		const next = !dark;
		document.documentElement.classList.toggle("dark", next);
		document.documentElement.style.colorScheme = next ? "dark" : "light";
		localStorage.setItem("theme", next ? "dark" : "light");
		setDark(next);
	}
	return (
		<button
			type="button"
			onClick={toggle}
			className="h-11 border border-border px-3 text-sm md:h-8 md:text-xs"
			aria-label="Đổi giao diện sáng tối"
		>
			{dark ? "Tối" : "Sáng"}
		</button>
	);
}
