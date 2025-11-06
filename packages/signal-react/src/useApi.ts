import { IRequestContext, TAnyApiRequest } from "@alette/signal";
import { useEffect, useMemo, useSyncExternalStore } from "react";

export const useApi = <Context extends IRequestContext>(
	/**
	 * Do not do "extends TAnyApiRequest", or TS will not
	 * be able to infer types.
	 * */
	request: TAnyApiRequest<Context>,
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

	const requestState = useSyncExternalStore(
		controller.subscribe.bind(controller),
		() => controller.getState(),
	);

	useEffect(
		() => () => {
			controller.dispose();
		},
		[],
	);

	useEffect(() => {
		/**
		 * 1. The reloading logic itself is controlled/changed
		 * only by the "reloadable()" middleware.
		 * 2. Reloading MUST happen on each re-render - this
		 * is totally ok.
		 * */
		controller.reload();
	});

	return { ...requestState, ...handlers };
};
