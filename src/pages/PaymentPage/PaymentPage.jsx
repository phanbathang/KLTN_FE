import React, { useEffect, useMemo, useState } from 'react';
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

const PaymentPage = () => {
    const order = useSelector((state) => state.order);
    const user = useSelector((state) => state.user);

    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [payment, setPayment] = useState('later_money');
    const [delivery, setDelivery] = useState('fast');
    const [sdkReady, setSdkReady] = useState(false);
    const [stateUserDetail, setStateUserDetail] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
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
                city: user?.city,
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
            user?.city &&
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
                    city: user?.city,
                    paymentMethod: payment,
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
        if (isSuccess && dataAdd?.status === 'OK') {
            localStorage.removeItem('cart_' + user?.id);
            const arrayOrdered = [];
            order?.orderItemSelected?.forEach((e) => {
                arrayOrdered.push(e.product);
            });
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));
            toast.success('Đặt hàng thành công.', {
                style: { fontSize: '1.5rem' },
            });
            navigate('/orderSuccess', {
                state: {
                    delivery,
                    payment,
                    orders: order?.orderItemSelected,
                    priceTotalMemo: priceTotalMemo,
                },
            });
        } else if (isError || dataAdd?.status === 'ERR') {
            toast.error('Đặt hàng thành công không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccess, isError]);

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
        script.src = `https://sandbox.paypal.com/sdk/js?client-id=${data}`;
        script.async = true;
        script.onload = () => {
            setSdkReady(true);
        };
        document.body.appendChild(script);
    };

    const onSuccessPaypal = (details, data) => {
        setIsLoading(true); // Bật trạng thái loading
        mutationAddOrder.mutate(
            {
                access_token: user?.access_token,
                orderItems: order?.orderItemSelected,
                fullName: user?.name,
                address: user?.address,
                phone: user?.phone,
                city: user?.city,
                paymentMethod: payment,
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
                                padding: '20px',
                                borderRadius: '5px',
                            }}
                        >
                            {/* Chọn phương thức giao hàng */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '10px' }}>
                                    Chọn phương thức giao hàng
                                </h3>
                                <div
                                    style={{
                                        padding: '20px',
                                        backgroundColor: '#f0f8ff',
                                        borderRadius: '5px',
                                    }}
                                    onChange={handleDelivery}
                                    value={delivery}
                                >
                                    <div style={{ marginBottom: '20px' }}>
                                        <input
                                            type="radio"
                                            id="fast"
                                            name="deliveryMethod"
                                            value="fast"
                                        />
                                        <label
                                            style={{ marginLeft: '10px' }}
                                            htmlFor="fast"
                                        >
                                            <span
                                                style={{
                                                    color: '#ea8500',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                FAST
                                            </span>{' '}
                                            Giao hàng tiết kiệm
                                        </label>
                                    </div>
                                    <div>
                                        <input
                                            type="radio"
                                            id="gojek"
                                            name="deliveryMethod"
                                            value="gojek"
                                        />
                                        <label
                                            style={{ marginLeft: '10px' }}
                                            htmlFor="gojek"
                                        >
                                            <span
                                                style={{
                                                    color: '#ea8500',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                GO_JEK
                                            </span>{' '}
                                            Giao hàng tiết kiệm
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Chọn phương thức thanh toán */}
                            <div>
                                <h3 style={{ marginBottom: '10px' }}>
                                    Chọn phương thức thanh toán
                                </h3>
                                <div
                                    style={{
                                        padding: '20px',
                                        backgroundColor: '#f0f8ff',
                                        borderRadius: '5px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    onChange={handlePayment}
                                    value={payment}
                                >
                                    <label>
                                        <input
                                            type="radio"
                                            value="later_money"
                                            name="paymentMethod"
                                            style={{
                                                marginRight: '10px',
                                                marginBottom: '20px',
                                            }}
                                        />
                                        Thanh toán tiền mặt khi nhận hàng
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="paypal"
                                            name="paymentMethod"
                                            style={{
                                                marginRight: '10px',
                                            }}
                                        />
                                        Thanh toán tiền bằng paypal
                                    </label>
                                </div>
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
                                    {`${user?.address} ${user?.city}`}{' '}
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
                                    // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
                                    onSuccess={onSuccessPaypal}
                                    onError={() => {
                                        alert('Error');
                                    }}
                                />
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
