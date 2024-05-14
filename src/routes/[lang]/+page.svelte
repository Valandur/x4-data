<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
	$: numShips = data.numShips;
	$: numComponents = data.numComponents;
	$: numMacros = data.numMacros;
</script>

<h1 class="display-1 mb-5">Welcome to X4 Data</h1>

<div class="row mb-5">
	<Card category="Last Update" title="14.05.2024" subTitle="7.00 Beta (531045)" />
	<Card category="Ships" title={numShips.toString()} subTitle="&nbsp;" />
	<Card category="Components" title={numComponents.toString()} subTitle="&nbsp;" />
	<Card category="Macros" title={numMacros.toString()} subTitle="&nbsp;" />
</div>

<p class="display-6 mb-5">
	Check out the <a href="{lang}/ships">Ships</a> section to compare different ships.
</p>

<p class="display-6 mb-5">
	Head over to <a href="{lang}/components">Components</a> or <a href="{lang}/macros">Macros</a> to view
	in-depth data of X4: Foundations.
</p>
