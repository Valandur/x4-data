<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import type { PageData } from './$types';

	export let data: PageData;
	let search = browser ? $page.url.searchParams.get('search') : null;
	let cargoIsCompact = browser ? !$page.url.searchParams.has('cargo') : true;
	let docksIsCompact = browser ? !$page.url.searchParams.has('dock') : true;
	let hangarIsCompact = browser ? !$page.url.searchParams.has('hanger') : true;

	$: sizes = data.sizes;
	$: cargoTypes = data.cargoTypes;
	$: ships = data.ships.filter(
		(s) => !search || s.properties.identification.name.toLocaleLowerCase().includes(search)
	);

	function onSearch(value: string) {
		search = value.toLocaleLowerCase();
		const newParams = new URLSearchParams($page.url.searchParams);
		newParams.set('search', search);
		goto(`?${newParams.toString()}`);
	}
	function onCargoToggle() {
		cargoIsCompact = !cargoIsCompact;
		const newParams = new URLSearchParams($page.url.searchParams);
		if (cargoIsCompact) {
			newParams.delete('cargo');
		} else {
			newParams.set('cargo', '');
		}
		goto(`?${newParams.toString()}`);
	}
	function onDockToggle() {
		docksIsCompact = !docksIsCompact;
		const newParams = new URLSearchParams($page.url.searchParams);
		if (docksIsCompact) {
			newParams.delete('dock');
		} else {
			newParams.set('dock', '');
		}
		goto(`?${newParams.toString()}`);
	}
	function onHangarToggle() {
		hangarIsCompact = !hangarIsCompact;
		const newParams = new URLSearchParams($page.url.searchParams);
		if (hangarIsCompact) {
			newParams.delete('hanger');
		} else {
			newParams.set('hanger', '');
		}
		goto(`?${newParams.toString()}`);
	}
</script>

<h1>Ships</h1>

<p>{data.ships.length} ships loaded</p>

<div class="form-group mb-3">
	<label class="form-label" for="searchFormControl">Search</label>
	<input
		id="searchFormControl"
		type="text"
		class="form-control"
		name="search"
		placeholder="Find a ship..."
		value={search}
		on:change={(e) => onSearch(e.currentTarget.value)}
	/>
</div>

<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Role</b></div>
<div class="form-group mb-3">
	{#each data.roles as role}
		<div class="form-check-inline">
			<input
				id="role{role}CheckBox"
				type="checkbox"
				name="roles"
				value={role}
				class="form-check-input"
			/>
			<label class="form-check-label" for="role{role}CheckBox">{role}</label>
		</div>
	{/each}
</div>

<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Purpose</b></div>
<div class="form-group mb-3">
	{#each data.purposes as purpose}
		<div class="form-check-inline">
			<input
				id="purpose{purpose}CheckBox"
				type="checkbox"
				name="purposes"
				value={purpose}
				class="form-check-input"
			/>
			<label class="form-check-label" for="purpose{purpose}CheckBox">{purpose}</label>
		</div>
	{/each}
</div>

<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Size</b></div>
<div class="form-group mb-3">
	{#each data.sizes as size}
		<div class="form-check-inline">
			<input
				id="size{size}CheckBox"
				type="checkbox"
				name="sizes"
				value={size}
				class="form-check-input"
			/>
			<label class="form-check-label" for="size{size}CheckBox">{size}</label>
		</div>
	{/each}
</div>

<div class="table-responsive">
	<table id="table-ships" class="table table-striped table-hover">
		<thead class="table-light">
			<tr>
				<th>Size</th>
				<th>Role</th>
				<th>Purpose</th>
				<th>Name</th>
				<th colSpan={cargoIsCompact ? 1 : cargoTypes.length}>
					<span>Cargo</span>
					<button type="button" class="btn btn-sm btn-secondary ms-2" on:click={onCargoToggle}>
						<i class="fa-solid fa-{cargoIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th>Crew</th>
				<th>Hull</th>
				<th colSpan={docksIsCompact ? 1 : sizes.length}>
					<span>Docks</span>
					<button type="button" class="btn btn-sm btn-secondary ms-2" on:click={onDockToggle}>
						<i class="fa-solid fa-{docksIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={hangarIsCompact ? 1 : sizes.length}>
					<span>Hangars</span>
					<button type="button" class="btn btn-sm btn-secondary ms-2" on:click={onHangarToggle}>
						<i class="fa-solid fa-{hangarIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
			</tr>
			{#if !cargoIsCompact || !docksIsCompact || !hangarIsCompact}
				<tr>
					<th colSpan="4" />
					{#if cargoIsCompact}
						<th />
					{:else}
						{#each cargoTypes as type}
							<th>{type}</th>
						{/each}
					{/if}
					<th colSpan="2" />
					{#if docksIsCompact}
						<th />
					{:else}
						{#each sizes as size}
							<th>{size}</th>
						{/each}
					{/if}
					{#if hangarIsCompact}
						<th />
					{:else}
						{#each sizes as size}
							<th>{size}</th>
						{/each}
					{/if}
				</tr>
			{/if}
		</thead>
		<tbody>
			{#each ships as ship}
				{@const props = ship.properties}
				<tr>
					<td>{ship.size}</td>
					<td>{props.ship.type}</td>
					<td>{props.purpose.primary}</td>
					<td>{props.identification.name}</td>
					{#if cargoIsCompact}
						<td>
							{#each Object.entries(ship.cargo) as [type, amount]}
								<span class="badge text-bg-green me-2">{amount} {type}</span>
							{/each}
						</td>
					{:else}
						{#each cargoTypes as type}
							<td>{ship.cargo[type] || '-'}</td>
						{/each}
					{/if}
					<td>{props.people?.capacity ?? '-'}</td>
					<td>{props.hull.max}</td>
					{#if docksIsCompact}
						<td>
							{#each Object.entries(ship.docks).filter(([, { external }]) => external > 0) as [size, { external }]}
								<span class="badge text-bg-light me-2">{external} {size}</span>
							{/each}
						</td>
					{:else}
						{#each sizes as size}
							<td>{ship.docks[size]?.external || '-'}</td>
						{/each}
					{/if}
					{#if hangarIsCompact}
						<td>
							{#each Object.entries(ship.docks).filter(([, { storage }]) => storage > 0) as [size, { storage }]}
								<span class="badge text-bg-indigo me-2">{storage} {size}</span>
							{/each}
						</td>
					{:else}
						{#each sizes as size}
							<td>{ship.docks[size]?.storage || '-'}</td>
						{/each}
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.btn-sm {
		font-size: 0.6rem;
		padding: 2px 4px;
		margin: 0;
	}
</style>
