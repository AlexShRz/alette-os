import * as Context from "effect/Context";
import {
	IPluginActivationHook,
	IPluginDeactivationHook,
} from "../../ApiPluginBuilder";
import { PluginTaskScheduler } from "../../PluginTaskScheduler";

export class ApiPluginInfo extends Context.Tag("ApiPluginInfo")<
	ApiPluginInfo,
	{
		pluginName: string;
		scheduler: PluginTaskScheduler;
		activationHooks: IPluginDeactivationHook[];
		deactivationHooks: IPluginActivationHook[];
	}
>() {}
