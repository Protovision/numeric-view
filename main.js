(() => {
	window.addEventListener('DOMContentLoaded', async (event) => {
		const signedness = document.getElementById('signedness');
		const size = document.getElementById('size');
		const type = document.getElementById('type');
		const endian = document.getElementById('endian');
		const bits = document.getElementById('bits');
		const valueFieldContainer = document.getElementById('value-field-container');
		const signValue = document.getElementById('sign-value');
		const exponentValue = document.getElementById('exponent-value');
		const fractionValue = document.getElementById('fraction-value');
		const finalValue = document.getElementById('final-value');
		const clearBits = document.getElementById('clear-bits');
		const setBits = document.getElementById('set-bits');
		const flipBits = document.getElementById('flip-bits');

		const buffer = new ArrayBuffer(8);
		const view = new DataView(buffer);

		const updateValueFields = () => {
			const bitLength = Number(size.value);
			const bytes = [];
			let uint8;
			let i = 0;
			while (i < bitLength) {
				uint8 = 0;
				let j;
				for (j = 0; j < 8; ++j) {
					const bitValue = Number(document.getElementById('b' + (i + j)).textContent);
					uint8 |= ((1 & bitValue) << j);
				}
				bytes.push(uint8);
				i += j;
			}
			let littleEndian = true;
			if (endian.value == 'be') {
				bytes.reverse();
				littleEndian = false;	
			}
			for (let i = 0; i < bytes.length; ++i) {
				view.setUint8(i, bytes[i]);				
			}
			if (type.value == 'i') {
				if (signedness.value == 's') {
					switch (bitLength) {
					case 8:
						finalValue.value = view.getInt8();
						break;
					case 16:
						finalValue.value = view.getInt16(0, littleEndian);
						break;
					case 32:
						finalValue.value = view.getInt32(0, littleEndian);
						break;
					default: 
						break;
					}
				} else if (signedness.value == 'u') {
					switch (bitLength) {
					case 8:
						finalValue.value = view.getUint8();
						break;
					case 16:
						finalValue.value = view.getUint16(0, littleEndian);
						break;
					case 32:
						finalValue.value = view.getUint32(0, littleEndian);
						break;
					default: 
						break;
					}
				}
			} else if (type.value == 'f') {
				if (bitLength == 32) {
					finalValue.value = view.getFloat32(0, littleEndian);
				} else if (bitLength == 64) {
					finalValue.value = view.getFloat64(0, littleEndian);
				}
			}
		};

		const updateBitFields = () => {
			const bitLength = Number(size.value);
			const littleEndian = endian.value == 'be' ? false : true;
			const value = Number(finalValue.value);
			if (type.value == 'i') {
				if (signedness.value == 's') {
					switch (bitLength) {
					case 8:
						view.setInt8(0, value);
						break;
					case 16:
						view.setInt16(0, value, littleEndian);
						break;
					case 32:
						view.setInt32(0, value, littleEndian);
						break;
					default:
						break;
					}
				} else if (signedness.value == 'u') {
					switch (bitLength) {
					case 8:
						view.setUint8(0, value);
						break;
					case 16:
						view.setUint16(0, value, littleEndian);
						break;
					case 32:
						view.setUint32(0, value, littleEndian);
						break;
					default:
						break;
					}
				}
			} else if (type.value == 'f') {
				if (bitLength == 32) {
					view.setFloat32(0, value, littleEndian);
				} else if (bitLength == 64) {
					view.setFloat64(0, value, littleEndian);
				}
			}
			const bytes = [];
			for (let i = 0; i < bitLength / 8; ++i) {
				bytes.push(view.getUint8(i));
			}
			if (littleEndian) {
				bytes.reverse();
			}
			for (let i = 0; i < bitLength; ) {
				let uint8 = bytes.pop();
				let j;
				for (j = 0; j < 8; ++j) {
					document.getElementById('b' + (i + j)).textContent = (uint8 & (1 << j)) != 0 ? '1' : '0';
				}
				i += j;
			}
		};

		const updateBit = (bit) => {
			const newValue = document.createTextNode(
				Number(bit.lastChild.textContent) == '1' ? '0' : '1');
			bit.replaceChild(newValue, bit.lastChild);
			updateValueFields();
		};

		const updateFormat = () => {
			switch (type.value) {
			case 'i':
				signedness.disabled = false;
				if (Number(size.value) > 32) { size.value = '32'; }
				document.querySelectorAll('#size>option').
					forEach(e => e.disabled = false);
				document.querySelector('#size>option[value="64"]').disabled = true;
				valueFieldContainer.classList.add('hide');
				break;
			case 'f':
				signedness.disabled = true;
				if (Number(size.value) < 32) { size.value = '32'; }
				document.querySelectorAll(
						'#size>option[value="4"],' +
						'#size>option[value="8"],' +
						'#size>option[value="16"]').
					forEach(e => e.disabled = true);
				document.querySelector('#size>option[value="64"]').disabled = false;
				/*valueFieldContainer.classList.remove('hide');*/
				valueFieldContainer.classList.add('hide');
				break;
			default:
				break;
			}
			if (bits.lastChild) { bits.removeChild(bits.lastChild); }
			const makeBit = (bitIndex, bitValue) => {
				const td = document.createElement('td');
				const divBit = document.createElement('div');
				divBit.id = 'b' + bitIndex;
				divBit.appendChild(document.createTextNode(bitValue));
				divBit.addEventListener('click', (event) => {
					updateBit(event.target);
				});
				const divIndex = document.createElement('div');
				divIndex.classList.add('bit-index');
				divIndex.appendChild(document.createTextNode(bitIndex));
				td.appendChild(divBit);
				td.appendChild(divIndex);
				return td;
			};
			const fragment = document.createDocumentFragment();
			const tr = document.createElement('tr');
			if (endian.value == 'be') {
				let index = Number(size.value);
				while (index > 0) {
					tr.appendChild(makeBit(--index, '0'));
				}
			} else {
				let index = 0;
				const end = Number(size.value);
				while (index < end) {
					tr.appendChild(makeBit(index++, '0'));
				}
			}
			fragment.appendChild(tr);
			if (type.value == 'i') {
				let index = Number(size.value);
				if (signedness.value == 's') {
					fragment.getElementById('b' + (--index)).classList.add('int-sign-bit');
				}
				while (index != 0) {
					fragment.getElementById('b' + (--index)).classList.add('int-bit');
				}
			} else if (type.value == 'f') {
				let index = Number(size.value);
				fragment.getElementById('b' + (--index)).classList.add('float-sign-bit');
				let end = Number(size.value) == 64 ? 52 : 23;
				while (index != end) {
					fragment.getElementById('b' + (--index)).classList.add('float-exponent-bit');
				}
				while (index != 0) {
					fragment.getElementById('b' + (--index)).classList.add('float-bit');
				}
			}
			bits.appendChild(fragment);
		};


		const clearAllBits = () => {
			const bitLength = Number(size.value);
			for (let i = 0; i < bitLength; ++i) {
				document.getElementById('b' + i).textContent = '0';
			}
			updateValueFields();
		};

		const setAllBits = () => {
			const bitLength = Number(size.value);
			for (let i = 0; i < bitLength; ++i) {
				document.getElementById('b' + i).textContent = '1';
			}
			updateValueFields();
		}

		const flipAllBits = () => {
			const bitLength = Number(size.value);
			for (let i = 0; i < bitLength; ++i) {
				const bit = document.getElementById('b' + i);
				bit.textContent = bit.textContent == '0' ? '1' : '0';
			}
			updateValueFields();
		}

		[signedness, size, type, endian].forEach(e => 
			e.addEventListener('change', (event) => { updateFormat(); updateValueFields(); }));
		[signValue, exponentValue, fractionValue, finalValue].forEach(e => 
			e.addEventListener('click', (event) => { event.target.select(); }));

		finalValue.addEventListener('input', (event) => {
			updateBitFields();
		});

		clearBits.addEventListener('click', (event) => { clearAllBits(); });
		setBits.addEventListener('click', (event) => { setAllBits(); });
		flipBits.addEventListener('click', (event) => {flipAllBits(); });

		signedness.value = 'u';
		size.value = '32';
		type.value = 'f';
		updateFormat();
		updateValueFields();
	});
})();
