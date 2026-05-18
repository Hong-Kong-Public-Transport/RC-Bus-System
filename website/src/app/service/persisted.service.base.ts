export abstract class PersistedServiceBase<T> {

	abstract read(data: T): void;

	abstract write(): T;
}
