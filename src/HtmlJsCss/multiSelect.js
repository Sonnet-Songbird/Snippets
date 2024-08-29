export class MultiSelect {
    constructor(select) {
        this.closeTime = 300; // (ms) 호버에서 마우스가 벗어날 경우 창이 닫히기까지 시간

        this.select = select;
        this.name = this.select.name || this.select.id;

        if (!this.select || this.select.options.length === 0) {
            console.error("MultiSelect : No Select or Option", select);
            return;
        }
        if (!this.name) {
            console.error("MultiSelect : Need Select name or id", select);
            return;
        }
        this.property = this.getPropertyFromDataSet();

        this.options = Array.from(select.options);
        this.optionGroups = this.getGroupOptions();
        this.checkboxes = new Map();
        this.selectedOptions = new Set();
        this.sorted = null;

        this.container = document.createElement('div');
        this.container.classList.add('ms-container');

        this.dropdown = document.createElement('div');
        this.dropdown.classList.add('ms-dropdown');
        this.dropdown.style.display = 'none';

        this.dropdownContent = document.createElement('div');
        this.dropdownContent.classList.add('ms-dropdown-content');

        this.dropdownHead = document.createElement('div');
        this.dropdownHead.classList.add('ms-dropdown-head');

        this.checkboxContainer = document.createElement('div');
        this.checkboxContainer.classList.add('ms-checkbox-container');

        this.openBtn = document.createElement('button');
        this.openBtn.classList.add('ms-open-button');
        this.openBtn.type = 'button';
        this.openBtn.textContent = 'Select options';

        if (this.property.noHover) {
            this.openBtn.addEventListener('click', () => this.toggleDropdown());
        } else {
            this.container.addEventListener('mouseenter', () => this.showDropdown());
            this.container.addEventListener('mouseleave', () => this.startCloseTimer());
        }

        this.filterInput = document.createElement('input');
        this.filterInput.classList.add('ms-filter');
        this.filterInput.placeholder = 'Search...';
        this.filterInput.addEventListener('input', () => this.filter());

        this.selectAllBtn = document.createElement('button');
        this.selectAllBtn.classList.add('ms-select-all');
        this.selectAllBtn.type = 'button';
        this.selectAllBtn.textContent = 'Select All';
        this.selectAllBtn.addEventListener('click', () => this.toggleSelectAll());

        this.sortBtn = document.createElement('button');
        this.sortBtn.classList.add('ms-sort');
        this.sortBtn.type = 'button';
        this.sortBtn.textContent = '정렬버튼';
        this.sortBtn.addEventListener('click', () => this.toggleSort());

        this.dropdownContent.appendChild(this.checkboxContainer);
        this.dropdownHead.append(this.filterInput, this.sortBtn, this.selectAllBtn);

        this.dropdown.append(this.dropdownHead, this.dropdownContent);
        this.container.append(this.openBtn, this.dropdown);
        select.replaceWith(this.container);

        this.applyStyles();

        this.createCheckboxes();
        this.updateStats();

        this.container.addEventListener('mouseleave', () => this.startCloseTimer());
        this.container.addEventListener('mouseenter', () => this.clearCloseTimer());
    }

    getPropertyFromDataSet() {
        const property = {};
        const dataset = this.select.dataset;

        function bool(string) {
            return Boolean(string) && string !== 'false';
        }

        property.noHover = bool(dataset.noHover);
        property.width = dataset.width || '';
        property.minWidth = dataset.minWidth || '';
        property.maxWidth = dataset.maxWidth || '';
        property.height = dataset.height || '';
        property.minHeight = dataset.minHeight || '';
        property.maxHeight = dataset.maxHeight || '';
        property.overflow = dataset.overflow || '';
        return property;
    }

    applyStyles() {
        const {width, minWidth, maxWidth, height, minHeight, maxHeight, overflow} = this.property;

        Object.assign(this.container.style, {width, minWidth, maxWidth});
        Object.assign(this.dropdown.style, {height, minHeight, maxHeight, overflow});
    }

    startCloseTimer() {
        if (this.show) this.closeTimer = setTimeout(() => this.hideDropdown(), this.closeTime);
    }

    clearCloseTimer() {
        clearTimeout(this.closeTimer);
    }

    static from(selector) {
        return new MultiSelect(document.querySelector(selector));
    }

    static fromAll(selector) {
        return Array.from(document.querySelectorAll(selector)).map(select => new MultiSelect(select));
    }

    getGroupOptions() {
        const groups = {};
        this.options.forEach(option => {
            const groupLabel = option.parentElement.label || "";
            if (!groups[groupLabel]) groups[groupLabel] = [];
            groups[groupLabel].push(option);
        });
        return groups;
    }

    createCheckboxes() {
        this.checkboxContainer.innerHTML = '';
        this.checkboxes.clear();
        Object.keys(this.optionGroups).forEach(label => {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('ms-group');
            if (label) {
                const groupLabel = document.createElement('div');
                groupLabel.textContent = label;
                groupLabel.classList.add('ms-group-label');
                groupLabel.addEventListener('click', () => this.toggleGroup(label));
                groupDiv.appendChild(groupLabel);
            }
            this.checkboxContainer.appendChild(groupDiv);

            this.optionGroups[label].forEach(option => {
                const labelEl = document.createElement('label');
                labelEl.classList.add('ms-option-label');

                const checkbox = document.createElement('input');
                checkbox.classList.add('ms-checkbox');
                checkbox.type = 'checkbox';
                checkbox.value = option.value;
                checkbox.name = this.name;

                checkbox.checked = this.selectedOptions.has(option.value);

                checkbox.addEventListener('change', () => this.setSelect(option.value, checkbox.checked));

                labelEl.append(checkbox, document.createTextNode(option.text));
                groupDiv.appendChild(labelEl);
                this.checkboxes.set(checkbox.value, checkbox);
            });
        });
    }

    toggleDropdown() {
        this.show ? this.hideDropdown() : this.showDropdown();
    }

    showDropdown() {
        this.dropdown.style.display = 'block';
        this.show = true;
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.show = false;
    }

    filter() {
        const filterValue = this.filterInput.value.toLowerCase();
        this.checkboxes.forEach((checkbox) => {
            const label = checkbox.parentElement;
            const text = label.textContent.toLowerCase();
            label.style.display = text.includes(filterValue) ? '' : 'none';
        });
    }

    toggleSelectAll() {
        const allSelected = this.getSelected().length === this.checkboxes.size;
        this.checkboxes.forEach((checkbox) => {
            checkbox.checked = !allSelected;
            this.setSelect(checkbox.value, checkbox.checked);
        });
    }


    toggleSort() {
        const order = this.sorted === 'ASC' ? 'DESC' : this.sorted === 'DESC' ? null : 'ASC';
        this.optionGroups = order ? this.getSortedGroupOptions(order) : this.getGroupOptions();
        this.sorted = order;
        this.sortBtn.textContent = order === 'ASC' ? '오름차순' : order === 'DESC' ? '내림차순' : '정렬버튼';
        this.createCheckboxes();
    }

    getSortedGroupOptions(order) {
        const sortedOptions = {};
        Object.keys(this.optionGroups).forEach(groupLabel => {
            sortedOptions[groupLabel] = [...this.optionGroups[groupLabel]].sort((a, b) => {
                return order === 'ASC'
                    ? a.innerText.localeCompare(b.innerText)
                    : b.innerText.localeCompare(a.innerText);
            });
        });
        return sortedOptions;
    }

    toggleGroup(groupLabel) {
        const group = this.optionGroups[groupLabel];
        if (group) {
            const allSelected = group.every(option => this.selectedOptions.has(option.value));
            group.forEach(option => this.setSelect(option.value, !allSelected));
        }
    }

    getSelected() {
        return Array.from(this.selectedOptions);
    }

    setSelect(value, bool) {
        if (this.checkboxes.has(value)) {
            const checkbox = this.checkboxes.get(value);
            checkbox.checked = bool;
            const label = checkbox.parentNode
            label.classList.toggle('selected', bool)
            if (bool) {
                this.selectedOptions.add(value);
            } else {
                this.selectedOptions.delete(value);
            }
            this.updateStats();
        }
    }

    updateStats() {
        // 버튼 텍스트 업데이트
        const selected = this.getSelected();
        let text = selected.map(value => this.options.find(opt => opt.value === value).text).join(', ');
        const openBtnWidth = this.openBtn.clientWidth;
        if (this.getTextWidth(text) > openBtnWidth - 20) {
            text = `${selected.length} selected`;
        }
        this.openBtn.textContent = text || 'Select options';

        // 그룹 선택 상태 업데이트
        Object.keys(this.optionGroups).forEach(groupLabel => {
            const groupDiv = Array.from(this.checkboxContainer.querySelectorAll('.ms-group'))
                .find(div => div.querySelector('.ms-group-label')?.textContent === groupLabel);
            if (groupDiv) {
                const checkboxes = groupDiv.querySelectorAll('.ms-checkbox');
                const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                if (allChecked) {
                    groupDiv.querySelector('.ms-group-label').classList.add('selected');
                } else {
                    groupDiv.querySelector('.ms-group-label').classList.remove('selected');
                }
            }
        });
    }

    getTextWidth(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = getComputedStyle(this.openBtn).font;
        return context.measureText(text).width;
    }
}
