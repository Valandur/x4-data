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
	const COL_NAMES: Record<string, string> = {
		timeToMaxSpeed: 'Time to Max Speed (TtMS)',
		dragPerEngine: 'Drag per Engine (DpE)'
	};

	export let data: PageData;

	const params = trackUrlParams({
		cols: {
			name: 'c',
			flags: {
				image: { name: 'i', default: false, invert: true },
				size: { name: 's', default: false, invert: true },
				purpose: { name: 'p', default: false, invert: true },
				role: { name: 'r', default: false, invert: true },
				engines: { name: 'e', default: false, invert: true },
				shields: { name: 's', default: false, invert: true },
				weapons: { name: 'w', default: false, invert: true },
				turrets: { name: 't', default: false, invert: true },
				cargo: { name: 'a', default: false, invert: true },
				docks: { name: 'o', default: false, invert: true },
				hangars: { name: 'h', default: false, invert: true },
				crew: { name: 'c', default: false, invert: true },
				hull: { name: 'u', default: false, invert: true },
				mass: { name: 'm', default: false, invert: true },
				timeToMaxSpeed: { name: 'x', default: false, invert: true },
				dragPerEngine: { name: 'd', default: false, invert: true }
			}
		},
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
				hangars: { name: 'h', default: false },
				drag: { name: 'r', default: false }
			}
		}
	});

	$: columns = Object.keys($params.cols) as (keyof typeof $params.cols)[];
	$: lowerText = $params.text.toLocaleLowerCase();
	$: filteredShips = data.ships
		.filter(
			(ship) =>
				(!lowerText ||
					ship.ident.toLocaleLowerCase().includes(lowerText) ||
					ship.name.includes(lowerText)) &&
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
				} else if (!valueA && valueB) {
					return 1;
				} else if (valueA && !valueB) {
					return -1;
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

	function orderToTag(order: string) {
		const parts = (order.startsWith('-') ? order.substring(1) : order).split('.');
		const name = COL_NAMES[parts[0]] ?? parts[0][0].toLocaleUpperCase() + parts[0].substring(1);
		return `${name} • ${parts[1]}`;
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
	<div class="row">
		<div class="col">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Columns</b></div>
			<div class="form-group mb-3">
				{#each columns as column}
					<div class="form-check-inline">
						<input
							id="col{column}CheckBox"
							type="checkbox"
							name="roles"
							class="form-check-input"
							bind:checked={$params.cols[column]}
						/>
						<label class="form-check-label" for="col{column}CheckBox">
							{COL_NAMES[column] ?? column[0].toLocaleUpperCase() + column.substring(1)}
						</label>
					</div>
				{/each}
			</div>
		</div>

		<div class="col">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Order By</b></div>
			{#if $params.order.length > 0}
				<div class="form-group mb-3">
					{#each $params.order as order}
						<button
							class="btn btn-warning me-2"
							on:click={() => ($params.order = $params.order.filter((o) => o !== order))}
						>
							<i class="fa-solid fa-arrow-{order.startsWith('-') ? 'down' : 'up'}" />
							<span class="mx-2">
								{orderToTag(order)}
							</span>
							<i class="fa-solid fa-x" />
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-secondary">(Click a column header to order by that column)</p>
			{/if}
		</div>
	</div>
</div>

<div class="table-responsive">
	<table id="table-ships" class="table table-striped table-hover">
		<thead class="table-light">
			<tr>
				{#if $params.cols.image}
					<th style:width="100px" />
				{/if}

				<th>
					<span>Name</span>
					<SortButton bind:orderBy={$params.order} prop="ident" />
				</th>

				{#if $params.cols.size}
					<th>
						<span>Size</span>
						<SortButton bind:orderBy={$params.order} prop="size" />
					</th>
				{/if}

				{#if $params.cols.purpose}
					<th>
						<span>Purpose</span>
						<SortButton bind:orderBy={$params.order} prop="purpose" />
					</th>
				{/if}

				{#if $params.cols.role}
					<th>
						<span>Role</span>
						<SortButton bind:orderBy={$params.order} prop="type" />
					</th>
				{/if}

				{#if $params.cols.engines}
					<th colSpan={$params.expand.engines ? ENGINE_SIZES.length : 1}>
						<span>Engines</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.engines = !$params.expand.engines)}
						>
							<i class="fa-solid fa-{$params.expand.engines ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.shields}
					<th colSpan={$params.expand.shields ? SHIELD_SIZES.length : 1}>
						<span>Shields</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.shields = !$params.expand.shields)}
						>
							<i class="fa-solid fa-{$params.expand.shields ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.weapons}
					<th colSpan={$params.expand.weapons ? WEAPON_SIZES.length : 1}>
						<span>Weapons</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.weapons = !$params.expand.weapons)}
						>
							<i class="fa-solid fa-{$params.expand.weapons ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.turrets}
					<th colSpan={$params.expand.turrets ? TURRET_SIZES.length : 1}>
						<span>Turrets</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.turrets = !$params.expand.turrets)}
						>
							<i class="fa-solid fa-{$params.expand.turrets ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.cargo}
					<th colSpan={$params.expand.cargo ? CARGO_TYPES.length : 1}>
						<span>Cargo</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.cargo = !$params.expand.cargo)}
						>
							<i class="fa-solid fa-{$params.expand.cargo ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.docks}
					<th colSpan={$params.expand.docks ? DOCK_SIZES.length : 1}>
						<span>Docks</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.docks = !$params.expand.docks)}
						>
							<i class="fa-solid fa-{$params.expand.docks ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.hangars}
					<th colSpan={$params.expand.hangars ? HANGER_SIZES.length : 1}>
						<span>Hangars</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.hangars = !$params.expand.hangars)}
						>
							<i class="fa-solid fa-{$params.expand.hangars ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}

				{#if $params.cols.crew}
					<th>
						<span>Crew</span>
						<SortButton bind:orderBy={$params.order} prop="crew" />
					</th>
				{/if}

				{#if $params.cols.hull}
					<th>
						<span>Hull</span>
						<SortButton bind:orderBy={$params.order} prop="hull" />
					</th>
				{/if}

				{#if $params.cols.mass}
					<th>
						<span>Mass</span>
						<SortButton bind:orderBy={$params.order} prop="mass" />
					</th>
				{/if}

				{#if $params.cols.timeToMaxSpeed}
					<th>
						<span>TtMS</span>
						<SortButton bind:orderBy={$params.order} prop="timeToMaxSpeed" />
					</th>
				{/if}

				{#if $params.cols.dragPerEngine}
					<th colSpan={$params.expand.drag ? ENGINE_SIZES.length : 1}>
						<span>{$params.expand.drag ? 'Drag per Engine (lower is better)' : 'DpE'}</span>
						<button
							type="button"
							class="btn btn-sm btn-primary ms-2"
							on:click={() => ($params.expand.drag = !$params.expand.drag)}
						>
							<i class="fa-solid fa-{$params.expand.drag ? 'minus' : 'plus'}" />
						</button>
					</th>
				{/if}
			</tr>
			<tr>
				{#if $params.cols.image}
					<th />
				{/if}

				<!-- Name column is always visible -->
				<th />

				{#if $params.cols.size}
					<th />
				{/if}

				{#if $params.cols.purpose}
					<th />
				{/if}

				{#if $params.cols.role}
					<th />
				{/if}

				{#if $params.cols.engines}
					{#if $params.expand.engines}
						{#each ENGINE_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="engines.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.shields}
					{#if $params.expand.shields}
						{#each SHIELD_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="shields.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.weapons}
					{#if $params.expand.weapons}
						{#each WEAPON_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="weapons.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.turrets}
					{#if $params.expand.turrets}
						{#each TURRET_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="turrets.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.cargo}
					{#if $params.expand.cargo}
						{#each CARGO_TYPES as type}
							<th>
								<span>{CARGO_NAMES[type]}</span>
								<SortButton bind:orderBy={$params.order} prop="cargo.{type}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.docks}
					{#if $params.expand.docks}
						{#each DOCK_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="docks.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.hangars}
					{#if $params.expand.hangars}
						{#each HANGER_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="hangars.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}

				{#if $params.cols.crew}
					<th />
				{/if}

				{#if $params.cols.hull}
					<th />
				{/if}

				{#if $params.cols.mass}
					<th />
				{/if}

				{#if $params.cols.timeToMaxSpeed}
					<th />
				{/if}

				{#if $params.cols.dragPerEngine}
					{#if $params.expand.drag}
						{#each ENGINE_SIZES as size}
							<th>
								<span>{size}</span>
								<SortButton bind:orderBy={$params.order} prop="dragPerEngine.{size}" />
							</th>
						{/each}
					{:else}
						<th />
					{/if}
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each filteredShips as ship}
				<tr>
					{#if $params.cols.image}
						<td class="p-0" style:vertical-align="middle">
							<img
								src="/data/images/ships/{ship.size}/{ship.name}_s.jpg"
								alt="Preview"
								style:max-height="2.5em"
							/>
						</td>
					{/if}

					<td>
						<a href="/{data.lang}/macros/{ship.class}/{ship.name}">{ship.ident}</a>
					</td>

					{#if $params.cols.size}
						<td>{ship.size}</td>
					{/if}

					{#if $params.cols.purpose}
						<td>{ship.purpose}</td>
					{/if}

					{#if $params.cols.role}
						<td>{ship.type}</td>
					{/if}

					{#if $params.cols.engines}
						{#if $params.expand.engines}
							{#each ENGINE_SIZES as size}
								<td>
									{ship.engines[size] || '-'}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.engines).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-green me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.shields}
						{#if $params.expand.shields}
							{#each SHIELD_SIZES as size}
								<td>
									{ship.shields[size] || '-'}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.shields).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-primary me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.weapons}
						{#if $params.expand.weapons}
							{#each WEAPON_SIZES as size}
								<td>
									{ship.weapons[size] || '-'}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.weapons).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-red me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.turrets}
						{#if $params.expand.turrets}
							{#each TURRET_SIZES as size}
								<td>
									{ship.turrets[size] || '-'}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.turrets).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-pink me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.cargo}
						{#if $params.expand.cargo}
							{#each CARGO_TYPES as type}
								<td>{ship.cargo[type] || '-'}</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.cargo).filter(([, val]) => val > 0) as [type, total]}
									<span class="badge text-bg-light me-2">{total} {CARGO_NAMES[type]}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.docks}
						{#if $params.expand.docks}
							{#each DOCK_SIZES as size}
								<td>{ship.docks[size] || '-'}</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.docks).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-indigo me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.hangars}
						{#if $params.expand.hangars}
							{#each HANGER_SIZES as size}
								<td>{ship.docks[size] || '-'}</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.docks).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-purple me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.crew}
						<td>{ship.crew || '-'}</td>
					{/if}

					{#if $params.cols.hull}
						<td>{ship.hull || '-'}</td>
					{/if}

					{#if $params.cols.mass}
						<td>{ship.mass > 0 ? ship.mass.toFixed(2) : '-'}</td>
					{/if}

					{#if $params.cols.timeToMaxSpeed}
						<td>{ship.timeToMaxSpeed > 0 ? ship.timeToMaxSpeed.toFixed(2) : '-'}</td>
					{/if}

					{#if $params.cols.dragPerEngine}
						{#if $params.expand.drag}
							{#each ENGINE_SIZES as size}
								<td>
									{ship.dragPerEngine[size] > 0 ? ship.dragPerEngine[size].toFixed(2) : '-'}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.dragPerEngine).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-green me-2">{total.toFixed(2)} {size}</span>
								{/each}
							</td>
						{/if}
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
