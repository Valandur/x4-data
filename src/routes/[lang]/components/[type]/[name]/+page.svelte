<script lang="ts">
	import type { PageData } from './$types';

	import PropertyCard from '$lib/components/PropertyCard.svelte';

	export let data: PageData;
	$: lang = data.lang;
	$: component = data.component;
	$: conns = component.connections || [];
	$: duplicates = component.duplicates;
</script>

<ol class="breadcrumb">
	<li class="breadcrumb-item"><a href="/{lang}/components">Components</a></li>
	<li class="breadcrumb-item">
		<a href="/{lang}/components/{component.class}">{component.class}</a>
	</li>
	<li class="breadcrumb-item active">{component.name}</li>
</ol>

<h1>{component.name}</h1>
<div class="mb-4">{component.xmlSourceFile}</div>

<div class="container-flex">
	{#if component.source}
		<div class="row mb-2">
			<h2>Source</h2>
		</div>
		<div class="row">
			<div class="col">
				<PropertyCard title="source" property={component.source} />
			</div>
		</div>
	{/if}

	{#if conns.length > 0}
		<div class="row mb-2">
			<h2>Connections</h2>
		</div>
		<div class="row">
			{#each conns as { name, ...conn }}
				<div class="col-4">
					<PropertyCard title={name} property={conn} />
				</div>
			{/each}
		</div>
	{/if}

	{#if duplicates.length > 0}
		<div class="row mb-2">
			<h2>Duplicates</h2>
		</div>
		<div class="row">
			{#each duplicates as { xmlSourceFile, ...duplicate }}
				<div class="col-12">
					<PropertyCard title={xmlSourceFile} property={duplicate} />
				</div>
			{/each}
		</div>
	{/if}
</div>
