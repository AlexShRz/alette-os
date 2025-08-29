import * as E from "effect/Effect";
import { RequestController } from "../../blueprint/controller/RequestController";
import { IRequestContext } from "../../context/IRequestContext";
import { TRequestArguments } from "../../context/RequestIOTypes";
import { RequestMiddleware } from "../../interceptors/middleware/RequestMiddleware";
import { RequestWatcher } from "../../interceptors/watchers/RequestWatcher";
import { queryTask } from "../../tasks/primitive/functions";

export const spawnRequest = <Context extends IRequestContext>({}: {
	threadId: string;
	controller: RequestController<Context>;
	argProvider: () => TRequestArguments<NoInfer<Context>>;
	middlewareInjectors: RequestMiddleware[];
	watcherInjectors: RequestWatcher[];
}) => queryTask(() => E.gen(function* () {})).concurrent();
