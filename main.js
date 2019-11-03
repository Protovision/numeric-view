(() => {	
	class ScalarStorageUserInterface {

		updateDataSignedness()
		{
			this.internal.data.signedness = 
				this.internal.elements.signedness.value == 'signed' ?
				ScalarStorage.signedness.signed :
				ScalarStorage.signedness.unsigned;
		}

		updateDataSize()
		{
			switch (Number(this.internal.elements.size.value)) {
			case 8:
				this.internal.data.size = 1;
				break;
			case 16:
				this.internal.data.size = 2;
				break;
			case 32:
				this.internal.data.size = 4;
				break;
			case 64:
				this.internal.data.size = 8;
				break;
			}
		}

		updateDataCategory()
		{
			this.internal.data.category =
				this.internal.elements.type.value == 'int' ?
				ScalarStorage.category.integral :
				ScalarStorage.category.floatingPoint;
		}

		updateDataEndianness()
		{
			this.internal.data.endianness =
				this.internal.elements.endianness.value == 'big' ?
				ScalarStorage.endianness.bigEndian :
				ScalarStorage.endianness.littleEndian;
		}

		updateDataBits()
		{
			const bits = [];
			const cells = this.internal.elements.bits.parentNode.rows
				.item(0).cells;
			for (let i = 0; i < cells.length; ++i) {
				bits.push(Number(cells.item(i).firstChild.textContent));
			}
			this.internal.data.bits = bits;
		}

		updateDataValue()
		{
			const oldType = this.internal.data.type;
			let value = Number(this.internal.elements.value.value);
			if (oldType == ScalarStorage.type.f32) value = Math.fround(value);
			this.internal.data.value = value;
			this.internal.data.type = oldType;
		}

		updateControls()
		{
			const isFloat = (this.internal.elements.type.selectedIndex == 1);
			const toggleHidden = (element, bool) => {
				element.disabled = bool;
				element.classList.toggle('hidden', bool);
			};
			toggleHidden(this.internal.optionElements.signednessUnsigned, 
				isFloat);
			toggleHidden(this.internal.optionElements.size8, isFloat);
			toggleHidden(this.internal.optionElements.size16, isFloat);
			toggleHidden(this.internal.optionElements.size64, !isFloat);
			const adjustToLastEnabledOption = (selectElement) => {
				if (selectElement.options.item(
						selectElement.selectedIndex).disabled) {
					for (let i = selectElement.options.length; i > 0; ) {
						--i;
						if (!selectElement.options.item(i).disabled) {
							selectElement.selectedIndex = i;
							return;
						}
					}
				}
			};
			adjustToLastEnabledOption(this.internal.elements.signedness);
			adjustToLastEnabledOption(this.internal.elements.size);
			toggleHidden(this.internal.elements.flip, isFloat);
			toggleHidden(this.internal.elements.shiftLeft, isFloat);
			toggleHidden(this.internal.elements.shiftRight, isFloat);
		}

		renderValueFields()
		{
			this.internal.elements.value.value = this.internal.data.value;
			this.internal.elements.value.style.width = 
				(this.internal.elements.value.value.length + 0.75) + 'em';
		}

		renderBitBoxes()
		{
			this.internal.elements['bits'].parentNode.deleteRow(0);
			const fragment = document.createDocumentFragment();
			const tr = document.createElement('tr');
			for (let i = 0; i < this.internal.data.size * 8; ++i) {
				const td = document.createElement('td');
				const bitValueDiv = document.createElement('div');
				bitValueDiv.appendChild(document.createTextNode(''));
				bitValueDiv.addEventListener(
					'click', (event) => {
						event.target.textContent = 
							(event.target.textContent == '0' ? '1' : '0');
						this.updateDataBits();
						this.renderValueFields();
						this.renderBitValues();
					});
				const bitPositionDiv = document.createElement('div');
				bitPositionDiv.appendChild(document.createTextNode(''));
				td.appendChild(bitValueDiv);
				td.appendChild(bitPositionDiv);
				tr.appendChild(td);
			}
			fragment.appendChild(tr);
			this.internal.elements['bits'].appendChild(fragment);
		}

		renderBitValues()
		{
			const bits = this.internal.data.bits;
			const cells = this.internal.elements.bits.parentNode.rows
				.item(0).cells;
			for (let i = 0; i < bits.length; ++i) {
				cells.item(i).firstChild.textContent = bits[i];
			}
		}

		renderBitPositions()
		{
			const cells = this.internal.elements.bits.parentNode.rows
				.item(0).cells;
			if (this.internal.data.endianness == 
					ScalarStorage.endianness.littleEndian) {
				for (let i = 0; i < cells.length; ++i) {
					cells.item(i).lastChild.textContent = i;
				}
			} else {
				for (let i = 0, id = cells.length; i < cells.length; ++i) {
					cells.item(i).lastChild.textContent = --id;
				}
			}
		}

		renderBitColors()
		{
			const cells = this.internal.elements.bits.parentNode.rows
				.item(0).cells;
			const isLittleEndian = (this.internal.data.endianness ==
				ScalarStorage.endianness.littleEndian);
			const signBitIndex = (isLittleEndian ?
				(this.internal.data.size * 8 - 1) : 0);
			const isSigned  = (this.internal.data.signedness ==
					ScalarStorage.signedness.signed);
			const colorClasses = [
				'int-sign-bit',
				'int-bit',
				'float-sign-bit',
				'float-exponent-bit',
				'float-fraction-bit'
			];
			for (let i = 0; i < cells.length; ++i) {
				colorClasses.forEach((c) => {
					cells.item(i).firstChild.classList.remove(c);
				});
			}
			if (this.internal.data.category == 
					ScalarStorage.category.integral) {
				for (let i = 0; i < cells.length; ++i) {
					cells.item(i).firstChild.classList.add('int-bit');
				}
				if (isSigned) {
					cells.item(signBitIndex).firstChild.classList.replace(
						'int-bit', 'int-sign-bit');
				}
			} else {
				cells.item(signBitIndex).firstChild.classList.add(
					'float-sign-bit');
				if (!isLittleEndian) {
					const fractionBitsIndex = 
						(this.internal.data.size == 4) ? 9 : 12;
					for (let i = 1; i < fractionBitsIndex; ++i) {
						cells.item(i).firstChild.classList.add(
							'float-exponent-bit');
					}
					for (let i = fractionBitsIndex; i < cells.length; ++i) {
						cells.item(i).firstChild.classList.add(
							'float-fraction-bit');
					}
				} else {
					const exponentBitsIndex = 
						(this.internal.data.size == 4) ? 31 : 63;
					const fractionBitsIndex = 
						(this.internal.data.size == 4) ? 23 : 52;
					for (let i = exponentBitsIndex; 
							i > fractionBitsIndex; ) {
						--i;
						cells.item(i).firstChild.classList.add(
							'float-exponent-bit');
					}
					for (let i = fractionBitsIndex; i > 0; ) {
						--i;
						cells.item(i).firstChild.classList.add(
							'float-fraction-bit');
					}
				}
			}
		}

		update()
		{
			this.updateControls();
			this.updateDataCategory();
			this.updateDataSize();
			this.updateDataSignedness();
			this.updateDataEndianness();
		}

		render()
		{
			this.renderValueFields();
			this.renderBitBoxes();
			this.renderBitPositions();
			this.renderBitValues();
			this.renderBitColors();
		}

		constructor(scalarStorage)
		{
			this.internal = {
				data: scalarStorage,
				elements: [
					'signedness',
					'size',
					'type',
					'endianness',
					'bits',
					'clear',
					'flip',
					'shiftLeft',
					'shiftRight',
					'increment',
					'decrement',
					/*
					'sign',
					'exponent',
					'fraction',
					*/
					'value'
				].reduce((map, key) => {
					map[key] = document.getElementById(key);
					return map;
				}, {}),
				optionElements: [
					[ 'signednessUnsigned',
						'#signedness>option[value="unsigned"]' ],
					[ 'size8', '#size>option[value="8"]' ],
					[ 'size16', '#size>option[value="16"]' ],
					[ 'size32', '#size>option[value="32"]' ],
					[ 'size64', '#size>option[value="64"]' ]
				].reduce((map, key) => {
					map[key[0]] = document.querySelector(key[1]);
					return map;
				}, {})
			};
			this.internal.elements.signedness.addEventListener(
				'change', (event) => {
					this.updateDataSignedness();
					this.renderValueFields();
					this.renderBitValues();
					this.renderBitColors();
				});
			this.internal.elements.size.addEventListener(
				'change', (event) => {
					this.updateDataSize();
					this.render();
				});
			this.internal.elements.type.addEventListener(
				'change', (event) => {
					this.update();
					this.render();
				});
			this.internal.elements.endianness.addEventListener(
				'change', (event) => {
					this.updateDataEndianness();
					this.renderBitValues();
					this.renderBitPositions();
					this.renderBitColors();
				});
			[
				'clear',
				'flip',
				'increment',
				'decrement'
			].forEach((id) => {
				this.internal.elements[id].addEventListener(
					'click', (event) => {
						this.internal.data[id]();
						this.renderBitValues();
						this.renderValueFields();
					});
			});
			this.internal.elements.shiftLeft.addEventListener(
				'click', (event) => {
					this.internal.data.shiftLeft(1);
					this.renderValueFields();
					this.renderBitValues();
				});
			this.internal.elements.shiftRight.addEventListener(
				'click', (event) => {
					this.internal.data.shiftRight(1);
					this.renderValueFields();
					this.renderBitValues();
				});
			this.internal.elements.value.addEventListener(
				'click', (event) => { event.target.select(); });
			[ /*'exponent', 'fraction',*/ 'value' ].forEach((id) => {
				const updateValueFieldWidth = (target) => {
					target.style.width = (target.value.length + 0.75) + 'em';
				}
				this.internal.elements[id].addEventListener(
					'input', (event) => {
						updateValueFieldWidth(event.target);
					})
				updateValueFieldWidth(this.internal.elements[id]);
			});
			this.internal.elements.value.addEventListener(
				'change', (event) => {
					this.updateDataValue();
					this.renderValueFields();
					this.renderBitValues();
				});
			this.update();
			this.render();
		}
	};

	window.addEventListener('DOMContentLoaded', async () => {
		const data = new ScalarStorage;
		const ui = new ScalarStorageUserInterface(data);
	});

})();
