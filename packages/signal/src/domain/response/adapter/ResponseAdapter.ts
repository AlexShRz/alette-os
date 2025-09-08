import { ISchema, validateSchema } from "@alette/pulse";
import { IResponseValueDeserializer } from "./ResponseAdapterBuilder";
import { ResponseRef } from "./ResponseRef";
import { CannotParseResponseValueException } from "./errors/CannotParseResponseValueException";

export class ResponseAdapter<Value = unknown> {
	constructor(
		protected config: {
			schema: ISchema<unknown, Value>;
			deserializer: IResponseValueDeserializer<Value>;
			createRef: (value: Value) => ResponseRef<Value>;
		},
	) {}

	getSchema() {
		return this.config.schema;
	}

	from(value: unknown | Value) {
		const validated = this.validateValue(value);
		return this.config.createRef(validated);
	}

	fromSerialized(serializedValue: string) {
		const validated = this.validateValue(
			this.config.deserializer(serializedValue, { schema: this.getSchema() }),
		);
		return this.config.createRef(validated);
	}

	protected validateValue(value: unknown) {
		try {
			return validateSchema(this.getSchema(), value);
		} catch {
			throw new CannotParseResponseValueException(value);
		}
	}
}
