import React, { useEffect, useState } from 'react';
import { Badge, Button, Col, Dropdown, message, Popover, Menu } from 'antd';
import {
    UserOutlined,
    CaretDownOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import styles from './style.module.scss';
import ButtonInputSearch from '../ButtonInputSearch/ButtonInputSearch';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../services/UserService.js';
import { resetUser } from '../../redux/slides/userSlide.js';
import Loading from '../LoadingComponent/Loading.jsx';
import { Bounce, toast } from 'react-toastify';
import image1 from '../../assets/images/booktech-Photoroom.png';
import { searchProduct } from '../../redux/slides/productSlide.js';
import * as ProductService from '../../services/ProductService';
import TypeProduct from '../TypeProduct/TypeProduct.jsx';
import {
    resetOrderItem,
    setOrderItems,
} from '../../redux/slides/orderSlide.js';
import {
    resetBorrowItem,
    setBorrowItems,
} from '../../redux/slides/borrowSlide.js';

const HeaderComponent = ({
    isHiddenSearch = false,
    isHiddenCart = false,
    isHidden = false,
}) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [useravatar, setUseravatar] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const order = useSelector((state) => state.order);
    const borrow = useSelector((state) => state.borrow);
    const [search, setSearch] = useState('');
    const [typeProduct, setTypeProduct] = useState([]);

    const fetchAllTypeProduct = async () => {
        const res = await ProductService.getAllTypeProduct();
        if (res?.status === 'OK') {
            setTypeProduct(res?.data);
        }
    };

    useEffect(() => {
        fetchAllTypeProduct();
    }, []);

    const handleLogin = () => {
        navigate('/sign-in');
    };

    const handleLogout = async () => {
        const response = await UserService.logoutUser();
        if (response.status === 'OK') {
            setIsSubmitting(true);
            setTimeout(() => {
                // Lưu giỏ hàng vào localStorage trước khi đăng xuất
                localStorage.setItem(
                    'cart_' + user?.id,
                    JSON.stringify(order?.orderItems),
                );

                // Lưu giỏ sách vào localStorage trước khi đăng xuất
                localStorage.setItem(
                    'cartBook_' + user?.id,
                    JSON.stringify(borrow?.borrowItems),
                );

                localStorage.removeItem('access_token'); // Xóa access_token
                dispatch(resetUser());
                dispatch(resetOrderItem());
                dispatch(resetBorrowItem());
                toast.success('Đã đăng xuất', {
                    style: { fontSize: '1.5rem' },
                });
                setIsSubmitting(false);
            }, 1000);
        } else {
            console.error('Logout API failed:', response.message);
        }
    };

    useEffect(() => {
        setIsSubmitting(true);
        setUsername(user?.name);
        setUseravatar(user?.avatar);
        setIsSubmitting(false);

        // Kiểm tra nếu có giỏ hàng cũ trong localStorage
        const savedCart = localStorage.getItem('cart_' + user?.id);
        if (savedCart) {
            dispatch(setOrderItems(JSON.parse(savedCart))); // Cập nhật giỏ hàng vào Redux
        }

        // Kiểm tra nếu có giỏ sách cũ trong localStorage
        const savedCartBook = localStorage.getItem('cartBook_' + user?.id);
        if (savedCartBook) {
            dispatch(setBorrowItems(JSON.parse(savedCartBook))); // Cập nhật giỏ sách vào Redux
        }
    }, [user?.name, user?.avatar, user?.id]);

    const content = (
        <div>
            {user?.isAdmin && (
                <p
                    className={styles.WrapperAdmin}
                    onClick={() => navigate('/')}
                >
                    Quản lý giao diện
                </p>
            )}
            {user?.isAdmin && (
                <p
                    className={styles.WrapperAdmin}
                    onClick={() => navigate('/system/admin')}
                >
                    Quản lý hệ thống
                </p>
            )}
            <p
                className={styles.WrapperPopover}
                onClick={() => navigate('/profile-user')}
            >
                Thông tin người dùng
            </p>

            <p
                className={styles.WrapperPopover}
                onClick={() =>
                    navigate('/my-borrow', {
                        state: {
                            id: user?.id,
                            access_token: user?.access_token,
                        },
                    })
                }
            >
                Danh sách mượn sách
            </p>

            <p className={styles.WrapperPopoverLogout} onClick={handleLogout}>
                Đăng xuất
            </p>
        </div>
    );

    const onSearch = (e) => {
        setSearch(e.target.value);
        dispatch(searchProduct(e.target.value));
    };

    const menu = (
        <Menu style={{ backgroundColor: '#f0f0f0' }}>
            {typeProduct.map((item, index) => (
                <Menu.Item
                    key={index}
                    style={{
                        display: 'block',
                        padding: '15px ',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    <TypeProduct name={item} />
                </Menu.Item>
            ))}
        </Menu>
    );

    const borrowCart = (
        <Menu
            className={styles.WrapperBorrowCart}
            style={{
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                width: '120px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
            }}
            onClick={() => navigate('/borrow')}
        >
            <Menu.Item key="borrow" onClick={() => navigate('/borrow')}>
                <Badge count={borrow?.borrowItems?.length} size="small">
                    <ShoppingOutlined style={{ fontSize: '20px' }} />
                </Badge>
                <span style={{ marginLeft: '5px' }}>Giỏ sách</span>
            </Menu.Item>
        </Menu>
    );

    const handleLink = () => {
        navigate('/');
    };

    return (
        <div>
            <div
                className={styles.WrappperHeader}
                gutter={16}
                style={{
                    justifyContent:
                        isHiddenSearch && isHiddenSearch
                            ? 'space-between'
                            : 'unset',
                }}
            >
                <Col span={6} style={{ paddingLeft: '40px' }}>
                    <div
                        className={styles.WrappperHeaderLink}
                        onClick={handleLink}
                    >
                        <img
                            src={image1}
                            className={styles.WrappperHeaderImg}
                            alt="img"
                        />
                    </div>
                </Col>

                {!isHidden && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '-130px',
                        }}
                    >
                        <Col>
                            <div
                                onClick={() => {
                                    navigate('/');
                                }}
                                className={styles.WrapperHome}
                            >
                                Trang chủ
                            </div>
                        </Col>

                        <Col>
                            <Dropdown
                                overlay={menu}
                                trigger={['hover']}
                                align={{ offset: [-45, 5] }}
                            >
                                <Button className={styles.WrapperCategory}>
                                    Sản phẩm
                                </Button>
                            </Dropdown>
                        </Col>

                        <Col span={2}>
                            <div
                                onClick={() =>
                                    navigate('/my-order', {
                                        state: {
                                            id: user?.id,
                                            access_token: user?.access_token,
                                        },
                                    })
                                }
                                className={styles.WrapperMyOrder}
                            >
                                Đơn hàng của tôi
                            </div>
                        </Col>
                    </div>
                )}

                {!isHiddenSearch && (
                    <Col
                        span={6}
                        style={{ margin: 'auto', position: 'relative' }}
                    >
                        <ButtonInputSearch
                            size="large"
                            placeholder="Bạn đang muốn tìm sách gì ?"
                            textButton="Tìm kiếm"
                            style={{ height: '38px' }}
                            onChange={onSearch}
                        />
                    </Col>
                )}

                <Col span={6} style={{ display: 'flex', alignItems: 'center' }}>
                    <Loading isLoading={isSubmitting}>
                        <div className={styles.WrapperHeaderAccount}>
                            {useravatar ? (
                                <img
                                    src={useravatar}
                                    alt="avatar"
                                    style={{
                                        height: '50px',
                                        width: '50px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <UserOutlined style={{ fontSize: '30px' }} />
                            )}
                            {user?.access_token ? (
                                <>
                                    <Popover content={content} trigger="click">
                                        <div
                                            style={{
                                                cursor: 'pointer',
                                                width: '109px',
                                            }}
                                        >
                                            {username?.length
                                                ? username
                                                : user?.email}
                                        </div>
                                    </Popover>
                                </>
                            ) : (
                                <div
                                    style={{
                                        margin: 'auto',
                                        cursor: 'pointer',
                                    }}
                                    onClick={handleLogin}
                                >
                                    <span className={styles.WrappperHeaderText}>
                                        Đăng nhập/Đăng ký
                                    </span>
                                    <div>
                                        <span
                                            className={
                                                styles.WrappperHeaderText
                                            }
                                        >
                                            Tài khoản
                                        </span>
                                        <CaretDownOutlined />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Loading>

                    {!isHiddenCart && (
                        <Dropdown
                            overlay={borrowCart}
                            trigger={['hover']}
                            align={{ offset: [-20, 5] }}
                        >
                            <div
                                className={styles.WrapperCart}
                                onClick={() => navigate('/order')}
                            >
                                <Badge
                                    count={order?.orderItems?.length}
                                    size="small"
                                >
                                    <ShoppingCartOutlined
                                        style={{
                                            fontSize: '30px',
                                            color: '#fff',
                                        }}
                                    />
                                </Badge>
                                <span className={styles.WrappperHeaderText}>
                                    Giỏ hàng
                                </span>
                            </div>
                        </Dropdown>
                    )}
                </Col>
            </div>
        </div>
    );
};

export default HeaderComponent;
