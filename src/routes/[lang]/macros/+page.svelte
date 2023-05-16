<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: types = data.types;
</script>

<h1>Macros</h1>

<p>{types.length} types loaded</p>

<div class="table-responsive">
	<table class="table table-striped table-hover">
		<thead>
			<tr>
				<th>Type</th>
				<th>Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each types as type}
				<tr>
					<td>
						<a href="macros/{type.name}">{type.name}</a>
					</td>
					<td>{type.count}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
