import { IRequestContext, TAnyApiRequest } from "@alette/signal";
import { useEffect, useMemo, useState } from "react";

export const useApi = <Context extends IRequestContext>(
	/**
	 * Do not do "extends TAnyApiRequest", or TS will not
	 * be able to infer types.
	 * */
	request: TAnyApiRequest<Context>,
	deps: unknown[] = [],
) => {
	const { controller, handlers } = useMemo(() => {
		const controller = request.control();
		return {
			controller,
			handlers: controller.getHandlers(),
		};
	}, [request.getKey()]);

	/**
	 * 1. Update setting supplier ("using") on every rerender.
	 * 2. This makes sure our closures over UI values are
	 * always fresh.
	 * */
	controller.setSettingSupplier(request.getSettingSupplier());

	/**
	 * Do not use "useSyncExternalStore" - it skips state updates.
	 * */
	const [requestState, updateRequestState] = useState(controller.getState());
	useEffect(() => {
		const unsubscribe = controller.subscribe((data) => {
			updateRequestState(data);
		});

		return () => {
			unsubscribe();
			controller.dispose();
		};
	}, []);

	useEffect(() => {
		controller.reload();
	}, deps);

	return { ...requestState, ...handlers };
};
