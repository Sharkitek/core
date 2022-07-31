import {Type} from "./Type";

/**
 * Type of an array of values.
 */
export class ArrayType<SerializedValueType, SharkitekValueType> extends Type<SerializedValueType[], SharkitekValueType[]>
{
	/**
	 * Constructs a new array type of Sharkitek model property.
	 * @param valueType - Type of the array values.
	 */
	constructor(protected valueType: Type<SerializedValueType, SharkitekValueType>)
	{
		super();
	}

	serialize(value: SharkitekValueType[]): SerializedValueType[]
	{
		return value.map((value) => (
			// Serializing each value of the array.
			this.valueType.serialize(value)
		));
	}

	deserialize(value: SerializedValueType[]): SharkitekValueType[]
	{
		return value.map((serializedValue) => (
			// Deserializing each value of the array.
			this.valueType.deserialize(serializedValue)
		));
	}

	serializeDiff(value: SharkitekValueType[]): any
	{
		// Serializing diff of all elements.
		return value.map((value) => this.valueType.serializeDiff(value));
	}

	resetDiff(value: SharkitekValueType[]): void
	{
		// Reset diff of all elements.
		value.forEach((value) => this.valueType.resetDiff(value));
	}
}

/**
 * Type of an array of values.
 * @param valueType - Type of the array values.
 */
export function SArray<SerializedValueType, SharkitekValueType>(valueType: Type<SerializedValueType, SharkitekValueType>)
{
	return new ArrayType<SerializedValueType, SharkitekValueType>(valueType);
}
