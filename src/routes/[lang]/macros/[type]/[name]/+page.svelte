<script lang="ts">
	import type { PageData } from './$types';

	import PropertyCard from '$lib/components/PropertyCard.svelte';

	export let data: PageData;
	$: lang = data.lang;
	$: props = data.props;
	$: macro = data.macro;
</script>

<ol class="breadcrumb">
	<li class="breadcrumb-item"><a href="/{lang}/macros">Macros</a></li>
	<li class="breadcrumb-item"><a href="/{lang}/macros/{macro.class}">{macro.class}</a></li>
	<li class="breadcrumb-item active">{macro.name}</li>
</ol>
<h1 class="mb-5">{macro.name}</h1>

<div class="container-flex">
	<div class="row">
		{#each props as prop}
			<div class="col mb-4" class:col-4={prop === 'identification'}>
				<PropertyCard title={prop} property={macro[prop]} />
			</div>
		{/each}
	</div>
</div>
