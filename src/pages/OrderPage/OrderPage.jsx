import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Checkbox, Button, InputNumber, Form } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    decreaseAmount,
    increaseAmount,
    removeAllOrderProduct,
    removeOrderProduct,
    selectedOrder,
} from '../../redux/slides/orderSlide';
import { convertPrice } from '../../ultils';
import styles from './OrderPage.module.scss';
import { useMutationHook } from '../../hooks/useMutationHook';
import * as UserService from '../../services/UserService.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import StepsComponent from '../../components/StepsComponent/StepsComponent.jsx';

const OrderPage = () => {
    const [listChecked, setListChecked] = useState([]);
    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
    const order = useSelector((state) => state.order);
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [stateUserDetail, setStateUserDetail] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
    });

    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onChange = (e) => {
        if (listChecked.includes(e.target.value)) {
            const newListChecked = listChecked.filter(
                (item) => item !== e.target.value,
            );
            setListChecked(newListChecked);
        } else {
            setListChecked([...listChecked, e.target.value]);
        }
    };

    const handleChangeCount = (type, idProduct, limited) => {
        if (type === 'increase') {
            if (!limited) {
                dispatch(increaseAmount({ idProduct }));
            }
        } else {
            if (!limited) {
                dispatch(decreaseAmount({ idProduct }));
            }
        }
    };

    const handleDeleteOrder = (idProduct) => {
        dispatch(removeOrderProduct({ idProduct }));
    };

    const handleOnchangeCheckAll = (e) => {
        if (e.target.checked) {
            const newListChecked = [];
            order?.orderItems?.forEach((item) => {
                newListChecked.push(item?.product);
            });
            setListChecked(newListChecked);
        } else {
            setListChecked([]);
        }
    };

    useEffect(() => {
        dispatch(selectedOrder({ listChecked }));
    }, [listChecked]);

    useEffect(() => {
        form.setFieldsValue(stateUserDetail);
    }, [stateUserDetail, form]);

    useEffect(() => {
        if (isOpenModalUpdateInfo) {
            setStateUserDetail({
                ...stateUserDetail,
                city: user?.city,
                name: user?.name,
                phone: user?.phone,
                address: user?.address,
            });
        }
    }, [isOpenModalUpdateInfo]);

    const handleRemoveAllOrder = () => {
        if (listChecked?.length > 0) {
            dispatch(removeAllOrderProduct({ listChecked }));
        }
    };

    const priceMemo = useMemo(() => {
        const result = order?.orderItemSelected.reduce((total, cur) => {
            return total + cur.price * cur.amount;
        }, 0);
        return result;
    }, [order]);

    const priceDiscountMemo = useMemo(() => {
        if (!order?.orderItemSelected.length) return 0;

        const totalDiscountPercentage = order?.orderItemSelected.reduce(
            (total, cur) => {
                return total + (cur.discount ? cur.discount : 0);
            },
            0,
        );

        return (
            (priceMemo * totalDiscountPercentage) /
            (100 * order.orderItemSelected.length)
        );
    }, [order, priceMemo]);

    const priceDeliveryMemo = useMemo(() => {
        if (priceMemo >= 100000 && priceMemo < 200000) {
            return 20000;
        } else if (priceMemo >= 200000) {
            return 10000;
        } else if (order?.orderItemSelected?.length === 0) {
            return 0;
        } else {
            return 30000;
        }
    }, [priceMemo]);

    const priceTotalMemo = useMemo(() => {
        return (
            Number(priceMemo) -
            Number(priceDiscountMemo) +
            Number(priceDeliveryMemo)
        );
    }, [priceMemo, priceDiscountMemo, priceDeliveryMemo]);

    const handleAddCard = () => {
        if (!order?.orderItemSelected?.length) {
            toast.error('Vui lòng chọn sản phẩm để thanh toán', {
                style: { fontSize: '1.5rem' },
            });
        } else if (
            !user?.phone ||
            !user?.address ||
            !user?.name ||
            !user?.city
        ) {
            setIsOpenModalUpdateInfo(true);
        } else {
            navigate('/payment', {
                state: {
                    priceMemo,
                    priceDiscountMemo,
                    priceDeliveryMemo,
                    priceTotalMemo,
                },
            });
        }
    };

    const mutationUpdate = useMutationHook((data) => {
        const { id, access_token, ...rests } = data;
        return UserService.updateUser(id, rests, access_token);
    });

    const { data } = mutationUpdate;

    const itemDelivery = [
        {
            title: '30.000 VND',
            description: 'Dưới 100.000 VND',
        },
        {
            title: '20.000 VND',
            description: 'Từ 100.000 VND đến dưới 200.000 VND',
        },
        {
            title: '10.000 VND',
            description: 'Trên 200.000 VND',
        },
    ];

    return (
        <div
            style={{
                backgroundColor: '#f0f0f5',
                width: '100%',
                minHeight: '100vh',
                padding: '20px',
            }}
        >
            <h1 style={{ marginBottom: '10px' }}>Giỏ hàng</h1>
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
                        <StepsComponent
                            items={itemDelivery}
                            current={
                                priceDeliveryMemo === 20000
                                    ? 2
                                    : priceDeliveryMemo === 30000
                                    ? 1
                                    : order.orderItemSelected.length === 0
                                    ? 0
                                    : 3
                            }
                        />
                        {/* Header */}
                        <Row
                            style={{
                                borderBottom: '1px solid #ddd',
                                paddingBottom: '10px',
                                marginBottom: '15px',
                                marginTop: '20px',
                            }}
                        >
                            <Col span={4}>
                                <Checkbox
                                    onChange={handleOnchangeCheckAll}
                                    checked={
                                        listChecked?.length ===
                                        order?.orderItems?.length
                                    }
                                >
                                    Tất cả ({order?.orderItems?.length}) sản
                                    phẩm
                                </Checkbox>
                            </Col>
                            <Col
                                span={4}
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    marginRight: '25px',
                                }}
                            >
                                Tên sản phẩm
                            </Col>

                            <Col
                                span={4}
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    marginRight: '25px',
                                }}
                            >
                                Đơn giá
                            </Col>
                            <Col
                                span={4}
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    marginRight: '35px',
                                }}
                            >
                                Số lượng
                            </Col>
                            <Col
                                span={4}
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                }}
                            >
                                Thành tiền
                            </Col>

                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                style={{ fontSize: '16px', marginLeft: '30px' }}
                                onClick={handleRemoveAllOrder}
                            />
                        </Row>

                        {/* Sản phẩm */}
                        {order?.orderItems?.map((order) => {
                            return (
                                <Row
                                    key={order?.id}
                                    style={{
                                        marginBottom: '15px',
                                        alignItems: 'center',
                                        borderBottom: '1px solid #ddd',
                                        paddingBottom: '10px',
                                    }}
                                >
                                    <Col span={1}>
                                        <Checkbox
                                            onChange={onChange}
                                            value={order?.product}
                                            checked={listChecked.includes(
                                                order?.product,
                                            )}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <img
                                            src={order?.image}
                                            alt="Sản phẩm"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </Col>
                                    <Col span={5}>
                                        <div>{order?.name}</div>
                                    </Col>
                                    <Col span={4}>
                                        <div
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#ff4d4f',
                                            }}
                                        >
                                            {convertPrice(order?.price)}
                                        </div>
                                    </Col>
                                    <Col
                                        span={4}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                            }}
                                        >
                                            <Button
                                                icon={<MinusOutlined />}
                                                size="small"
                                                style={{ marginRight: '5px' }}
                                                onClick={() =>
                                                    handleChangeCount(
                                                        'decrease',
                                                        order?.product,
                                                        order?.amount === 1,
                                                    )
                                                }
                                            />
                                            <InputNumber
                                                defaultValue={order?.amount}
                                                value={order?.amount}
                                                size="small"
                                                style={{
                                                    width: '50px',
                                                    textAlign: 'center',
                                                }}
                                                controls={false}
                                                min={1}
                                                max={order?.countInStock}
                                            />
                                            <Button
                                                icon={<PlusOutlined />}
                                                size="small"
                                                style={{ marginLeft: '5px' }}
                                                onClick={() =>
                                                    handleChangeCount(
                                                        'increase',
                                                        order?.product,
                                                        order?.amount ===
                                                            order.countInStock,
                                                    )
                                                }
                                            />
                                        </div>
                                    </Col>
                                    <Col
                                        span={4}
                                        style={{
                                            textAlign: 'center',
                                            color: '#ff4d4f',
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>
                                            {convertPrice(
                                                order?.price * order?.amount,
                                            )}
                                        </div>
                                    </Col>
                                    <Col
                                        span={2}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            danger
                                            style={{ fontSize: '16px' }}
                                            onClick={() =>
                                                handleDeleteOrder(
                                                    order?.product,
                                                )
                                            }
                                        />
                                    </Col>
                                </Row>
                            );
                        })}
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
                            <Col style={{ color: '#ff4d4f', fontSize: '20px' }}>
                                {convertPrice(priceTotalMemo)}
                            </Col>
                        </Row>
                        <Button
                            type="primary"
                            style={{
                                width: '100%',
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                height: '40px',
                            }}
                            onClick={handleAddCard}
                        >
                            Mua hàng
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default OrderPage;
