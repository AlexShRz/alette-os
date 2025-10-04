import { ISchema, as } from "@alette/pulse";
import isEqual from "fast-deep-equal";
import { ArgumentAdapter } from "./ArgumentAdapter";
import { ArgumentRef } from "./ArgumentRef";
import { ArgumentCloningError } from "./errors";

export interface IArgumentComparator<V> {
	(passedArgs: V | null, currentArgs: V): boolean;
}

export interface IArgumentCloner<V> {
	(value: V): V;
}

export const argumentAdapter = () => new ArgumentAdapterBuilder();

export class ArgumentAdapterBuilder<Arguments> {
	protected argSchema = as() as ISchema<unknown, Arguments>;
	protected argComparator: IArgumentComparator<Arguments> = (next, current) =>
		isEqual(next, current);
	protected argCloner: IArgumentCloner<Arguments> = (args) => {
		try {
			return structuredClone(args);
		} catch {
			throw new ArgumentCloningError(args);
		}
	};

	schema<Value>(
		passedSchema: ISchema<unknown, Value>,
	): ArgumentAdapterBuilder<Value> {
		this.argSchema = passedSchema as any;
		return this as any;
	}

	whenCompared(comparator: typeof this.argComparator) {
		this.argComparator = comparator;
		return this;
	}

	whenCloned(cloner: typeof this.argCloner) {
		this.argCloner = (args) => {
			try {
				return cloner(args);
			} catch {
				throw new ArgumentCloningError(args);
			}
		};
		return this;
	}

	build() {
		return new ArgumentAdapter<Arguments>({
			schema: this.argSchema,
			createRef: (value) =>
				new ArgumentRef(value, {
					schema: this.argSchema,
					comparator: this.argComparator,
					cloner: this.argCloner,
				}),
		});
	}
}
