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
				{@const props = weapon.properties}
				<tr>
					<td>{weapon.class}</td>
					<td>{props.identification.name}</td>
					<td>{props.bullet?.class ?? '-'}</td>
					<td>{props.ammunition?.tags ?? '-'} / {props.ammunition?.value ?? '-'}</td>
					{#if props.reload}
						<td>{props.reload?.rate} / {props.reload?.time}</td>
					{:else if props.heat}
						<td>
							{props.heat?.overheat} / {props.heat?.coolrate} /
							{props.heat?.cooldelay} / {props.heat?.reenable}
						</td>
					{:else}
						<td>-</td>
					{/if}
					<td>{props.rotationspeed?.max ?? '-'}</td>
					<td>{props.storage?.unit ?? '-'}</td>
					<td>{props.hull?.max ?? '-'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
