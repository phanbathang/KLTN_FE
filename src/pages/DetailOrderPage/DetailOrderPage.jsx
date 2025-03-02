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
    // const {
    //     shippingAddress,
    //     orderItems,
    //     shippingPrice,
    //     paymentMethod,
    //     isPaid,
    //     totalPrice,
    // } = data;

    // const priceMemo = useMemo(() => {
    //     const result = data?.orderItemSelected.reduce((total, cur) => {
    //         return total + cur.price * cur.amount;
    //     }, 0);
    //     return result;
    // }, [data]);

    const priceMemo = useMemo(() => {
        const result = (data?.orderItems || []).reduce((total, cur) => {
            return total + cur.price * cur.amount;
        }, 0);
        return result;
    }, [data]);

    return (
        <div className={styles.Wrapper}>
            <div style={{ backgroundColor: '#fff', padding: '20px' }}>
                <h2>Chi tiết đơn hàng</h2>
                <div className={styles.OrderDetails}>
                    <div className={styles.Section}>
                        <h3>Địa chỉ người nhận</h3>
                        <div className={styles.Box}>
                            <p>
                                <strong>
                                    {data?.shippingAddress?.fullName}
                                </strong>
                            </p>
                            <p>
                                {`${data?.shippingAddress?.address} ${data?.shippingAddress?.city}`}
                            </p>
                            <p>{data?.shippingAddress?.phone}</p>
                        </div>
                    </div>
                    <div className={styles.Section}>
                        <h3>Hình thức giao hàng</h3>
                        <div className={styles.Box}>
                            <p>
                                <strong>FAST</strong> Giao hàng tiết kiệm
                            </p>
                            <p>
                                Phí giao hàng:{' '}
                                {convertPrice(data?.shippingPrice)}
                            </p>
                        </div>
                    </div>
                    <div className={styles.Section}>
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
                </div>
                <div className={styles.ProductDetails}>
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Giảm giá</th>
                            </tr>
                        </thead>
                        {data?.orderItems?.map((order) => {
                            return (
                                <tbody>
                                    <tr>
                                        <td className={styles.Product}>
                                            <img
                                                src={order?.image}
                                                alt="Điện thoại"
                                            />
                                            <span>{order?.name}</span>
                                        </td>
                                        <td>{convertPrice(order?.price)}</td>
                                        <td>{order?.amount}</td>
                                        <td>
                                            {convertPrice(
                                                (priceMemo * order?.discount) /
                                                    100 || 0,
                                            )}
                                        </td>
                                        {/* <td>110.000</td>
                                        <td>{convertPrice(shippingPrice)}</td>
                                        <td className={styles.Total}>
                                            {convertPrice(totalPrice)}
                                        </td> */}
                                    </tr>
                                </tbody>
                            );
                        })}
                        <thead>
                            <tr>
                                <th>Tạm tính</th>
                                <th>Phí vận chuyển</th>
                                <th colSpan={2}>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{convertPrice(priceMemo)}</td>
                                <td>{convertPrice(data?.shippingPrice)}</td>
                                <td colSpan={2} className={styles.Total}>
                                    {convertPrice(data?.totalPrice)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailOrderPage;
