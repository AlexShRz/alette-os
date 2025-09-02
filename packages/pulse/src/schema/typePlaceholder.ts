import { declare, standardSchemaV1 } from "effect/Schema";
import { ISchema } from "./StandardSchemaTypes";

export const type = <ValueToInfer = any>(
	validator: (value: unknown) => boolean = () => true,
): ISchema<ValueToInfer, ValueToInfer> => {
	const schema = declare(
		(input: unknown): input is ValueToInfer => validator(input),
		{
			identifier: "CustomTypeSchema",
		},
	);

	return standardSchemaV1(schema);
};
