<script lang="ts">
	import type { PageData } from './$types';

	import ConnectionCard from '$lib/components/ConnectionCard.svelte';
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import type { Macro } from '$lib/models/Macro';

	export let data: PageData;
	$: lang = data.lang;
	$: macro = data.macro;
	$: props = Object.keys(macro.properties);
	$: conns = macro.connections || [];
	$: duplicates = macro.duplicates;
</script>

<ol class="breadcrumb">
	<li class="breadcrumb-item"><a href="/{lang}/macros">Macros</a></li>
	<li class="breadcrumb-item"><a href="/{lang}/macros/{macro.class}">{macro.class}</a></li>
	<li class="breadcrumb-item active">{macro.name}</li>
</ol>

<h1>{macro.name}</h1>
<div class="mb-4">{macro.xmlSourceFile}</div>

<div class="container-flex">
	{#if macro.component}
		<div class="row mb-2">
			<h2>Component</h2>
		</div>
		<div class="row">
			<div class="col">
				{#if 'ref' in macro.component}
					<PropertyCard title="component" property={macro.component} />
				{:else}
					<ConnectionCard
						title="component"
						name={macro.component.name}
						link={`/${lang}/components/${macro.component.class}/${macro.component.name}`}
					/>
				{/if}
			</div>
		</div>
	{/if}

	{#if props.length > 0}
		<div class="row mb-2">
			<h2>Properties</h2>
		</div>
		<div class="row">
			{#each props as prop}
				<div class="col-4">
					<PropertyCard title={prop} property={macro.properties[prop]} />
				</div>
			{/each}
		</div>
	{/if}

	{#if conns.length > 0}
		<div class="row mb-2">
			<h2>Connections</h2>
		</div>
		<div class="row">
			{#each conns as conn}
				<div class="col-4">
					<ConnectionCard
						title={conn.ref}
						name={conn.macro?.ref || '-'}
						link={'resolved' in conn
							? `/${lang}/macros/${conn.resolved?.class}/${conn.resolved?.name}`
							: null}
						extras={{ connection: conn.macro?.connection || '-' }}
					/>
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
