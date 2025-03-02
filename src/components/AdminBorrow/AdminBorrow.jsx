import React, { useState } from 'react';
import styles from './AdminBorrow.module.scss';
import { Button, Input, Modal, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { useDispatch, useSelector } from 'react-redux';
import * as BorrowService from '../../services/BorrowService.js';
import { useQuery } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { orderContent } from '../../content.js';
import PieChartComponent from './PieChart.jsx';
import { useNavigate } from 'react-router-dom';

const AdminBorrow = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state?.user);
    const access_token = user?.access_token;

    const getAllBorrows = async () => {
        const res = await BorrowService.getAllBorrows(user?.access_token);
        return res;
    };

    const queryBorrow = useQuery({
        queryKey: ['borrows'],
        queryFn: BorrowService.getAllBorrows,
    });

    const { isLoading: isLoadingOrder, data: borrows = { data: [] } } =
        queryBorrow;

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    // ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    // onPressEnter={() =>
                    //     handleSearch(selectedKeys, confirm, dataIndex)
                    // }
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        // onClick={() =>
                        //     handleSearch(selectedKeys, confirm, dataIndex)
                        // }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        // onClick={() =>
                        //     clearFilters && handleReset(clearFilters)
                        // }
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    // setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const handleViewBorrowDetail = (id) => {
        const borrowDetail = dataModal.find((borrow) => borrow.key === id);
        setSelectedOrder(borrowDetail); // Lưu đơn hàng vào state
        setIsModalOpen(true); // Mở modal
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'userName',
            width: 200,
            sorter: (a, b) => a.userName.length - b.userName.length,
            ...getColumnSearchProps('userName'),
        },

        {
            title: 'Phone',
            dataIndex: 'phone',
            width: 70,
            ...getColumnSearchProps('phone'),
        },

        {
            title: 'Address',
            dataIndex: 'address',
            width: 700,
            sorter: (a, b) => a.address.length - b.address.length,
            ...getColumnSearchProps('address'),
        },

        {
            title: 'isReturned',
            dataIndex: 'isReturned',
            width: 50,
            sorter: (a, b) => a.isReturned.length - b.isReturned.length,
            ...getColumnSearchProps('isReturned'),
        },

        {
            title: 'Borrowed Date',
            dataIndex: 'borrowDate',
            width: 300,
            sorter: (a, b) => a.borrowDate.length - b.borrowDate.length,
            ...getColumnSearchProps('borrowDate'),
        },

        {
            title: 'Returned Date',
            dataIndex: 'returnDate',
            width: 300,
            sorter: (a, b) => a.returnDate.length - b.returnDate.length,
            ...getColumnSearchProps('returnDate'),
        },

        {
            title: 'isOverdue',
            dataIndex: 'isOverdue',
            width: 50,
            sorter: (a, b) => a.isOverdue.length - b.isOverdue.length,
            render: (text) => (
                <span style={{ color: text === 'TRUE' ? 'red' : 'green' }}>
                    {text}
                </span>
            ),
            ...getColumnSearchProps('isOverdue'),
        },

        {
            title: 'Price Total',
            dataIndex: 'totalPrice',
            width: 250,
            sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
            ...getColumnSearchProps('totalPrice'),
        },

        {
            title: 'Action',
            dataIndex: 'action',
            width: 50,
            align: 'center',
            render: (_, borrow) => (
                <Button
                    type="link"
                    onClick={() => handleViewBorrowDetail(borrow?._id)}
                    style={{ color: '#007784' }}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const formatDateTime = (dateString) => {
        const dateObj = new Date(dateString);

        // Lấy thông tin ngày, tháng, năm
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const dataTable =
        Array.isArray(borrows?.data) &&
        borrows?.data.length &&
        borrows?.data.map((borrow) => {
            return {
                ...borrow,
                key: borrow._id,
                userName: borrow?.borrowAddress?.fullName,
                phone: `0${borrow?.borrowAddress?.phone}`,
                address: borrow?.borrowAddress?.address,
                isReturned: borrow?.isReturned ? 'TRUE' : 'FALSE',
                borrowDate: formatDateTime(borrow?.borrowDate),
                returnDate: formatDateTime(borrow?.returnDate),
                isOverdue: borrow?.isOverdue ? 'TRUE' : 'FALSE',
                totalPrice: convertPrice(borrow?.totalPrice),
            };
        });

    const dataModal =
        Array.isArray(borrows?.data) &&
        borrows?.data.length &&
        borrows?.data.map((borrow) => {
            return {
                ...borrow,
                key: borrow._id,
                name: borrow?.borrowItems.map((item) => item.name).join(', '),
                amount: borrow?.borrowItems
                    .map((item) => item.amount)
                    .join(', '),
                userName: borrow?.borrowAddress?.fullName,
                phone: `0${borrow?.borrowAddress?.phone}`,
                address: borrow?.borrowAddress?.address,
                isReturned: borrow?.isReturned ? 'TRUE' : 'FALSE',
                borrowDate: formatDateTime(borrow?.borrowDate),
                returnDate: formatDateTime(borrow?.returnDate),
                isOverdue: borrow?.isOverdue ? 'TRUE' : 'FALSE',
                totalPrice: convertPrice(borrow?.totalPrice),
            };
        });

    return (
        <div>
            <h1 className={styles.WrapperHeader}>Danh sách mượn</h1>
            {/* <div style={{ height: '200px', width: '200px' }}>
                <PieChartComponent data={borrows?.data} />
            </div> */}
            <div style={{ marginTop: '20px' }}>
                <TableComponent
                    style={{ position: 'relative' }}
                    columns={columns}
                    data={dataTable}
                />
            </div>

            <Modal
                title={
                    <span
                        style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#007784',
                        }}
                    >
                        Chi tiết đơn hàng
                    </span>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>
                        Đóng
                    </Button>,
                ]}
            >
                {selectedOrder ? (
                    <div>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Tên sản phẩm:</strong> {selectedOrder.name}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Số lượng:</strong> {selectedOrder.amount}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Tên khách hàng:</strong>{' '}
                            {selectedOrder.userName}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Số điện thoại:</strong>{' '}
                            {selectedOrder.phone}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Địa chỉ:</strong> {selectedOrder.address}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Ngày mượn:</strong>{' '}
                            {selectedOrder.borrowDate}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Ngày trả:</strong>{' '}
                            {selectedOrder.returnDate}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Đã trả:</strong> {selectedOrder.isReturned}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Đã quá hạn:</strong>{' '}
                            {selectedOrder.isOverdue}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>Tổng tiền:</strong>{' '}
                            {selectedOrder.totalPrice}
                        </p>
                    </div>
                ) : (
                    <p>Đang tải dữ liệu...</p>
                )}
            </Modal>
        </div>
    );
};

export default AdminBorrow;
