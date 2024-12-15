import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { fetchData } from '../services/ApiService';
import 'primeicons/primeicons.css';
import './TableComponent.css';

const TableComponent: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [globalSelectedRows, setGlobalSelectedRows] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const rowsPerPage = 12;
    const totalRecords = 100;
    const overlayPanelRef = useRef<OverlayPanel>(null);

    const loadData = async (pageNum: number) => {
        setLoading(true);
        const result = await fetchData(pageNum, rowsPerPage);
        setData(result);

        const currentPageSelections = result.filter((row: any) => globalSelectedRows[row.id]);
        setSelectedRows(currentPageSelections);

        setLoading(false);
    };

    useEffect(() => {
        loadData(page);
    }, [page]);

    const onPageChange = useCallback((e: { first: number; rows: number }) => {
        setPage(Math.floor(e.first / e.rows) + 1);
    }, []);

    const handleSelectRowsSubmit = async (numRows: number) => {
        const updatedGlobalSelections = { ...globalSelectedRows };
        let remainingRows = numRows;
        let currentPage = 1;

        while (remainingRows > 0) {
            const currentPageData =
                currentPage === page ? data : await fetchData(currentPage, rowsPerPage);

            const rowsToSelect = Math.min(remainingRows, currentPageData.length);

            currentPageData.slice(0, rowsToSelect).forEach((row: any) => {
                updatedGlobalSelections[row.id] = true;
            });

            remainingRows -= rowsToSelect;
            currentPage++;
        }

        setGlobalSelectedRows(updatedGlobalSelections);

        const currentSelection = data.filter((row) => updatedGlobalSelections[row.id]);
        setSelectedRows(currentSelection);

        overlayPanelRef.current?.hide();
    };

    const onSelectionChange = (e: any) => {
        const currentSelection = [...e.value];
        const updatedGlobalSelections = { ...globalSelectedRows };

        data.forEach((row) => {
            if (currentSelection.some((selected) => selected.id === row.id)) {
                updatedGlobalSelections[row.id] = true;
            } else {
                delete updatedGlobalSelections[row.id];
            }
        });

        setSelectedRows(currentSelection);
        setGlobalSelectedRows(updatedGlobalSelections);
    };

    const isRowSelected = (row: any) => !!globalSelectedRows[row.id];

    const clearAllSelections = () => {
        setGlobalSelectedRows({});
        setSelectedRows([]);
    };

    const memoizedData = useMemo(() => data, [data]);

    return (
        <div className="card">
            <div className="p-mb-3">
                <Button
                    label="Select Rows"
                    icon="pi pi-chevron-down"
                    onClick={(e) => overlayPanelRef.current?.toggle(e)}
                    className="p-mr-2"
                />
                <Button
                    label="Clear All Selections"
                    icon="pi pi-times"
                    className="p-button-danger"
                    onClick={clearAllSelections}
                />
                <OverlayPanel ref={overlayPanelRef}>
                    <div className="p-field">
                        <label htmlFor="numRows" className="p-d-block">
                            Enter number of rows to select:
                        </label>
                        <input
                            id="numRows"
                            type="number"
                            placeholder="Enter number of rows"
                            min="1"
                            max={totalRecords}
                            className="p-inputtext p-d-block"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSelectRowsSubmit(Number((e.target as HTMLInputElement).value));
                                }
                            }}
                        />
                        <Button
                            label="Submit"
                            onClick={() =>
                                handleSelectRowsSubmit(Number((document.getElementById('numRows') as HTMLInputElement).value))
                            }
                        />
                    </div>
                </OverlayPanel>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    value={memoizedData}
                    paginator
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    lazy
                    first={(page - 1) * rowsPerPage}
                    onPage={onPageChange}
                    selection={selectedRows}
                    onSelectionChange={onSelectionChange}
                    dataKey="id"
                    rowClassName={(rowData) => (isRowSelected(rowData) ? 'p-highlight' : '')}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="title" header="Title"></Column>
                    <Column field="place_of_origin" header="Place of Origin"></Column>
                    <Column field="artist_display" header="Artist"></Column>
                    <Column field="inscriptions" header="Inscriptions"></Column>
                    <Column field="date_start" header="Start Date"></Column>
                    <Column field="date_end" header="End Date"></Column>
                </DataTable>
            )}
        </div>
    );
};

export default TableComponent;
