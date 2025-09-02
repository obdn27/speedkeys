import { useEffect, useRef } from "react";

/**
 * Props:
 * - enabled: boolean — when true, starts listening globally
 * - onInput: (payload) => void — receives packaged events
 * - preventDefault?: boolean (default true)
 * - stopPropagation?: boolean (default true)
 * - className?: string — for styling the container
 * - children
 */
export default function EventCapture({
	enabled,
	onInput,
	preventDefault = true,
	stopPropagation = true,
	className = "",
	children,
}) {
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	const pkgKey = (e) => ({
		type: "key",
		key: e.key,             // "r", " ", "Enter"
		code: e.code,           // "KeyR", "Space", "Enter"
		repeat: e.repeat,
		composing: e.isComposing,
		shift: e.shiftKey,
		ctrl: e.ctrlKey,
		alt: e.altKey,
		meta: e.metaKey,
		ts: performance.now(),
		target: tagInfo(e.target),
	});

	const pkgClick = (e) => ({
		type: e.button === 2 ? "rclick" : "click",
		button: e.button,       // 0 left, 1 middle, 2 right
		x: e.clientX,
		y: e.clientY,
		shift: e.shiftKey,
		ctrl: e.ctrlKey,
		alt: e.altKey,
		meta: e.metaKey,
		ts: performance.now(),
		target: tagInfo(e.target),
	});

	const tagInfo = (t) => ({
		tag: t?.tagName?.toLowerCase() ?? null,
		id: t?.id ?? null,
		class: t?.className ?? null,
		// you can add dataset if useful
	});

	useEffect(() => {
		if (!enabled) return;

		const onKeyDown = (e) => {
			if (!enabledRef.current) return;
			onInput?.({
				type: "key",
				key: e.key,
				code: e.code,
				repeat: e.repeat,
				composing: e.isComposing,
				shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey,
				ts: performance.now(),
			});
			if (preventDefault) e.preventDefault();
			if (stopPropagation) e.stopPropagation();
		};

		const onPointerDown = (e) => {
			// 0 = left, 1 = middle, 2 = right
			const type = e.button === 2 ? "rclick" : e.button === 0 ? "click" : null;
			// ignore middle/others
			if (!type || !enabledRef.current) return;

			onInput?.({
				type,
				button: e.button,
				x: e.clientX, y: e.clientY,
				shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey,
				ts: performance.now(),
			});

			if (preventDefault) e.preventDefault();
			if (stopPropagation) e.stopPropagation();
		};

		const onContextMenu = (e) => {
			// prevent browser menu, but DO NOT emit another event (avoids rclick->lclick noise)
			e.preventDefault();
			if (stopPropagation) e.stopPropagation();
		};

		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("contextmenu", onContextMenu, true);

		return () => {
			document.removeEventListener("keydown", onKeyDown, true);
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("contextmenu", onContextMenu, true);
		};
	}, [enabled, onInput, preventDefault, stopPropagation]);

	return (
		<div className={className}>
			{children}
		</div>
	);
}
