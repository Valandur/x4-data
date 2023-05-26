<script lang="ts">
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { settings } from '$lib/stores/settings';

	import type { LayoutData } from './$types';
	import { clickOutside } from '$lib/actions/click-outside';

	export let data: LayoutData;

	$: lang = data.lang;
	$: langs = data.languages;
	$: pathAndSearch = $page.url.pathname.replace(`/${lang}`, '') + (browser ? $page.url.search : '');
	$: scrollY = 0;

	let dropdownLangs = false;

	$: if (browser) {
		if ($settings.darkTheme) {
			document.documentElement.setAttribute('data-bs-theme', 'dark');
		} else {
			document.documentElement.setAttribute('data-bs-theme', 'light');
		}
	}

	onMount(() => {
		document.body.classList.add('app-init');
		if ($settings.sidebarCollapsed) {
			const app = document.getElementById('app');
			app?.classList.add('app-sidebar-collapsed');
		}
	});

	function onToggleCollapse(isMobile?: boolean) {
		const app = document.getElementById('app');
		if (app) {
			if (isMobile) {
				app.classList.remove('app-sidebar-collapsed');
				if (app.classList.contains('app-sidebar-mobile-toggled')) {
					app.classList.remove('app-sidebar-mobile-toggled');
				} else {
					app.classList.add('app-sidebar-mobile-toggled');
				}
			} else {
				app.classList.remove('app-sidebar-mobile-toggled');
				if (app.classList.contains('app-sidebar-collapsed')) {
					app.classList.remove('app-sidebar-collapsed');
					app.classList.add('app-sidebar-toggled');
					$settings.sidebarCollapsed = false;
				} else {
					app.classList.remove('app-sidebar-toggled');
					app.classList.add('app-sidebar-collapsed');
					$settings.sidebarCollapsed = true;
				}
			}
		}
	}
</script>

<svelte:window bind:scrollY />

<div id="header" class="app-header">
	<div class="desktop-toggler">
		<button type="button" class="menu-toggler" on:click={() => onToggleCollapse(false)}>
			<span class="bar" />
			<span class="bar" />
			<span class="bar" />
		</button>
	</div>

	<div class="mobile-toggler">
		<button type="button" class="menu-toggler" on:click={() => onToggleCollapse(true)}>
			<span class="bar" />
			<span class="bar" />
			<span class="bar" />
		</button>
	</div>

	<div class="brand">
		<a href="/" class="brand-logo">
			<span class="brand-img">
				<span class="brand-img-text text-theme">X</span>
			</span>
			<span class="brand-text">X4 Data</span>
		</a>
	</div>

	<div class="menu">
		<div class="menu-item me-1">
			<div class="form-switch">
				<input
					type="checkbox"
					class="form-check-input me-1"
					id="customSwitch1"
					bind:checked={$settings.darkTheme}
				/>
				<label class="form-check-label" for="customSwitch1">
					<i class="fa-solid fa-moon" />
				</label>
			</div>
		</div>

		<div
			class="menu-item dropdown dropdown-mobile-full"
			use:clickOutside
			on:outclick={() => (dropdownLangs = false)}
		>
			<button class="btn menu-link" on:click={() => (dropdownLangs = !dropdownLangs)}>
				<div class="menu-text">{data.langName}</div>
			</button>
			<div class="dropdown-menu me-sm-1 mt-1 top-100 end-0" class:show={dropdownLangs}>
				{#each langs as [key, name]}
					<a
						class="dropdown-item d-flex align-items-center"
						href="/{key}{pathAndSearch}"
						on:click={() => (dropdownLangs = false)}
					>
						{name}
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!--<form class="menu-search" method="POST" name="header_search_form">
			<div class="menu-search-container">
				<div class="menu-search-icon"><i class="bi bi-search" /></div>
				<div class="menu-search-input">
					<input type="text" class="form-control form-control-lg" placeholder="Search menu..." />
				</div>
				<div class="menu-search-icon">
					<button
						class="btn"
						data-toggle-class="app-header-menu-search-toggled"
						data-toggle-target=".app"
					>
						<i class="bi bi-x-lg" />
					</button>
				</div>
			</div>
		</form>-->
</div>

<sidebar id="sidebar" class="app-sidebar">
	<div id="sidebar" class="app-sidebar">
		<div class="app-sidebar-content">
			<div class="menu">
				<div class="menu-header">Navigation</div>

				<div class="menu-item" class:active={$page.url.pathname === `/${lang}`}>
					<a href="/{lang}" class="menu-link">
						<span class="menu-icon"><i class="fa-solid fa-home" /></span>
						<span class="menu-text">Home</span>
					</a>
				</div>

				<div class="menu-item" class:active={$page.url.pathname === `/${lang}/ships`}>
					<a href="/{lang}/ships" class="menu-link">
						<span class="menu-icon"><i class="fa-solid fa-shuttle-space" /></span>
						<span class="menu-text">Ships</span>
					</a>
				</div>
				<div class="menu-item" class:active={$page.url.pathname.startsWith(`/${lang}/components`)}>
					<a href="/{lang}/components" class="menu-link">
						<span class="menu-icon"><i class="fa-solid fa-object-ungroup" /></span>
						<span class="menu-text">Components</span>
					</a>
				</div>

				<div class="menu-item" class:active={$page.url.pathname.startsWith(`/${lang}/macros`)}>
					<a href="/{lang}/macros" class="menu-link">
						<span class="menu-icon"><i class="fa-solid fa-microchip" /></span>
						<span class="menu-text">Macros</span>
					</a>
				</div>
			</div>
		</div>
	</div>

	<button class="app-sidebar-mobile-backdrop" on:click={() => onToggleCollapse(true)} />
</sidebar>

<div id="content" class="app-content">
	<slot />
</div>

<button class="btn btn-scroll-top {scrollY > 10 ? 'show' : 'fade'}" on:click={() => (scrollY = 0)}>
	<i class="fa fa-arrow-up" />
</button>
