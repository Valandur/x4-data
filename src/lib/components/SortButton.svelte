<script lang="ts">
	export let prop: string;
	export let orderBy: string[];

	$: sortIcon = orderBy.includes(`-${prop}`) ? '-down' : orderBy.includes(prop) ? '-up' : '';

	function onOrderBy(field: string) {
		if (orderBy.includes(`-${field}`)) {
			orderBy = orderBy.map((o) => (o !== `-${field}` ? o : field));
		} else if (orderBy.includes(field)) {
			orderBy = orderBy.filter((o) => o !== field);
		} else {
			orderBy = orderBy.concat(`-${field}`);
		}
	}
</script>

<button type="button" class="btn btn-sm btn-secondary ms-2" on:click={() => onOrderBy(prop)}>
	<i class="fa-solid fa-sort{sortIcon}" />
</button>

<style lang="scss">
	.btn-sm {
		font-size: 0.6rem;
		padding: 2px 4px;
		margin: 0;
	}
</style>
