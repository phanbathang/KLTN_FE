import React from 'react';
import { Row, Col, Button, Card, Empty, Tag } from 'antd';
import { HeartFilled, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../../redux/slides/productSlide.js';
import { convertPrice } from '../../ultils';
import styles from './WishListPage.module.scss';

const { Meta } = Card;

const WishListPage = () => {
    const wishlist = useSelector((state) => state.product.wishlist);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleViewDetail = (id) => {
        navigate(`/product-detail/${id}`);
    };

    const handleRemove = (id) => {
        dispatch(removeFromWishlist(id));
    };

    return (
        <div className={styles.wishlistContainer}>
            <div className={styles.wishlistHeader}>
                <h1>
                    {/* <HeartFilled className={styles.heartIcon} /> */}
                    Danh sách yêu thích
                </h1>
                <p className={styles.itemCount}>
                    {wishlist.length}{' '}
                    {wishlist.length > 1 ? 'sản phẩm' : 'sản phẩm'}
                </p>
            </div>

            {wishlist.length > 0 ? (
                <Row gutter={[24, 24]} className={styles.wishlistGrid}>
                    {wishlist.map((product) => (
                        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                className={styles.productCard}
                                cover={
                                    <div className={styles.imageContainer}>
                                        <img
                                            alt={product.name}
                                            src={product.image}
                                            className={styles.productImage}
                                        />
                                    </div>
                                }
                                actions={[
                                    <EyeOutlined
                                        key="view"
                                        className={styles.actionIcon}
                                        onClick={() =>
                                            handleViewDetail(product.id)
                                        }
                                    />,
                                    <DeleteOutlined
                                        key="delete"
                                        className={styles.actionIcon}
                                        onClick={() => handleRemove(product.id)}
                                    />,
                                ]}
                            >
                                <Meta
                                    title={
                                        <span className={styles.productName}>
                                            {product.name}
                                        </span>
                                    }
                                    description={
                                        <>
                                            <div
                                                className={
                                                    styles.priceContainer
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.currentPrice
                                                    }
                                                >
                                                    {convertPrice(
                                                        product.price,
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className={styles.emptyState}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className={styles.emptyText}>
                                Danh sách yêu thích của bạn trống
                            </span>
                        }
                    >
                        <Button
                            className={styles.shopNowButton}
                            onClick={() => navigate('/')}
                        >
                            Mua sắm ngay
                        </Button>
                    </Empty>
                </div>
            )}
        </div>
    );
};

export default WishListPage;
