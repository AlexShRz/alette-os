export const isTestEnv = () => {
	if ("vi" in globalThis) {
		return true;
	}

	return "jest" in globalThis;
};
