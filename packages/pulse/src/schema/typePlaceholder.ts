import { StandardSchemaV1 } from "@standard-schema/spec";
import { declare, standardSchemaV1 } from "effect/Schema";

export const type = <ValueToInfer = any>(
	validator: (value: unknown) => boolean = () => true,
): StandardSchemaV1<ValueToInfer, ValueToInfer> => {
	const schema = declare(
		(input: unknown): input is ValueToInfer => validator(input),
		{
			identifier: "CustomTypeSchema",
		},
	);

	return standardSchemaV1(schema);
};
