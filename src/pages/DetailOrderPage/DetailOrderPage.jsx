import React, { useEffect, useMemo } from 'react';
import styles from './DetailOrderPage.module.scss';
import { useLocation, useParams } from 'react-router-dom';
import * as OrderService from '../../services/OrderService.js';
import { useQuery } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { orderContent } from '../../content.js';

const DetailOrderPage = () => {
    const params = useParams();
    const { id } = params;
    const location = useLocation();
    const { state } = location;

    const fetchDetailOrder = async () => {
        const res = await OrderService.getOrderDetail(id, state?.access_token);
        return res.data;
    };

    const queryOrder = useQuery({
        queryKey: ['orders-details'],
        queryFn: fetchDetailOrder,
        enabled: !!id,
    });

    const { isLoading, data } = queryOrder;

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const priceMemo = useMemo(() => {
        const result = (data?.orderItems || []).reduce((total, cur) => {
            return total + cur.price * cur.amount;
        }, 0);
        return result;
    }, [data]);

    const priceDiscountMemo = useMemo(() => {
        if (!data?.orderItems?.length) return 0;
        return data.orderItems.reduce((total, cur) => {
            return (
                total +
                (cur.discount
                    ? (cur.price * cur.amount * cur.discount) / 100
                    : 0)
            );
        }, 0);
    }, [data]);

    // Hàm lấy phần mô tả từ orderContent.delivery
    const getDeliveryDescription = (deliveryMethod) => {
        const fullText = orderContent.delivery[deliveryMethod];
        if (fullText) {
            return fullText.split(' - ')[1] || fullText; // Lấy phần sau dấu " - "
        }
        return deliveryMethod; // Fallback nếu không tìm thấy
    };

    return (
        <div className={styles.Wrapper}>
            <div style={{ backgroundColor: '#fff', padding: '20px' }}>
                <h2>Chi tiết đơn hàng</h2>
                <div className={styles.OrderDetails}>
                    <div className={styles.Section}>
                        <h3 style={{ textAlign: 'center' }}>
                            Địa chỉ người nhận
                        </h3>
                        <div className={styles.Box}>
                            <p>
                                <strong>
                                    {data?.shippingAddress?.fullName}
                                </strong>
                            </p>
                            <p>{`${data?.shippingAddress?.address}`}</p>
                            <p>{`0${data?.shippingAddress?.phone}`}</p>
                        </div>
                    </div>
                    <div
                        className={styles.Section}
                        style={{ textAlign: 'center' }}
                    >
                        <h3>Hình thức giao hàng</h3>
                        <div className={styles.Box}>
                            <p>
                                <strong
                                    style={{
                                        color:
                                            data?.deliveryMethod === 'fast'
                                                ? '#ea8500'
                                                : '#00b14f',
                                    }}
                                >
                                    {orderContent.delivery[
                                        data?.deliveryMethod
                                    ]?.split(' - ')[0] || 'Không xác định'}
                                </strong>{' '}
                                - {getDeliveryDescription(data?.deliveryMethod)}
                            </p>
                            <p>
                                Phí giao hàng:{' '}
                                {convertPrice(data?.shippingPrice)}
                            </p>
                        </div>
                    </div>
                    <div
                        className={styles.Section}
                        style={{ textAlign: 'center' }}
                    >
                        <h3>Hình thức thanh toán</h3>
                        <div className={styles.Box}>
                            <p>{orderContent.payment[data?.paymentMethod]}</p>
                            <p className={styles.Warning}>
                                {data?.isPaid
                                    ? 'Đã thanh toán'
                                    : 'Chưa thanh toán'}
                            </p>
                        </div>
                    </div>
                    <div
                        className={styles.SectionDate}
                        style={{ textAlign: 'center' }}
                    >
                        <h3>Ngày đặt hàng</h3>
                        <div className={styles.Box}>
                            <p>
                                {data?.createdAt
                                    ? formatDate(data.createdAt)
                                    : 'Không có thông tin'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.ProductDetails}>
                    <table>
                        {/* Tiêu đề bảng */}
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Giảm giá</th>
                                <th>Tổng</th>
                            </tr>
                        </thead>
                        {/* Danh sách sản phẩm */}
                        <tbody>
                            {data?.orderItems?.map((order) => (
                                <tr key={order._id}>
                                    <td className={styles.Product}>
                                        <img
                                            src={order?.image}
                                            alt={order?.name}
                                        />
                                        <span>{order?.name}</span>
                                    </td>
                                    <td>{convertPrice(order?.price)}</td>
                                    <td>{order?.amount}</td>
                                    <td>
                                        {convertPrice(
                                            (order?.price * order?.discount) /
                                                100 || 0,
                                        )}
                                    </td>
                                    <td>
                                        {convertPrice(
                                            order?.price * order?.amount,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Tổng kết */}
                        <tfoot>
                            <tr>
                                <td colSpan={3}></td>
                                <td style={{ fontWeight: 'bold' }}>Tạm tính</td>
                                <td>{convertPrice(priceMemo)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td style={{ fontWeight: 'bold' }}>Giảm giá</td>
                                <td>{convertPrice(priceDiscountMemo)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td style={{ fontWeight: 'bold' }}>
                                    Phí vận chuyển
                                </td>
                                <td>{convertPrice(data?.shippingPrice)}</td>
                            </tr>
                            <tr className={styles.totalRow}>
                                <td colSpan={3}></td>
                                <td style={{ fontWeight: 'bold' }}>
                                    Tổng cộng
                                </td>
                                <td className={styles.Total}>
                                    {convertPrice(data?.totalPrice)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailOrderPage;
