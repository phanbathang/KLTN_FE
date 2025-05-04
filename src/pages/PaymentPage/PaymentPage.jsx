import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Button, Form, Input, Radio } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { convertPrice } from '../../ultils.js';
import styles from './PaymentPage.module.scss';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import * as UserService from '../../services/UserService.js';
import * as OrderService from '../../services/OrderService.js';
import * as PaymentService from '../../services/PaymentService.js';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { removeAllOrderProduct } from '../../redux/slides/orderSlide.js';
import { PayPalButton } from 'react-paypal-button-v2';
import Loading from '../../components/LoadingComponent/Loading.jsx';
import { setCaptureId } from '../../redux/slides/paymentSlide.js';

const PaymentPage = () => {
    const order = useSelector((state) => state.order);
    const user = useSelector((state) => state.user);

    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [payment, setPayment] = useState('later_money');
    const [delivery, setDelivery] = useState('fast');
    const [sdkReady, setSdkReady] = useState(false);
    const [hasProcessed, setHasProcessed] = useState(false); // Thêm state để kiểm soát xử lý
    const processedRef = useRef(false); // Thêm useRef để kiểm soát xử lý
    const [stateUserDetail, setStateUserDetail] = useState({
        name: '',
        phone: '',
        address: '',
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const location = useLocation();
    const { priceMemo, priceDiscountMemo, priceDeliveryMemo, priceTotalMemo } =
        location.state || {};

    useEffect(() => {
        form.setFieldsValue(stateUserDetail);
    }, [stateUserDetail, form]);

    useEffect(() => {
        if (isOpenModalUpdateInfo) {
            setStateUserDetail({
                // ...stateUserDetail,

                name: user?.name,
                phone: user?.phone,
                address: user?.address,
            });
        }
    }, [isOpenModalUpdateInfo]);

    const handleAddOrder = () => {
        if (
            user?.access_token &&
            order?.orderItemSelected &&
            user?.name &&
            user?.address &&
            user?.phone &&
            priceMemo &&
            user?.id
        ) {
            setIsLoading(true); // Bật trạng thái loading

            mutationAddOrder.mutate(
                {
                    access_token: user?.access_token,
                    orderItems: order?.orderItemSelected,
                    fullName: user?.name,
                    address: user?.address,
                    phone: user?.phone,
                    paymentMethod: payment,
                    deliveryMethod: delivery,
                    itemsPrice: priceMemo,
                    shippingPrice: priceDeliveryMemo,
                    totalPrice: priceTotalMemo,
                    user: user?.id,
                    email: user?.email,
                },
                {
                    onSettled: () => setIsLoading(false), // Tắt loading khi kết thúc
                },
            );
        }
    };

    const mutationUpdate = useMutationHook((data) => {
        const { id, access_token, ...rests } = data;
        return UserService.updateUser(id, rests, access_token);
    });

    const mutationAddOrder = useMutationHook((data) => {
        const { access_token, ...rests } = data;
        return OrderService.createOrder({ ...rests }, access_token);
    });

    const { data } = mutationUpdate;
    const { data: dataAdd, isSuccess, isError } = mutationAddOrder;

    useEffect(() => {
        if (isSuccess && dataAdd?.status === 'OK' && !processedRef.current) {
            console.log('Đơn hàng đã được tạo thành công trong PaymentPage!');
            processedRef.current = true; // Đánh dấu đã xử lý
            setIsLoading(false); // Tắt spin
            localStorage.removeItem('pendingOrder');
            localStorage.removeItem('cart_' + user?.id);
            const arrayOrdered =
                order?.orderItemSelected?.map((e) => e.product) || [];
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));
            toast.success('Đặt hàng thành công.', {
                style: { fontSize: '1.5rem' },
            });
            navigate('/orderSuccess', {
                state: {
                    delivery,
                    payment,
                    orders: order?.orderItemSelected,
                    priceTotalMemo,
                },
            });
        } else if (
            isError ||
            (dataAdd?.status === 'ERR' && !processedRef.current)
        ) {
            console.error('Lỗi khi tạo đơn hàng trong PaymentPage:', dataAdd);
            processedRef.current = true; // Đánh dấu đã xử lý
            setIsLoading(false); // Tắt spin nếu lỗi
            toast.error('Đặt hàng không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccess, isError, dataAdd]);

    const handleDelivery = (e) => {
        setDelivery(e.target.value);
    };

    const handlePayment = (e) => {
        setPayment(e.target.value);
    };

    useEffect(() => {
        if (!window.paypal) {
            addPaypalScript();
        } else {
            setSdkReady(true);
        }
    }, []);

    const addPaypalScript = async () => {
        const { data } = await PaymentService.getConfig();
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.paypal.com/sdk/js?client-id=${data}&currency=USD`;
        script.async = true;
        script.onload = () => {
            setSdkReady(true);
        };
        document.body.appendChild(script);
    };

    const onSuccessPaypal = (details, data) => {
        const captureId =
            details?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

        if (captureId) {
            dispatch(setCaptureId(captureId)); // Lưu captureId vào Redux
        }

        setIsLoading(true); // Bật trạng thái loading
        mutationAddOrder.mutate(
            {
                access_token: user?.access_token,
                orderItems: order?.orderItemSelected,
                fullName: user?.name,
                address: user?.address,
                phone: user?.phone,
                paymentMethod: payment,
                deliveryMethod: delivery,
                itemsPrice: priceMemo,
                shippingPrice: priceDeliveryMemo,
                totalPrice: priceTotalMemo,
                user: user?.id,
                isPaid: true,
                paidAt: details.update_time,
                email: user?.email,
            },
            {
                onSettled: () => setIsLoading(false), // Tắt loading khi kết thúc
            },
        );
    };

    const handleVNPayPayment = async () => {
        setIsLoading(true);
        try {
            if (!order?.orderItemSelected || !priceTotalMemo) {
                toast.error(
                    'Dữ liệu đơn hàng không đầy đủ. Vui lòng kiểm tra giỏ hàng.',
                );
                setIsLoading(false);
                return;
            }

            const orderData = {
                delivery,
                deliveryMethod: delivery, // Thêm deliveryMethod để khớp schema
                payment,
                orders: order?.orderItemSelected,
                priceMemo: priceMemo || 0,
                priceDeliveryMemo: priceDeliveryMemo || 0,
                priceTotalMemo: priceTotalMemo || 0,
            };
            console.log('Saving to localStorage:', orderData);
            localStorage.setItem('pendingOrder', JSON.stringify(orderData));

            const response = await PaymentService.createVNPayPayment({
                amount: priceTotalMemo,
                orderId: `ORDER_${new Date().getTime()}`,
                ipAddr: window.location.hostname,
            });
            const { paymentUrl } = response.data;
            window.location.href = paymentUrl;
        } catch (error) {
            console.error('Error in handleVNPayPayment:', error);
            toast.error('Lỗi khi tạo thanh toán VNPay.');
            setIsLoading(false);
        }
    };

    const deliveryOptions = [
        {
            value: 'fast',
            label: 'FAST - Giao Hàng Tiết Kiệm',
            time: '2-3 ngày',
            color: '#ea8500',
        },
        {
            value: 'gojek',
            label: 'GOJEK - Giao Hàng Nhanh',
            time: '1-2 ngày',
            color: '#00b14f',
        },
    ];

    const paymentOptions = [
        {
            value: 'later_money',
            label: 'Thanh Toán Khi Nhận Hàng',
            desc: 'Thanh toán bằng tiền mặt khi nhận hàng tại nhà',
        },
        {
            value: 'paypal',
            label: 'Thanh Toán Qua PayPal',
            desc: 'Thanh toán an toàn qua cổng PayPal quốc tế',
        },
        {
            value: 'vnpay',
            label: 'Thanh Toán Qua VNPay',
            desc: 'Thanh toán nhanh chóng qua VNPay nội địa',
        },
    ];

    return (
        <Loading isLoading={isLoading}>
            <div
                style={{
                    backgroundColor: '#f0f0f5',
                    width: '100%',
                    minHeight: '100vh',
                    padding: '20px',
                }}
            >
                <h1 style={{ marginBottom: '20px' }}>Thanh toán</h1>
                <Row gutter={16}>
                    {/* Phần bên trái: Danh sách sản phẩm */}
                    <Col span={18}>
                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '25px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                border: '1px solid #e8e8e8',
                            }}
                        >
                            {/* Phương thức giao hàng */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3
                                    style={{
                                        marginBottom: '20px',
                                        fontSize: '20px',
                                        color: '#333',
                                        fontWeight: '500',
                                        borderBottom: '2px solid #1890ff',
                                        paddingBottom: '8px',
                                        display: 'inline-block',
                                    }}
                                >
                                    Phương Thức Giao Hàng
                                </h3>
                                <Row gutter={[16, 16]}>
                                    {deliveryOptions.map((option) => (
                                        <Col span={12} key={option.value}>
                                            <div
                                                style={{
                                                    border:
                                                        delivery ===
                                                        option.value
                                                            ? `2px solid ${option.color}`
                                                            : '1px solid #d9d9d9',
                                                    borderRadius: '8px',
                                                    padding: '15px',
                                                    backgroundColor:
                                                        delivery ===
                                                        option.value
                                                            ? `${option.color}10`
                                                            : '#fff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.border = `2px solid ${option.color}`)
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.border =
                                                        delivery ===
                                                        option.value
                                                            ? `2px solid ${option.color}`
                                                            : '1px solid #d9d9d9')
                                                }
                                                onClick={() =>
                                                    setDelivery(option.value)
                                                }
                                            >
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="deliveryMethod"
                                                        value={option.value}
                                                        checked={
                                                            delivery ===
                                                            option.value
                                                        }
                                                        onChange={
                                                            handleDelivery
                                                        }
                                                        style={{
                                                            marginRight: '10px',
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: '500',
                                                            color: '#333',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                color: option.color,
                                                            }}
                                                        >
                                                            {
                                                                option.label.split(
                                                                    ' - ',
                                                                )[0]
                                                            }
                                                        </span>{' '}
                                                        -{' '}
                                                        {
                                                            option.label.split(
                                                                ' - ',
                                                            )[1]
                                                        }
                                                    </span>
                                                </label>
                                                <div
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#666',
                                                        marginLeft: '24px',
                                                    }}
                                                >
                                                    Thời gian dự kiến:{' '}
                                                    {option.time}
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>

                            {/* Phương thức thanh toán */}
                            <div>
                                <h3
                                    style={{
                                        marginBottom: '20px',
                                        fontSize: '20px',
                                        color: '#333',
                                        fontWeight: '500',
                                        borderBottom: '2px solid #1890ff',
                                        paddingBottom: '8px',
                                        display: 'inline-block',
                                    }}
                                >
                                    Phương Thức Thanh Toán
                                </h3>
                                <Row gutter={[16, 16]}>
                                    {paymentOptions.map((option) => (
                                        <Col span={8} key={option.value}>
                                            <div
                                                style={{
                                                    border:
                                                        payment === option.value
                                                            ? '2px solid #1890ff'
                                                            : '1px solid #d9d9d9',
                                                    borderRadius: '8px',
                                                    padding: '15px',
                                                    backgroundColor:
                                                        payment === option.value
                                                            ? '#e6f7ff'
                                                            : '#fff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.border =
                                                        '2px solid #40a9ff')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.border =
                                                        payment === option.value
                                                            ? '2px solid #1890ff'
                                                            : '1px solid #d9d9d9')
                                                }
                                                onClick={() =>
                                                    setPayment(option.value)
                                                }
                                            >
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={option.value}
                                                        checked={
                                                            payment ===
                                                            option.value
                                                        }
                                                        onChange={handlePayment}
                                                        style={{
                                                            marginRight: '10px',
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: '500',
                                                            color: '#333',
                                                        }}
                                                    >
                                                        {option.label}
                                                    </span>
                                                </label>
                                                <div
                                                    style={{
                                                        fontSize: '13px',
                                                        color: '#666',
                                                        marginLeft: '24px',
                                                        lineHeight: '1.4',
                                                    }}
                                                >
                                                    {option.desc}
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </div>
                    </Col>

                    {/* Phần bên phải: Tóm tắt đơn hàng */}
                    <Col span={6}>
                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '5px',
                            }}
                        >
                            <Row style={{ marginBottom: '25px' }}>
                                <span>Địa chỉ giao hàng:</span>
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {`${user?.address} `}{' '}
                                </span>
                            </Row>
                            <Row
                                justify="space-between"
                                style={{ marginBottom: '10px' }}
                            >
                                <Col>Tạm tính</Col>
                                <Col>{convertPrice(priceMemo)}</Col>
                            </Row>
                            <Row
                                justify="space-between"
                                style={{ marginBottom: '10px' }}
                            >
                                <Col>Giảm giá</Col>
                                <Col>{convertPrice(priceDiscountMemo)}</Col>
                            </Row>
                            <Row
                                justify="space-between"
                                style={{ marginBottom: '20px' }}
                            >
                                <Col>Phí giao hàng</Col>
                                <Col>{convertPrice(priceDeliveryMemo)}</Col>
                            </Row>
                            <Row
                                justify="space-between"
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                    marginBottom: '20px',
                                }}
                            >
                                <Col>Tổng tiền</Col>
                                <Col
                                    style={{
                                        color: '#ff4d4f',
                                        fontSize: '20px',
                                    }}
                                >
                                    {convertPrice(priceTotalMemo)}
                                </Col>
                            </Row>
                            {payment === 'paypal' && sdkReady ? (
                                <PayPalButton
                                    amount={Math.round(priceTotalMemo / 20000)}
                                    onSuccess={onSuccessPaypal}
                                    onError={() => alert('Error')}
                                />
                            ) : payment === 'vnpay' ? (
                                <Button
                                    type="primary"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#005BAC', // Màu xanh dương đậm của VNPay
                                        borderColor: '#005BAC', // Đảm bảo viền khớp với màu nền
                                        height: '40px',
                                        color: '#fff', // Màu chữ trắng để nổi bật trên nền xanh
                                    }}
                                    onClick={handleVNPayPayment}
                                >
                                    Thanh toán bằng VNPay
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#ff4d4f',
                                        borderColor: '#ff4d4f',
                                        height: '40px',
                                    }}
                                    onClick={() => handleAddOrder()}
                                >
                                    Đặt hàng
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </Loading>
    );
};

export default PaymentPage;
