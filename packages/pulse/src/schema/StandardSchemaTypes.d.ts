import { StandardSchemaV1 } from "@standard-schema/spec";

export interface ISchema<Input, Output>
	extends StandardSchemaV1<Input, Output> {}

export interface IAnySchema extends StandardSchemaV1<any, any> {}

export type TInferSchemaInput<T extends ISchema> = T extends StandardSchemaV1<
	infer UInput,
	any
>
	? UInput
	: never;

export type TInferSchemaOutput<T extends ISchema> = T extends StandardSchemaV1<
	any,
	infer UOutput
>
	? UOutput
	: never;
