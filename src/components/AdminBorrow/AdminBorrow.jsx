import React, { useState } from 'react';
import styles from './AdminBorrow.module.scss';
import { Button, Input, Modal, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { useSelector } from 'react-redux';
import * as BorrowService from '../../services/BorrowService.js';
import { useQuery } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { orderContent } from '../../content.js';
import PieChartComponent from './PieChart.jsx';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import Loading from '../LoadingComponent/Loading.jsx';

const AdminBorrow = () => {
    const [selectedRange, setSelectedRange] = useState([null, null]);
    const user = useSelector((state) => state?.user);
    const access_token = user?.access_token;

    const getAllBorrows = async () => {
        const res = await BorrowService.getAllBorrows(user?.access_token);
        return res;
    };

    const getDeletedBorrows = async () => {
        const res = await BorrowService.getDeletedBorrows();
        return res;
    };

    const queryBorrow = useQuery({
        queryKey: ['borrows'],
        queryFn: getAllBorrows,
    });

    const queryDeletedBorrow = useQuery({
        queryKey: ['deletedBorrows'],
        queryFn: getDeletedBorrows,
    });

    const {
        isLoading: isLoadingOrder,
        isFetching: isFetchingOrder,
        data: borrows = { data: [] },
    } = queryBorrow;

    const {
        isLoading: isLoadingDeleted,
        isFetching: isFetchingDeleted,
        data: deletedBorrows = { data: [] },
    } = queryDeletedBorrow;

    const calculateOverdueFee = (returnDate, isReturned) => {
        if (!returnDate || isReturned) return 0;
        const currentDate = new Date();
        const returnDateObj = new Date(returnDate);
        if (currentDate <= returnDateObj) return 0;
        const diffTime = currentDate - returnDateObj;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * 5000;
    };

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
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => confirm()}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && clearFilters()}
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
                ? String(record[dataIndex])
                      .toLowerCase()
                      .includes(value.toLowerCase())
                : false,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const handleViewBorrowDetail = (id) => {
        const borrowDetail = dataModal.find((borrow) => borrow.key === id);
        setSelectedOrder(borrowDetail);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: 'Id đơn hàng',
            dataIndex: '_id',
            width: 300,
            sorter: (a, b) => (a._id || '').localeCompare(b._id || ''),
            ...getColumnSearchProps('_id'),
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'userName',
            width: 300,
            sorter: (a, b) =>
                (a.userName || '').localeCompare(b.userName || ''),
            ...getColumnSearchProps('userName'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: 200,
            ...getColumnSearchProps('phone'),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            width: 600,
            sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
            ...getColumnSearchProps('address'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isFullyReturned',
            width: 250,
            render: (isFullyReturned) =>
                isFullyReturned ? 'Đã trả hết' : 'Chưa trả hết',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            width: 250,
            sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
            ...getColumnSearchProps('totalPrice'),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            width: 150,
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
        if (!dateString) return 'Chưa xác định';
        const dateObj = new Date(dateString);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}-${month}-${year}`;
    };

    console.log('Borrows data:', borrows?.data);
    console.log('Deleted Borrows data:', deletedBorrows?.data);

    const dataTable =
        Array.isArray(borrows?.data) && borrows?.data.length
            ? borrows.data
                  .filter(
                      (borrow) => borrow?._id && typeof borrow._id === 'string',
                  )
                  .map((borrow) => {
                      const overdueFees = borrow.borrowItems.reduce(
                          (total, item) => {
                              return (
                                  total +
                                  calculateOverdueFee(
                                      item.returnDate,
                                      item.isReturned,
                                  )
                              );
                          },
                          0,
                      );
                      return {
                          ...borrow,
                          key: borrow._id,
                          userName: borrow?.borrowAddress?.fullName,
                          phone: `0${borrow?.borrowAddress?.phone}`,
                          address: borrow?.borrowAddress?.address,
                          totalPrice: convertPrice(
                              borrow?.totalPrice + overdueFees,
                          ),
                          isFullyReturned: borrow?.isFullyReturned,
                      };
                  })
            : [];

    const dataModal =
        Array.isArray(borrows?.data) && borrows?.data.length
            ? borrows.data
                  .filter(
                      (borrow) => borrow?._id && typeof borrow._id === 'string',
                  )
                  .map((borrow) => {
                      const overdueFees = borrow.borrowItems.reduce(
                          (total, item) => {
                              return (
                                  total +
                                  calculateOverdueFee(
                                      item.returnDate,
                                      item.isReturned,
                                  )
                              );
                          },
                          0,
                      );
                      return {
                          ...borrow,
                          key: borrow._id,
                          borrowItems: borrow?.borrowItems,
                          userName: borrow?.borrowAddress?.fullName,
                          phone: `0${borrow?.borrowAddress?.phone}`,
                          address: borrow?.borrowAddress?.address,
                          totalPrice: convertPrice(
                              borrow?.totalPrice + overdueFees,
                          ),
                      };
                  })
            : [];

    const handleDateChange = (dates) => {
        if (dates) {
            setSelectedRange([
                dayjs(dates[0]).format('DD/MM/YYYY'),
                dayjs(dates[1]).format('DD/MM/YYYY'),
            ]);
        } else {
            setSelectedRange([null, null]);
        }
    };

    const totalOrderByDateRange = deletedBorrows?.data?.reduce(
        (acc, borrow) => {
            const date = dayjs(borrow.createdAt).format('DD/MM/YYYY');
            if (
                selectedRange[0] &&
                selectedRange[1] &&
                dayjs(date, 'DD/MM/YYYY').isBetween(
                    dayjs(selectedRange[0], 'DD/MM/YYYY'),
                    dayjs(selectedRange[1], 'DD/MM/YYYY'),
                    null,
                    '[]',
                )
            ) {
                acc += borrow.revenue || 0;
            }
            return acc;
        },
        0,
    );

    const totalRevenue = deletedBorrows?.data?.reduce((acc, borrow) => {
        return acc + (borrow.revenue || 0);
    }, 0);

    return (
        <Loading
            isLoading={
                isLoadingOrder ||
                isFetchingOrder ||
                isLoadingDeleted ||
                isFetchingDeleted
            }
            size="small"
        >
            <div>
                <h1 className={styles.WrapperHeader}>Danh sách thuê</h1>
                <div className={styles.WrapperSection}>
                    <div className={styles.WrapperTotal}>
                        <h2>
                            Tổng doanh thu{' '}
                            {selectedRange ? '' : 'tất cả các ngày'}:
                        </h2>
                        <p>
                            <strong>
                                {selectedRange[0] && selectedRange[1]
                                    ? `Từ ${selectedRange[0]} đến ${selectedRange[1]}`
                                    : 'Tất cả các ngày'}
                                :
                            </strong>{' '}
                            <span style={{ color: 'red', fontWeight: 'bold' }}>
                                {selectedRange[0] && selectedRange[1]
                                    ? convertPrice(totalOrderByDateRange)
                                    : convertPrice(totalRevenue)}
                            </span>
                        </p>
                    </div>

                    <div className={styles.WrapperDate}>
                        <h2 style={{ marginRight: '5px' }}>Chọn ngày:</h2>
                        <DatePicker.RangePicker
                            onChange={handleDateChange}
                            format="DD/MM/YYYY"
                        />
                    </div>
                </div>
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
                            Chi tiết đơn mượn
                        </span>
                    }
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={[
                        <Button
                            key="close"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Đóng
                        </Button>,
                    ]}
                >
                    {selectedOrder ? (
                        <div>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Tên khách hàng:</strong>{' '}
                                {selectedOrder.userName}
                            </p>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Số điện thoại:</strong>{' '}
                                {selectedOrder.phone}
                            </p>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Địa chỉ:</strong>{' '}
                                {selectedOrder.address}
                            </p>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Tổng tiền:</strong>{' '}
                                {selectedOrder.totalPrice}
                            </p>
                            <p
                                style={{
                                    marginBottom: '10px',
                                    fontWeight: 'bold',
                                }}
                            >
                                Danh sách sách mượn:
                            </p>
                            {selectedOrder.borrowItems?.length > 0 ? (
                                selectedOrder.borrowItems.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            marginBottom: '15px',
                                            padding: '10px',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <p style={{ marginBottom: '5px' }}>
                                            <strong>Sách {index + 1}:</strong>{' '}
                                            {item.name}
                                        </p>
                                        <p style={{ marginBottom: '5px' }}>
                                            <strong>Số lượng:</strong>{' '}
                                            {item.amount}
                                        </p>
                                        <p style={{ marginBottom: '5px' }}>
                                            <strong>Ngày mượn:</strong>{' '}
                                            {formatDateTime(item.borrowDate)}
                                        </p>
                                        <p style={{ marginBottom: '5px' }}>
                                            <strong>Ngày trả:</strong>{' '}
                                            {formatDateTime(item.returnDate)}
                                        </p>
                                        <p style={{ marginBottom: '5px' }}>
                                            <strong>Đã trả:</strong>{' '}
                                            {item.isReturned
                                                ? 'Đã trả'
                                                : 'Chưa trả'}
                                        </p>
                                        <p style={{ marginBottom: '5px' }}>
                                            <strong>Phí quá hạn:</strong>{' '}
                                            <span
                                                style={{
                                                    color: item.isOverdue
                                                        ? 'red'
                                                        : 'green',
                                                }}
                                            >
                                                {convertPrice(
                                                    calculateOverdueFee(
                                                        item.returnDate,
                                                        item.isReturned,
                                                    ),
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>Không có sách nào được mượn.</p>
                            )}
                        </div>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </Modal>
            </div>
        </Loading>
    );
};

export default AdminBorrow;
