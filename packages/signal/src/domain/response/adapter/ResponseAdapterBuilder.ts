import { ISchema, type, validateSchema } from "@alette/pulse";
import { ResponseAdapter } from "./ResponseAdapter";
import { ResponseRef } from "./ResponseRef";

export interface IResponseValueSerializer<V> {
	(value: V, options: { schema: ISchema<unknown, V> }): string;
}

export interface IResponseValueDeserializer<V> {
	(value: string, options: { schema: ISchema<unknown, V> }): V;
}

export interface IResponseValueCloner<V> {
	(value: V, options: { schema: ISchema<unknown, V> }): V;
}

export interface IResponseValue<V> {
	isDirty: boolean;
	value: V;
}

export const responseAdapter = () => new ResponseAdapterBuilder();

export class ResponseAdapterBuilder<ResponseValue> {
	protected valueSchema = type() as ISchema<unknown, ResponseValue>;
	protected valueSerializer: IResponseValueSerializer<ResponseValue> = (
		value: ResponseValue,
	) => JSON.stringify(value);
	protected valueDeserializer: IResponseValueDeserializer<ResponseValue> = (
		value,
		{ schema },
	) => {
		const deserialized = JSON.parse(value);
		return validateSchema(schema, deserialized);
	};
	/**
	 * Use structuredClone algorithm by default
	 * */
	protected valueCloner: IResponseValueCloner<ResponseValue> = (value) =>
		structuredClone(value);

	whenSerialized(serializer: typeof this.valueSerializer) {
		this.valueSerializer = serializer;
		return this;
	}

	whenDeserialized(deserializer: NonNullable<typeof this.valueDeserializer>) {
		this.valueDeserializer = deserializer;
		return this;
	}

	whenCloned(cloner: NonNullable<typeof this.valueCloner>) {
		this.valueCloner = cloner;
		return this;
	}

	schema<Value>(
		passedSchema: ISchema<unknown, Value>,
	): ResponseAdapterBuilder<Value> {
		this.valueSchema = passedSchema as any;
		return this as any;
	}

	build() {
		return new ResponseAdapter<ResponseValue>({
			schema: this.valueSchema,
			deserializer: this.valueDeserializer,
			createRef: (value) =>
				new ResponseRef(
					{
						isDirty: false,
						value,
					},
					{
						schema: this.valueSchema,
						cloner: this.valueCloner,
						serializer: this.valueSerializer,
					},
				),
		});
	}
}
