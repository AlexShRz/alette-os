import * as E from "effect/Effect";
import { RequestState } from "../../../../domain/execution/events/request/RequestState";
import { OneShotRequestController } from "../../controller/OneShotRequestController";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

export const setUpInterruptionRecovery = E.gen(function* () {
	const { getController } = yield* PrepareRequestWorkerArguments;
	const controller = getController();

	if (!(controller instanceof OneShotRequestController)) {
		return;
	}

	yield* E.addFinalizer(
		E.fn(function* () {
			const state = (controller as OneShotRequestController).getState();
			const isUndeterminedState =
				state.isLoading && !state.isSuccess && !state.isError;

			if (isUndeterminedState) {
				yield* controller.getEventReceiver().offer(RequestState.Interrupted());
			}
		}),
	);
});
