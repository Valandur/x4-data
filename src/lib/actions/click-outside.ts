import type { ActionReturn } from 'svelte/action';

interface Attributes {
	'on:outclick': (e: CustomEvent) => void;
}

export function clickOutside(node: HTMLElement): ActionReturn<unknown, Attributes> {
	const handleClick = (event: MouseEvent) => {
		if (event.target && !node.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent('outclick'));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
