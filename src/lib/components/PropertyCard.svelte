<script lang="ts">
	export let title: string;
	export let property: unknown;
	$: entries = Object.entries(property as any);
</script>

<div class="card">
	<div class="card-header fw-bold small">{title}</div>
	<div class="card-body">
		<table class="table table-borderless table-hover m-0">
			<tbody>
				{#each entries as [key, value]}
					<tr>
						<td>{key}</td>
						{#if typeof value !== 'object'}
							<td>{value}</td>
						{:else}
							<td>
								<pre class="bg-transparent text-white border-0 m-0 p-0"><code
										>{JSON.stringify(value, null, 2)}</code
									></pre>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="card-arrow">
		<div class="card-arrow-top-left" />
		<div class="card-arrow-top-right" />
		<div class="card-arrow-bottom-left" />
		<div class="card-arrow-bottom-right" />
	</div>
</div>
