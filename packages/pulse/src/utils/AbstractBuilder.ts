export abstract class AbstractBuilder<BuilderType extends object = any> {
	protected cloneWith<OverriddenBuilderType = BuilderType>(
		fn: (clone: OverriddenBuilderType) => void | OverriddenBuilderType,
	): OverriddenBuilderType {
		const clone = this.clone();
		const maybeProvidedBuilder = fn(clone as any);
		return (maybeProvidedBuilder ?? clone) as OverriddenBuilderType;
	}

	abstract clone(): BuilderType;
}
