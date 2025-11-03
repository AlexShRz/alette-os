import type { F, U } from "ts-toolbelt";
import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
	IRequestContext,
	RequestSpecification,
	TVerifyMiddlewareCompatibility,
	TVerifyMiddlewareSupplier,
} from "../../../domain";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../../domain/context/RequestContextPatches";
import { MiddlewareFacade } from "../../../domain/middleware/facade/MiddlewareFacade";
import { OneShotRequestBlueprint } from "./OneShotRequestBlueprint";

export interface IOneShotRequestBlueprintWithMiddleware<
	Context extends IRequestContext,
	RequestSpec extends RequestSpecification,
> {
	use<
		N1 extends string,
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
	>(
		fn1: MiddlewareFacade<N1, Context, MC1, any, NC1>,
	): TVerifyMiddlewareCompatibility<
		N1,
		RequestSpec,
		MC1,
		OneShotRequestBlueprint<
			TApplyRequestContextPatches<Context, NC1>,
			RequestSpec
		>
	>;
	use<
		N1 extends string,
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		N2 extends string,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: MiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			MiddlewareFacade<
				N2,
				TApplyRequestContextPatches<Context, NC1>,
				MC2,
				any,
				NC2
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
		RequestSpec
	>;
	use<
		N1 extends string,
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		N2 extends string,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		N3 extends string,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
	>(
		fn1: MiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			MiddlewareFacade<
				N2,
				TApplyRequestContextPatches<Context, NC1>,
				MC2,
				any,
				NC2
			>
		>,
		fn3: TVerifyMiddlewareCompatibility<
			N2,
			RequestSpec,
			MC2,
			MiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
		RequestSpec
	>;
}
