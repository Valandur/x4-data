<script lang="ts">
	export let title: string;
	export let property: any;

	let open: string[] = [];

	$: entries = Object.entries(property ?? {});
	$: simples = entries.filter(([_, value]) => typeof value !== 'object');
	$: complex = entries.filter(
		([_, value]) => typeof value === 'object' && value !== null && Object.keys(value).length > 0
	) as [string, object][];

	function toggleOpen(key: string, newOpen: boolean) {
		if (newOpen) {
			open = open.concat(key);
		} else {
			open = open.filter((o) => o !== key);
		}
	}
</script>

<div class="card mb-4">
	<div class="card-header fw-bold small">{title}</div>

	{#if simples.length > 0}
		<div class="card-body">
			<table class="table table-borderless table-hover m-0">
				<tbody>
					{#each simples as [key, value]}
						<tr>
							<td>{key}</td>
							<td>{value}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if complex.length > 0}
		<ul class="list-group list-group-flush">
			<!-- needed for the horizontal line -->
			<li class="list-group-item p-0" />

			{#each complex as [key, value]}
				{@const isOpen = open.includes(key)}
				<li class="list-group-item d-flex flex-row p-0">
					<button
						type="button"
						class="btn flex-fill card-header fw-bold text-start"
						on:click={() => toggleOpen(key, !isOpen)}
					>
						<i class="fa-solid fa-caret-{isOpen ? 'down' : 'right'} me-2" />
						{key}
					</button>
				</li>
				{#if isOpen}
					<li class="list-group-item overflow-hidden">
						<div class="table-responsive">
							<table class="table table-borderless table-hover m-0">
								<tbody>
									{#each Object.entries(value) as [subKey, subValue]}
										<tr>
											<td>{subKey}</td>
											{#if typeof subValue !== 'object'}
												<td>{subValue}</td>
											{:else}
												<td>
													<pre class="bg-transparent text-white border-0 m-0 p-0"><code
															>{JSON.stringify(subValue, null, 2)}</code
														></pre>
												</td>
											{/if}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</li>
				{/if}
			{/each}
		</ul>
	{/if}

	<div class="card-arrow">
		<div class="card-arrow-top-left" />
		<div class="card-arrow-top-right" />
		<div class="card-arrow-bottom-left" />
		<div class="card-arrow-bottom-right" />
	</div>
</div>
