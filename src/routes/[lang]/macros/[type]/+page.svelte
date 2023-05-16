<script lang="ts">
	import type { PageData } from './$types';

	const baseProps = ['name', 'class', 'alias', 'source'];

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
				<th>Name</th>
				<th>Alias</th>
				<th>Properties</th>
				<th>Source</th>
			</tr>
		</thead>
		<tbody>
			{#each macros as object}
				<tr>
					<td>
						<a href="{object.class}/{object.name}">{object.name}</a>
					</td>
					<td>{object.alias || '-'}</td>
					<td>
						{#each Object.keys(object).filter((p) => !baseProps.includes(p)) as prop}
							<span class="badge bg-primary me-1">{prop}</span>
						{/each}
					</td>
					<td>{object.source || '-'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
