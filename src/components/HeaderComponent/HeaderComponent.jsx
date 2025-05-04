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
import { toast } from 'react-toastify';
import image1 from '../../assets/images/booktech-Photoroom.png';
import {
    resetWishlist,
    searchProduct,
    setWishlist,
} from '../../redux/slides/productSlide.js';
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
    const wishlist = useSelector((state) => state.product.wishlist) || [];
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
                localStorage.setItem(
                    'cart_' + user?.id,
                    JSON.stringify(order?.orderItems),
                );
                localStorage.setItem(
                    'cartBook_' + user?.id,
                    JSON.stringify(borrow?.borrowItems),
                );
                localStorage.setItem(
                    'wishlist_' + user?.id,
                    JSON.stringify(wishlist),
                );
                localStorage.removeItem('access_token');
                dispatch(resetUser());
                dispatch(resetOrderItem());
                dispatch(resetBorrowItem());
                dispatch(resetWishlist());
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

        const savedCart = localStorage.getItem('cart_' + user?.id);
        if (savedCart) {
            dispatch(setOrderItems(JSON.parse(savedCart)));
        }

        const savedCartBook = localStorage.getItem('cartBook_' + user?.id);
        if (savedCartBook) {
            dispatch(setBorrowItems(JSON.parse(savedCartBook)));
        }

        const savedWishlist = localStorage.getItem('wishlist_' + user?.id);
        if (savedWishlist) {
            dispatch(setWishlist(JSON.parse(savedWishlist)));
        }
    }, [user?.name, user?.avatar, user?.id]);

    const content = (
        <div className={styles.popoverContent}>
            {user?.isAdmin && (
                <p
                    className={styles.wrapperAdmin}
                    onClick={() => navigate('/')}
                >
                    Quản lý giao diện
                </p>
            )}
            {user?.isAdmin && (
                <p
                    className={styles.wrapperAdmin}
                    onClick={() => navigate('/system/admin')}
                >
                    Quản lý hệ thống
                </p>
            )}
            <p
                className={styles.wrapperPopover}
                onClick={() => navigate('/profile-user')}
            >
                Thông tin người dùng
            </p>
            <p
                className={styles.wrapperPopover}
                onClick={() =>
                    navigate('/my-borrow', {
                        state: {
                            id: user?.id,
                            access_token: user?.access_token,
                        },
                    })
                }
            >
                Danh sách thuê sách
            </p>
            <p
                className={styles.wrapperPopover}
                onClick={() => navigate('/wishlist')}
            >
                WishList
            </p>
            <p className={styles.wrapperPopoverLogout} onClick={handleLogout}>
                Đăng xuất
            </p>
        </div>
    );

    const onSearch = (e) => {
        setSearch(e.target.value);
        dispatch(searchProduct(e.target.value));
    };

    const menu = (
        <Menu className={styles.dropdownMenu}>
            {typeProduct.map((item, index) => (
                <Menu.Item key={index} className={styles.menuItem}>
                    <TypeProduct name={item} />
                </Menu.Item>
            ))}
        </Menu>
    );

    const cartMenu = (
        <Menu className={styles.dropdownMenu}>
            <Menu.Item
                key="cart"
                className={styles.menuItem}
                onClick={() => navigate('/order')}
            >
                <Badge count={order?.orderItems?.length} size="small">
                    <ShoppingCartOutlined className={styles.cartIcon} />
                </Badge>
                <span style={{ marginLeft: '8px' }}>Giỏ hàng</span>
            </Menu.Item>
            <Menu.Item
                key="borrow"
                className={styles.menuItem}
                onClick={() => navigate('/borrow')}
            >
                <Badge count={borrow?.borrowItems?.length} size="small">
                    <ShoppingOutlined className={styles.cartIcon} />
                </Badge>
                <span style={{ marginLeft: '8px' }}>Giỏ sách</span>
            </Menu.Item>
        </Menu>
    );

    const handleLink = () => {
        navigate('/');
    };

    return (
        <div className={styles.headerContainer}>
            <div
                className={styles.wrappperHeader}
                style={{
                    justifyContent:
                        isHiddenSearch && isHiddenCart
                            ? 'space-between'
                            : 'unset',
                }}
            >
                <Col span={6} className={styles.logoContainer}>
                    <div
                        className={styles.wrappperHeaderLink}
                        onClick={handleLink}
                    >
                        <img
                            src={image1}
                            className={styles.wrappperHeaderImg}
                            alt="Logo"
                        />
                    </div>
                </Col>

                {!isHidden && (
                    <div className={styles.menuContainer}>
                        <Col>
                            <div
                                onClick={() => navigate('/')}
                                className={styles.wrapperHome}
                            >
                                Trang chủ
                            </div>
                        </Col>

                        <Col>
                            <Dropdown
                                overlay={menu}
                                trigger={['hover']}
                                align={{ offset: [-60, 15] }}
                            >
                                <Button className={styles.wrapperCategory}>
                                    Sản phẩm
                                </Button>
                            </Dropdown>
                        </Col>

                        <Col>
                            <div
                                onClick={() =>
                                    navigate('/my-order', {
                                        state: {
                                            id: user?.id,
                                            access_token: user?.access_token,
                                        },
                                    })
                                }
                                className={styles.wrapperMyOrder}
                            >
                                Đơn hàng của tôi
                            </div>
                        </Col>

                        <Col>
                            <div
                                onClick={() => navigate('/rule')}
                                className={styles.wrapperMyOrder}
                            >
                                Quy định
                            </div>
                        </Col>
                    </div>
                )}

                {!isHiddenSearch && (
                    <Col className={styles.searchContainer}>
                        <ButtonInputSearch
                            size="large"
                            placeholder="Bạn đang muốn tìm sách gì?"
                            textButton="Tìm kiếm"
                            className={styles.searchInput}
                            onChange={onSearch}
                        />
                    </Col>
                )}

                <Col className={styles.accountCartContainer}>
                    <Loading isLoading={isSubmitting}>
                        <div className={styles.wrapperHeaderAccount}>
                            {useravatar ? (
                                <img
                                    src={useravatar}
                                    alt="Avatar"
                                    className={styles.avatar}
                                />
                            ) : (
                                <UserOutlined className={styles.userIcon} />
                            )}
                            {user?.access_token ? (
                                <Popover content={content} trigger="click">
                                    <div className={styles.accountName}>
                                        {username?.length
                                            ? username
                                            : user?.email}
                                        <CaretDownOutlined
                                            className={styles.dropdownIcon}
                                        />
                                    </div>
                                </Popover>
                            ) : (
                                <div
                                    className={styles.loginRegister}
                                    onClick={handleLogin}
                                >
                                    <span>Đăng nhập/Đăng ký</span>
                                    <div>
                                        <span>Tài khoản</span>
                                        <CaretDownOutlined
                                            className={styles.dropdownIcon}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Loading>

                    {!isHiddenCart && (
                        <Dropdown
                            overlay={cartMenu}
                            trigger={['hover']}
                            align={{ offset: [-20, 5] }}
                        >
                            <div className={styles.wrapperCart}>
                                <Badge
                                    count={order?.orderItems?.length}
                                    size="small"
                                    className={styles.cartBadge}
                                >
                                    <ShoppingCartOutlined
                                        className={styles.cartIcon}
                                    />
                                </Badge>
                                <span className={styles.cartText}>
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
