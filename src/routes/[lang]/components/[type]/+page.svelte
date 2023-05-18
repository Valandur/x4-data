<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
	$: components = data.components;
</script>

<ol class="breadcrumb">
	<li class="breadcrumb-item"><a href="/{lang}/components">Components</a></li>
	<li class="breadcrumb-item active">{data.type}</li>
</ol>

<h1>{data.type}</h1>

<p>{components.length} components loaded</p>

<div class="table-responsive">
	<table class="table table-striped table-hover">
		<thead>
			<tr>
				<th>Name<br />(Alias)</th>
				<th>Connections</th>
			</tr>
		</thead>
		<tbody>
			{#each components as macro}
				<tr>
					<td>
						<a href="{macro.class}/{macro.name}">{macro.name}</a>
						{#if macro.alias}
							<br />
							({macro.alias})
						{/if}
					</td>
					<td>
						{#if macro.connections}
							{#each macro.connections as conn}
								<span class="badge bg-secondary me-1">{conn.name}</span>
							{/each}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
