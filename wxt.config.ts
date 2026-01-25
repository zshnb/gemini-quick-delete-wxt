import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
	manifest: {
		name: '__MSG_extName__',
		description: '__MSG_extDescription__',
		permissions: [],
		host_permissions: ['https://gemini.google.com/*'],
		action: {},
		default_locale: 'en'
	},
});
