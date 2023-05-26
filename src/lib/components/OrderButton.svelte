<script lang="ts">
	export let orderBy: string[];
	export let prop: string;
	export let ascending = false;
	export let showDelete = false;
	export let clazz = '';

	$: sortIcon = orderBy.includes(`-${prop}`) ? '-down' : orderBy.includes(prop) ? '-up' : '';

	function onOrderBy() {
		const first = ascending ? prop : `-${prop}`;
		const second = ascending ? `-${prop}` : prop;

		if (orderBy.includes(first)) {
			orderBy = orderBy.map((o) => (o !== first ? o : second));
		} else if (orderBy.includes(second)) {
			if (showDelete) {
				orderBy = orderBy.map((o) => (o !== second ? o : first));
			} else {
				orderBy = orderBy.filter((o) => o !== second);
			}
		} else {
			orderBy = orderBy.concat(first);
		}
	}

	function onDelete() {
		orderBy = orderBy.filter((o) => o !== prop && o !== `-${prop}`);
	}
</script>

<div class="btn-group {clazz}">
	<button
		type="button"
		class="btn btn-sm {sortIcon ? 'text-bg-primary' : 'text-bg-theme'}"
		on:click={onOrderBy}
	>
		<slot />
		<i class="fa-solid fa-sort{sortIcon} ms-1" />
	</button>
	{#if showDelete}
		<button class="btn btn-sm btn-danger" on:click={onDelete}>
			<i class="fa-solid fa-x" />
		</button>
	{/if}
	<slot name="attach" />
</div>
