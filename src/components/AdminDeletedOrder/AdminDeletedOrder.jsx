import React, { useRef, useState } from 'react';
import styles from './AdminDeletedOrder.module.scss';
import { Button, Input, Modal, Space } from 'antd';
import { DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { useDispatch, useSelector } from 'react-redux';
import * as OrderService from '../../services/OrderService.js';
import { useQuery } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { toast } from 'react-toastify';
import ModalComponent from '../ModalComponent/ModalComponent.jsx';
import Loading from '../LoadingComponent/Loading.jsx';

dayjs.extend(isBetween);

const AdminDeletedOrder = () => {
    const [selectedRange, setSelectedRange] = useState([null, null]);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const dispatch = useDispatch();
    const user = useSelector((state) => state?.user);
    const access_token = user?.access_token;

    const getDeletedOrders = async () => {
        const res = await OrderService.getDeletedOrders(user?.access_token);
        return res;
    };

    const queryOrder = useQuery({
        queryKey: ['orders'],
        queryFn: OrderService.getDeletedOrders,
    });

    const {
        isLoading: isLoadingOrder,
        isFetching,
        data: orders = { data: [] },
    } = queryOrder;

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
        setSelectedOrder(orderDetail); // Lưu đơn hàng vào state
        setIsModalOpen(true); // Mở modal
    };

    const handleOpenDeleteModal = (id) => {
        setSelectedOrderId(id);
        setIsModalOpenDelete(true);
    };

    const handleDelete = async () => {
        if (selectedOrderId) {
            try {
                const response = await OrderService.deleteCanceledOrder(
                    selectedOrderId,
                );
                if (response?.status === 'OK') {
                    toast.success('Xóa đơn hàng thành công.', {
                        style: { fontSize: '1.5rem' },
                    });
                    queryOrder.refetch(); // Cập nhật danh sách sau khi xóa
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
            width: 400,
            sorter: (a, b) => a.address.length - b.address.length,
            ...getColumnSearchProps('address'),
        },

        {
            title: 'Canceled Date', // Thêm cột Ngày hủy
            dataIndex: 'deletedAt',
            width: 200,
            sorter: (a, b) => a.deletedAt.length - b.deletedAt.length,
            ...getColumnSearchProps('deletedAt'),
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
            width: 150,
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
        const dateObj = new Date(dateString);

        // Lấy thông tin ngày, tháng, năm
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        // Lấy thông tin giờ, phút, giây
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const seconds = dateObj.getSeconds().toString().padStart(2, '0');

        return `${day}-${month}-${year}\n${hours}:${minutes}:${seconds}`;
    };

    const dataTable =
        Array.isArray(orders?.data) &&
        orders?.data.length &&
        orders?.data.map((order) => {
            return {
                ...order,
                key: order._id,
                userName: order?.shippingAddress?.fullName,
                phone: `0${order?.shippingAddress?.phone}`,
                address: order?.shippingAddress?.address,
                totalPrice: convertPrice(order?.totalPrice),
                deletedAt: order?.deletedAt
                    ? formatDateTime(order?.deletedAt)
                    : 'Chưa có thông tin',
            };
        });

    const dataModal =
        Array.isArray(orders?.data) &&
        orders?.data.length &&
        orders?.data.map((order) => {
            return {
                ...order,
                key: order._id,
                name: order?.orderItems.map((item) => item.name).join(', '),
                amount: order?.orderItems.map((item) => item.amount).join(', '),
                userName: order?.shippingAddress?.fullName,
                phone: `0${order?.shippingAddress?.phone}`,
                address: order?.shippingAddress?.address,
                totalPrice: convertPrice(order?.totalPrice),
                deletedAt: order?.deletedAt
                    ? formatDateTime(order?.deletedAt)
                    : 'Chưa có thông tin',
            };
        });

    //Tổng tiền đơn hàng

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

    const totalOrderByDateRange = orders?.data?.reduce((acc, order) => {
        const date = dayjs(order.createdAt).format('DD/MM/YYYY');

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
            acc += order.totalPrice;
        }

        return acc;
    }, 0);

    return (
        <Loading isLoading={isLoadingOrder || isFetching} size="small">
            <div>
                <h1 className={styles.WrapperHeader}>Đơn hàng đã hủy</h1>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '30px',
                    }}
                ></div>

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
                                <strong>Tên sản phẩm:</strong>{' '}
                                {selectedOrder.name}
                            </p>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Số lượng:</strong>{' '}
                                {selectedOrder.amount}
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
                                <strong>Địa chỉ:</strong>{' '}
                                {selectedOrder.address}
                            </p>
                            <p style={{ marginBottom: '10px' }}>
                                <strong>Tổng tiền:</strong>{' '}
                                {selectedOrder.totalPrice}
                            </p>
                            <p>
                                <strong>Ngày hủy:</strong>{' '}
                                {selectedOrder.deletedAt}
                            </p>{' '}
                            {/* Thêm ngày hủy */}
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

export default AdminDeletedOrder;
