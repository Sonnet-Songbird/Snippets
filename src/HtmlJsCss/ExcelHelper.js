const XLSX = window.XLSX;

export class ExcelFile {
    constructor(opts = {}) {
        this.workbook = XLSX.utils.book_new();
        this.worksheet = null;
        this.options = opts;
    }

    static fromTable(htmlTableElement) {
        const excelFile = new ExcelFile();
        excelFile.worksheet = XLSX.utils.table_to_sheet(htmlTableElement);
        return excelFile;
    }

    static mergedDownload(workbookName, excelFiles) {
        const workbook = XLSX.utils.book_new();

        excelFiles.forEach(({name, excelFile}) => {
            if (excelFile.worksheet) {
                XLSX.utils.book_append_sheet(workbook, excelFile.worksheet, name);
            }
        });

        XLSX.writeFile(workbook, workbookName);
    }

    removeRowsIf(conditionFn) {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        const filteredRows = rows.filter((row, index) => {
            return index === 0 || !conditionFn(row[0]);
        });
        this.worksheet = XLSX.utils.aoa_to_sheet(filteredRows, this.options);
    }

    getCellAddr(value) {
        const range = this.worksheet['!ref'];
        const totalRows = parseInt(range.split(':')[1].replace(/\D/g, ''));
        const totalCols = range.split(':')[1].replace(/\d/g, '').length;

        const cellAddresses = [];

        Array.from({length: totalRows + 1}, (_, rowIndex) => {
            Array.from({length: totalCols}, (_, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({r: rowIndex, c: colIndex});
                if (this.worksheet[cellAddress] && this.worksheet[cellAddress].v === value) {
                    cellAddresses.push(cellAddress);
                }
            });
        });

        return cellAddresses.length > 0 ? cellAddresses : null;
    }

    setCellValue(cellAddress, value) {
        if (this.worksheet[cellAddress]) {
            this.worksheet[cellAddress].v = value;
        }
    }

    updateRange() {
        const range = XLSX.utils.decode_range(this.worksheet['!ref']);
        const newRange = {
            s: {r: range.s.r, c: range.s.c},
            e: {r: range.e.r - 1, c: range.e.c}
        };

        this.worksheet['!ref'] = XLSX.utils.encode_range(newRange);
    }

    sort(compareFn, column = null) {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        rows.sort((a, b) => {
            const aValue = column ? a[column] : a;
            const bValue = column ? b[column] : b;

            return (aValue ? 0 : 1) - (bValue ? 0 : 1) || compareFn(aValue, bValue);
        });
        this.worksheet = XLSX.utils.aoa_to_sheet(rows, this.options);
    }


    mergeCells(startRow, startCol, endRow, endCol) {
        const merge = {
            s: {r: startRow, c: startCol},
            e: {r: endRow, c: endCol}
        };
        if (!this.worksheet['!merges']) {
            this.worksheet['!merges'] = [];
        }
        this.worksheet['!merges'].push(merge);
    }

    getRange(targetIndex, isVertical = true, start = isVertical ? 1 : 0) {
        const [, end] = this.worksheet['!ref'].split(':');
        return isVertical
            ? {start: start, end: parseInt(end.replace(/\D/g, '')) - 1}  // 행 범위
            : {start: start, end: parseInt(end.replace(/\d/g, '').charCodeAt(0) - 64) - 1};  // 열 범위
    }


    mergeDirectional(targetIndex, isRow) {
        const {start, end} = this.getRange(targetIndex, isRow);
        const [sRow, sCol, eRow, eCol] = isRow
            ? [start, targetIndex, end, targetIndex]
            : [targetIndex, start, targetIndex, end];
        this.mergeCells(sRow, sCol, eRow, eCol);
    }


    mergeContinuousCells(column) {
        const columnIndex = this.getColumnIndex(column) ?? column;
        const merges = [];
        let start = null;
        const totalRows = parseInt(this.worksheet['!ref'].split(':')[1].replace(/\D/g, ''), 10);

        Array.from({length: totalRows}, (_, rowIndex) => {
            const cellAddress = XLSX.utils.encode_cell({r: rowIndex + 1, c: columnIndex});
            const currentCell = this.worksheet[cellAddress];
            const prevCell = this.worksheet[XLSX.utils.encode_cell({r: rowIndex, c: columnIndex})];

            if (currentCell && prevCell && currentCell.v === prevCell.v) {
                if (start === null) start = rowIndex; // 범위 시작 지점 설정
            } else {
                if (start !== null) {
                    merges.push({start, end: rowIndex});
                    start = null; // 시작 지점을 초기화
                }
            }
        });

        if (start !== null) {
            merges.push({start, end: totalRows});
        }

        merges.forEach(({start, end}) => this.mergeCells(start, columnIndex, end, columnIndex));
    }


    getColumnIndex(header) {
        const headers = XLSX.utils.sheet_to_json(this.worksheet, {header: 1})[0];
        const columnIndex = headers.indexOf(header);
        return columnIndex === -1 ? null : columnIndex;
    }

    setValue(column, rowIndex, value) {
        const columnIndex = this.getColumnIndex(column) ?? column;
        const cellAddress = XLSX.utils.encode_cell({r: rowIndex + 1, c: columnIndex});
        this.setCellValue(cellAddress, value)
    }

    removeRow(rowIndex) {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        if (rowIndex >= 0 && rowIndex < rows.length) {
            rows.splice(rowIndex, 1);
            this.worksheet = XLSX.utils.aoa_to_sheet(rows, this.options);
        }
    }

    removeColumn(column) {
        const columnIndex = this.getColumnIndex(column) ?? column;
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        rows.forEach(row => {
            if (columnIndex >= 0 && columnIndex < row.length) {
                row.splice(columnIndex, 1);
            }
        });
        this.worksheet = XLSX.utils.aoa_to_sheet(rows, this.options);
    }

    truncateEmptyRows() {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        const filteredRows = rows.filter((row, index) => {
            return row.some(cell => !!cell);
        });
        this.worksheet = XLSX.utils.aoa_to_sheet(filteredRows, this.options);
    }

    download(fileName = 'sheet.xlsx') {
        if (this.worksheet) {
            XLSX.utils.book_append_sheet(this.workbook, this.worksheet, 'Sheet1');
        }
        XLSX.writeFile(this.workbook, fileName);
    }
}

export class ExcelFile {
    constructor(opts = {}) {
        this.workbook = XLSX.utils.book_new();
        this.worksheet = null;
        this.options = opts;
    }

    setWorksheet(newWorksheet) {
        if (this.worksheet && this.worksheet['!merges'] && this.worksheet['!merges'].length > 0) {
            console.warn("Warning: Merges will be reset when the worksheet is replaced.");
        }
        this.worksheet = newWorksheet;
    }

    static fromTable(htmlTableElement) {
        const excelFile = new ExcelFile();
        excelFile.setWorksheet(XLSX.utils.table_to_sheet(htmlTableElement));
        return excelFile;
    }

    static mergedDownload(workbookName, excelFiles) {
        const workbook = XLSX.utils.book_new();

        excelFiles.forEach(({name, excelFile}) => {
            if (excelFile.worksheet) {
                XLSX.utils.book_append_sheet(workbook, excelFile.worksheet, name);
            }
        });

        XLSX.writeFile(workbook, workbookName);
    }

    removeRowsIf(conditionFn) {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        const filteredRows = rows.filter((row, index) => {
            return index === 0 || !conditionFn(row[0]);
        });
        this.setWorksheet(XLSX.utils.aoa_to_sheet(filteredRows, this.options));
    }

    getCellAddr(value) {
        const range = this.worksheet['!ref'];
        const totalRows = parseInt(range.split(':')[1].replace(/\D/g, ''));
        const totalCols = range.split(':')[1].replace(/\d/g, '').length;

        const cellAddresses = [];

        Array.from({length: totalRows + 1}, (_, rowIndex) => {
            Array.from({length: totalCols}, (_, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({r: rowIndex, c: colIndex});
                if (this.worksheet[cellAddress] && this.worksheet[cellAddress].v === value) {
                    cellAddresses.push(cellAddress);
                }
            });
        });

        return cellAddresses.length > 0 ? cellAddresses : null;
    }

    setCellValue(cellAddress, value) {
        if (this.worksheet[cellAddress]) {
            this.worksheet[cellAddress].v = value;
        }
    }

    updateRange() {
        const range = XLSX.utils.decode_range(this.worksheet['!ref']);
        const newRange = {
            s: {r: range.s.r, c: range.s.c},
            e: {r: range.e.r - 1, c: range.e.c}
        };

        this.worksheet['!ref'] = XLSX.utils.encode_range(newRange);
    }

    sort(compareFn, column = null) {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        rows.sort((a, b) => {
            const aValue = column ? a[column] : a;
            const bValue = column ? b[column] : b;

            return (aValue ? 0 : 1) - (bValue ? 0 : 1) || compareFn(aValue, bValue);
        });
        this.setWorksheet(XLSX.utils.aoa_to_sheet(rows, this.options));
    }

    mergeCells(startRow, startCol, endRow, endCol) {
        const merge = {
            s: {r: startRow, c: startCol},
            e: {r: endRow, c: endCol}
        };
        if (!this.worksheet['!merges']) {
            this.worksheet['!merges'] = [];
        }
        this.worksheet['!merges'].push(merge);
    }

    getRange(targetIndex, isVertical = true, start = isVertical ? 1 : 0) {
        const [, end] = this.worksheet['!ref'].split(':');
        return isVertical
            ? {start: start, end: parseInt(end.replace(/\D/g, '')) - 1}  // 행 범위
            : {start: start, end: parseInt(end.replace(/\d/g, '').charCodeAt(0) - 64) - 1};  // 열 범위
    }

    mergeDirectional(targetIndex, isRow) {
        const {start, end} = this.getRange(targetIndex, isRow);
        const [sRow, sCol, eRow, eCol] = isRow
            ? [start, targetIndex, end, targetIndex]
            : [targetIndex, start, targetIndex, end];
        this.mergeCells(sRow, sCol, eRow, eCol);
    }

    mergeContinuousCells(column) {
        const columnIndex = this.getColumnIndex(column) ?? column;
        const merges = [];
        let start = null;
        const totalRows = parseInt(this.worksheet['!ref'].split(':')[1].replace(/\D/g, ''), 10);

        Array.from({length: totalRows}, (_, rowIndex) => {
            const cellAddress = XLSX.utils.encode_cell({r: rowIndex + 1, c: columnIndex});
            const currentCell = this.worksheet[cellAddress];
            const prevCell = this.worksheet[XLSX.utils.encode_cell({r: rowIndex, c: columnIndex})];

            if (currentCell && prevCell && currentCell.v === prevCell.v) {
                if (start === null) start = rowIndex; // 범위 시작 지점 설정
            } else {
                if (start !== null) {
                    merges.push({start, end: rowIndex});
                    start = null; // 시작 지점을 초기화
                }
            }
        });

        if (start !== null) {
            merges.push({start, end: totalRows});
        }

        merges.forEach(({start, end}) => this.mergeCells(start, columnIndex, end, columnIndex));
    }

    getColumnIndex(header) {
        const headers = XLSX.utils.sheet_to_json(this.worksheet, {header: 1})[0];
        const columnIndex = headers.indexOf(header);
        return columnIndex === -1 ? null : columnIndex;
    }

    setValue(column, rowIndex, value) {
        const columnIndex = this.getColumnIndex(column) ?? column;
        const cellAddress = XLSX.utils.encode_cell({r: rowIndex + 1, c: columnIndex});
        this.setCellValue(cellAddress, value);
    }

    removeRow(rowIndex) {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        if (rowIndex >= 0 && rowIndex < rows.length) {
            rows.splice(rowIndex, 1);
            this.setWorksheet(XLSX.utils.aoa_to_sheet(rows, this.options));
        }
    }

    removeColumn(column) {
        const columnIndex = this.getColumnIndex(column) ?? column;
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        rows.forEach(row => {
            if (columnIndex >= 0 && columnIndex < row.length) {
                row.splice(columnIndex, 1);
            }
        });
        this.setWorksheet(XLSX.utils.aoa_to_sheet(rows, this.options));
    }

    truncateEmptyRows() {
        const rows = XLSX.utils.sheet_to_json(this.worksheet, {header: 1});
        const filteredRows = rows.filter((row, index) => {
            return row.some(cell => !!cell);
        });
        this.setWorksheet(XLSX.utils.aoa_to_sheet(filteredRows, this.options));
    }

    download(fileName = 'sheet.xlsx') {
        if (this.worksheet) {
            XLSX.utils.book_append_sheet(this.workbook, this.worksheet, 'Sheet1');
        }
        XLSX.writeFile(this.workbook, fileName);
    }
}
