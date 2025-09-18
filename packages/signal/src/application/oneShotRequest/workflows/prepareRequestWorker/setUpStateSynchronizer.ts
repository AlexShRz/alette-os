import * as E from "effect/Effect";
import { RequestState } from "../../../../domain/execution/events/request/RequestState";
import { OneShotRequestController } from "../../controller/OneShotRequestController";
import { PrepareRequestWorkerArguments } from "./PrepareRequestWorkerArguments";

export const setUpStateSynchronizer = E.gen(function* () {
	const { getController } = yield* PrepareRequestWorkerArguments;
	const controller = getController();

	if (!(controller instanceof OneShotRequestController)) {
		return;
	}

	yield* E.addFinalizer(
		E.fn(function* () {
			const state = (controller as OneShotRequestController).getState();

			/**
			 * Switch to interrupted state only if
			 * our request is loading
			 * */
			if (state.isLoading) {
				yield* controller
					.getStateManager()
					.applyStateSnapshot(RequestState.Interrupted());
			}
		}),
	);
});
