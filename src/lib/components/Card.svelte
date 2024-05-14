<script lang="ts">
	import CardArrow from './CardArrow.svelte';

	export let category: string = '';
	export let title: string = '';
	export let subTitle: string = '';
</script>

<div class="col-xl-3 col-lg-6">
	<div class="card text-decoration-none">
		<div class="card-body d-flex align-items-center text-inverse m-5px bg-inverse bg-opacity-10">
			<div class="flex-fill">
				<div class="mb-1">{category}</div>
				<h2>{title}</h2>
				<div>{subTitle}</div>
			</div>
		</div>
		<CardArrow />
	</div>
</div>
