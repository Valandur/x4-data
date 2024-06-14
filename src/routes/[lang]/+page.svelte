<script lang="ts">
	import { format } from 'date-fns/format';

	import Card from '$lib/components/Card.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
	$: numShips = data.numShips;
	$: numComponents = data.numComponents;
	$: numMacros = data.numMacros;
	$: lastUpdate = data.lastUpdate;
	$: version = data.version;
	$: build = data.build;
	$: tag = data.tag;
</script>

<h1 class="display-1 mb-5">Welcome to X4 Data</h1>

<div class="row mb-5">
	<Card
		category="Last Update"
		title={format(lastUpdate, 'dd.MM.yyyy')}
		subTitle={`${version} ${tag} (${build})`}
	/>
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
