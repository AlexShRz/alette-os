import { ISchema, type, validateSchema } from "@alette/pulse";
import { v4 as uuid } from "uuid";
import {
	IResponseValue,
	IResponseValueCloner,
	IResponseValueSerializer,
} from "./ResponseAdapterBuilder";

export class ResponseRef<Value> {
	protected id = uuid();

	constructor(
		protected response: IResponseValue<Value>,
		protected config: {
			schema: ISchema<unknown, Value>;
			serializer: IResponseValueSerializer<Value>;
			cloner: IResponseValueCloner<Value>;
		},
	) {}

	isDirty() {
		return this.response.isDirty;
	}

	getId() {
		return this.id;
	}

	markAsDirty() {
		this.response.isDirty = true;
		return this;
	}

	/**
	 * Must be sync, because we might
	 * wait to access the value in environments where
	 * we cannot run promises (UI, etc.)
	 * */
	unsafeGet() {
		return this.response.value;
	}

	async map<NewValue>(
		mapper: (
			value: Value,
		) => Promise<NewValue> | Promise<ResponseRef<NewValue>>,
	): Promise<ResponseRef<NewValue>> {
		const { cloner, schema } = this.config;

		/**
		 * 1. If our value is dirty, it means that it is
		 * safe for mapping.
		 * 2. If our value is clean, it means that we need to clone
		 * it before mapping.
		 * ------------------------------------------------------------
		 * 1. This allows us to preserve the same response value
		 * if we don't have any middleware in the chain that need to map it.
		 * 2. This is especially useful when our response is a few MB in size -
		 * cloning it is an expensive operation that might hog more memory than needed.
		 * This is why we need to clone it ONCE for the whole chain and then reuse
		 * the cloned value when passing it through "mapper" middleware family.
		 * */
		const valueForMapping = this.isDirty()
			? this.response.value
			: cloner(this.response.value, { schema });
		const result = await mapper(valueForMapping);

		/**
		 * If we return a new response ref from the mapping,
		 * abandon current response ref and switch to it.
		 * */
		if (result instanceof ResponseRef) {
			return result;
		}

		const newResponseValue = {
			value: result as any,
			isDirty: true,
		};

		/**
		 * 1. If our new value can be validated using our old schema,
		 * preserve response ref and DO NOT create a new one.
		 * 2. If NOT, create a new ref and reset the schema to
		 * dummy placeholder. During all next maps, the schema will always pass,
		 * because it does not actually validate anything at runtime.
		 * This means that the value WILL NOT be cloned for the whole chain of mappers afterward.
		 * */
		try {
			validateSchema(schema, result);
			/**
			 * Update response value
			 * */
			this.response = newResponseValue;
			return this as any;
		} catch {
			return new ResponseRef(newResponseValue, {
				...this.config,
				schema: type<NewValue>() as any,
			}) as any;
		}
	}

	serialize() {
		const { serializer, schema } = this.config;
		return serializer(this.response.value, { schema });
	}

	clone() {
		/**
		 * If not dirty, deep clone the value and
		 * create a completely new reference.
		 * */
		if (!this.response.isDirty) {
			const { cloner, schema } = this.config;
			const clonedValue = cloner(this.response.value, { schema });
			return new ResponseRef(
				{
					value: clonedValue,
					isDirty: false,
				},
				this.config,
			);
		}

		/**
		 * If dirty, pass the same value
		 * reference down the chain without cloning it
		 * */
		return new ResponseRef(this.response, this.config);
	}
}
