<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: lang = data.lang;
</script>

<h1 class="display-1 mb-5">Welcome to X4 Data</h1>

<p class="display-6 mb-5">
	Check out the <a href="{lang}/ships">Ships</a> section to compare different ships.
</p>

<p class="display-6 mb-5">
	Head over to <a href="{lang}/components">Components</a> or <a href="{lang}/macros">Macros</a> to view
	in-depth data of X4: Foundations.
</p>
