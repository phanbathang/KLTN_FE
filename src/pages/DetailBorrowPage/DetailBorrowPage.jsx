import React, { useEffect, useMemo } from 'react';
import styles from './DetailBorrowPage.module.scss';
import { useLocation, useParams } from 'react-router-dom';
import * as BorrowService from '../../services/BorrowService.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertPrice } from '../../ultils.js';
import { orderContent } from '../../content.js';
import { Modal } from 'antd';
import { toast } from 'react-toastify';

const DetailBorrowPage = () => {
    const params = useParams();
    const { id } = params;
    const location = useLocation();
    const { state } = location;
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [selectedItemId, setSelectedItemId] = React.useState(null);

    const fetchDetailBorrow = async () => {
        const res = await BorrowService.getBorrowDetail(
            id,
            state?.access_token,
        );
        return res.data;
    };

    const queryBorrow = useQuery({
        queryKey: ['borrows-details', id],
        queryFn: fetchDetailBorrow,
        enabled: !!id,
    });

    const { isLoading, data } = queryBorrow;

    const mutation = useMutation({
        mutationFn: ({ borrowId, itemId }) =>
            BorrowService.returnBorrowItem(
                borrowId,
                itemId,
                state?.access_token,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries(['borrows-details', id]);
            toast.success('Trả sản phẩm thành công.');
        },
        onError: (error) => {
            toast.error('Trả sản phẩm không thành công.');
        },
    });

    // Calculate overdue fee for an item
    const calculateOverdueFee = (returnDate, isReturned) => {
        if (!returnDate || isReturned) return 0;
        const currentDate = new Date();
        const returnDateObj = new Date(returnDate);
        if (currentDate <= returnDateObj) return 0;
        const diffTime = currentDate - returnDateObj;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * 5000; // 5000 per day
    };

    // Memoize the total price including overdue fees
    const priceMemo = useMemo(() => {
        const basePrice = (data?.borrowItems || []).reduce((total, cur) => {
            return total + cur.price * cur.amount;
        }, 0);
        const overdueFees = (data?.borrowItems || []).reduce((total, cur) => {
            return total + calculateOverdueFee(cur.returnDate, cur.isReturned);
        }, 0);
        return basePrice + overdueFees;
    }, [data]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day} - ${month} - ${year}`;
    };

    const handleReturnItem = (itemId) => {
        mutation.mutate({ borrowId: id, itemId });
        setIsModalVisible(false);
    };

    const showReturnModal = (itemId) => {
        setSelectedItemId(itemId);
        setIsModalVisible(true);
    };

    return (
        <div className={styles.Wrapper}>
            <div style={{ backgroundColor: '#fff', padding: '20px' }}>
                <h2>Chi tiết đơn thuê - #{data?._id || 'N/A'}</h2>
                <div className={styles.OrderDetails}>
                    <div className={styles.Section}>
                        <h3>Địa chỉ người thuê</h3>
                        <div className={styles.Box}>
                            <p>
                                <strong>{data?.borrowAddress?.fullName}</strong>
                            </p>
                            <p>{`${data?.borrowAddress?.address}`}</p>
                            <p>{`0${data?.borrowAddress?.phone}`}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.ProductDetails}>
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Ngày thuê</th>
                                <th>Ngày trả</th>
                                <th>Thời gian mượn</th>
                                <th>Trạng thái</th>
                                <th>Tạm tính</th>
                                <th>Phí quá hạn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.borrowItems?.map((borrow, index) => (
                                <tr key={index}>
                                    <td className={styles.Product}>
                                        <img
                                            src={borrow?.image}
                                            alt={borrow?.name}
                                        />
                                        <span>{borrow?.name}</span>
                                    </td>
                                    <td>{borrow?.amount}</td>
                                    <td>{formatDate(borrow?.borrowDate)}</td>
                                    <td>{formatDate(borrow?.returnDate)}</td>
                                    <td>
                                        {borrow?.borrowDuration || 'N/A'} ngày
                                    </td>
                                    <td>
                                        {borrow.isReturned
                                            ? 'Đã trả'
                                            : borrow.isOverdue
                                            ? 'Quá hạn'
                                            : 'Đang trong thời gian thuê'}
                                    </td>
                                    <td>
                                        {convertPrice(
                                            borrow?.price * borrow?.amount,
                                        )}
                                    </td>
                                    <td>
                                        {convertPrice(
                                            calculateOverdueFee(
                                                borrow?.returnDate,
                                                borrow?.isReturned,
                                            ),
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <thead>
                            <tr>
                                <th colSpan={8} style={{ textAlign: 'center' }}>
                                    Tổng cộng
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={8}
                                    style={{
                                        color: 'red',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}
                                >
                                    {convertPrice(priceMemo)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                title="Xác nhận trả sản phẩm"
                visible={isModalVisible}
                onOk={() => handleReturnItem(selectedItemId)}
                onCancel={() => setIsModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
            >
                <p>Bạn có chắc chắn muốn trả sản phẩm này không?</p>
            </Modal>
        </div>
    );
};

export default DetailBorrowPage;
