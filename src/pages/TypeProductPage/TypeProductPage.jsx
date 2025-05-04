import React, { useEffect, useState } from 'react';
import CardComponent from '../../components/CardComponent/CardComponent';
import { Col, Pagination, Row, Select, Slider, Button, Drawer } from 'antd';
import * as ProductService from '../../services/ProductService';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDebounceHook } from '../../hooks/useDebounce';
import styles from './TypeProductPage.module.scss';
import { MenuOutlined } from '@ant-design/icons';

const { Option } = Select;

const TypeProductPage = () => {
    const searchProduct = useSelector((state) => state.product?.search);
    const searchDebounce = useDebounceHook(searchProduct, 1000);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12); // Số sản phẩm mỗi trang
    const [priceRange, setPriceRange] = useState([0, 1000000]); // Bộ lọc giá
    const [ratingFilter, setRatingFilter] = useState(0); // Bộ lọc rating
    const [sortOption, setSortOption] = useState('default'); // Sắp xếp
    const [isDrawerVisible, setIsDrawerVisible] = useState(false); // Drawer cho mobile
    const { state } = useLocation();

    const fetchProductType = async (type) => {
        const res = await ProductService.getTypeProduct(type);
        if (res?.status === 'OK') {
            setProducts(res?.data);
            setFilteredProducts(res?.data);
        }
    };

    useEffect(() => {
        if (state?.selectedType) {
            fetchProductType(state.selectedType);
        }
    }, [state]);

    // Lọc và sắp xếp sản phẩm
    useEffect(() => {
        let filtered = products;

        // Lọc theo tìm kiếm
        if (searchDebounce) {
            filtered = filtered.filter((pro) =>
                pro?.name
                    .toLowerCase()
                    ?.includes(searchDebounce?.toLowerCase()),
            );
        }

        // Lọc theo giá
        filtered = filtered.filter(
            (pro) => pro.price >= priceRange[0] && pro.price <= priceRange[1],
        );

        // Lọc theo rating
        filtered = filtered.filter((pro) => pro.rating >= ratingFilter);

        // Sắp xếp
        if (sortOption === 'price-asc') {
            filtered = [...filtered].sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
            filtered = [...filtered].sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rating-desc') {
            filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        } else if (sortOption === 'selled-desc') {
            filtered = [...filtered].sort((a, b) => b.selled - a.selled);
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset về trang 1 khi lọc/sắp xếp
    }, [searchDebounce, priceRange, ratingFilter, sortOption, products]);

    const selectedType = state?.selectedType || 'Tất cả sản phẩm';

    // Phân trang
    const paginatedProducts = filteredProducts?.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const onPageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onPriceChange = (value) => {
        setPriceRange(value);
    };

    const onRatingChange = (value) => {
        setRatingFilter(value);
    };

    const onSortChange = (value) => {
        setSortOption(value);
    };

    const showDrawer = () => {
        setIsDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setIsDrawerVisible(false);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.titleContainer}>
                <h2 className={styles.sidebarTitle}>{selectedType}</h2>
            </div>

            <Row className={styles.mainRow}>
                {/* <Col span={5} className={styles.sidebarCol}>
                    <h2 className={styles.sidebarTitle}>{selectedType}</h2>
                </Col> */}

                <Col span={19} className={styles.productsCol}>
                    <div className={styles.headerSection}>
                        <Select
                            defaultValue="default"
                            onChange={onSortChange}
                            className={styles.sortSelect}
                        >
                            <Option value="default">Mặc định</Option>
                            <Option value="price-asc">Giá: Thấp đến Cao</Option>
                            <Option value="price-desc">
                                Giá: Cao đến Thấp
                            </Option>
                            <Option value="rating-desc">
                                Đánh giá: Cao nhất
                            </Option>
                        </Select>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <>
                            <div className={styles.wrapperProducts}>
                                {paginatedProducts?.map((product) => (
                                    <CardComponent
                                        key={product._id}
                                        countInStock={product.countInStock}
                                        description={product.description}
                                        image={product.image}
                                        name={product.name}
                                        price={product.price}
                                        rating={product.rating}
                                        type={product.type}
                                        discount={product.discount}
                                        selled={product.selled}
                                        id={product._id}
                                    />
                                ))}
                            </div>
                            <div className={styles.paginationContainer}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={filteredProducts.length}
                                    onChange={onPageChange}
                                    showSizeChanger={false}
                                    className={styles.pagination}
                                />
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Không tìm thấy sản phẩm nào.</p>
                        </div>
                    )}
                </Col>
            </Row>

            <Drawer
                title="Bộ lọc"
                placement="left"
                onClose={onCloseDrawer}
                visible={isDrawerVisible}
                className={styles.filterDrawer}
            >
                <h2 className={styles.sidebarTitle}>{selectedType}</h2>
            </Drawer>
        </div>
    );
};

export default TypeProductPage;
