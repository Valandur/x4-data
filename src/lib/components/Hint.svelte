<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';

	let show = false;
</script>

<span class="position-relative" use:clickOutside on:outclick={() => (show = false)}>
	<button type="button" class="btn p-0" on:click={() => (show = !show)}>
		<i class="fa-solid fa-info-circle text-primary" />
	</button>

	{#if show}
		<div class="popover position-absolute p-2">
			<slot />
		</div>
	{/if}
</span>

<style lang="scss">
	.popover {
		width: var(--bs-popover-max-width);
		right: 0;
		color: var(--bs-heading-color);
	}
</style>
