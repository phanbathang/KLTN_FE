import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.scss';
import SliderComponents from '../../components/SliderComponents/SliderComponents';
import slide4 from '../../assets/images/slide4.webp';
import slide5 from '../../assets/images/slide5.webp';
import slide6 from '../../assets/images/slide6.webp';
import slide7 from '../../assets/images/slide7.webp';
import CardComponent from '../../components/CardComponent/CardComponent';
import ButtonComponents from '../../components/ButtonComponents/ButtonComponents';
import { useQuery } from '@tanstack/react-query';
import * as ProductService from '../../services/ProductService';
import FooterComponent from '../../components/FooterComponent/FooterComponent';
import { useSelector } from 'react-redux';
import Loading from '../../components/LoadingComponent/Loading';
import { useDebounceHook } from '../../hooks/useDebounce';
import TypeProduct from '../../components/TypeProduct/TypeProduct';

const HomePage = () => {
    const searchProduct = useSelector((state) => state.product?.search);
    const searchDebounce = useDebounceHook(searchProduct, 1000);
    const [isSetLoading, setIsSetLoading] = useState(false);
    const [limit, setLimit] = useState(12);
    const [typeProduct, setTypeProduct] = useState([]);

    const fetchProductAll = async (context) => {
        const limit = context?.queryKey && context?.queryKey[1];
        const search = context?.queryKey && context?.queryKey[2];
        const res = await ProductService.getAllProduct(search, limit);
        return res;
    };

    const fetchAllTypeProduct = async () => {
        const res = await ProductService.getAllTypeProduct();
        if (res?.status === 'OK') {
            setTypeProduct(res?.data);
        }
    };

    const {
        isLoading,
        data: products,
        isPreviousData,
    } = useQuery({
        queryKey: ['product', limit, searchDebounce],
        queryFn: fetchProductAll,
        retry: 3,
        retryDelay: 1000,
        keepPreviousData: true,
    });

    useEffect(() => {
        fetchAllTypeProduct();
    }, []);

    useEffect(() => {
        if (isLoading) {
            setIsSetLoading(true);
        } else {
            const timer = setTimeout(() => {
                setIsSetLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    return (
        <Loading isLoading={isLoading || isSetLoading}>
            <div className={styles.homePageContainer}>
                {/* Banner (Slider) */}
                <div className={styles.sliderContainer}>
                    <SliderComponents arrImage={[slide4, slide7, slide6]} />
                </div>

                {/* Danh mục sản phẩm */}
                <div className={styles.wrapperTypeProduct}>
                    {typeProduct.map((item) => (
                        <TypeProduct name={item} key={item} />
                    ))}
                </div>

                {/* Danh sách sản phẩm */}
                <div className={styles.productsSection}>
                    <h2 className={styles.sectionTitle}>Sản phẩm nổi bật</h2>
                    <div className={styles.wrapperProducts}>
                        {products?.data?.map((product) => (
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
                </div>

                {/* Nút Xem thêm */}
                <div className={styles.buttonContainer}>
                    <ButtonComponents
                        textButton="Xem thêm"
                        type="outline"
                        className={styles.wrapperButton}
                        onClick={() => setLimit((prev) => prev + 4)}
                    />
                </div>

                {/* Hình ảnh quảng cáo */}
                <div className={styles.adImageContainer}>
                    <img
                        src={slide5}
                        className={styles.wrapperImg}
                        alt="Advertisement"
                    />
                </div>

                {/* Footer */}
                <FooterComponent />
            </div>
        </Loading>
    );
};

export default HomePage;
