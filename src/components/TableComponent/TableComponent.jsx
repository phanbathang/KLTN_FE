import { Button, Divider, Radio, Table } from 'antd';
import React, { useMemo, useState } from 'react';
import ModalComponent from '../ModalComponent/ModalComponent';
import { Excel } from 'antd-table-saveas-excel';

const TableComponent = (props) => {
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);

    const {
        selectionType = 'checkbox',
        data: dataSource = [],
        isLoading = false,
        columns = [],
        handleDeleteMany,
    } = props;

    const [rowSelectedKey, setRowSelectedKey] = useState([]);
    // rowSelection object indicates the need for row selection

    const newColumns = useMemo(() => {
        const arr = columns?.filter(
            (col) => col.dataIndex !== 'action' && col.dataIndex !== 'image',
        );
        return arr;
    }, [columns]);
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setRowSelectedKey(selectedRowKeys);
        },
        // getCheckboxProps: (record) => ({
        //     disabled: record.name === 'Disabled User',
        //     // Column configuration not to be checked
        //     name: record.name,
        // }),
    };

    const handleDeleteAll = () => {
        handleDeleteMany(rowSelectedKey);
    };

    // const handleDeleteAllUser = () => {
    //     handleDeleteUserMany(rowSelectedKey);
    // };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };

    const exportExcel = () => {
        const excel = new Excel();
        excel
            .addSheet('test')
            .addColumns(newColumns)
            .addDataSource(dataSource, {
                str2Percent: true,
            })
            .saveAs('Excel.xlsx');

        setIsModalOpenDelete(false);
    };

    return (
        <div>
            {rowSelectedKey.length > 1 && (
                <div
                    style={{
                        backgroundColor: '#007784',
                        color: '#fff',
                        fontWeight: 'bold',
                        padding: '10px 20px 10px 20px',
                        cursor: 'pointer',
                        width: '110px',
                        textAlign: 'center',
                        fontSize: '14px',
                        borderRadius: '6px',
                        margin: '0px 0px 10px 91%',
                    }}
                    onClick={handleDeleteAll}
                >
                    Xóa tất cả
                </div>
            )}

            <button
                style={{
                    backgroundColor: '#007784',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px 10px 20px',
                    borderRadius: '6px',
                    position: 'absolute',
                    top: '142px',
                    left: '585px',
                    cursor: 'pointer',
                }}
                onClick={() => setIsModalOpenDelete(true)}
            >
                Export File
            </button>

            <Table
                rowSelection={{
                    type: selectionType,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={dataSource}
                {...props}
            />
            {/* <ModalComponent
                title="Xóa sản phẩm"
                open={isModalOpenDelete}
                style={{ top: '50px' }}
                onOk={handleDeleteAllProduct}
                footer={[
                    <Button
                        key="cancel"
                        onClick={handleCancelDelete}
                        style={{
                            borderColor: '#76b8bf',
                            color: '#000',
                        }}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        style={{
                            backgroundColor: '#76b8bf', // Màu nền của nút OK
                            borderColor: '#76b8bf', // Đảm bảo viền có màu giống nền
                        }}
                        onClick={handleDeleteAllProduct} // Hàm xử lý khi nhấn nút OK
                    >
                        OK
                    </Button>,
                ]}
            >
                <div>Bạn có chắc chắn xóa tất cả sản phẩm này không?</div>
            </ModalComponent> */}

            <ModalComponent
                title="Xuất file"
                onCancel={handleCancelDelete}
                open={isModalOpenDelete}
                style={{ top: '50px' }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={handleCancelDelete}
                        style={{
                            borderColor: '#76b8bf',
                            color: '#000',
                        }}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        style={{
                            backgroundColor: '#76b8bf', // Màu nền của nút OK
                            borderColor: '#76b8bf', // Đảm bảo viền có màu giống nền
                        }}
                        onClick={exportExcel} // Hàm xử lý khi nhấn nút OK
                    >
                        OK
                    </Button>,
                ]}
            >
                <div>Bạn có muốn xuất file này không ?</div>
            </ModalComponent>
        </div>
    );
};

export default TableComponent;
