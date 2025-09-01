import * as E from "effect/Effect";
import { KernelTaskRunner } from "./KernelTaskRunner";

export class Kernel extends E.Service<Kernel>()("Kernel", {
	dependencies: [KernelTaskRunner.Default],
	effect: E.gen(function* () {
		return {};
	}),
}) {}
