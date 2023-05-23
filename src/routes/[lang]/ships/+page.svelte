<script lang="ts">
	import { CARGO_TYPES, SIZES, Size } from '$lib/models/Constants';
	import { trackUrlParams } from '$lib/stores/url-params';
	import SortButton from '$lib/components/SortButton.svelte';

	import type { PageData } from './$types';

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

	const params = trackUrlParams({
		text: { name: 'q', default: '' },
		roles: { name: 'r', default: [] },
		purposes: { name: 'p', default: [] },
		sizes: { name: 's', default: [] },
		order: { name: 'o', default: [] },
		expand: {
			name: 't',
			flags: {
				engines: { name: 'e', default: false },
				shields: { name: 's', default: false },
				weapons: { name: 'w', default: false },
				turrets: { name: 't', default: false },
				cargo: { name: 'c', default: false },
				docks: { name: 'd', default: false },
				hangars: { name: 'h', default: false }
			}
		}
	});

	$: filteredShips = data.ships
		.filter(
			(ship) =>
				(!$params.text || ship.ident.toLocaleLowerCase().includes($params.text)) &&
				(!$params.roles.length || $params.roles.includes(ship.type)) &&
				(!$params.purposes.length || $params.purposes.includes(ship.purpose)) &&
				(!$params.sizes.length || $params.sizes.includes(ship.size))
		)
		.sort((shipA, shipB) => {
			for (const order of $params.order) {
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

	function onEngineToggle() {
		$params.expand.engines = !$params.expand.engines;
	}
	function onShieldToggle() {
		$params.expand.shields = !$params.expand.shields;
	}
	function onWeaponToggle() {
		$params.expand.weapons = !$params.expand.weapons;
	}
	function onTurretToggle() {
		$params.expand.turrets = !$params.expand.turrets;
	}
	function onCargoToggle() {
		$params.expand.cargo = !$params.expand.cargo;
	}
	function onDockToggle() {
		$params.expand.docks = !$params.expand.docks;
	}
	function onHangarToggle() {
		$params.expand.hangars = !$params.expand.hangars;
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
							bind:group={$params.sizes}
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
						bind:value={$params.text}
					/>
					<button
						disabled={!$params.text}
						class="btn btn-{$params.text ? '' : 'outline-'}danger"
						on:click={() => ($params.text = '')}
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
							bind:group={$params.purposes}
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
							bind:group={$params.roles}
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
					<SortButton bind:orderBy={$params.order} prop="ident" />
				</th>
				<th>
					<span>Size</span>
					<SortButton bind:orderBy={$params.order} prop="size" />
				</th>
				<th>
					<span>Purpose</span>
					<SortButton bind:orderBy={$params.order} prop="purpose" />
				</th>
				<th>
					<span>Role</span>
					<SortButton bind:orderBy={$params.order} prop="type" />
				</th>
				<th colSpan={$params.expand.engines ? ENGINE_SIZES.length : 1}>
					<span>Engines</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onEngineToggle}>
						<i class="fa-solid fa-{$params.expand.engines ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th colSpan={$params.expand.shields ? SHIELD_SIZES.length : 1}>
					<span>Shields</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onShieldToggle}>
						<i class="fa-solid fa-{$params.expand.shields ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th colSpan={$params.expand.weapons ? WEAPON_SIZES.length : 1}>
					<span>Weapons</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onWeaponToggle}>
						<i class="fa-solid fa-{$params.expand.weapons ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th colSpan={$params.expand.turrets ? TURRET_SIZES.length : 1}>
					<span>Turrets</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onTurretToggle}>
						<i class="fa-solid fa-{$params.expand.turrets ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th colSpan={$params.expand.cargo ? CARGO_TYPES.length : 1}>
					<span>Cargo</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onCargoToggle}>
						<i class="fa-solid fa-{$params.expand.cargo ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th colSpan={$params.expand.docks ? DOCK_SIZES.length : 1}>
					<span>Docks</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onDockToggle}>
						<i class="fa-solid fa-{$params.expand.docks ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th colSpan={$params.expand.hangars ? HANGER_SIZES.length : 1}>
					<span>Hangars</span>
					<button type="button" class="btn btn-sm btn-primary ms-2" on:click={onHangarToggle}>
						<i class="fa-solid fa-{$params.expand.hangars ? 'minus' : 'plus'}" />
					</button>
				</th>
				<th>
					<span>Crew</span>
					<SortButton bind:orderBy={$params.order} prop="crew" />
				</th>
				<th>
					<span>Hull</span>
					<SortButton bind:orderBy={$params.order} prop="hull" />
				</th>
			</tr>
			<tr>
				<th colSpan="5" class="p-1" style:vertical-align="middle">
					{#if $params.order.length > 0}
						<div class="d-flex flex-wrap flex-row align-items-center row-gap-1 fs-5">
							<span class="badge text-bg-primary me-1">Sort</span>
							{#each $params.order as order}
								<button
									class="btn btn-danger p-1 m-0 me-1"
									style:font-size="0.6rem"
									on:click={() => ($params.order = $params.order.filter((o) => o !== order))}
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
				{#if !$params.expand.engines}
					<th />
				{:else}
					{#each ENGINE_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy={$params.order} prop="engines.{size}" />
						</th>
					{/each}
				{/if}
				{#if !$params.expand.shields}
					<th />
				{:else}
					{#each SHIELD_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy={$params.order} prop="shields.{size}" />
						</th>
					{/each}
				{/if}
				{#if !$params.expand.weapons}
					<th />
				{:else}
					{#each WEAPON_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy={$params.order} prop="weapons.{size}" />
						</th>
					{/each}
				{/if}
				{#if !$params.expand.turrets}
					<th />
				{:else}
					{#each TURRET_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy={$params.order} prop="turrets.{size}" />
						</th>
					{/each}
				{/if}
				{#if !$params.expand.cargo}
					<th />
				{:else}
					{#each CARGO_TYPES as type}
						<th>
							<span>{CARGO_NAMES[type]}</span>
							<SortButton bind:orderBy={$params.order} prop="cargo.{type}" />
						</th>
					{/each}
				{/if}
				{#if !$params.expand.docks}
					<th />
				{:else}
					{#each DOCK_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy={$params.order} prop="docks.{size}" />
						</th>
					{/each}
				{/if}
				{#if !$params.expand.hangars}
					<th />
				{:else}
					{#each HANGER_SIZES as size}
						<th>
							<span>{size}</span>
							<SortButton bind:orderBy={$params.order} prop="hangars.{size}" />
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
					{#if !$params.expand.engines}
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
					{#if !$params.expand.shields}
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
					{#if !$params.expand.weapons}
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
					{#if !$params.expand.turrets}
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
					{#if !$params.expand.cargo}
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
					{#if !$params.expand.docks}
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
					{#if !$params.expand.hangars}
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
