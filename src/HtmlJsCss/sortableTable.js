export class sortableTable {
    constructor(tableSelector) {
        this.table = document.querySelector(tableSelector) || document.createElement('table');
        this.head = this.table.querySelector('thead') || document.createElement('thead');
        this.body = this.table.querySelector('tbody') || document.createElement('tbody');
        this.rows = this.body ? Array.from(this.body.querySelectorAll('tr')) : [];
        this.headers = this.head ? Array.from(this.head.querySelectorAll('th')) : [];
        this.originalRowOrder = [];

        if (!this.table.contains(this.head)) {
            this.table.appendChild(this.head);
        }
        if (!this.table.contains(this.body)) {
            this.table.appendChild(this.body);
        }

        this.saveOriginalRowOrder();
    }

    saveOriginalRowOrder() {
        this.originalRowOrder = Array.from(this.body.children);
    }

    addHeader(headers) {
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.innerText = headerText;
            headerRow.appendChild(th);
        });
        this.head.appendChild(headerRow);
        this.headers = Array.from(this.head.querySelectorAll('th'));
    }

    updateHeader(index, headerText) {
        if (index >= 0 && index < this.headers.length) {
            this.headers[index].innerText = headerText;
        }
    }

    addRow(rowData) {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
            const td = document.createElement('td');
            td.innerText = cellData;
            row.appendChild(td);
        });
        this.body.appendChild(row);
        this.rows.push(row);
        this.originalRowOrder.push(row);
    }

    sort(colIndex, compareFunc = sortableTable.defaultNumericCompare) {
        const rowData = this.rows.map(row => {
            const cells = row.querySelectorAll('td');
            return {
                element: row,
                value: cells[colIndex].innerText
            };
        });
        rowData.sort(compareFunc);
        rowData.forEach(data => {
            this.body.appendChild(data.element);
        });
    }

    swapColumns(colIndex1, colIndex2) {
        if (colIndex1 === colIndex2 || colIndex1 < 0 || colIndex2 < 0 || colIndex1 >= this.headers.length || colIndex2 >= this.headers.length) {
            return;
        }

        const tempHeader = this.headers[colIndex1].innerText;
        this.headers[colIndex1].innerText = this.headers[colIndex2].innerText;
        this.headers[colIndex2].innerText = tempHeader;

        this.rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const tempCell = cells[colIndex1].innerText;
            cells[colIndex1].innerText = cells[colIndex2].innerText;
            cells[colIndex2].innerText = tempCell;
        });
    }

    resetSort() {
        this.originalRowOrder.forEach(row => {
            this.body.appendChild(row);
        });

        this.rows = Array.from(this.body.querySelectorAll('tr'));
    }

    static defaultNumericCompare(a, b) {
        return parseInt(a.value, 10) - parseInt(b.value, 10);
    }
}
