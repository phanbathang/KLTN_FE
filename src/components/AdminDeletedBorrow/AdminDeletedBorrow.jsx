import React, { useRef, useState } from 'react';
import styles from './AdminDeletedBorrow.module.scss';
import { Button, Input, Modal, Space } from 'antd';
import { DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { useDispatch, useSelector } from 'react-redux';
import * as BorrowService from '../../services/BorrowService.js';
import { useQuery } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { orderContent } from '../../content.js';
import PieChartComponent from './PieChart.jsx';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import Loading from '../../components/LoadingComponent/Loading.jsx';
import ModalComponent from '../ModalComponent/ModalComponent.jsx';
import { toast } from 'react-toastify';

dayjs.extend(isBetween);

const AdminDeletedBorrow = () => {
    const [selectedRange, setSelectedRange] = useState([null, null]);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [selectedBorrowId, setSelectedBorrowId] = useState(null);

    const dispatch = useDispatch();
    const user = useSelector((state) => state?.user);
    const access_token = user?.access_token;

    const getDeletedBorrows = async () => {
        const res = await BorrowService.getDeletedBorrows(user?.access_token);
        return res;
    };

    const queryBorrow = useQuery({
        queryKey: ['borrows'],
        queryFn: getDeletedBorrows,
    });

    const {
        isLoading: isLoadingOrder,
        isFetching,
        data: borrows = { data: [] },
    } = queryBorrow;

    const searchInput = useRef(null);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
    };

    const handleReset = (clearFilters) => {
        clearFilters();
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{ color: filtered ? '#1677ff' : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const handleViewOrderDetail = (id) => {
        const orderDetail = dataModal.find((order) => order.key === id);
        console.log('Selected Order:', orderDetail); // Gỡ lỗi dữ liệu
        setSelectedOrder(orderDetail);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (id) => {
        setSelectedBorrowId(id);
        setIsModalOpenDelete(true);
    };

    const handleDelete = async () => {
        if (selectedBorrowId) {
            try {
                const response = await BorrowService.deleteCanceledBorrow(
                    selectedBorrowId,
                );
                if (response?.status === 'OK') {
                    toast.success('Xóa đơn hàng thành công.', {
                        style: { fontSize: '1.5rem' },
                    });
                    queryBorrow.refetch();
                    setIsModalOpenDelete(false);
                } else {
                    toast.error('Xóa đơn hàng không thành công.', {
                        style: { fontSize: '1.5rem' },
                    });
                }
            } catch (error) {
                console.error('Lỗi khi xóa đơn hàng:', error);
                toast.error('Có lỗi xảy ra khi xóa đơn hàng.', {
                    style: { fontSize: '1.5rem' },
                });
            }
        }
    };

    const columns = [
        {
            title: 'Id đơn hàng',
            dataIndex: '_id',
            width: 300,
            sorter: (a, b) => a._id.length - b._id.length,
            ...getColumnSearchProps('_id'),
        },
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
            width: 300,
            sorter: (a, b) => a.address.length - b.address.length,
            ...getColumnSearchProps('address'),
        },
        {
            title: 'Returned Date',
            dataIndex: 'returnedAt',
            width: 200,
            sorter: (a, b) => a.returnedAt.length - b.returnedAt.length,
            ...getColumnSearchProps('returnedAt'),
        },
        {
            title: 'Price Total',
            dataIndex: 'totalPrice',
            width: 150,
            sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
            ...getColumnSearchProps('totalPrice'),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            width: 200,
            align: 'center',
            render: (_, order) => (
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type="link"
                        onClick={() => handleViewOrderDetail(order?._id)}
                        style={{ color: '#007784', fontSize: '20px' }}
                    >
                        <EyeOutlined />
                    </Button>
                    <Button
                        type="link"
                        onClick={() => handleOpenDeleteModal(order?._id)}
                        style={{ color: 'red', fontSize: '20px' }}
                    >
                        <DeleteOutlined />
                    </Button>
                </div>
            ),
        },
    ];

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Chưa có thông tin';
        const dateObj = new Date(dateString);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const seconds = dateObj.getSeconds().toString().padStart(2, '0');
        return `${day}-${month}-${year}\n${hours}:${minutes}:${seconds}`;
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
                totalPrice: convertPrice(borrow?.totalPrice), // Định dạng ở đây
                rawTotalPrice: borrow?.totalPrice, // Lưu giá trị gốc
                penaltyFee: convertPrice(borrow?.penaltyFee || 0), // Định dạng ở đây
                rawPenaltyFee: borrow?.penaltyFee || 0, // Lưu giá trị gốc
                returnedAt: borrow?.returnedAt
                    ? formatDateTime(borrow?.returnedAt)
                    : 'Chưa có thông tin',
            };
        });

    const dataModal =
        Array.isArray(borrows?.data) &&
        borrows?.data.length &&
        borrows?.data.map((borrow) => {
            return {
                ...borrow,
                key: borrow._id,
                borrowItems: borrow?.borrowItems,
                userName: borrow?.borrowAddress?.fullName,
                phone: `0${borrow?.borrowAddress?.phone}`,
                address: borrow?.borrowAddress?.address,
                totalPrice: convertPrice(borrow?.totalPrice), // Định dạng ở đây
                rawTotalPrice: borrow?.totalPrice, // Lưu giá trị gốc
                penaltyFee: convertPrice(borrow?.penaltyFee || 0), // Định dạng ở đây
                rawPenaltyFee: borrow?.penaltyFee || 0, // Lưu giá trị gốc
                returnedAt: borrow?.returnedAt
                    ? formatDateTime(borrow?.returnedAt)
                    : 'Chưa có thông tin',
            };
        });

    return (
        <Loading isLoading={isLoadingOrder || isFetching} size="small">
            <div>
                <h1 className={styles.WrapperHeader}>Đơn hàng đã trả</h1>
                <div style={{ marginTop: '20px' }}>
                    <TableComponent
                        style={{ position: 'relative' }}
                        columns={columns}
                        data={dataTable}
                        enableExport={false}
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
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Phí quá hạn:</strong>{' '}
                                <span
                                    style={{
                                        color:
                                            selectedOrder.rawPenaltyFee > 0
                                                ? 'red'
                                                : 'green',
                                    }}
                                >
                                    {selectedOrder.penaltyFee}
                                </span>
                            </p>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Tổng thanh toán:</strong>{' '}
                                <span style={{ color: 'green' }}>
                                    {convertPrice(
                                        Number(selectedOrder.rawTotalPrice) +
                                            Number(selectedOrder.rawPenaltyFee),
                                    )}
                                </span>
                            </p>
                            <p
                                style={{
                                    marginBottom: '10px',
                                    fontWeight: 'bold',
                                }}
                            >
                                Danh sách sách:
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
                                            <strong>Ngày trả:</strong>{' '}
                                            {formatDateTime(item.returnedAt)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>Không có sách nào.</p>
                            )}
                        </div>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </Modal>

                <ModalComponent
                    title="Xóa đơn hàng đã hủy"
                    open={isModalOpenDelete}
                    onCancel={() => setIsModalOpenDelete(false)}
                    style={{ top: '50px' }}
                    onOk={handleDelete}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{
                        style: {
                            backgroundColor: '#76b8bf',
                            borderColor: '#76b8bf',
                            color: '#fff',
                        },
                    }}
                    cancelButtonProps={{
                        style: {
                            borderColor: '#76b8bf',
                            color: '#000',
                        },
                    }}
                >
                    <div>Bạn có chắc chắn xóa đơn hàng đã hủy này không?</div>
                </ModalComponent>
            </div>
        </Loading>
    );
};

export default AdminDeletedBorrow;
