import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import {
	groupIconMdPlugin,
	groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Alette Signal',
	markdown: {
		config(md) {
			md.use(groupIconMdPlugin);
		},
	},
	vite: {
		plugins: [tailwindcss(), groupIconVitePlugin()],
	},
	description: "Delightful data fetching for every Front-End",
	head: [["link", { rel: "icon", href: "/favicon.ico" }]],
	themeConfig: {
		siteTitle: false,
		sitemap: {
			hostname: 'https://alette-os.com/'
		},
		footer: {
			message: 'Released under the Apache 2.0 License.',
		},
		logo: {
			alt: "Alette Signal logo",
			dark: "/alette-signal-white.svg",
			light: "/alette-signal-black.svg",
		},
		lastUpdated: {
			text: "Last Updated",
		},

		// https://vitepress.dev/reference/default-theme-config
		search: {
			provider: "local",
		},
		nav: [
			{ text: "Partnership options", link: "/docs/partnership" },
			{ text: "Discord", link: "https://discord.gg/dWWwtbDG" },
		],

		sidebar: [
			{
				text: "Overview",
				collapsed: false,
				items: [
					{
						text: "Why Alette Signal",
						link: "/docs/overview/why-alette-signal",
					},
					{
						text: "Comparison",
						link: "/docs/overview/comparison",
					},
				],
			},
			{
				text: "Getting started",
				collapsed: false,
				items: [
					{ text: "Installation", link: "/docs/getting-started/installation" },
					{
						text: "Configuring requests",
						link: "/docs/getting-started/configuring-requests",
					},
					{
						text: "Request modes",
						link: "/docs/getting-started/request-modes",
					},
					{
						text: "Request middleware",
						link: "/docs/getting-started/request-middleware",
					},
					{
						text: "Api client",
						link: "/docs/getting-started/api-configuration",
					},
					{ text: "Api plugins", link: "/docs/getting-started/api-plugins" },
					{ text: "Api context", link: "/docs/getting-started/api-context" },
				],
			},
			{
				text: "Request behaviour",
				collapsed: false,
				items: [
					{
						text: "Request lifecycle",
						link: "/docs/request-behaviour/request-lifecycle",
					},
					{
						text: "Request state",
						link: "/docs/request-behaviour/request-state",
					},
					{ text: "Query", link: "/docs/request-behaviour/query" },
					{ text: "Mutation", link: "/docs/request-behaviour/mutation" },
					{ text: "Custom", link: "/docs/request-behaviour/custom" },
					{ text: "Caching", link: "/docs/request-behaviour/caching" },
				],
			},
			{
				text: "Behaviour control",
				collapsed: false,
				items: [
					{
						text: "Request reloading",
						link: "/docs/behaviour-control/request-reloading",
					},
					{
						text: "Request debouncing",
						link: "/docs/behaviour-control/request-debouncing",
					},
					{
						text: "Request throttling",
						link: "/docs/behaviour-control/request-throttling",
					},
					{
						text: "Request retrying",
						link: "/docs/behaviour-control/request-retrying",
					},
				],
			},
			{
				text: "Error system",
				collapsed: false,
				items: [
					{
						text: "Error types",
						link: "/docs/error-system/error-types",
					},
					{
						text: "Error handling",
						link: "/docs/error-system/error-handling",
					},
				],
			},
			{
				text: "Authorization",
				collapsed: false,
				items: [
					{
						text: "Access control",
						link: "/docs/authorization/access-control",
					},
					{
						text: "Token holder",
						link: "/docs/authorization/token-holder",
					},
					{
						text: "Cookie handler",
						link: "/docs/authorization/cookie-handler",
					},
					{
						text: "Request authorization",
						link: "/docs/authorization/request-authorization",
					},
				],
			},
			{
				text: "Paginated data",
				collapsed: true,
				items: [
					{
						text: "Pagination",
						link: "/docs/paginated-data/pagination",
					},
					{
						text: "Cursor pagination",
						link: "/docs/paginated-data/cursor-pagination",
					},
					{
						text: "Single-direction cursor pagination",
						link: "/docs/paginated-data/single-direction-cursor",
					},
					{
						text: "Bi-directional cursor pagination",
						link: "/docs/paginated-data/bi-directional-cursor",
					},
					{
						text: "Infinite scroll",
						link: "/docs/paginated-data/infinite-scroll",
					},
				],
			},
			{
				text: "Integrations",
				collapsed: false,
				items: [
					{
						text: "React integration",
						link: "/docs/integrations/react-integration",
					},
					{
						text: "State managers",
						collapsed: false,
						items: [
							{
								text: "Redux integration",
								link: "/docs/integrations/state-managers/redux-integration",
							},
						],
					},
				],
			},
			{
				text: "Testing",
				collapsed: true,
				items: [
					{
						text: "Environment requirements",
						link: "/docs/testing/environment-requirements",
					},
				],
			},
			{
				text: "Middleware reference",
				collapsed: true,
				items: [
					{
						text: "Middleware overview",
						link: "/docs/middleware-reference/middleware-overview",
					},
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/vuejs/vitepress" },
		],
	},
});
