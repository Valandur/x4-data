<script lang="ts">
	import type { PageData } from './$types';

	import ConnectionCard from '$lib/components/ConnectionCard.svelte';
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import type { Macro } from '$lib/models/Macro';

	export let data: PageData;
	$: lang = data.lang;
	$: macro = data.macro;
	$: props = Object.keys(macro.properties) as (keyof Macro['properties'])[];
	$: conns = macro.connections || [];
	$: versions = macro.versions;
</script>

<ol class="breadcrumb">
	<li class="breadcrumb-item"><a href="/{lang}/macros">Macros</a></li>
	<li class="breadcrumb-item"><a href="/{lang}/macros/{macro.class}">{macro.class}</a></li>
	<li class="breadcrumb-item active">{macro.name}</li>
</ol>

<h1>{macro.name}</h1>
<div class="mb-4">{macro.source}</div>

<div class="container-flex">
	{#if macro.component}
		<div class="row mb-2">
			<h2>Component</h2>
		</div>
		<div class="row">
			<div class="col">
				<PropertyCard title="component" property={macro.component} />
			</div>
		</div>
	{/if}

	{#if props.length > 0}
		<div class="row mb-2">
			<h2>Properties</h2>
		</div>
		<div class="row">
			{#each props as prop}
				<div class="col" class:col-4={prop === 'identification'}>
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
				<div class="col">
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

	{#if versions.length > 0}
		<div class="row mb-2">
			<h2>Versions</h2>
		</div>
		<div class="row">
			{#each versions as version}
				<div class="col">
					<PropertyCard
						title={version.source}
						property={{
							component: version.component,
							properties: version.properties,
							connections: version.connections
						}}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
