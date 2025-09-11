import { activatePlugins, coreApiPlugin } from "../../application";
import { CommandTaskBuilder } from "../../application/plugins/tasks/primitive/CommandTaskBuilder";
import { client } from "../../infrastructure/ApiClient";

export const createTestApi = (...commands: CommandTaskBuilder[]) => {
	const core = coreApiPlugin();
	const api = client(activatePlugins(core), ...commands);

	return { api, corePlugin: core, ...core.use() };
};
