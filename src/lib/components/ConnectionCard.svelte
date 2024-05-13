<script lang="ts">
	export let title: string;
	export let name: string;
	export let link: string | null;
	export let extras: object = {};
</script>

<div class="card mb-4">
	<div class="card-header fw-bold small">{title}</div>
	<div class="card-body">
		<table class="table table-borderless table-hover m-0">
			<tbody>
				<tr>
					<td>ref</td>
					<td>
						{#if link}
							<a href={link}>{name}</a>
						{:else}
							{name}
						{/if}
					</td>
				</tr>
				{#each Object.entries(extras) as [key, value]}
					<tr>
						<td>{key}</td>
						<td>{value}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="card-arrow">
		<div class="card-arrow-top-left"></div>
		<div class="card-arrow-top-right"></div>
		<div class="card-arrow-bottom-left"></div>
		<div class="card-arrow-bottom-right"></div>
	</div>
</div>
