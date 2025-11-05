import {
	IAnyMiddlewareSpecification,
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
import { TAnyMiddlewareFacade } from "../../../domain/middleware/facade/TAnyMiddlewareFacade";
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
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
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
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			TAnyMiddlewareFacade<
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
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		N5 extends string,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
		fn5: TVerifyMiddlewareCompatibility<
			N4,
			RequestSpec,
			MC4,
			TAnyMiddlewareFacade<
				N5,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
				MC5,
				any,
				NC5
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
		>,
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		N5 extends string,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		N6 extends string,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
		fn5: TVerifyMiddlewareCompatibility<
			N4,
			RequestSpec,
			MC4,
			TAnyMiddlewareFacade<
				N5,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
				MC5,
				any,
				NC5
			>
		>,
		fn6: TVerifyMiddlewareCompatibility<
			N5,
			RequestSpec,
			MC5,
			TAnyMiddlewareFacade<
				N6,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
				>,
				MC6,
				any,
				NC6
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
		>,
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		N5 extends string,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		N6 extends string,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		N7 extends string,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
		fn5: TVerifyMiddlewareCompatibility<
			N4,
			RequestSpec,
			MC4,
			TAnyMiddlewareFacade<
				N5,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
				MC5,
				any,
				NC5
			>
		>,
		fn6: TVerifyMiddlewareCompatibility<
			N5,
			RequestSpec,
			MC5,
			TAnyMiddlewareFacade<
				N6,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
				>,
				MC6,
				any,
				NC6
			>
		>,
		fn7: TVerifyMiddlewareCompatibility<
			N6,
			RequestSpec,
			MC6,
			TAnyMiddlewareFacade<
				N7,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
				>,
				MC7,
				any,
				NC7
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
		>,
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		N5 extends string,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		N6 extends string,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		N7 extends string,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
		N8 extends string,
		NC8 extends IRequestContextPatch<any, any>[],
		MC8 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
		fn5: TVerifyMiddlewareCompatibility<
			N4,
			RequestSpec,
			MC4,
			TAnyMiddlewareFacade<
				N5,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
				MC5,
				any,
				NC5
			>
		>,
		fn6: TVerifyMiddlewareCompatibility<
			N5,
			RequestSpec,
			MC5,
			TAnyMiddlewareFacade<
				N6,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
				>,
				MC6,
				any,
				NC6
			>
		>,
		fn7: TVerifyMiddlewareCompatibility<
			N6,
			RequestSpec,
			MC6,
			TAnyMiddlewareFacade<
				N7,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
				>,
				MC7,
				any,
				NC7
			>
		>,
		fn8: TVerifyMiddlewareCompatibility<
			N7,
			RequestSpec,
			MC7,
			TAnyMiddlewareFacade<
				N8,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
				>,
				MC8,
				any,
				NC8
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
		>,
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		N5 extends string,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		N6 extends string,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		N7 extends string,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
		N8 extends string,
		NC8 extends IRequestContextPatch<any, any>[],
		MC8 extends IAnyMiddlewareSpecification,
		N9 extends string,
		NC9 extends IRequestContextPatch<any, any>[],
		MC9 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
		fn5: TVerifyMiddlewareCompatibility<
			N4,
			RequestSpec,
			MC4,
			TAnyMiddlewareFacade<
				N5,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
				MC5,
				any,
				NC5
			>
		>,
		fn6: TVerifyMiddlewareCompatibility<
			N5,
			RequestSpec,
			MC5,
			TAnyMiddlewareFacade<
				N6,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
				>,
				MC6,
				any,
				NC6
			>
		>,
		fn7: TVerifyMiddlewareCompatibility<
			N6,
			RequestSpec,
			MC6,
			TAnyMiddlewareFacade<
				N7,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
				>,
				MC7,
				any,
				NC7
			>
		>,
		fn8: TVerifyMiddlewareCompatibility<
			N7,
			RequestSpec,
			MC7,
			TAnyMiddlewareFacade<
				N8,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
				>,
				MC8,
				any,
				NC8
			>
		>,
		fn9: TVerifyMiddlewareCompatibility<
			N8,
			RequestSpec,
			MC8,
			TAnyMiddlewareFacade<
				N9,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
				>,
				MC9,
				any,
				NC9
			>
		>,
	): OneShotRequestBlueprint<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8, ...NC9]
		>,
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
		N4 extends string,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
		N5 extends string,
		NC5 extends IRequestContextPatch<any, any>[],
		MC5 extends IAnyMiddlewareSpecification,
		N6 extends string,
		NC6 extends IRequestContextPatch<any, any>[],
		MC6 extends IAnyMiddlewareSpecification,
		N7 extends string,
		NC7 extends IRequestContextPatch<any, any>[],
		MC7 extends IAnyMiddlewareSpecification,
		N8 extends string,
		NC8 extends IRequestContextPatch<any, any>[],
		MC8 extends IAnyMiddlewareSpecification,
		N9 extends string,
		NC9 extends IRequestContextPatch<any, any>[],
		MC9 extends IAnyMiddlewareSpecification,
		N10 extends string,
		NC10 extends IRequestContextPatch<any, any>[],
		MC10 extends IAnyMiddlewareSpecification,
	>(
		fn1: TAnyMiddlewareFacade<N1, Context, MC1, any, NC1>,
		fn2: TVerifyMiddlewareCompatibility<
			N1,
			RequestSpec,
			MC1,
			TAnyMiddlewareFacade<
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
			TAnyMiddlewareFacade<
				N3,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
				MC3,
				any,
				NC3
			>
		>,
		fn4: TVerifyMiddlewareCompatibility<
			N3,
			RequestSpec,
			MC3,
			TAnyMiddlewareFacade<
				N4,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
				MC4,
				any,
				NC4
			>
		>,
		fn5: TVerifyMiddlewareCompatibility<
			N4,
			RequestSpec,
			MC4,
			TAnyMiddlewareFacade<
				N5,
				TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
				MC5,
				any,
				NC5
			>
		>,
		fn6: TVerifyMiddlewareCompatibility<
			N5,
			RequestSpec,
			MC5,
			TAnyMiddlewareFacade<
				N6,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
				>,
				MC6,
				any,
				NC6
			>
		>,
		fn7: TVerifyMiddlewareCompatibility<
			N6,
			RequestSpec,
			MC6,
			TAnyMiddlewareFacade<
				N7,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
				>,
				MC7,
				any,
				NC7
			>
		>,
		fn8: TVerifyMiddlewareCompatibility<
			N7,
			RequestSpec,
			MC7,
			TAnyMiddlewareFacade<
				N8,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
				>,
				MC8,
				any,
				NC8
			>
		>,
		fn9: TVerifyMiddlewareCompatibility<
			N8,
			RequestSpec,
			MC8,
			TAnyMiddlewareFacade<
				N9,
				TApplyRequestContextPatches<
					Context,
					[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
				>,
				MC9,
				any,
				NC9
			>
		>,
		fn10: TVerifyMiddlewareCompatibility<
			N9,
			RequestSpec,
			MC9,
			TAnyMiddlewareFacade<
				N10,
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
					]
				>,
				MC10,
				any,
				NC10
			>
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
