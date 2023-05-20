<script lang="ts">
	import { onDestroy } from 'svelte';

	import { afterNavigate, goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { CARGO_TYPES, SIZES, Size } from '$lib/models/Constants';
	import SortButton from '$lib/components/SortButton.svelte';

	import type { PageData } from './$types';

	const PARAM_SEP = '_';
	const PARAM_TEXT = 'q';
	const PARAM_ROLES = 'r';
	const PARAM_PURPOSES = 'p';
	const PARAM_SIZES = 's';
	const PARAM_TOGGLES = 't';
	const PARAM_ORDER = 'o';
	const SEARCH_DELAY = 500;
	const ENGINE_SIZES = SIZES;
	const SHIELD_SIZES = [Size.S, Size.M, Size.L, Size.XL];
	const WEAPON_SIZES = SIZES;
	const TURRET_SIZES = [Size.S, Size.M, Size.L];
	const DOCK_SIZES = [Size.S, Size.M];
	const HANGER_SIZES = [Size.XS, Size.S, Size.M];
	const CARGO_NAMES: Record<string, string> = {
		CONTAINER: 'CT',
		CONDENSATE: 'CS',
		LIQUID: 'L',
		SOLID: 'S'
	};

	export let data: PageData;

	let navTimeout: ReturnType<typeof setTimeout> | null = null;
	let filterText = '';
	let filterRoles: string[] = [];
	let filterPurposes: string[] = [];
	let filterSizes: string[] = [];
	let orderBy: string[] = [];
	let engineIsCompact = true;
	let shieldIsCompact = true;
	let weaponIsCompact = true;
	let turretIsCompact = true;
	let cargoIsCompact = true;
	let docksIsCompact = true;
	let hangarIsCompact = true;

	$: filteredShips = data.ships
		.filter(
			(ship) =>
				(!filterText || ship.ident.toLocaleLowerCase().includes(filterText)) &&
				(!filterRoles.length || filterRoles.includes(ship.type)) &&
				(!filterPurposes.length || filterPurposes.includes(ship.purpose)) &&
				(!filterSizes.length || filterSizes.includes(ship.size))
		)
		.sort((shipA, shipB) => {
			for (const order of orderBy) {
				const neg = order[0] === '-';
				const parts = order.substring(neg ? 1 : 0).split('.');
				let valueA: any = shipA;
				let valueB: any = shipB;
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
			return shipA.ident.localeCompare(shipB.ident);
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
				engineIsCompact ? '' : 'e',
				shieldIsCompact ? '' : 's',
				weaponIsCompact ? '' : 'w',
				turretIsCompact ? '' : 't',
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
		engineIsCompact = !urlToggles.includes('e');
		shieldIsCompact = !urlToggles.includes('s');
		weaponIsCompact = !urlToggles.includes('w');
		turretIsCompact = !urlToggles.includes('t');
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

	function onEngineToggle() {
		engineIsCompact = !engineIsCompact;
	}
	function onShieldToggle() {
		shieldIsCompact = !shieldIsCompact;
	}
	function onWeaponToggle() {
		weaponIsCompact = !weaponIsCompact;
	}
	function onTurretToggle() {
		turretIsCompact = !turretIsCompact;
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
				<th style:width="100px" />
				<th>
					<span>Name</span>
					<SortButton bind:orderBy prop="ident" />
				</th>
				<th>
					<span>Size</span>
					<SortButton bind:orderBy prop="size" />
				</th>
				<th>
					<span>Purpose</span>
					<SortButton bind:orderBy prop="purpose" />
				</th>
				<th>
					<span>Role</span>
					<SortButton bind:orderBy prop="type" />
				</th>
				<th colSpan={engineIsCompact ? 1 : ENGINE_SIZES.length}>
					<span>Engines</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onEngineToggle}>
						<i class="fa-solid fa-{engineIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={shieldIsCompact ? 1 : SHIELD_SIZES.length}>
					<span>Shields</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onShieldToggle}>
						<i class="fa-solid fa-{shieldIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={weaponIsCompact ? 1 : WEAPON_SIZES.length}>
					<span>Weapons</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onWeaponToggle}>
						<i class="fa-solid fa-{weaponIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={turretIsCompact ? 1 : TURRET_SIZES.length}>
					<span>Turrets</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onTurretToggle}>
						<i class="fa-solid fa-{turretIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={cargoIsCompact ? 1 : CARGO_TYPES.length}>
					<span>Cargo</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onCargoToggle}>
						<i class="fa-solid fa-{cargoIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={docksIsCompact ? 1 : DOCK_SIZES.length}>
					<span>Docks</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onDockToggle}>
						<i class="fa-solid fa-{docksIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th colSpan={hangarIsCompact ? 1 : HANGER_SIZES.length}>
					<span>Hangars</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onHangarToggle}>
						<i class="fa-solid fa-{hangarIsCompact ? 'plus' : 'minus'}" />
					</button>
				</th>
				<th>
					<span>Crew</span>
					<SortButton bind:orderBy prop="crew" />
				</th>
				<th>
					<span>Hull</span>
					<SortButton bind:orderBy prop="hull" />
				</th>
			</tr>
			<tr>
				<th colSpan="5" class="p-1" style:vertical-align="middle">
					{#if orderBy.length > 0}
						<div class="d-flex flex-wrap flex-row align-items-center row-gap-1 fs-5">
							<span class="badge text-bg-primary me-1">Sort</span>
							{#each orderBy as order}
								<button
									class="btn btn-danger p-1 m-0 me-1"
									style:font-size="0.6rem"
									on:click={() => (orderBy = orderBy.filter((o) => o !== order))}
								>
									<i class="fa-solid fa-arrow-{order.startsWith('-') ? 'down' : 'up'}" />
									<span class="mx-2">
										{(order.startsWith('-') ? order.substring(1) : order).replaceAll('.', ' ')}
									</span>
									<i class="fa-solid fa-x" />
								</button>
							{/each}
						</div>
					{/if}
				</th>
				{#if engineIsCompact}
					<th />
				{:else}
					{#each ENGINE_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy prop="engines.{size}" />
						</th>
					{/each}
				{/if}
				{#if shieldIsCompact}
					<th />
				{:else}
					{#each SHIELD_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy prop="shields.{size}" />
						</th>
					{/each}
				{/if}
				{#if weaponIsCompact}
					<th />
				{:else}
					{#each WEAPON_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy prop="weapons.{size}" />
						</th>
					{/each}
				{/if}
				{#if turretIsCompact}
					<th />
				{:else}
					{#each TURRET_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy prop="turrets.{size}" />
						</th>
					{/each}
				{/if}
				{#if cargoIsCompact}
					<th />
				{:else}
					{#each CARGO_TYPES as type}
						<th>
							<span>{CARGO_NAMES[type]}</span>
							<SortButton bind:orderBy prop="cargo.{type}" />
						</th>
					{/each}
				{/if}
				{#if docksIsCompact}
					<th />
				{:else}
					{#each DOCK_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy prop="docks.{size}" />
						</th>
					{/each}
				{/if}
				{#if hangarIsCompact}
					<th />
				{:else}
					{#each HANGER_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy prop="hangars.{size}" />
						</th>
					{/each}
				{/if}
				<th colSpan="3" />
			</tr>
		</thead>
		<tbody>
			{#each filteredShips as ship}
				<tr>
					<td class="p-0" style:vertical-align="middle">
						<img
							src="/data/images/ships/{ship.size}/{ship.name}_s.jpg"
							alt="Preview"
							style:max-height="2.5em"
						/>
					</td>
					<td>
						<a href="/{data.lang}/macros/{ship.class}/{ship.name}">{ship.ident}</a>
					</td>
					<td>{ship.size}</td>
					<td>{ship.purpose}</td>
					<td>{ship.type}</td>
					{#if engineIsCompact}
						<td>
							{#each Object.entries(ship.engines) as [size, total]}
								<span class="badge text-bg-green me-2">{total} {size}</span>
							{/each}
						</td>
					{:else}
						{#each ENGINE_SIZES as size}
							<td>
								{ship.engines[size] ?? '-'}
							</td>
						{/each}
					{/if}
					{#if shieldIsCompact}
						<td>
							{#each Object.entries(ship.shields) as [size, total]}
								<span class="badge text-bg-primary me-2">{total} {size}</span>
							{/each}
						</td>
					{:else}
						{#each SHIELD_SIZES as size}
							<td>
								{ship.shields[size] ?? '-'}
							</td>
						{/each}
					{/if}
					{#if weaponIsCompact}
						<td>
							{#each Object.entries(ship.weapons) as [size, total]}
								<span class="badge text-bg-red me-2">{total} {size}</span>
							{/each}
						</td>
					{:else}
						{#each WEAPON_SIZES as size}
							<td>
								{ship.weapons[size] ?? '-'}
							</td>
						{/each}
					{/if}
					{#if turretIsCompact}
						<td>
							{#each Object.entries(ship.turrets) as [size, total]}
								<span class="badge text-bg-pink me-2">{total} {size}</span>
							{/each}
						</td>
					{:else}
						{#each TURRET_SIZES as size}
							<td>
								{ship.turrets[size] ?? '-'}
							</td>
						{/each}
					{/if}
					{#if cargoIsCompact}
						<td>
							{#each Object.entries(ship.cargo) as [type, total]}
								<span class="badge text-bg-light me-2">{total} {CARGO_NAMES[type]}</span>
							{/each}
						</td>
					{:else}
						{#each CARGO_TYPES as type}
							<td>{ship.cargo[type] || '-'}</td>
						{/each}
					{/if}
					{#if docksIsCompact}
						<td>
							{#each Object.entries(ship.docks) as [size, total]}
								<span class="badge text-bg-indigo me-2">{total} {size}</span>
							{/each}
						</td>
					{:else}
						{#each DOCK_SIZES as size}
							<td>{ship.docks[size] ?? '-'}</td>
						{/each}
					{/if}
					{#if hangarIsCompact}
						<td>
							{#each Object.entries(ship.docks) as [size, total]}
								<span class="badge text-bg-purple me-2">{total} {size}</span>
							{/each}
						</td>
					{:else}
						{#each HANGER_SIZES as size}
							<td>{ship.docks[size] ?? '-'}</td>
						{/each}
					{/if}
					<td>{ship.crew ?? '-'}</td>
					<td>{ship.hull ?? '-'}</td>
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

	.table {
		> thead {
			> tr {
				> th {
					white-space: nowrap;
				}
			}
		}

		> tbody {
			> tr {
				> td {
					white-space: nowrap;
				}
			}
		}
	}
</style>
