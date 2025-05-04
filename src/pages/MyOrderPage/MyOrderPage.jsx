import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as OrderService from '../../services/OrderService.js';
import { useDispatch, useSelector } from 'react-redux';
import styles from './MyOrderPage.module.scss';
import { convertPrice } from '../../ultils.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import { toast } from 'react-toastify';
import { Modal } from 'antd'; // Thêm Modal của Ant Design
import * as PaymentService from '../../services/PaymentService.js';
import { clearCaptureId } from '../../redux/slides/paymentSlide.js';

const MyOrderPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị Modal
    const [selectedOrderId, setSelectedOrderId] = useState(null); // Lưu ID đơn hàng cần hủy

    const location = useLocation();
    const { state } = location;
    const dispatch = useDispatch();
    const captureIdFromRedux = useSelector((state) => state.payment.captureId);
    const navigate = useNavigate();

    const fetchMyOrder = async () => {
        const res = await OrderService.getAllOrderDetail(
            state?.id,
            state?.access_token,
        );
        return res.data;
    };

    const queryOrder = useQuery({
        queryKey: ['orders'],
        queryFn: fetchMyOrder,
        enabled: !!state?.id && !!state?.access_token,
    });

    const { isLoading, data } = queryOrder;
    console.log('123', isLoading, data); // Kiểm tra trạng thái và dữ liệu nhận được

    const renderProduct = (orderItems) => {
        return (
            <div className={styles.OrderDetailsGroup}>
                {orderItems?.map((item, idx) => (
                    <div key={idx} className={styles.OrderDetails}>
                        <img
                            src={item.image}
                            alt={item.name}
                            className={styles.OrderImage}
                        />
                        <div className={styles.OrderInfo}>
                            <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                            <p>{convertPrice(item.price)}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleDetailOrder = (id) => {
        navigate(`/detailOrder/${id}`, {
            state: {
                access_token: state?.access_token,
            },
        });
    };

    const mutation = useMutationHook((data) => {
        const { id, access_token } = data;
        return OrderService.cancelOrderDetail(id, access_token);
    });

    // const handleCancelOrder = (id) => {
    //     mutation.mutate(
    //         { id, access_token: state?.access_token },
    //         {
    //             onSuccess: () => {
    //                 queryOrder.refetch(); // Tải lại danh sách đơn hàng sau khi hủy
    //             },
    //         },
    //     );
    // };

    const handleCancelOrder = async (
        id,
        captureId,
        paymentMethod,
        isPaid,
        isDelivered,
    ) => {
        try {
            const finalCaptureId = captureIdFromRedux; // Ưu tiên lấy từ Redux nếu có

            if (isDelivered) {
                toast.warning(
                    'Đơn hàng đã giao, cần xác nhận trước khi hoàn tiền.',
                    {
                        style: { fontSize: '1.5rem' },
                    },
                );
                return;
            }

            let refundSuccess = true;

            if (refundSuccess) {
                mutation.mutate(
                    { id, access_token: state?.access_token },
                    {
                        onSuccess: () => {
                            queryOrder.refetch();
                            toast.success('Hủy đơn hàng thành công.', {
                                style: { fontSize: '1.5rem' },
                            });
                        },
                        onError: () => {
                            toast.error('Hủy đơn hàng thất bại.', {
                                style: { fontSize: '1.5rem' },
                            });
                        },
                    },
                );
            }

            if (finalCaptureId && isPaid) {
                const accessToken = await PaymentService.getAccessTokenPaypal();
                console.log('Access Token nhận được:', accessToken);
                const refundResponse = await PaymentService.refundOrder(
                    finalCaptureId,
                    accessToken,
                );
                console.log('Kết quả hoàn tiền:', refundResponse);

                if (refundResponse.status !== 'OK') {
                    toast.success('Hoàn tiền PayPal thành công!', {
                        style: { fontSize: '1.5rem' },
                    });
                    refundSuccess = false;
                    // Xóa captureId sau khi hoàn tiền thành công
                    dispatch(clearCaptureId());
                } else {
                    toast.error('Hoàn tiền PayPal thất bại!', {
                        style: { fontSize: '1.5rem' },
                    });
                }
            }
        } catch (error) {
            console.error('Lỗi khi hoàn tiền:', error);
            toast.error('Có lỗi xảy ra khi hoàn tiền.', {
                style: { fontSize: '1.5rem' },
            });
        }
    };

    // const {
    //     isLoading: isLoadingCancel,
    //     isSuccess: isSuccessCancel,
    //     isError: isErrorCancel,
    //     data: dataCancel,
    // } = mutation;

    // useEffect(() => {
    //     if (isSuccessCancel && dataCancel?.status === 'OK') {
    //         toast.success('Hủy đơn hàng thành công.', {
    //             style: { fontSize: '1.5rem' },
    //         });
    //     } else if (isErrorCancel || dataCancel?.status === 'ERR') {
    //         toast.error('Hủy đơn hàng không thành công.', {
    //             style: { fontSize: '1.5rem' },
    //         });
    //     }
    // }, [isSuccessCancel, isErrorCancel]);

    // const showCancelModal = (id) => {
    //     setSelectedOrderId(id); // Lưu ID của đơn hàng
    //     setIsModalVisible(true); // Hiển thị Modal
    // };

    const showCancelModal = (
        id,
        captureId,
        paymentMethod,
        isPaid,
        isDelivered,
    ) => {
        setSelectedOrderId({
            id,
            captureId: captureId || captureIdFromRedux,
            paymentMethod,
            isPaid,
            isDelivered,
        });
        setIsModalVisible(true);
    };

    return (
        <div className={styles.Wrapper}>
            <h1>Đơn hàng của tôi</h1>
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
                    Không có đơn hàng nào được tìm thấy. Hãy kiểm tra lại hoặc
                    bắt đầu mua sắm!
                </div>
            )}
            {(Array.isArray(data) ? data : [])
                .slice()
                .reverse()
                .map((order) => (
                    <div key={order.id} className={styles.OrderCard}>
                        <h2>Trạng thái</h2>
                        <div className={styles.OrderStatus}>
                            <p>
                                <span className={styles.StatusLabel}>
                                    Giao hàng:
                                </span>
                                <span className={styles.StatusValue}>
                                    {`${
                                        order.isDelivered
                                            ? 'Đã giao hàng'
                                            : 'Chưa giao hàng'
                                    }`}
                                </span>
                            </p>
                            <p>
                                <span className={styles.StatusLabel}>
                                    Thanh toán:
                                </span>
                                <span className={styles.StatusValue}>
                                    {`${
                                        order.isPaid
                                            ? 'Đã thanh toán'
                                            : 'Chưa thanh toán'
                                    }`}
                                </span>
                            </p>
                        </div>
                        {renderProduct(order?.orderItems)}
                        <div className={styles.OrderFooter}>
                            <p className={styles.OrderTotal}>
                                Tổng tiền:{' '}
                                <span>{convertPrice(order.totalPrice)}</span>
                            </p>
                            <div className={styles.OrderActions}>
                                <button
                                    className={styles.CancelButton}
                                    onClick={() =>
                                        showCancelModal(
                                            order?._id,
                                            order?.captureIdFromRedux,
                                            order?.paymentMethod,
                                            order?.isPaid,
                                            order?.isDelivered,
                                        )
                                    }
                                >
                                    Hủy đơn hàng
                                </button>
                                <button
                                    className={styles.DetailsButton}
                                    onClick={() =>
                                        handleDetailOrder(order?._id)
                                    }
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            {/* Modal Xác nhận hủy */}
            <Modal
                title="Xác nhận hủy đơn hàng"
                visible={isModalVisible}
                onOk={() => {
                    handleCancelOrder(
                        selectedOrderId.id,
                        selectedOrderId.captureIdFromRedux,
                        selectedOrderId.paymentMethod,
                        selectedOrderId.isPaid,
                        selectedOrderId.isDelivered,
                    );
                    setIsModalVisible(false); // Đóng Modal
                }}
                onCancel={() => setIsModalVisible(false)} // Đóng Modal khi người dùng hủy
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
                <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
            </Modal>
        </div>
    );
};

export default MyOrderPage;
