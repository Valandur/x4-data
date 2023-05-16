<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ships = data.ships;

	function formatClass(clazz: string) {
		return clazz.substring(5).toUpperCase();
	}
</script>

<h1>Ships</h1>

<p>{ships.length} ships loaded</p>

<div class="table-responsive">
	<table class="table table-striped table-hover">
		<thead>
			<tr>
				<th>Size</th>
				<th>Role</th>
				<th>Purpose</th>
				<th>Name</th>
				<th>Hull</th>
			</tr>
		</thead>
		<tbody>
			{#each ships as ship}
				<tr>
					<td>{formatClass(ship.class)}</td>
					<td>{ship.ship.type}</td>
					<td>{ship.purpose.primary}</td>
					<td>{ship.identification.name}</td>
					<td>{ship.hull.max}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
