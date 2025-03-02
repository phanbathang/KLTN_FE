import React, { useEffect, useState } from 'react';
import NavBarComponent from '../../components/NavBarComponent/NavBarComponent';
import CardComponent from '../../components/CardComponent/CardComponent';
import { Col, Pagination, Row } from 'antd';
import * as ProductService from '../../services/ProductService';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDebounceHook } from '../../hooks/useDebounce';
import styles from './TypeProductPage.module.scss';

const TypeProductPage = () => {
    const searchProduct = useSelector((state) => state.product?.search);
    const searchDebounce = useDebounceHook(searchProduct, 1000);
    const [products, setProducts] = useState([]);
    const { state } = useLocation();
    const fetchProductType = async (type) => {
        const res = await ProductService.getTypeProduct(type);
        if (res?.status === 'OK') {
            setProducts(res?.data);
        }
    };

    useEffect(() => {
        if (state?.selectedType) {
            fetchProductType(state.selectedType);
        }
    }, [state]);

    const selectedType = state?.selectedType || 'Tất cả sản phẩm';

    const onChange = () => {};
    return (
        <div style={{ backgroundColor: '#efefef', height: '100vh' }}>
            <Row
                style={{
                    padding: '30px 136px',
                    backgroundColor: '#efefef',
                }}
            >
                <Col span={4}>
                    <div className={styles.WrapperNavbar}>{selectedType}</div>
                </Col>

                <Col
                    span={20}
                    style={{
                        padding: '10px',
                        backgroundColor: '#efefef',
                        display: 'flex',
                        gap: '21px',
                        flexWrap: 'wrap',
                    }}
                >
                    {products
                        ?.filter((pro) => {
                            if (searchDebounce === '') {
                                return pro;
                            } else if (
                                pro?.name
                                    .toLowerCase()
                                    ?.includes(searchDebounce?.toLowerCase())
                            ) {
                                return pro;
                            }
                        })
                        ?.map((product) => {
                            return (
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
                            );
                        })}
                </Col>
            </Row>
            {/* <Pagination
                showQuickJumper
                defaultCurrent={2}
                total={100}
                onChange={onChange}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '20px',
                }}
            /> */}
        </div>
    );
};

export default TypeProductPage;
