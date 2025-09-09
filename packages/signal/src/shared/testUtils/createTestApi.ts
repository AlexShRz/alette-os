import { activatePlugins, coreApiPlugin } from "../../application";
import { client } from "../../infrastructure/ApiClient";

export const createTestApi = () => {
	const core = coreApiPlugin();
	const api = client(activatePlugins(core));

	return { api, ...core.use() };
};
