import React, { useEffect, useState } from 'react';
import {
    Col,
    Image,
    InputNumber,
    Row,
    Rate,
    Input,
    Button,
    List,
    Avatar,
    Menu,
    Dropdown,
    Switch,
} from 'antd';
import styles from './ProductDetailComponent.module.scss';
import {
    MinusOutlined,
    MoreOutlined,
    PlusOutlined,
    SwapOutlined,
    HeartFilled,
    HeartOutlined,
} from '@ant-design/icons';
import ButtonComponents from '../ButtonComponents/ButtonComponents';
import * as ProductService from '../../services/ProductService.js';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addOrderProduct, resetOrder } from '../../redux/slides/orderSlide.js';
import { convertPrice, formatDescription } from '../../ultils.js';
import { toast } from 'react-toastify';
import { addBorrowProduct } from '../../redux/slides/borrowSlide.js';
import {
    addToWishlist,
    removeFromWishlist,
} from '../../redux/slides/productSlide.js';

const { TextArea } = Input;

const ProductDetailComponent = ({ idProduct }) => {
    const user = useSelector((state) => state.user);
    const order = useSelector((state) => state.order);
    const wishlist = useSelector((state) => state.product.wishlist);
    const [errorOrderLimit, setErrorOrderLimit] = useState(false);
    const [numProduct, setNumProduct] = useState(1);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const [borrowDuration, setBorrowDuration] = useState(1); // Thêm state cho số ngày mượn
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const onChange = (value) => {
        setNumProduct(Number(value));
    };
    const fetchGetDetailProduct = async (context) => {
        const id = context?.queryKey && context?.queryKey[1];
        if (id) {
            const res = await ProductService.getDetailProduct(id);
            return res.data;
        }
    };

    const handleChangeCount = (type, limited) => {
        if (type === 'increase') {
            if (!limited) {
                setNumProduct(numProduct + 1);
            }
        } else {
            if (!limited) {
                setNumProduct(numProduct - 1);
            }
        }
    };

    const { isLoading, data: productDetails } = useQuery({
        queryKey: ['product-detail', idProduct],
        queryFn: fetchGetDetailProduct,
        enabled: !!idProduct,
    });

    const [isForSale, setIsForSale] = useState(true);
    const [isForRent, setIsForRent] = useState(productDetails?.isForRent);
    const [displayPrice, setDisplayPrice] = useState(productDetails?.price);

    const handleToggle = () => {
        if (isForSale) {
            // Nếu đang là bán, chuyển sang thuê
            setIsForSale(false);
            setIsForRent(true);
            setDisplayPrice(productDetails?.rentalPrice);
        } else {
            // Nếu đang là thuê, chuyển sang bán
            setIsForSale(true);
            setIsForRent(false);
            setDisplayPrice(productDetails?.price);
        }
    };

    useEffect(() => {
        setDisplayPrice(
            isForSale ? productDetails?.price : productDetails?.rentalPrice,
        );
    }, [productDetails, isForSale]);

    const handleAddOrderProduct = () => {
        if (!user?.id) {
            navigate('/sign-in', { state: location.pathname });
        } else {
            const orderRedux = order?.orderItems?.find(
                (item) => item.product === productDetails?._id,
            );
            if (
                orderRedux?.amount + numProduct <= orderRedux?.countInStock ||
                (!orderRedux && productDetails?.countInStock > 0)
            ) {
                dispatch(
                    addOrderProduct({
                        orderItem: {
                            name: productDetails?.name,
                            amount: numProduct,
                            type: productDetails?.type,
                            image: productDetails?.image,
                            price: productDetails?.price,
                            product: productDetails?._id,
                            discount: productDetails?.discount,
                            countInStock: productDetails?.countInStock,
                        },
                    }),
                );
            } else {
                setErrorOrderLimit(true);
            }
        }
    };

    const handleBuyOrderProduct = () => {
        if (!user?.id) {
            navigate('/sign-in', { state: location.pathname });
        } else {
            const orderRedux = order?.orderItems?.find(
                (item) => item.product === productDetails?._id,
            );
            if (
                orderRedux?.amount + numProduct <= orderRedux?.countInStock ||
                (!orderRedux && productDetails?.countInStock > 0)
            ) {
                dispatch(
                    addOrderProduct({
                        orderItem: {
                            name: productDetails?.name,
                            amount: numProduct,
                            type: productDetails?.type,
                            image: productDetails?.image,
                            price: productDetails?.price,
                            product: productDetails?._id,
                            discount: productDetails?.discount,
                            countInStock: productDetails?.countInStock,
                        },
                    }),
                );
                navigate('/order');
            } else {
                setErrorOrderLimit(true);
            }
        }
    };

    const handleAddBorrowProduct = () => {
        if (!user?.id) {
            navigate('/sign-in', { state: location.pathname });
        } else {
            const borrowDate = new Date();
            const returnDate = new Date(borrowDate);
            returnDate.setDate(borrowDate.getDate() + borrowDuration);

            dispatch(
                addBorrowProduct({
                    borrowItem: {
                        name: productDetails?.name || 'Không có tên',
                        amount: numProduct || 1,
                        image: productDetails?.image || '',
                        price: productDetails?.rentalPrice || 0,
                        product: productDetails?._id,
                        discount: productDetails?.discount || 0,
                        countInStock: productDetails?.countInStock || 0,
                        isRenting: true,
                        borrowDate: borrowDate.toISOString().split('T')[0],
                        returnDate: returnDate.toISOString().split('T')[0],
                        borrowDuration, // Thêm số ngày mượn
                    },
                }),
            );

            toast.success('Thành công thêm vào giỏ sách', {
                style: { fontSize: '15px' },
            });
        }
    };

    const handleBorrowOrderProduct = () => {
        if (!user?.id) {
            navigate('/sign-in', { state: location.pathname });
        } else {
            const borrowDate = new Date();
            const returnDate = new Date(borrowDate);
            returnDate.setDate(borrowDate.getDate() + borrowDuration);

            dispatch(
                addBorrowProduct({
                    borrowItem: {
                        name: productDetails?.name,
                        amount: numProduct,
                        image: productDetails?.image,
                        price: productDetails?.rentalPrice,
                        product: productDetails?._id,
                        discount: productDetails?.discount,
                        countInStock: productDetails?.countInStock,
                        isRenting: true,
                        borrowDate: borrowDate.toISOString().split('T')[0],
                        returnDate: returnDate.toISOString().split('T')[0],
                        borrowDuration, // Thêm số ngày mượn
                    },
                }),
            );
            navigate('/borrow');
        }
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const rentalDays = borrowDuration
        ? `${formatDate(new Date())} - ${formatDate(
              new Date(Date.now() + borrowDuration * 24 * 60 * 60 * 1000),
          )}`
        : 'Không xác định';

    const isWishlisted = wishlist.some(
        (item) => item.id === productDetails?._id,
    );

    const handleAddWishListProduct = () => {
        if (!user?.id) {
            navigate('/sign-in', { state: location.pathname });
        } else {
            if (isWishlisted) {
                dispatch(removeFromWishlist(productDetails?._id));
                toast.warning('Đã xóa khỏi danh sách yêu thích', {
                    style: { fontSize: '15px' },
                });
                console.log('Removed from wishlist:', productDetails?._id);
            } else {
                if (wishlist.length >= 10) {
                    toast.error(
                        'Danh sách yêu thích đã đầy (tối đa 10 sản phẩm)',
                        {
                            style: { fontSize: '15px' },
                        },
                    );
                    return;
                }
                const productToAdd = {
                    wishlist: {
                        id: productDetails?._id,
                        name: productDetails?.name,
                        amount: numProduct,
                        image: productDetails?.image,
                        price: productDetails?.price,
                        type: productDetails?.type,
                        discount: productDetails?.discount,
                        countInStock: productDetails?.countInStock,
                    },
                };
                dispatch(addToWishlist(productToAdd));
                toast.success('Đã thêm vào danh sách yêu thích', {
                    style: { fontSize: '15px' },
                });
                console.log('Added to wishlist:', productToAdd);
            }
        }
    };

    useEffect(() => {
        if (order.isSuccessOrder) {
            toast.success('Đã thêm vào giỏ hàng', {
                style: { fontSize: '1.5rem' },
            });
        }
        return () => {
            dispatch(resetOrder());
        };
    }, [order.isSuccessOrder]);

    useEffect(() => {
        const orderRedux = order?.orderItems?.find(
            (item) => item.product === productDetails?._id,
        );
        if (
            orderRedux?.amount + numProduct <= orderRedux?.countInStock ||
            (!orderRedux && productDetails?.countInStock > 0)
        ) {
            setErrorOrderLimit(false);
        } else if (productDetails?.countInStock === 0) {
            setErrorOrderLimit(true);
        }
    }, [numProduct]);

    //COMMENT

    useEffect(() => {
        if (!idProduct) return;

        const savedComments = localStorage.getItem(`comments-${idProduct}`);
        if (savedComments) {
            const parsedComments = JSON.parse(savedComments);
            setComments(parsedComments);
            if (parsedComments.length > 0) setShowComments(true);
        }
    }, [idProduct]);

    const handleCommentChange = (e) => {
        setComment(e.target.value);
        if (e.target.value.trim() !== '') setShowComments(true);
    };

    const handleAddComment = () => {
        if (comment.trim()) {
            const newComment = {
                id: Date.now(),
                content: comment,
                author: user?.name || 'Khách',
                avatar: user?.avatar || 'https://via.placeholder.com/40',
                timestamp: new Date().toLocaleString(), // Thêm ngày giờ
            };

            const savedComments = localStorage.getItem(`comments-${idProduct}`);
            const existingComments = savedComments
                ? JSON.parse(savedComments)
                : [];

            // Bình luận mới sẽ lên đầu
            const updatedComments = [newComment, ...existingComments];
            setComments(updatedComments);

            localStorage.setItem(
                `comments-${idProduct}`,
                JSON.stringify(updatedComments),
            );

            setComment('');
        }
    };

    const handleEditComment = (commentId, content, author) => {
        if (user?.name === author) {
            // Chỉ cho phép tác giả chỉnh sửa
            setEditingCommentId(commentId);
            setEditedComment(content);
        } else {
            toast.error('Bạn không thể chỉnh sửa bình luận này!', {
                style: { fontSize: '15px' },
            });
        }
    };

    const handleSaveEditedComment = () => {
        if (editedComment.trim()) {
            const updatedComments = comments.map((c) =>
                c.id === editingCommentId && user?.name === c.author // Chỉ cho phép tác giả lưu chỉnh sửa
                    ? { ...c, content: editedComment }
                    : c,
            );
            setComments(updatedComments);
            localStorage.setItem(
                `comments-${idProduct}`,
                JSON.stringify(updatedComments),
            );
            setEditingCommentId(null);
            setEditedComment('');
        }
    };

    const handleDeleteComment = (id, author) => {
        if (user?.isAdmin || user?.name === author) {
            const updatedComments = comments.filter(
                (comment) => comment.id !== id,
            );
            setComments(updatedComments);
            localStorage.setItem(
                `comments-${idProduct}`,
                JSON.stringify(updatedComments),
            );
        } else {
            toast.error('Bạn không có quyền xóa bình luận này!', {
                style: { fontSize: '15px' },
            });
        }
    };

    const menu = (commentId, content, author) => (
        <Menu>
            {(user?.name === author || user?.isAdmin) && (
                <>
                    {editingCommentId === commentId ? (
                        <Menu.Item key="save" onClick={handleSaveEditedComment}>
                            Lưu
                        </Menu.Item>
                    ) : (
                        <Menu.Item
                            key="edit"
                            onClick={() =>
                                handleEditComment(commentId, content, author)
                            }
                        >
                            Chỉnh sửa
                        </Menu.Item>
                    )}
                </>
            )}
            {(user?.isAdmin || user?.name === author) && (
                <Menu.Item
                    key="delete"
                    onClick={() => handleDeleteComment(commentId, author)}
                    danger
                >
                    Xóa
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <div>
            <h2 style={{ padding: '10px 0 12px 0', fontSize: '17px' }}>
                <span
                    onClick={() => {
                        navigate('/');
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    Trang chủ
                </span>{' '}
                - {productDetails?.name}
            </h2>
            <div style={{ display: 'flex' }}>
                <Row
                    style={{
                        padding: '20px 30px 20px 30px',
                        backgroundColor: '#fff',
                        width: '70%',
                    }}
                >
                    <Col span={10}>
                        <img
                            src={productDetails?.image}
                            alt="test"
                            preview="false"
                            className={styles.WrapperImage}
                        />
                    </Col>
                    <Col span={14}>
                        <div className={styles.WrapperNameProduct}>
                            {productDetails?.name}
                        </div>
                        <div>
                            <Rate
                                allowHalf
                                defaultValue={productDetails?.rating}
                                value={productDetails?.rating}
                                style={{
                                    fontSize: '14px',
                                    color: 'yellow ',
                                    marginRight: '5px',
                                }}
                            />
                            <span className={styles.WrapperTextSell}>
                                | Đã bán {productDetails?.selled || 0}+
                            </span>

                            <div className={styles.WrapperPriceProduct}>
                                <h1>{convertPrice(displayPrice)}</h1>
                                <span
                                    style={{
                                        backgroundColor: 'rgb(245, 245, 250)',
                                        padding: '5px',
                                        marginTop: '10px',
                                        fontSize: '13px',
                                    }}
                                >
                                    {isForSale
                                        ? `-${productDetails?.discount}%`
                                        : 'Giá thuê'}
                                </span>
                            </div>

                            {!isForRent && (
                                <div className={styles.WrapperAddressProduct}>
                                    <span>Giao đến </span>
                                    <span
                                        className="address"
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        {user?.address}
                                    </span>
                                </div>
                            )}
                            <div className={styles.WrapperQualityProduct}>
                                <div style={{ marginBottom: '15px' }}>
                                    {' '}
                                    Số Lượng
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button
                                        className={styles.WrapperCustomNumber}
                                        onClick={() =>
                                            handleChangeCount(
                                                'decrease',
                                                numProduct === 1,
                                            )
                                        }
                                    >
                                        <MinusOutlined size="10" />
                                    </button>
                                    <InputNumber
                                        className={styles.CustomInputNumber}
                                        min={1}
                                        max={productDetails?.countInStock}
                                        defaultValue={1}
                                        controls={false}
                                        onChange={onChange}
                                        value={numProduct}
                                    />
                                    <button
                                        className={styles.WrapperCustomNumber}
                                        onClick={() =>
                                            handleChangeCount(
                                                'increase',
                                                numProduct ===
                                                    productDetails?.countInStock,
                                            )
                                        }
                                    >
                                        <PlusOutlined size="10" />
                                    </button>
                                </div>
                            </div>

                            {!isForSale && (
                                <div className={styles.WrapperQualityProduct}>
                                    <div style={{ marginBottom: '15px' }}>
                                        Thời gian mượn (ngày)
                                    </div>
                                    <InputNumber
                                        min={1}
                                        max={30}
                                        defaultValue={1}
                                        value={borrowDuration}
                                        onChange={(value) =>
                                            setBorrowDuration(Number(value))
                                        }
                                        style={{ width: '100px' }}
                                    />
                                </div>
                            )}

                            <div
                                className={styles.WrapperWishlist}
                                onClick={handleAddWishListProduct}
                                style={{ cursor: 'pointer' }}
                            >
                                {isWishlisted ? (
                                    <HeartFilled style={{ color: 'red' }} />
                                ) : (
                                    <HeartOutlined />
                                )}
                            </div>

                            {errorOrderLimit && (
                                <div style={{ color: 'red' }}>
                                    Sản phẩm đã hết hàng
                                </div>
                            )}
                            <div style={{ marginTop: '50px' }}>
                                <Switch
                                    checked={isForSale}
                                    onChange={handleToggle}
                                    checkedChildren="Bán"
                                    unCheckedChildren="Thuê"
                                />
                                <p
                                    style={{
                                        marginTop: '10px',
                                        fontSize: '15px',
                                    }}
                                >
                                    Trạng thái: {isForSale ? 'Bán' : 'Thuê'}
                                </p>
                            </div>
                            {!isForSale && (
                                <p
                                    style={{
                                        marginTop: '10px',
                                        fontSize: '15px',
                                    }}
                                >
                                    Thời gian thuê: {rentalDays}
                                </p>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row
                    style={{
                        padding: '16px',
                        backgroundColor: '#fff',
                        width: '30%',
                        marginLeft: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '250px',
                    }}
                >
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>
                        Tạm tính:{' '}
                        <div
                            style={{
                                color: 'rgb(255, 66, 78)',
                                fontWeight: 'bold',
                            }}
                        >
                            {convertPrice(displayPrice * numProduct)}
                        </div>
                    </div>
                    <ButtonComponents
                        className={styles.WrapperButtonBuy}
                        textButton={isForSale ? 'Mua ngay' : 'Thuê ngay'}
                        onClick={() =>
                            isForSale
                                ? handleBuyOrderProduct()
                                : handleBorrowOrderProduct()
                        }
                    />

                    <ButtonComponents
                        className={styles.WrapperButtonCart}
                        textButton={
                            isForSale
                                ? 'Thêm vào giỏ hàng'
                                : 'Thêm vào giỏ sách'
                        }
                        onClick={() =>
                            isForSale
                                ? handleAddOrderProduct()
                                : handleAddBorrowProduct()
                        }
                    />
                </Row>
            </div>
            <div className={styles.WrapperDescription}>
                <div
                    style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                    }}
                >
                    Mô tả sản phẩm
                </div>
                <div style={{ fontSize: '17px', whiteSpace: 'pre-line' }}>
                    {productDetails?.description}
                </div>
            </div>

            <div
                style={{
                    backgroundColor: '#fff',
                    padding: '10px 20px',
                    marginTop: '30px',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            marginBottom: '20px',
                        }}
                    >
                        Bình luận ({comments.length})
                    </div>
                    <TextArea
                        rows={3}
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Nhập bình luận của bạn..."
                        style={{ borderColor: 'rgb(156 156 156)' }}
                    />
                    <Button
                        onClick={handleAddComment}
                        style={{
                            marginTop: 10,
                            backgroundColor: '#007784',
                            color: '#fff',
                        }}
                    >
                        Gửi bình luận
                    </Button>
                </div>

                {/* Hiển thị danh sách bình luận nếu có */}
                {showComments && comments.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <List
                            dataSource={comments}
                            renderItem={(comment) => (
                                <List.Item
                                    actions={[
                                        user?.name === comment.author ||
                                        user?.isAdmin ? (
                                            <>
                                                {editingCommentId ===
                                                comment.id ? (
                                                    <Button
                                                        type="primary"
                                                        onClick={
                                                            handleSaveEditedComment
                                                        }
                                                        size="small"
                                                        style={{ marginTop: 8 }}
                                                    >
                                                        Lưu
                                                    </Button>
                                                ) : (
                                                    <Dropdown
                                                        overlay={menu(
                                                            comment.id,
                                                            comment.content,
                                                            comment.author,
                                                        )}
                                                        trigger={['click']}
                                                    >
                                                        <MoreOutlined
                                                            style={{
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '15px',
                                                            }}
                                                        />
                                                    </Dropdown>
                                                )}
                                            </>
                                        ) : null,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={comment.avatar} />}
                                        title={
                                            <span
                                                style={{
                                                    fontSize: '16px',
                                                }}
                                            >
                                                {comment.author}
                                            </span>
                                        }
                                        description={
                                            editingCommentId === comment.id ? (
                                                <TextArea
                                                    value={editedComment}
                                                    onChange={(e) =>
                                                        setEditedComment(
                                                            e.target.value,
                                                        )
                                                    }
                                                    autoSize={{
                                                        minRows: 2,
                                                        maxRows: 4,
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    <p
                                                        style={{
                                                            fontSize: '14px',
                                                            color: '#333',
                                                        }}
                                                    >
                                                        {comment.content}
                                                    </p>
                                                    <span
                                                        style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                        }}
                                                    >
                                                        {comment.timestamp}
                                                    </span>
                                                </>
                                            )
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailComponent;
