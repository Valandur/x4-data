<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
	$: macros = data.macros;
</script>

<ol class="breadcrumb">
	<li class="breadcrumb-item"><a href="/{lang}/macros">Macros</a></li>
	<li class="breadcrumb-item active">{data.type}</li>
</ol>

<h1>{data.type}</h1>

<p>{macros.length} macros loaded</p>

<div class="table-responsive">
	<table class="table table-striped table-hover">
		<thead>
			<tr>
				<th>Name<br />(Alias)</th>
				<th>Component</th>
				<th>Properties</th>
				<th>Connections</th>
			</tr>
		</thead>
		<tbody>
			{#each macros as macro}
				<tr>
					<td>
						<a href="{macro.class}/{macro.name}">{macro.name}</a>
						{#if macro.alias}
							<br />
							({macro.alias})
						{/if}
					</td>
					<td>{!!macro.component && 'ref' in macro.component ? macro.component.ref : '-'}</td>
					<td>
						{#each Object.keys(macro.properties) as prop}
							<span class="badge bg-primary me-1">{prop}</span>
						{/each}
					</td>
					<td>
						{#if macro.connections}
							{#each macro.connections as conn}
								<span class="badge bg-secondary me-1">{conn.ref}</span>
							{/each}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
