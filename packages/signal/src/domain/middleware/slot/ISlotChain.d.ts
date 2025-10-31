import { IRequestContext } from "../../context";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../context/RequestContextPatches";
import { TAnyMiddlewareFacade } from "../facade/TAnyMiddlewareFacade";
import { Slot } from "./Slot";

export interface ISlotChain<Context extends IRequestContext> {
	with<NC1 extends IRequestContextPatch<any, any>[]>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
	): Slot<TApplyRequestContextPatches<Context, NC1>, [typeof m1]>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
	): Slot<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
		[typeof m1, typeof m2]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
	): Slot<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
		[typeof m1, typeof m2, typeof m3]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
	): Slot<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
		[typeof m1, typeof m2, typeof m3, typeof m4]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
		NC5 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			any,
			any,
			NC5
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
		>,
		[typeof m1, typeof m2, typeof m3, typeof m4, typeof m5]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
		NC5 extends IRequestContextPatch<any, any>[],
		NC6 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			any,
			any,
			NC5
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			any,
			any,
			NC6
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
		>,
		[typeof m1, typeof m2, typeof m3, typeof m4, typeof m5, typeof m6]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
		NC5 extends IRequestContextPatch<any, any>[],
		NC6 extends IRequestContextPatch<any, any>[],
		NC7 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			any,
			any,
			NC5
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			any,
			any,
			NC6
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			any,
			any,
			NC7
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
		>,
		[
			typeof m1,
			typeof m2,
			typeof m3,
			typeof m4,
			typeof m5,
			typeof m6,
			typeof m7,
		]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
		NC5 extends IRequestContextPatch<any, any>[],
		NC6 extends IRequestContextPatch<any, any>[],
		NC7 extends IRequestContextPatch<any, any>[],
		NC8 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			any,
			any,
			NC5
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			any,
			any,
			NC6
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			any,
			any,
			NC7
		>,
		m8: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			any,
			any,
			NC8
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
		>,
		[
			typeof m1,
			typeof m2,
			typeof m3,
			typeof m4,
			typeof m5,
			typeof m6,
			typeof m7,
			typeof m8,
		]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
		NC5 extends IRequestContextPatch<any, any>[],
		NC6 extends IRequestContextPatch<any, any>[],
		NC7 extends IRequestContextPatch<any, any>[],
		NC8 extends IRequestContextPatch<any, any>[],
		NC9 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			any,
			any,
			NC5
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			any,
			any,
			NC6
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			any,
			any,
			NC7
		>,
		m8: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			any,
			any,
			NC8
		>,
		m9: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
			>,
			any,
			any,
			NC9
		>,
	): Slot<
		TApplyRequestContextPatches<
			Context,
			[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8, ...NC9]
		>,
		[
			typeof m1,
			typeof m2,
			typeof m3,
			typeof m4,
			typeof m5,
			typeof m6,
			typeof m7,
			typeof m8,
			typeof m9,
		]
	>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
		NC4 extends IRequestContextPatch<any, any>[],
		NC5 extends IRequestContextPatch<any, any>[],
		NC6 extends IRequestContextPatch<any, any>[],
		NC7 extends IRequestContextPatch<any, any>[],
		NC8 extends IRequestContextPatch<any, any>[],
		NC9 extends IRequestContextPatch<any, any>[],
		NC10 extends IRequestContextPatch<any, any>[],
	>(
		m1: TAnyMiddlewareFacade<Context, any, any, NC1>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			any,
			any,
			NC2
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
		m4: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
			any,
			any,
			NC4
		>,
		m5: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3, ...NC4]>,
			any,
			any,
			NC5
		>,
		m6: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5]
			>,
			any,
			any,
			NC6
		>,
		m7: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6]
			>,
			any,
			any,
			NC7
		>,
		m8: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7]
			>,
			any,
			any,
			NC8
		>,
		m9: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8]
			>,
			any,
			any,
			NC9
		>,
		m10: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<
				Context,
				[...NC1, ...NC2, ...NC3, ...NC4, ...NC5, ...NC6, ...NC7, ...NC8, ...NC9]
			>,
			any,
			any,
			NC10
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
			typeof m1,
			typeof m2,
			typeof m3,
			typeof m4,
			typeof m5,
			typeof m6,
			typeof m7,
			typeof m8,
			typeof m9,
			typeof m10,
		]
	>;

	with(
		...middleware: TAnyMiddlewareFacade<any, any, any, any>[]
	): Slot<any, any>;
}
