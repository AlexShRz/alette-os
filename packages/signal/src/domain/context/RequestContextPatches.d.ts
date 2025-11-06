import { TDeepMerge, TDeepReplace } from "@alette/shared";

type TRequestContextPatchStrategy = "replace" | "merge";

export interface IRequestContextPatch<
	Patch extends object = {},
	Strategy extends TRequestContextPatchStrategy = "replace",
> {
	patch: Patch;
	strategy: Strategy;
}

/**
 * IMPORTANT - "any" must be set in IRequestContextPatch<...> "extends" clause.
 * Otherwise, the whole "extends" clause will not work.
 * */
export type TApplyRequestContextPatches<
	Context extends object,
	Patches extends IRequestContextPatch<any, any>[],
> = Patches extends [infer Head, ...infer Tail]
	? Head extends IRequestContextPatch<any, any>
		? Tail extends IRequestContextPatch<any, any>[]
			? TApplyRequestContextPatches<TApplySinglePatch<Context, Head>, Tail>
			: TApplySinglePatch<Context, Head>
		: Context
	: Context;

type TApplySinglePatch<
	Context extends object,
	Patch extends IRequestContextPatch<any, any>,
> = Patch["strategy"] extends "merge"
	? TDeepMerge<Context, Patch["patch"]>
	: TDeepReplace<Context, Patch["patch"]>;
