import React, { useEffect, useMemo } from 'react';
import styles from './DetailBorrowPage.module.scss';
import { useLocation, useParams } from 'react-router-dom';
import * as BorrowService from '../../services/BorrowService.js';
import { useQuery } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { orderContent } from '../../content.js';

const DetailBorrowPage = () => {
    const params = useParams();
    const { id } = params;
    const location = useLocation();
    const { state } = location;
    const fetchDetailBorrow = async () => {
        const res = await BorrowService.getBorrowDetail(
            id,
            state?.access_token,
        );
        return res.data;
    };
    const queryBorrow = useQuery({
        queryKey: ['borrows-details'],
        queryFn: fetchDetailBorrow,
        enabled: !!id,
    });

    const { isLoading, data } = queryBorrow;

    const priceMemo = useMemo(() => {
        const result = (data?.borrowItems || []).reduce((total, cur) => {
            return total + cur.price * cur.amount;
        }, 0);
        return result;
    }, [data]);

    const formatDate = (dateString) => {
        if (!dateString) return ''; // Kiểm tra nếu không có dữ liệu
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày và thêm số 0 nếu cần
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng (cộng thêm 1 vì JS đếm từ 0)
        const year = date.getFullYear(); // Lấy năm
        return `${day}-${month}-${year}`; // Trả về chuỗi đã định dạng
    };

    return (
        <div className={styles.Wrapper}>
            <div style={{ backgroundColor: '#fff', padding: '20px' }}>
                <h2>Chi tiết đơn hàng</h2>
                <div className={styles.OrderDetails}>
                    <div className={styles.Section}>
                        <h3>Địa chỉ người nhận</h3>
                        <div className={styles.Box}>
                            <p>
                                <strong>{data?.borrowAddress?.fullName}</strong>
                            </p>
                            <p>{`${data?.borrowAddress?.address}`}</p>
                            <p>{`0${data?.borrowAddress?.phone}`}</p>
                        </div>
                    </div>
                    <div className={styles.Section}>
                        <h3>Thời gian thuê</h3>
                        <div className={styles.Box}>
                            <p>
                                Ngày mượn:{' '}
                                <strong>{formatDate(data?.borrowDate)}</strong>
                            </p>
                            <p>
                                Ngày trả:{' '}
                                <strong>{formatDate(data?.returnDate)}</strong>
                            </p>
                        </div>
                    </div>
                    <div className={styles.Section}>
                        <h3>Trạng thái thuê</h3>
                        <div className={styles.Box}>
                            <p>{orderContent.payment[data?.paymentMethod]}</p>
                            <p className={styles.Warning}>
                                {data?.isOverdue
                                    ? 'Đã quá hạn'
                                    : 'Đang trong thời gian thuê'}
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
                                <th>Tạm tính</th>
                                <th>Tổng cộng</th>
                            </tr>
                        </thead>
                        {data?.borrowItems?.map((borrow) => {
                            return (
                                <tbody>
                                    <tr>
                                        <td className={styles.Product}>
                                            <img
                                                src={borrow?.image}
                                                alt="Điện thoại"
                                            />
                                            <span>{borrow?.name}</span>
                                        </td>
                                        <td>{convertPrice(borrow?.price)}</td>
                                        <td>{borrow?.amount}</td>
                                        <td>{convertPrice(priceMemo)}</td>
                                        <td
                                            style={{
                                                color: 'red',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {convertPrice(data?.totalPrice)}
                                        </td>
                                    </tr>
                                </tbody>
                            );
                        })}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailBorrowPage;
