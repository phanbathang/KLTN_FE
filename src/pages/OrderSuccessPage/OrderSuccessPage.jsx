import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import styles from './OrderSuccessPage.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderContent } from '../../content';
import { convertPrice } from '../../ultils';
import { useEffect, useState, useRef } from 'react';
import * as OrderService from '../../services/OrderService.js';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import { removeAllOrderProduct } from '../../redux/slides/orderSlide.js';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Loading from '../../components/LoadingComponent/Loading.jsx'; // Import component Loading
import { CheckCircleFilled } from '@ant-design/icons'; // Thêm import icon

const OrderSuccessPage = () => {
    const user = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái isLoading
    const processedRef = useRef(false); // Ngăn xử lý lặp

    const mutationAddOrder = useMutationHook((data) => {
        const { access_token, ...rests } = data;
        return OrderService.createOrder({ ...rests }, access_token);
    });

    const { data: dataAdd, isSuccess, isError } = mutationAddOrder;

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const responseCode = query.get('vnp_ResponseCode');
        const orderId = query.get('vnp_TxnRef');
        const storedOrder = localStorage.getItem('pendingOrder');

        console.log('ResponseCode:', responseCode);
        console.log('StoredOrder:', storedOrder);

        if (responseCode === '00' && storedOrder && !processedRef.current) {
            const parsedOrder = JSON.parse(storedOrder);
            setOrderData(parsedOrder);

            // Tạo đơn hàng nếu chưa tạo
            if (
                user?.access_token &&
                parsedOrder.orders &&
                !processedRef.current
            ) {
                processedRef.current = true; // Đánh dấu đã xử lý
                setIsLoading(true); // Bật spin
                mutationAddOrder.mutate({
                    access_token: user?.access_token,
                    orderItems: parsedOrder.orders,
                    fullName: user?.name,
                    address: user?.address,
                    phone: user?.phone,
                    paymentMethod: parsedOrder.payment,
                    deliveryMethod:
                        parsedOrder.deliveryMethod || parsedOrder.delivery,
                    itemsPrice: parsedOrder.priceMemo,
                    shippingPrice: parsedOrder.priceDeliveryMemo,
                    totalPrice: parsedOrder.priceTotalMemo,
                    user: user?.id,
                    isPaid: true,
                    paidAt: new Date().toISOString(),
                    email: user?.email,
                });
            }
        } else if (responseCode && responseCode !== '00') {
            setError('Thanh toán thất bại. Vui lòng thử lại.');
            setIsLoading(false); // Tắt spin nếu lỗi
            navigate('/orderFailed');
        } else if (location.state) {
            setOrderData(location.state);
            setIsLoading(false); // Tắt spin nếu dùng location.state
        } else {
            setError('Không tìm thấy thông tin đơn hàng.');
            setIsLoading(false); // Tắt spin nếu lỗi
        }
    }, [location, navigate, user]);

    useEffect(() => {
        if (isSuccess && dataAdd?.status === 'OK') {
            localStorage.removeItem('pendingOrder');
            localStorage.removeItem('cart_' + user?.id);
            const arrayOrdered = orderData?.orders?.map((e) => e.product) || [];
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));
            toast.success('Đặt hàng thành công.', {
                style: { fontSize: '1.5rem' },
            });
            setIsLoading(false); // Tắt spin khi hoàn tất
        } else if (isError || dataAdd?.status === 'ERR') {
            setError('Đặt hàng không thành công.');
            toast.error('Đặt hàng không thành công.', {
                style: { fontSize: '1.5rem' },
            });
            setIsLoading(false); // Tắt spin nếu lỗi
        }
    }, [isSuccess, isError, dataAdd]);

    const getDeliveryDescription = (delivery) => {
        const fullText = orderContent.delivery[delivery];
        if (fullText) {
            return fullText.split(' - ')[1] || fullText; // Lấy phần sau dấu " - "
        }
        return delivery; // Fallback nếu không tìm thấy
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Loading isLoading={isLoading}>
            <div className={styles.Wrapper}>
                {!isLoading && (
                    <div className={styles.Container}>
                        <h1 className={styles.Title}>
                            <CheckCircleFilled
                                style={{
                                    color: '#52c41a', // Màu xanh lá
                                    fontSize: '40px',
                                    marginRight: '10px',
                                    verticalAlign: 'middle',
                                    marginBottom: '10px',
                                }}
                            />
                            Đã đặt hàng thành công!
                        </h1>
                        <Row gutter={24}>
                            <Col style={{ width: '100%' }}>
                                <div>
                                    <div className={styles.InfoBlock}>
                                        <h3>Phương thức giao hàng</h3>
                                        <div className={styles.Content}>
                                            <span
                                                className={styles.DeliveryName}
                                                style={{
                                                    color:
                                                        orderData?.delivery ===
                                                        'fast'
                                                            ? '#ea8500'
                                                            : '#00b14f',
                                                }}
                                            >
                                                {orderContent.delivery[
                                                    orderData?.delivery
                                                ]?.split(' - ')[0] ||
                                                    'Không xác định'}
                                            </span>{' '}
                                            -{' '}
                                            {getDeliveryDescription(
                                                orderData?.delivery,
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.InfoBlock}>
                                        <h3>Phương thức thanh toán</h3>
                                        <div className={styles.Content}>
                                            {orderContent.payment[
                                                orderData?.payment
                                            ] || 'Không xác định'}
                                        </div>
                                    </div>
                                    {orderData?.orders?.map((order) => (
                                        <Row
                                            key={order?.image}
                                            className={styles.WrapperRow}
                                        >
                                            <Col span={4}>
                                                <img
                                                    src={order?.image}
                                                    alt="Sản phẩm"
                                                    className={
                                                        styles.ProductImage
                                                    }
                                                />
                                            </Col>
                                            <Col span={5}>
                                                <div
                                                    className={
                                                        styles.ProductName
                                                    }
                                                >
                                                    {order?.name}
                                                </div>
                                            </Col>
                                            <Col span={4}>
                                                <div className={styles.Price}>
                                                    Giá tiền:{' '}
                                                    <span
                                                        className={
                                                            styles.PriceValue
                                                        }
                                                    >
                                                        {convertPrice(
                                                            order?.price,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col
                                                span={4}
                                                style={{ textAlign: 'center' }}
                                            >
                                                <div className={styles.Amount}>
                                                    Số lượng:{' '}
                                                    <span
                                                        className={
                                                            styles.AmountValue
                                                        }
                                                    >
                                                        {order?.amount}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col
                                                span={7}
                                                style={{ textAlign: 'center' }}
                                            >
                                                <div className={styles.Total}>
                                                    Tổng:{' '}
                                                    {convertPrice(
                                                        order?.price *
                                                            order?.amount,
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    ))}
                                </div>
                                <div className={styles.WrapperTotal}>
                                    Tổng tiền:{' '}
                                    <span className={styles.TotalValue}>
                                        {convertPrice(
                                            orderData?.priceTotalMemo,
                                        )}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </div>
        </Loading>
    );
};

export default OrderSuccessPage;
