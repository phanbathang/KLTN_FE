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
    const [limit, setLimit] = useState(15);
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
            <div
                style={{
                    padding: '20px 120px 30px 120px',
                    backgroundColor: '#f0f0f0',
                }}
            >
                {/* <div className={styles.wrapperTypeProduct}>
                    {typeProduct.map((item) => {
                        return <TypeProduct name={item} key={item} />;
                    })}
                </div> */}

                <SliderComponents arrImage={[slide4, slide7, slide6]} />
                <div className={styles.WrapperProducts}>
                    {products?.data?.map((product) => {
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
                </div>
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '10px',
                    }}
                >
                    <ButtonComponents
                        textButton="Xem thêm"
                        type="outline"
                        className={styles.WrapperButton}
                        onClick={() => setLimit((prev) => prev + 5)}
                    />
                </div>
            </div>
            <img src={slide5} className={styles.WrapperImg} />
            <FooterComponent />
        </Loading>
    );
};

export default HomePage;
