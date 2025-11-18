import {
	IAnyMiddlewareSpecification,
	IRequestContext,
	RequestSpecification,
} from "../../../domain";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../../domain/context/RequestContextPatches";
import { TAnyMiddlewareFacade } from "../../../domain/middleware/TAnyMiddlewareFacade";
import { OneShotRequestBlueprint } from "./OneShotRequestBlueprint";

export interface IOneShotRequestBlueprintWithMiddleware<
	Context extends IRequestContext,
	RequestSpec extends RequestSpecification,
> {
	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, NC1>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4,
			RequestSpec
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
		>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4,
			RequestSpec
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5,
			RequestSpec
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
		>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4,
			RequestSpec
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5,
			RequestSpec
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6,
			RequestSpec
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
		>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
		NC8 extends IRequestContextPatch<any, any>[],
		MC8 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4,
			RequestSpec
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5,
			RequestSpec
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6,
			RequestSpec
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7,
			RequestSpec
		>,
		m8: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			NC8,
			MC8,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
		>,
		RequestSpec
	>;

	use<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
		NC8 extends IRequestContextPatch<any, any>[],
		MC8 extends IAnyMiddlewareSpecification,
		NC9 extends IRequestContextPatch<any, any>[],
		MC9 extends IAnyMiddlewareSpecification,
		NC10 extends IRequestContextPatch<any, any>[],
		MC10 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4,
			RequestSpec
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5,
			RequestSpec
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6,
			RequestSpec
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7,
			RequestSpec
		>,
		m8: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			NC8,
			MC8,
			RequestSpec
		>,
		m9: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
			>,
			NC9,
			MC9,
			RequestSpec
		>,
		m10: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8, ...NC9]
			>,
			NC10,
			MC10,
			RequestSpec
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[
				...NC1,
				...NC2,
				...NC3,
				...NC4,
				...NC5,
				...NC6,
				...NC7,
				...NC8,
				...NC9,
				...NC10,
			]
		>,
		RequestSpec
	>;
}
