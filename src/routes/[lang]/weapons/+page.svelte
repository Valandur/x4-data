<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: weapons = data.weapons;
</script>

<h1>Weapons & Turrets</h1>

<p>{weapons.length} weapons & turrets loaded</p>

<div class="table-responsive">
	<table class="table table-striped table-hover">
		<thead>
			<tr>
				<th>Class</th>
				<th>Name</th>
				<th>Bullet</th>
				<th>Ammunition</th>
				<th>Heat / Reload</th>
				<th>Rotation Speed</th>
				<th>Storage</th>
				<th>Hull</th>
			</tr>
		</thead>
		<tbody>
			{#each weapons as weapon}
				<tr>
					<td>{weapon.class}</td>
					<td>{weapon.identification.name}</td>
					<td>{weapon.bullet?.class || '-'}</td>
					<td>{weapon.ammunition?.tags || '-'} / {weapon.ammunition?.value || '-'}</td>
					{#if weapon.reload}
						<td>{weapon.reload?.rate} / {weapon.reload?.time}</td>
					{:else if weapon.heat}
						<td>
							{weapon.heat?.overheat} / {weapon.heat?.coolrate} /
							{weapon.heat?.cooldelay} / {weapon.heat?.reenable}
						</td>
					{:else}
						<td>-</td>
					{/if}
					<td>{weapon.rotationspeed?.max || '-'}</td>
					<td>{weapon.storage?.unit || '-'}</td>
					<td>{weapon.hull?.max || '-'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
