import { IRequestContext } from "../../context";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../context/RequestContextPatches";
import { IAnyMiddlewareSpecification } from "../../specification";
import { TAnyMiddlewareFacadeWithoutValidation } from "../TAnyMiddlewareFacade";
import { Slot } from "./Slot";

/**
 * IMPORTANT:
 * 1. Make sure that middleware types stored inside Slot second
 * generic argument have their "Context" type set to "any". This
 * is a must, otherwise all types "upstream" will be lost and
 * preconfigured request blueprints will not be able
 * */
export interface ISlotChain<Context extends IRequestContext> {
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
	): Slot<
		TApplyRequestContextPatches<Context, NC1>,
		[TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>]
	>;

	with<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
	): Slot<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
		]
	>;

	with<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
	): Slot<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
		]
	>;

	with<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContextPatch<any, any>[],
		MC4 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
	): Slot<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
		]
	>;

	with<
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
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
		m5: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
		>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC5, MC5>,
		]
	>;

	with<
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
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
		m5: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5
		>,
		m6: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
		>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC5, MC5>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC6, MC6>,
		]
	>;

	with<
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
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
		m5: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5
		>,
		m6: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6
		>,
		m7: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
		>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC5, MC5>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC6, MC6>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC7, MC7>,
		]
	>;

	with<
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
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
		m5: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5
		>,
		m6: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6
		>,
		m7: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7
		>,
		m8: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			NC8,
			MC8
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
		>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC5, MC5>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC6, MC6>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC7, MC7>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC8, MC8>,
		]
	>;

	with<
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
	>(
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
		m5: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5
		>,
		m6: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6
		>,
		m7: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7
		>,
		m8: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			NC8,
			MC8
		>,
		m9: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
			>,
			NC9,
			MC9
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8, ...NC9]
		>,
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC5, MC5>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC6, MC6>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC7, MC7>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC8, MC8>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC9, MC9>,
		]
	>;

	with<
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
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1, MC1>,
		m2: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2
		>,
		m3: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3
		>,
		m4: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			NC4,
			MC4
		>,
		m5: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			NC5,
			MC5
		>,
		m6: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			NC6,
			MC6
		>,
		m7: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			NC7,
			MC7
		>,
		m8: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			NC8,
			MC8
		>,
		m9: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
			>,
			NC9,
			MC9
		>,
		m10: TAnyMiddlewareFacadeWithoutValidation<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8, ...NC9]
			>,
			NC10,
			MC10
		>,
	): Slot<
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
		[
			TAnyMiddlewareFacadeWithoutValidation<any, NC1, MC1>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC2, MC2>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC3, MC3>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC4, MC4>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC5, MC5>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC6, MC6>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC7, MC7>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC8, MC8>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC9, MC9>,
			TAnyMiddlewareFacadeWithoutValidation<any, NC10, MC10>,
		]
	>;
}
