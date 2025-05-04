// MyBorrowPage.jsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as BorrowService from '../../services/BorrowService.js';
import { useSelector } from 'react-redux';
import styles from './MyBorrowPage.module.scss';
import { convertPrice } from '../../ultils.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import { Bounce, toast } from 'react-toastify';
import { Modal } from 'antd';

const MyBorrowPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Lưu thông tin sản phẩm cần trả

    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();

    const fetchMyOrder = async () => {
        const res = await BorrowService.getAllBorrowDetail(
            state?.id,
            state?.access_token,
        );
        return res.data;
    };

    const queryOrder = useQuery({
        queryKey: ['borrows'],
        queryFn: fetchMyOrder,
        enabled: !!state?.id && !!state?.access_token,
    });

    const { isLoading, data } = queryOrder;

    const renderProduct = (borrowItems, borrowId) => {
        return (
            <div className={styles.OrderDetailsGroup}>
                {borrowItems?.map((item, idx) => (
                    <div key={idx} className={styles.OrderDetails}>
                        <img
                            src={item.image}
                            alt={item.name}
                            className={styles.OrderImage}
                        />
                        <div className={styles.OrderInfo}>
                            <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                            <p>{convertPrice(item.price)}</p>
                            <p>
                                Trạng thái:{' '}
                                {item.isReturned ? 'Đã trả' : 'Chưa trả'}
                            </p>
                            {!item.isReturned && (
                                <button
                                    className={styles.CancelButton}
                                    onClick={() =>
                                        showCancelModal(borrowId, item._id)
                                    }
                                >
                                    Trả sản phẩm
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const mutation = useMutationHook((data) => {
        const { borrowId, itemId, access_token } = data;
        return BorrowService.returnBorrowItem(borrowId, itemId, access_token);
    });

    const handleCancelItem = (borrowId, itemId) => {
        mutation.mutate(
            { borrowId, itemId, access_token: state?.access_token },
            {
                onSuccess: () => {
                    queryOrder.refetch();
                },
            },
        );
    };

    const {
        isLoading: isLoadingCancel,
        isSuccess: isSuccessCancel,
        isError: isErrorCancel,
        data: dataCancel,
    } = mutation;

    useEffect(() => {
        if (isSuccessCancel && dataCancel?.status === 'OK') {
            toast.success('Trả sản phẩm thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorCancel || dataCancel?.status === 'ERR') {
            toast.error(
                dataCancel?.message || 'Trả sản phẩm không thành công.',
                {
                    style: { fontSize: '1.5rem' },
                },
            );
        }
    }, [isSuccessCancel, isErrorCancel, dataCancel]);

    const showCancelModal = (borrowId, itemId) => {
        setSelectedItem({ borrowId, itemId });
        setIsModalVisible(true);
    };

    const handleDetailOrder = (id) => {
        navigate(`/detailBorrow/${id}`, {
            state: {
                access_token: state?.access_token,
            },
        });
    };

    return (
        <div className={styles.Wrapper}>
            <h1>Danh sách sách đã thuê</h1>
            {Array.isArray(data) && data.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#ff4d4f',
                    }}
                >
                    Không có sách nào trong danh sách mượn. Thêm sách vào ngay
                    để không bỏ lỡ!
                </div>
            )}
            {(Array.isArray(data) ? data : [])
                .slice()
                .reverse()
                .map((borrow) => (
                    <div key={borrow._id} className={styles.OrderCard}>
                        <h2>Trạng thái</h2>
                        <div className={styles.OrderStatus}>
                            <p>
                                <span className={styles.StatusLabel}>
                                    Thanh toán:
                                </span>
                                <span className={styles.StatusValue}>
                                    {`${
                                        borrow.isPaid
                                            ? 'Đã thanh toán'
                                            : 'Chưa thanh toán'
                                    }`}
                                </span>
                            </p>
                            <p>
                                <span className={styles.StatusLabel}>
                                    Trả hàng:
                                </span>
                                <span className={styles.StatusValue}>
                                    {borrow.isFullyReturned
                                        ? 'Đã trả hết'
                                        : 'Chưa trả hết'}
                                </span>
                            </p>
                        </div>
                        {renderProduct(borrow?.borrowItems, borrow._id)}
                        <div className={styles.OrderFooter}>
                            <p className={styles.OrderTotal}>
                                Tổng tiền:{' '}
                                <span>{convertPrice(borrow.totalPrice)}</span>
                            </p>
                            <div className={styles.OrderActions}>
                                <button
                                    className={styles.DetailsButton}
                                    onClick={() =>
                                        handleDetailOrder(borrow._id)
                                    }
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            <Modal
                title="Xác nhận trả sản phẩm"
                visible={isModalVisible}
                onOk={() => {
                    handleCancelItem(
                        selectedItem?.borrowId,
                        selectedItem?.itemId,
                    );
                    setIsModalVisible(false);
                }}
                onCancel={() => setIsModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
                okButtonProps={{
                    style: {
                        backgroundColor: 'rgb(118, 184, 191)',
                        borderColor: 'rgb(118, 184, 191)',
                        color: '#fff',
                    },
                }}
            >
                <p>Bạn có chắc chắn muốn trả sản phẩm này không?</p>
            </Modal>
        </div>
    );
};

export default MyBorrowPage;
