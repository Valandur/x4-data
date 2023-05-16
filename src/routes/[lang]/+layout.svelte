<script lang="ts">
	import { page } from '$app/stores';

	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: lang = data.lang;
	$: langs = data.languages;
	$: path = data.path;
</script>

<header id="header" class="app-header">
	<div id="header" class="app-header">
		<div class="desktop-toggler">
			<button
				type="button"
				class="menu-toggler"
				data-toggle-class="app-sidebar-collapsed"
				data-dismiss-class="app-sidebar-toggled"
				data-toggle-target=".app"
			>
				<span class="bar" />
				<span class="bar" />
				<span class="bar" />
			</button>
		</div>

		<div class="mobile-toggler">
			<button
				type="button"
				class="menu-toggler"
				data-toggle-class="app-sidebar-mobile-toggled"
				data-toggle-target=".app"
			>
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
			<div class="menu-item dropdown">
				<button
					data-toggle-class="app-header-menu-search-toggled"
					data-toggle-target=".app"
					class="btn menu-link"
				>
					<div class="menu-icon"><i class="bi bi-search nav-icon" /></div>
				</button>
			</div>
			<div class="menu-item dropdown">
				<div class="menu-item dropdown dropdown-mobile-full">
					<button data-bs-toggle="dropdown" data-bs-display="static" class="btn menu-link">
						<div class="menu-text d-sm-block d-none">{data.langName}</div>
					</button>
					<div class="dropdown-menu dropdown-menu-end me-lg-3 fs-11px mt-1">
						{#each langs as lang}
							<a class="dropdown-item d-flex align-items-center" href="/{lang.key}{path}">
								{lang.name}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<form class="menu-search" method="POST" name="header_search_form">
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
		</form>
	</div>
</header>

<sidebar id="sidebar" class="app-sidebar">
	<div id="sidebar" class="app-sidebar">
		<div class="app-sidebar-content" data-scrollbar="true" data-height="100%">
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

				<div class="menu-item" class:active={$page.url.pathname === `/${lang}/weapons`}>
					<a href="/{lang}/weapons" class="menu-link">
						<span class="menu-icon"><i class="fa-solid fa-gun" /></span>
						<span class="menu-text">Weapons & Turrets</span>
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

	<button
		class="app-sidebar-mobile-backdrop"
		data-toggle-target=".app"
		data-toggle-class="app-sidebar-mobile-toggled"
	/>
</sidebar>

<div id="content" class="app-content">
	<slot />
</div>

<button data-toggle="scroll-to-top" class="btn btn-scroll-top fade">
	<i class="fa fa-arrow-up" />
</button>
