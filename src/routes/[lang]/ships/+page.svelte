<script lang="ts">
	import { onDestroy } from 'svelte';

	import { afterNavigate, goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { CARGO_TYPES, SIZES } from '$lib/models/Constants';

	import type { PageData } from './$types';

	const PARAM_SEP = '_';
	const PARAM_TEXT = 'q';
	const PARAM_ROLES = 'r';
	const PARAM_PURPOSES = 'p';
	const PARAM_SIZES = 's';
	const PARAM_TOGGLES = 't';
	const PARAM_ORDER = 'o';
	const SEARCH_DELAY = 500;

	export let data: PageData;

	let navTimeout: ReturnType<typeof setTimeout> | null = null;
	let filterText = '';
	let filterRoles: string[] = [];
	let filterPurposes: string[] = [];
	let filterSizes: string[] = [];
	let orderBy: string[] = [];
	let cargoIsCompact = true;
	let docksIsCompact = true;
	let hangarIsCompact = true;

	$: filteredShips = data.ships
		.filter(
			(s) =>
				(!filterText ||
					s.properties.identification.name.toLocaleLowerCase().includes(filterText)) &&
				(!filterRoles.length || filterRoles.includes(s.properties.ship.type)) &&
				(!filterPurposes.length || filterPurposes.includes(s.properties.purpose.primary)) &&
				(!filterSizes.length || filterSizes.includes(s.size))
		)
		.sort((a, b) => {
			for (const order of orderBy) {
				const neg = order[0] === '-';
				const parts = order.substring(neg ? 1 : 0).split('.');
				let valueA: any = a;
				let valueB: any = b;
				for (const part of parts) {
					valueA = valueA?.[part];
					valueB = valueB?.[part];
				}

				let comp = 0;
				if (valueA === valueB) {
					continue;
				} else if (typeof valueA === 'undefined' && typeof valueB !== 'undefined') {
					return neg ? 1 : -1;
				} else if (typeof valueA !== 'undefined' && typeof valueB === 'undefined') {
					return neg ? -1 : 1;
				} else if (typeof valueA === 'string' && typeof valueB === 'string') {
					comp = neg ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
				} else {
					comp = neg ? valueB - valueA : valueA - valueB;
				}
				if (comp !== 0) {
					return comp;
				}
			}
			return a.properties.identification.name.localeCompare(b.properties.identification.name);
		});

	$: if (browser) {
		clearNavTimeout();
		navTimeout = setTimeout(() => {
			const oldParams = $page.url.searchParams;
			const newParams = new URLSearchParams(oldParams);
			if (filterText) {
				newParams.set(PARAM_TEXT, filterText);
			} else {
				newParams.delete(PARAM_TEXT);
			}
			if (filterRoles.length > 0) {
				newParams.set(PARAM_ROLES, filterRoles.join(PARAM_SEP));
			} else {
				newParams.delete(PARAM_ROLES);
			}
			if (filterPurposes.length > 0) {
				newParams.set(PARAM_PURPOSES, filterPurposes.join(PARAM_SEP));
			} else {
				newParams.delete(PARAM_PURPOSES);
			}
			if (filterSizes.length > 0) {
				newParams.set(PARAM_SIZES, filterSizes.join(PARAM_SEP));
			} else {
				newParams.delete(PARAM_SIZES);
			}
			if (orderBy.length > 0) {
				newParams.set(PARAM_ORDER, orderBy.join(PARAM_SEP));
			} else {
				newParams.delete(PARAM_ORDER);
			}
			const toggles = [
				cargoIsCompact ? '' : 'c',
				docksIsCompact ? '' : 'd',
				hangarIsCompact ? '' : 'h'
			].join('');
			if (toggles.length > 0) {
				newParams.set(PARAM_TOGGLES, toggles);
			} else {
				newParams.delete(PARAM_TOGGLES);
			}
			const newSearch = newParams.toString();

			if (newSearch !== oldParams.toString()) {
				goto(`?${newSearch}`, { keepFocus: true, noScroll: true });
			}
		}, SEARCH_DELAY);
	}

	onDestroy(() => clearNavTimeout());
	afterNavigate((nav) => {
		const params = nav.to?.url.searchParams;
		filterText = params?.get(PARAM_TEXT) ?? '';
		filterRoles = params?.get(PARAM_ROLES)?.split(PARAM_SEP) ?? [];
		filterPurposes = params?.get(PARAM_PURPOSES)?.split(PARAM_SEP) ?? [];
		filterSizes = params?.get(PARAM_SIZES)?.split(PARAM_SEP) ?? [];
		orderBy = params?.get(PARAM_ORDER)?.split(PARAM_SEP) ?? [];

		const urlToggles = params?.get(PARAM_TOGGLES) ?? '';
		cargoIsCompact = !urlToggles.includes('c');
		docksIsCompact = !urlToggles.includes('d');
		hangarIsCompact = !urlToggles.includes('h');
	});

	function clearNavTimeout() {
		if (navTimeout) {
			clearTimeout(navTimeout);
			navTimeout = null;
		}
	}

	function onOrderBy(field: string) {
		if (orderBy.includes(`-${field}`)) {
			orderBy = orderBy.map((o) => (o !== `-${field}` ? o : field));
		} else if (orderBy.includes(field)) {
			orderBy = orderBy.filter((o) => o !== field);
		} else {
			orderBy = orderBy.concat(`-${field}`);
		}
	}

	function onCargoToggle() {
		cargoIsCompact = !cargoIsCompact;
	}

	function onDockToggle() {
		docksIsCompact = !docksIsCompact;
	}

	function onHangarToggle() {
		hangarIsCompact = !hangarIsCompact;
	}

	$: sortIcon = (prop: string) =>
		'fa-sort' + (orderBy.includes(`-${prop}`) ? '-down' : orderBy.includes(prop) ? '-up' : '');
</script>

<h1>Ships</h1>

<p>{data.ships.length} ships loaded</p>

<div class="container-fluid">
	<div class="row">
		<div class="col-4">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Size</b></div>
			<div class="form-group mb-3">
				{#each SIZES as size}
					<div class="form-check-inline">
						<input
							id="size{size}CheckBox"
							type="checkbox"
							name="sizes"
							class="form-check-input"
							value={size}
							bind:group={filterSizes}
						/>
						<label class="form-check-label" for="size{size}CheckBox">{size}</label>
					</div>
				{/each}
			</div>
		</div>
		<div class="col">
			<div class="form-group mb-3">
				<div class="input-group flex-nowrap">
					<input
						id="searchFormControl"
						type="text"
						class="form-control"
						name="search"
						placeholder="Find a ship by name..."
						bind:value={filterText}
					/>
					<button
						disabled={!filterText}
						class="btn btn-{filterText ? '' : 'outline-'}danger"
						on:click={() => (filterText = '')}
					>
						<i class="fa-solid fa-remove" />
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Purpose</b></div>
			<div class="form-group mb-3">
				{#each data.purposes as purpose}
					<div class="form-check-inline">
						<input
							id="purpose{purpose}CheckBox"
							type="checkbox"
							name="purposes"
							class="form-check-input"
							value={purpose}
							bind:group={filterPurposes}
						/>
						<label class="form-check-label" for="purpose{purpose}CheckBox">{purpose}</label>
					</div>
				{/each}
			</div>
		</div>

		<div class="col-9">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Role</b></div>
			<div class="form-group mb-3">
				{#each data.roles as role}
					<div class="form-check-inline">
						<input
							id="role{role}CheckBox"
							type="checkbox"
							name="roles"
							class="form-check-input"
							value={role}
							bind:group={filterRoles}
						/>
						<label class="form-check-label" for="role{role}CheckBox">{role}</label>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<div class="table-responsive">
	<table id="table-ships" class="table table-striped table-hover">
		<thead class="table-light">
			<tr>
				<th class="text-nowrap">
					<span>Size</span>
					<button
						type="button"
						class="btn btn-sm btn-secondary ms-2"
						on:click={() => onOrderBy(`size`)}
					>
						<i class="fa-solid {sortIcon(`size`)}" />
					</button>
				</th>
				<th class="text-nowrap">
					<span>Role</span>
					<button
						type="button"
						class="btn btn-sm btn-secondary ms-2"
						on:click={() => onOrderBy(`properties.ship.type`)}
					>
						<i class="fa-solid {sortIcon(`properties.ship.type`)}" />
					</button>
				</th>
				<th class="text-nowrap">
					<span>Purpose</span>
					<button
						type="button"
						class="btn btn-sm btn-secondary ms-2"
						on:click={() => onOrderBy(`properties.purpose.primary`)}
					>
						<i class="fa-solid {sortIcon(`properties.purpose.primary`)}" />
					</button>
				</th>
				<th class="text-nowrap">
					<span>Name</span>
					<button
						type="button"
						class="btn btn-sm btn-secondary ms-2"
						on:click={() => onOrderBy(`properties.identification.name`)}
					>
						<i class="fa-solid {sortIcon(`properties.identification.name`)}" />
					</button>
				</th>
				<th colSpan={cargoIsCompact ? 1 : CARGO_TYPES.length} class="text-nowrap">
					<span>Cargo</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onCargoToggle}>
						<i class="fa-solid fa-{cargoIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th class="text-nowrap">
					<span>Crew</span>
					<button
						type="button"
						class="btn btn-sm btn-secondary ms-2"
						on:click={() => onOrderBy('properties.people.capacity')}
					>
						<i class="fa-solid {sortIcon('properties.people.capacity')}" />
					</button>
				</th>
				<th class="text-nowrap">
					<span>Hull</span>
					<button
						type="button"
						class="btn btn-sm btn-secondary ms-2"
						on:click={() => onOrderBy('properties.hull.max')}
					>
						<i class="fa-solid {sortIcon('properties.hull.max')}" />
					</button>
				</th>
				<th colSpan={docksIsCompact ? 1 : SIZES.length} class="text-nowrap">
					<span>Docks</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onDockToggle}>
						<i class="fa-solid fa-{docksIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={hangarIsCompact ? 1 : SIZES.length} class="text-nowrap">
					<span>Hangars</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onHangarToggle}>
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
						{#each CARGO_TYPES as type}
							<th class="text-nowrap">
								<span>{type}</span>
								<button
									type="button"
									class="btn btn-sm btn-secondary ms-2"
									on:click={() => onOrderBy(`cargo.${type}`)}
								>
									<i class="fa-solid {sortIcon(`cargo.${type}`)}" />
								</button>
							</th>
						{/each}
					{/if}
					<th colSpan="2" />
					{#if docksIsCompact}
						<th />
					{:else}
						{#each SIZES as size}
							<th class="text-nowrap">
								<span>{size}</span>
								<button
									type="button"
									class="btn btn-sm btn-secondary ms-2"
									on:click={() => onOrderBy(`docks.${size}.external`)}
								>
									<i class="fa-solid {sortIcon(`docks.${size}.external`)}" />
								</button>
							</th>
						{/each}
					{/if}
					{#if hangarIsCompact}
						<th />
					{:else}
						{#each SIZES as size}
							<th class="text-nowrap">
								<span>{size}</span>
								<button
									type="button"
									class="btn btn-sm btn-secondary ms-2"
									on:click={() => onOrderBy(`docks.${size}.storage`)}
								>
									<i class="fa-solid {sortIcon(`docks.${size}.storage`)}" />
								</button>
							</th>
						{/each}
					{/if}
				</tr>
			{/if}
		</thead>
		<tbody>
			{#each filteredShips as ship}
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
						{#each CARGO_TYPES as type}
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
						{#each SIZES as size}
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
						{#each SIZES as size}
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
