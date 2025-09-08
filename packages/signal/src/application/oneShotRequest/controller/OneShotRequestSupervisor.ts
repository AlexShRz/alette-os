import { RequestControllerSupervisor } from "../../blueprint/controller/RequestControllerSupervisor";

export class OneShotRequestSupervisor<
	R,
	ER,
> extends RequestControllerSupervisor<R, ER> {}
