import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Checkbox, Button, InputNumber, Form } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    decreaseAmount,
    increaseAmount,
    removeAllBorrowProduct,
    removeBorrowProduct,
    selectedBorrow,
} from '../../redux/slides/borrowSlide';
import { convertPrice } from '../../ultils';
import styles from './BorrowPage.module.scss';
import { useMutationHook } from '../../hooks/useMutationHook';
import * as UserService from '../../services/UserService.js';
import * as BorrowService from '../../services/BorrowService.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import StepsComponent from '../../components/StepsComponent/StepsComponent.jsx';
import Loading from '../../components/LoadingComponent/Loading.jsx';

const BorrowPage = () => {
    const [listChecked, setListChecked] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stateUserDetail, setStateUserDetail] = useState({
        name: '',
        phone: '',
        address: '',
    });
    const borrow = useSelector((state) => state.borrow);
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(stateUserDetail);
    }, [stateUserDetail, form]);

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
        dispatch(removeBorrowProduct({ idProduct }));
    };

    const handleOnchangeCheckAll = (e) => {
        if (e.target.checked) {
            const newListChecked = [];
            borrow?.borrowItems?.forEach((item) => {
                newListChecked.push(item?.product);
            });
            setListChecked(newListChecked);
        } else {
            setListChecked([]);
        }
    };

    useEffect(() => {
        dispatch(selectedBorrow({ listChecked }));
    }, [listChecked]);

    const handleRemoveAllOrder = () => {
        if (listChecked?.length > 0) {
            dispatch(removeAllBorrowProduct({ listChecked }));
        }
    };

    const priceMemo = useMemo(() => {
        const result = borrow?.borrowItemSelected.reduce((total, cur) => {
            return total + cur.price * cur.amount;
        }, 0);
        return result;
    }, [borrow]);

    const priceTotalMemo = useMemo(() => {
        return Number(priceMemo);
    }, [priceMemo]);

    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const borrowDateRange = useMemo(() => {
        if (!borrow?.borrowItemSelected?.length)
            return { start: 'Chưa chọn', end: 'Chưa chọn' };

        let borrowDates = borrow.borrowItemSelected.map((item) =>
            new Date(item.borrowDate).getTime(),
        );
        let returnDates = borrow.borrowItemSelected.map((item) =>
            new Date(item.returnDate).getTime(),
        );

        return {
            start: borrowDates.length
                ? formatDate(Math.min(...borrowDates))
                : 'Chưa chọn',
            end: returnDates.length
                ? formatDate(Math.max(...returnDates))
                : 'Chưa chọn',
        };
    }, [borrow.borrowItemSelected]);

    const handleAddCard = () => {
        if (!user?.access_token) {
            toast.error('Bạn cần đăng nhập để thuê sách.', {
                style: { fontSize: '1.5rem' },
            });
            return;
        }

        if (!borrow?.borrowItemSelected?.length) {
            toast.error('Vui lòng chọn ít nhất một cuốn sách để thuê.', {
                style: { fontSize: '1.5rem' },
            });
            return;
        }

        if (!user?.name || !user?.address || !user?.phone) {
            toast.error(
                'Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi thuê.',
                { style: { fontSize: '1.5rem' } },
            );
            return;
        }

        setIsLoading(true); // Bật trạng thái loading khi bắt đầu đặt thuê

        mutationAddBorrow.mutate(
            {
                access_token: user?.access_token,
                borrowItems: borrow?.borrowItemSelected,
                borrowAddress: {
                    fullName: user?.name,
                    phone: user?.phone,
                    address: user?.address,
                },
                borrowDate: new Date(
                    borrowDateRange.start.split('-').reverse().join('-'),
                ),
                returnDate: new Date(
                    borrowDateRange.end.split('-').reverse().join('-'),
                ),
                totalPrice: priceTotalMemo,

                userId: user?.id,
                email: user?.email,
            },
            {
                onSuccess: (data) => {
                    if (data?.status === 'OK') {
                        localStorage.removeItem('cartBook_' + user?.id);
                        dispatch(removeAllBorrowProduct({ listChecked }));
                        toast.success(
                            'Thuê thành công. Hãy đến cửa hàng sớm nhất có thể nhé !',
                            {
                                style: { fontSize: '1.5rem' },
                            },
                        );

                        console.log('Navigating to BorrowSuccess with data:', {
                            borrows: borrow?.borrowItemSelected,
                            borrowDate: borrow?.borrowDate,
                            returnDate: borrow?.returnDate,
                        });

                        navigate('/borrowSuccess', {
                            state: {
                                borrows: borrow?.borrowItemSelected,
                                borrowDateRange,
                                priceTotalMemo: priceTotalMemo,
                            },
                        });
                    } else {
                        toast.error('Đặt thuê thất bại. Vui lòng thử lại.', {
                            style: { fontSize: '1.5rem' },
                        });
                    }
                },
                onError: (error) => {
                    console.error('Lỗi khi đặt thuê:', error);
                    toast.error('Lỗi khi đặt thuê. Vui lòng kiểm tra lại.', {
                        style: { fontSize: '1.5rem' },
                    });
                },
                onSettled: () => {
                    setIsLoading(false); // Tắt loading sau khi hoàn thành
                },
            },
        );
    };

    const mutationAddBorrow = useMutationHook((data) => {
        const { access_token, ...rests } = data;
        return BorrowService.createBorrow({ ...rests }, access_token);
    });

    const mutationUpdate = useMutationHook((data) => {
        const { id, access_token, ...rests } = data;
        return UserService.updateUser(id, rests, access_token);
    });

    const { data } = mutationUpdate;
    const { data: dataAdd, isSuccess, isError } = mutationAddBorrow;

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
        <Loading isLoading={isLoading}>
            <div
                style={{
                    backgroundColor: '#f0f0f5',
                    width: '100%',
                    minHeight: '100vh',
                    padding: '20px',
                }}
            >
                <h1 style={{ marginBottom: '10px' }}>Giỏ sách</h1>
                <Row gutter={16}>
                    {/* Phần bên trái: Danh sách sản phẩm */}

                    <Col span={19}>
                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '5px',
                            }}
                        >
                            {/* <StepsComponent
                            items={itemDelivery}
                            current={
                                priceDeliveryMemo === 20000
                                    ? 2
                                    : priceDeliveryMemo === 30000
                                    ? 1
                                    : borrow.borrowItemSelected.length === 0
                                    ? 0
                                    : 3
                            }
                        /> */}
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
                                            borrow?.borrowItems?.length
                                        }
                                    >
                                        Tất cả ({borrow?.borrowItems?.length})
                                        sản phẩm
                                    </Checkbox>
                                </Col>
                                <Col
                                    span={3}
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        marginRight: '25px',
                                    }}
                                >
                                    Tên sản phẩm
                                </Col>

                                <Col
                                    span={3}
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        marginRight: '25px',
                                    }}
                                >
                                    Đơn giá
                                </Col>
                                <Col
                                    span={3}
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        marginRight: '35px',
                                    }}
                                >
                                    Số lượng
                                </Col>
                                <Col
                                    span={3}
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        // marginLeft: '75px',
                                    }}
                                >
                                    Ngày mượn
                                </Col>

                                <Col
                                    span={3}
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        // marginLeft: '75px',
                                    }}
                                >
                                    Ngày trả
                                </Col>

                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    danger
                                    style={{
                                        fontSize: '16px',
                                        marginLeft: '57px',
                                    }}
                                    onClick={handleRemoveAllOrder}
                                />
                            </Row>

                            {/* Sản phẩm */}
                            {borrow?.borrowItems?.map((order) => {
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
                                        <Col span={3}>
                                            <div>{order?.name}</div>
                                        </Col>
                                        <Col span={3}>
                                            <div
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: '#ff4d4f',
                                                    marginLeft: '20px',
                                                }}
                                            >
                                                {convertPrice(order?.price)}
                                            </div>
                                        </Col>
                                        <Col
                                            span={5}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    marginLeft: '25px',
                                                }}
                                            >
                                                <Button
                                                    icon={<MinusOutlined />}
                                                    size="small"
                                                    style={{
                                                        marginRight: '5px',
                                                    }}
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
                                                    style={{
                                                        marginLeft: '5px',
                                                    }}
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
                                            span={3}
                                            style={{
                                                textAlign: 'center',
                                                color: '#ff4d4f',
                                                marginLeft: '-53px',
                                            }}
                                        >
                                            {order?.borrowDate
                                                ? formatDate(order.borrowDate)
                                                : 'Chưa chọn'}{' '}
                                        </Col>
                                        <Col
                                            span={3}
                                            style={{
                                                textAlign: 'center',
                                                color: '#ff4d4f',
                                                marginLeft: '4px',
                                            }}
                                        >
                                            {order?.returnDate
                                                ? formatDate(order.returnDate)
                                                : 'Chưa chọn'}
                                        </Col>
                                        <Col
                                            span={2}
                                            style={{
                                                textAlign: 'center',
                                                marginLeft: '20px',
                                            }}
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
                    <Col span={5}>
                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '5px',
                            }}
                        >
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
                                <Col>Ngày mượn</Col>
                                <Col>{borrowDateRange.start}</Col>
                            </Row>
                            <Row
                                justify="space-between"
                                style={{ marginBottom: '20px' }}
                            >
                                <Col>Ngày trả</Col>
                                <Col>{borrowDateRange.end}</Col>
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
                                Thuê
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </Loading>
    );
};

export default BorrowPage;
