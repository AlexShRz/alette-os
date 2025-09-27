import { ISchema } from "./StandardSchemaTypes";

export const type = <ValueToInfer = any>(): ISchema<unknown, ValueToInfer> => {
	return {
		"~standard": {
			vendor: "alette-signal",
			version: 1,
			validate(value) {
				return { value: value as ValueToInfer };
			},
		},
	};
};
