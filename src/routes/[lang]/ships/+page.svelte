<script lang="ts">
	import { trackUrlParams } from '$lib/stores/url-params';
	import OrderButton from '$lib/components/OrderButton.svelte';
	import Hint from '$lib/components/Hint.svelte';

	import type { PageData } from './$types';

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
				shields: { name: 'l', default: false, invert: true },
				weapons: { name: 'w', default: false, invert: true },
				turrets: { name: 't', default: false, invert: true },
				cargo: { name: 'a', default: false, invert: true },
				docks: { name: 'o', default: false, invert: true },
				hangars: { name: 'h', default: false, invert: true },
				crew: { name: 'c', default: false, invert: true },
				hull: { name: 'u', default: false, invert: true },
				timeToMaxSpeed: { name: 'x', default: false, invert: true },
				massPerEngine: { name: 'm', default: false, invert: true },
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
				mass: { name: 'm', default: false },
				drag: { name: 'r', default: false }
			}
		}
	});

	$: names = data.names;
	$: enums = data.enums;
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
				} else if (typeof valueA === 'object' && typeof valueB === 'object') {
					const totalA = Object.values(valueA).reduce(
						(acc: number, curr) => acc + (typeof curr === 'number' ? curr : 0),
						0
					);
					const totalB = Object.values(valueB).reduce(
						(acc: number, curr) => acc + (typeof curr === 'number' ? curr : 0),
						0
					);
					if (!totalA && totalB) {
						return 1;
					} else if (totalA && !totalB) {
						return -1;
					}
					comp = neg ? totalB - totalA : totalA - totalB;
				} else {
					comp = neg ? valueB - valueA : valueA - valueB;
				}
				if (comp !== 0) {
					return comp;
				}
			}
			return shipA.ident.localeCompare(shipB.ident);
		});
</script>

<h1>Ships</h1>

<p>{data.ships.length} ships loaded</p>

<div class="container-fluid">
	<div class="row">
		<div class="col-4">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Size</b></div>
			<div class="form-group mb-3">
				{#each enums.ships as size}
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
						<i class="fa-solid fa-remove"></i>
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col">
			<div class="small text-inverse text-opacity-50 mb-1"><b class="fw-bold">Purpose</b></div>
			<div class="form-group mb-3">
				{#each enums.purposes as purpose}
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
				{#each enums.roles as role}
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
							{names.columns[column] ?? column[0].toLocaleUpperCase() + column.substring(1)}
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
						{@const isDescending = order.startsWith('-')}
						{@const text = (isDescending ? order.substring(1) : order)
							.split('.')
							.map((order) => names.columns[order] ?? order)
							.join(' • ')}
						<OrderButton
							bind:orderBy={$params.order}
							prop={isDescending ? order.substring(1) : order}
							showDelete
							clazz="me-1 mb-1"
						>
							<div class="capitalize d-inline-block">
								{text}
							</div>
						</OrderButton>
					{/each}
					<button class="btn btn-sm btn-danger mb-1" on:click={() => ($params.order = [])}>
						<i class="fa-solid fa-trash"></i>
					</button>
				</div>
			{:else}
				<p class="text-secondary">(Click a column header to order by that column)</p>
			{/if}
		</div>
	</div>
</div>

<div class="table-responsive">
	<table id="table-ships" class="table table-striped table-bordered table-hover">
		<thead class="table-dark">
			<tr>
				<td></td>

				{#if $params.cols.image}
					<th style:width="100px"></th>
				{/if}

				<th>
					<OrderButton bind:orderBy={$params.order} prop="ident" ascending>Name</OrderButton>
				</th>

				{#if $params.cols.size}
					<th>
						<OrderButton bind:orderBy={$params.order} prop="size">Size</OrderButton>
					</th>
				{/if}

				{#if $params.cols.purpose}
					<th>
						<OrderButton bind:orderBy={$params.order} prop="purpose">Purpose</OrderButton>
					</th>
				{/if}

				{#if $params.cols.role}
					<th>
						<OrderButton bind:orderBy={$params.order} prop="type">Role</OrderButton>
					</th>
				{/if}

				{#if $params.cols.engines}
					<th colSpan={$params.expand.engines ? enums.engines.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="engines">
							Engines
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.engines = !$params.expand.engines)}
								>
									<i class="fa-solid fa-{$params.expand.engines ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.shields}
					<th colSpan={$params.expand.shields ? enums.shields.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="shields">
							Shields
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.shields = !$params.expand.shields)}
								>
									<i class="fa-solid fa-{$params.expand.shields ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.weapons}
					<th colSpan={$params.expand.weapons ? enums.weapons.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="weapons">
							Weapons
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.weapons = !$params.expand.weapons)}
								>
									<i class="fa-solid fa-{$params.expand.weapons ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.turrets}
					<th colSpan={$params.expand.turrets ? enums.turrets.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="turrets">
							Turrets
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.turrets = !$params.expand.turrets)}
								>
									<i class="fa-solid fa-{$params.expand.turrets ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.cargo}
					<th colSpan={$params.expand.cargo ? enums.cargo.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="cargo">
							Cargo
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.cargo = !$params.expand.cargo)}
								>
									<i class="fa-solid fa-{$params.expand.cargo ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.docks}
					<th colSpan={$params.expand.docks ? enums.docks.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="docks">
							Docks
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.docks = !$params.expand.docks)}
								>
									<i class="fa-solid fa-{$params.expand.docks ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.hangars}
					<th colSpan={$params.expand.hangars ? enums.hangars.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="hangars">
							Hangars
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.hangars = !$params.expand.hangars)}
								>
									<i class="fa-solid fa-{$params.expand.hangars ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.crew}
					<th>
						<OrderButton bind:orderBy={$params.order} prop="crew">Crew</OrderButton>
					</th>
				{/if}

				{#if $params.cols.hull}
					<th>
						<OrderButton bind:orderBy={$params.order} prop="hull">Hull</OrderButton>
					</th>
				{/if}

				{#if $params.cols.timeToMaxSpeed}
					<th>
						<OrderButton bind:orderBy={$params.order} prop="timeToMaxSpeed">TtMS</OrderButton>
					</th>
				{/if}

				{#if $params.cols.massPerEngine}
					<th colSpan={$params.expand.mass ? enums.engines.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="massPerEngine">
							MpE
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.mass = !$params.expand.mass)}
								>
									<i class="fa-solid fa-{$params.expand.mass ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}

				{#if $params.cols.dragPerEngine}
					<th colSpan={$params.expand.drag ? enums.engines.length : 1}>
						<OrderButton bind:orderBy={$params.order} prop="dragPerEngine">
							DpE
							<svelte:fragment slot="attach">
								<button
									type="button"
									class="btn btn-sm btn-secondary"
									on:click={() => ($params.expand.drag = !$params.expand.drag)}
								>
									<i class="fa-solid fa-{$params.expand.drag ? 'minus' : 'plus'}"></i>
								</button>
							</svelte:fragment>
						</OrderButton>
					</th>
				{/if}
			</tr>

			<tr>
				{#if $params.cols.image}
					<th></th>
				{/if}

				<!-- Name column is always visible -->
				<th></th>

				{#if $params.cols.size}
					<th></th>
				{/if}

				{#if $params.cols.purpose}
					<th></th>
				{/if}

				{#if $params.cols.role}
					<th></th>
				{/if}

				{#if $params.cols.engines}
					{#if $params.expand.engines}
						{#each enums.engines as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="engines.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				{/if}

				{#if $params.cols.shields}
					{#if $params.expand.shields}
						{#each enums.shields as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="shields.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				{/if}

				{#if $params.cols.weapons}
					{#if $params.expand.weapons}
						{#each enums.weapons as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="weapons.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				{/if}

				{#if $params.cols.turrets}
					{#if $params.expand.turrets}
						{#each enums.turrets as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="turrets.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				{/if}

				{#if $params.cols.cargo}
					{#if $params.expand.cargo}
						{#each enums.cargo as type}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="cargo.{type}">
									{names.cargo[type]}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th>
							<Hint>
								<h6>Cargo</h6>
								<p class="text-muted">More is better</p>
								<p>The amount of each type of cargo the ship can carry.</p>
								<table class="table table-smaller table-striped mb-0">
									<tbody>
										{#each enums.cargo as type}
											<tr>
												<td>{names.cargo[type]}</td>
												<td><div class="d-inline-block m-0 p-0 capitalize">{type}</div></td>
											</tr>
										{/each}
									</tbody>
								</table>
							</Hint>
						</th>
					{/if}
				{/if}

				{#if $params.cols.docks}
					{#if $params.expand.docks}
						{#each enums.docks as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="docks.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				{/if}

				{#if $params.cols.hangars}
					{#if $params.expand.hangars}
						{#each enums.hangars as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="hangars.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				{/if}

				{#if $params.cols.crew}
					<th></th>
				{/if}

				{#if $params.cols.hull}
					<th></th>
				{/if}

				{#if $params.cols.timeToMaxSpeed}
					<th>
						<Hint>
							<h6>Time to Max Speed</h6>
							<p class="text-muted">Lower is better</p>
							<p>The amount of time (in seconds) that it takes the ship to reach max speed.</p>
							<p class="mb-0">
								More engines give more top speed and more acceleration equally, so this value isn't
								affected by the type of engines installed.
							</p>
						</Hint>
					</th>
				{/if}

				{#if $params.cols.massPerEngine}
					{#if $params.expand.mass}
						{#each enums.engines as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="massPerEngine.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th>
							<Hint>
								<h6>Mass per Engine</h6>
								<p class="text-muted">Lower is better</p>
								<p>The mass of the ship divided by the number of engines.</p>
								<p class="mb-0">
									A lower mass along with more engines allows a ship to accelerate faster.
								</p>
							</Hint>
						</th>
					{/if}
				{/if}

				{#if $params.cols.dragPerEngine}
					{#if $params.expand.drag}
						{#each enums.engines as size}
							<th>
								<OrderButton bind:orderBy={$params.order} prop="dragPerEngine.{size}">
									{size}
								</OrderButton>
							</th>
						{/each}
					{:else}
						<th>
							<Hint>
								<h6>Drag per Engine</h6>
								<p class="text-muted">Lower is better</p>
								<p>The drag of the ship divided by the number of engines.</p>
								<p class="mb-0">
									A lower drag along with more engines allows the ship to reach a higher top speed.
								</p>
							</Hint>
						</th>
					{/if}
				{/if}
			</tr>
		</thead>

		<tbody>
			<!-- makes the first visible row different -->
			<tr class="d-none"></tr>

			{#each filteredShips as ship}
				<tr>
					<td>
						<input class="" id="compare-{ship.name}" type="checkbox" />
					</td>

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
							{#each enums.engines as size}
								{@const value = ship.engines[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-green fw-bold overflow-visible"
												style="width: {(value / data.max.engines[size]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
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
							{#each enums.shields as size}
								{@const value = ship.shields[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-primary fw-bold overflow-visible"
												style="width: {(value / data.max.shields[size]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
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
							{#each enums.weapons as size}
								{@const value = ship.weapons[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-red fw-bold overflow-visible"
												style="width: {(value / data.max.weapons[size]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
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
							{#each enums.turrets as size}
								{@const value = ship.turrets[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-yellow fw-bold overflow-visible"
												style="width: {(value / data.max.turrets[size]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.turrets).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-yellow me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.cargo}
						{#if $params.expand.cargo}
							{#each enums.cargo as type}
								{@const value = ship.cargo[type]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-green fw-bold overflow-visible"
												style="width: {(value / data.max.cargo[type]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.cargo).filter(([, val]) => val > 0) as [type, total]}
									<span class="badge text-bg-green me-2">{total} {names.cargo[type]}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.docks}
						{#if $params.expand.docks}
							{#each enums.docks as size}
								{@const value = ship.docks[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-primary fw-bold overflow-visible"
												style="width: {(value / data.max.docks[size]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.docks).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-primary me-2">{total} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.hangars}
						{#if $params.expand.hangars}
							{#each enums.hangars as size}
								{@const value = ship.hangars[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-red fw-bold overflow-visible"
												style="width: {(value / data.max.hangars[size]) * 100}%"
											>
												{value}
											</div>
										</div>
									{:else}
										-
									{/if}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.docks).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-red me-2">{total} {size}</span>
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

					{#if $params.cols.timeToMaxSpeed}
						<td>{ship.timeToMaxSpeed > 0 ? ship.timeToMaxSpeed.toFixed(2) : '-'}</td>
					{/if}

					{#if $params.cols.massPerEngine}
						{#if $params.expand.mass}
							{#each enums.engines as size}
								{@const value = ship.massPerEngine[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-yellow fw-bold overflow-visible"
												style="width: {(value / data.max.massPerEngine[size]) * 100}%"
											>
												{value.toFixed(1)}
											</div>
										</div>
									{:else}
										-
									{/if}
								</td>
							{/each}
						{:else}
							<td>
								{#each Object.entries(ship.massPerEngine).filter(([, val]) => val > 0) as [size, total]}
									<span class="badge text-bg-yellow me-2">{total.toFixed(2)} {size}</span>
								{/each}
							</td>
						{/if}
					{/if}

					{#if $params.cols.dragPerEngine}
						{#if $params.expand.drag}
							{#each enums.engines as size}
								{@const value = ship.dragPerEngine[size]}
								<td>
									{#if value}
										<div class="progress fs-5" style:height="1.2rem">
											<div
												class="progress-bar text-bg-green fw-bold overflow-visible"
												style="width: {(value / data.max.dragPerEngine[size]) * 100}%"
											>
												{value.toFixed(1)}
											</div>
										</div>
									{:else}
										-
									{/if}
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

	.capitalize {
		text-transform: lowercase;
	}
	.capitalize::first-letter {
		text-transform: uppercase;
	}
</style>
