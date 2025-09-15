export abstract class AbstractBuilder<BuilderType extends object = any> {
	protected cloneWith<OverriddenBuilderType = BuilderType>(
		fn: (clone: OverriddenBuilderType) => void | OverriddenBuilderType,
	): OverriddenBuilderType {
		const self = fn(this as any);
		return self as OverriddenBuilderType;
	}

	abstract clone(): BuilderType;
}
