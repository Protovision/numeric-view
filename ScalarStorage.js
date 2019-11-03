/*
 * File: ScalarStorage.js
 * Author: Mark Swoope
 * Date: November 2, 2019
 * Description: ScalarStorage class for storing any arithmetic scalar type 
 * and accessing it's individual bits or bytes. 
 */

/*
 * ScalarStorage class:
 *  get signedness: ScalarStorage.signedness Symbol
 *  set signedness(s: ScalarStorage.signedness Symbol)
 *  get size: Number 
 *  set size(s: Number)
 *  get category: ScalarStorage.category Symbol
 *  set category(ScalarStorage.category Symbol)
 *  get endianness: ScalarStorage.endianness Symbol
 *  set endianness(e: ScalarStorage.endianness Symbol)
 *  get type: ScalarStorage.type Symbol
 *  set type(t: ScalarStorage.type Symbol)
 *  get value: Number
 *  set value(v: Number)
 *  get bytes: Array of Number
 *  set bytes(b: Array of Number)
 *  get bits: Array of Number
 *  set bits(b: Array of Number)
 *  clear()
 *  flip()
 *  shiftLeft(n: Number)
 *  shiftRight(n: Number)
 *  increment()
 *  decrement()
 * 
 * Symbols:
 *  ScalarStorage.signedness.signed
 *  ScalarStorage.signedness.unsigned
 *  ScalarStorage.category.integral
 *  ScalarStorage.category.floatingPoint
 *  ScalarStorage.endianness.littleEndian
 *  ScalarStorage.endianness.bigEndian
 *  ScalarStorage.type.s8
 *  ScalarStorage.type.u8
 *  ScalarStorage.type.s16
 *  ScalarStorage.type.u16
 *  ScalarStorage.type.s32
 *  ScalarStorage.type.u32
 *  ScalarStorage.type.f32
 *  ScalarStorage.type.f64
 */
class ScalarStorage {

	constructor()
	{
		this.internal = {};
		this.internal.arrayBuffer = new ArrayBuffer(8);
		this.internal.dataView = new DataView(this.internal.arrayBuffer);
		this.internal.signedness = ScalarStorage.signedness.signed;
		this.internal.size = 8;
		this.internal.category = ScalarStorage.category.floatingPoint;
		this.internal.type = ScalarStorage.type.f64;
		this.internal.endianness = ScalarStorage.endianness.bigEndian;
		this.clear();
	}

	get signedness()
	{
		return this.internal.signedness;	
	}

	set signedness(newSignedness)
	{
		if (newSignedness == this.signedness) return;
		switch (this.type) {
		case ScalarStorage.type.s8:
			this.type = ScalarStorage.type.u8;
			break;
		case ScalarStorage.type.s16:
			this.type = ScalarStorage.type.u16;
			break;
		case ScalarStorage.type.s32:
			this.type = ScalarStorage.type.u32;
			break;
		case ScalarStorage.type.u8:
			this.type = ScalarStorage.type.s8;
			break;
		case ScalarStorage.type.u16:
			this.type = ScalarStorage.type.s16;
			break;
		case ScalarStorage.type.u32:
			this.type = ScalarStorage.type.s32;
			break;
		default:
			throw 'Cannot change signedness for current type.';
		}
	}

	get size()
	{
		return this.internal.size;
	}

	set size(newSize)
	{
		if (newSize == this.size) return;
		if (this.category == ScalarStorage.category.floatingPoint) {
			switch (newSize) {
			case 4:
				this.type = ScalarStorage.type.f32;
				break;
			case 8:
				this.type = ScalarStorage.type.f64;
				break;
			default:
				throw 'Unsupported floating-point type size.';
			}
		} else {
			if (this.signedness == ScalarStorage.signedness.signed) {
				switch (newSize) {
				case 1:
					this.type = ScalarStorage.type.s8;
					break;
				case 2:
					this.type = ScalarStorage.type.s16;
					break;
				case 4:
					this.type = ScalarStorage.type.s32;
					break;
				default:
					throw 'Unsupported signed integral type size.';
				}
			} else {
				switch (newSize) {
				case 1:
					this.type = ScalarStorage.type.u8;
					break;
				case 2:
					this.type = ScalarStorage.type.u16;
					break;
				case 4:
					this.type = ScalarStorage.type.u32;
					break;
				default:
					throw 'Unsupported unsigned integral type size.';
				}
			} 
		} 
	}

	get category()
	{
		return this.internal.category;	
	}

	set category(newCategory)
	{
		if (newCategory == this.category) return;
		switch (newCategory) {
		case ScalarStorage.category.integral:
			this.type = ScalarStorage.type.s32;
			break;
		case ScalarStorage.category.floatingPoint:
			this.type = ScalarStorage.type.f64;
			break;
		default:
			throw 'Unknown type category.';
		}
	}

	get endianness()
	{
		return this.internal.endianness;
	}

	set endianness(newEndianness)
	{
		if (newEndianness == this.endianness) return;
		for (let first = 0, last = this.internal.size - 1; 
				first < last; ++first, --last) {
			const firstByte = this.internal.dataView.getUint8(first);
			const lastByte = this.internal.dataView.getUint8(last);
			this.internal.dataView.setUint8(first, lastByte);
			this.internal.dataView.setUint8(last, firstByte);
		}
		this.internal.endianness = newEndianness;
	}

	get type()
	{
		return this.internal.type;
	}

	set type(newType)
	{
		if (newType == this.type) return;
		const oldSignedness = this.signedness;
		const oldSize = this.size;
		const oldCategory = this.category;
		const oldEndianness = this.endianness;
		let newSignedness, newSize, newCategory;
		switch (newType) {
		case ScalarStorage.type.s8:
		case ScalarStorage.type.s16:
		case ScalarStorage.type.s32:
		case ScalarStorage.type.f32:
		case ScalarStorage.type.f64:
			newSignedness = ScalarStorage.signedness.signed;
			break;
		case ScalarStorage.type.u8:
		case ScalarStorage.type.u16:
		case ScalarStorage.type.u32:
			newSignedness = ScalarStorage.signedness.unsigned;
			break;
		default:
			throw 'Invalid type.';
		}
		switch (newType) {
		case ScalarStorage.type.s8:
		case ScalarStorage.type.u8:
			newSize = 1;
			break;
		case ScalarStorage.type.s16:
		case ScalarStorage.type.u16:
			newSize = 2;
			break;
		case ScalarStorage.type.s32:
		case ScalarStorage.type.u32:
		case ScalarStorage.type.f32:
			newSize = 4;
			break;
		case ScalarStorage.type.f64:
			newSize = 8;
			break;
		default:
			throw 'Invalid type.';
		}
		switch (newType) {
		case ScalarStorage.type.s8:
		case ScalarStorage.type.u8:
		case ScalarStorage.type.s16:
		case ScalarStorage.type.u16:
		case ScalarStorage.type.s32:
		case ScalarStorage.type.u32:
			newCategory = ScalarStorage.category.integral;
			break;
		case ScalarStorage.type.f32:
		case ScalarStorage.type.f64:
			newCategory = ScalarStorage.category.floatingPoint;
			break;
		default:
			throw 'Invalid type.';
		}
		this.endianness = ScalarStorage.endianness.littleEndian;
		for (let i = oldSize; i < newSize; ++i) {
			this.internal.dataView.setUint8(i, 0);
		}
		this.internal.size = newSize;
		this.endianness = oldEndianness;
		this.internal.signedness = newSignedness;
		this.internal.category = newCategory;
		this.internal.type = newType;
	}

	get value()
	{
		const littleEndian = 
			(this.endianness == ScalarStorage.endianness.littleEndian);
		switch (this.type) {
		case ScalarStorage.type.s8:
			return this.internal.dataView.getInt8(0);
		case ScalarStorage.type.s16:
			return this.internal.dataView.getInt16(0, littleEndian);
		case ScalarStorage.type.s32:
			return this.internal.dataView.getInt32(0, littleEndian);
		case ScalarStorage.type.u8:
			return this.internal.dataView.getUint8(0);
		case ScalarStorage.type.u16:
			return this.internal.dataView.getUint16(0, littleEndian);
		case ScalarStorage.type.u32:
			return this.internal.dataView.getUint32(0, littleEndian);
		case ScalarStorage.type.f32:
			return this.internal.dataView.getFloat32(0, littleEndian);
		case ScalarStorage.type.f64:
			return this.internal.dataView.getFloat64(0, littleEndian);
		}
	}

	set value(newValue)
	{
		const littleEndian =
			(this.endianness == ScalarStorage.endianness.littleEndian);
		switch (this.type) {
		case ScalarStorage.type.s8:
			if (-128 <= newValue && newValue <= 127) {
				this.internal.dataView.setInt8(0, newValue);
				return;
			}
			break;
		case ScalarStorage.type.u8:
			if (0 <= newValue && newValue <= 255) {
				this.internal.dataView.setUint8(0, newValue);
				return;
			}
			break;
		case ScalarStorage.type.s16:
			if (-32768 <= newValue && newValue <= 32767) {
				this.internal.dataView.setInt16(0, newValue, littleEndian);
				return;
			}
			break;
		case ScalarStorage.type.u16:
			if (0 <= newValue && newValue <= 65535) {
				this.internal.dataView.setUint16(0, newValue, littleEndian);
				return;
			}
			break;
		case ScalarStorage.type.s32:
			if (-2147483648 <= newValue && newValue <= 2147483647) {
				this.internal.dataView.setInt32(0, newValue, littleEndian);
				return;
			}
			break;
		case ScalarStorage.type.u32:
			if (0 <= newValue && newValue <= 4294967295) {
				this.internal.dataView.setUint32(0, newValue, littleEndian);
				return;
			}
			break;
		case ScalarStorage.type.f32:
			if (newValue == Math.fround(newValue)) {
				this.internal.dataView.setFloat32(0, newValue, littleEndian);
				return;
			}
			break;
		case ScalarStorage.type.f64:
			this.internal.dataView.setFloat64(0, newValue, littleEndian);
			return;
		}
		if (!Number.isSafeInteger(newValue)) {
			if (newValue == Math.fround(newValue)) {
				this.type = ScalarStorage.type.f32;
				this.internal.dataView.setFloat32(0, newValue, littleEndian);
			} else {
				this.type = ScalarStorage.type.f64;
				this.internal.dataView.setFloat64(0, newValue, littleEndian);
			}
		} else {
			if (-2147483648 <= newValue && newValue <= 2147483647) {
				this.type = ScalarStorage.type.s32;
				this.internal.dataView.setInt32(0, newValue, littleEndian);
			} else if (0 <= newValue && newValue <= 4294967295) {
				this.type = ScalarStorage.type.u32;
				this.internal.dataView.setUint32(0, newValue, littleEndian);
			} else {
				throw 'Integral value out of range of biggest integral type.';
			}
		}
	}

	get bytes()
	{
		const bytes = [];
		for (let i = 0; i < this.size; ++i) {
			bytes.push(this.internal.dataView.getUint8(i));
		}
		return bytes;
	}

	set bytes(newBytes)
	{
		if (newBytes.length != this.size)
			throw 'Byte array must have the same length as the current size.';
		for (let i = 0; i < newBytes.length; ++i) {
			this.internal.dataView.setUint8(i, newBytes[i]);
		}
	}

	get bits()
	{
		const bits = [];
		const bytes = this.bytes;
		if (this.endianness == ScalarStorage.endianness.littleEndian) {
			for (let i = 0; i < bytes.length; ++i) {
				const byte = bytes[i];
				for (let j = 0; j < 8; ++j) {
					bits.push((byte & (1 << j)) == 0 ? 0 : 1);
				}
			}
		} else {
			for (let i = 0; i < bytes.length; ++i) {
				const byte = bytes[i];
				for (let j = 8; j > 0; ) {
					--j;
					bits.push((byte & (1 << j)) == 0 ? 0 : 1);
				}
			}
		}
		return bits;
	}

	set bits(newBits)
	{
		if (newBits.length != this.size * 8)
			throw 'Bit array must have a length of exactly 8 times the ' +
				'current size.';
		if (this.endianness == ScalarStorage.endianness.littleEndian) {
			for (let i = 0; i < newBits.length / 8; ++i) {
				let byte = 0;
				for (let j = 0; j < 8; ++j) {
					byte |= (newBits[i * 8 + j] << j);	
				}
				this.internal.dataView.setUint8(i, byte);
			}
		} else {
			for (let i = 0; i < newBits.length / 8; ++i) {
				let byte = 0;
				for (let j = 0; j < 8; ++j) {
					byte |= (newBits[i * 8 + j] << (7 - j));
				}
				this.internal.dataView.setUint8(i, byte);
			}
		}
	}

	clear()
	{
		for (let i = 0; i < this.size; ++i) {
			this.internal.dataView.setUint8(i, 0);
		}
	}

	flip()
	{
		for (let i = 0; i < this.size; ++i) {
			const byte = this.internal.dataView.getUint8(i, 0);
			this.internal.dataView.setUint8(i, ~byte);
		}
	}

	shiftLeft(count)
	{
		count = count | 0;
		if (count < 0 || count > this.size * 8)
			throw 'Shift count out of range.';
		const bits = this.bits;
		if (this.endianness == ScalarStorage.endianness.littleEndian) {
			for (let i = 0; i < count; ++i) bits.unshift(0);
			this.bits = bits.slice(0, this.size * 8);
		} else {
			for (let i = 0; i < count; ++i) bits.push(0);
			this.bits = bits.slice(count);
		}
	}

	shiftRight(count)
	{
		count = count | 0;
		if (count < 0 || count > this.size * 8)
			throw 'Shift count out of range.';
		let bits = this.bits;
		if (this.endianness == ScalarStorage.endianness.littleEndian) {
			const signBit = 
				this.signedness == ScalarStorage.signedness.signed ?
				bits[bits.length - 1] : 0;
			for (let i = 0; i < count; ++i)	bits.push(signBit);
			this.bits = bits.slice(count);
		} else {
			const signBit = 
				this.signedness == ScalarStorage.signedness.signed ?
				bits[0] : 0;
			for (let i = 0; i < count; ++i) bits.unshift(signBit);
			this.bits = bits.slice(0, this.size * 8);
		}
	}

	increment()
	{
		const oldType = this.type;
		this.value = this.value + 1;
		this.type = oldType;
	}

	decrement()
	{
		const oldType = this.type;
		this.value = this.value - 1;
		this.type = oldType;
	}

}

defineEnum = (parentObj, enumName, symbols) =>
{
	Object.defineProperty(parentObj, enumName, {
		value: symbols.reduce((m, s) => { m[s] = Symbol(); return m }, {}),
		writable: false,
		enumerable: true,
		configurable: false
	});
}

defineEnum(ScalarStorage, 'signedness', [ 'signed', 'unsigned' ]);
defineEnum(ScalarStorage, 'category', [ 'integral', 'floatingPoint' ]);
defineEnum(ScalarStorage, 'type', [
	's8', 
	's16',
	's32', 
	'u8', 
	'u16', 
	'u32', 
	'f32', 
	'f64'
]);
defineEnum(ScalarStorage, 'endianness', [ 'bigEndian', 'littleEndian' ]);


