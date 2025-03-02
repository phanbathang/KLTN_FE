import React from 'react';
import ProductDetailComponent from '../../components/ProductDetailComponent/ProductDetailComponent';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    return (
        <div
            style={{
                padding: '5px 120px 0 120px',
                backgroundColor: '#efefef',
                height: 'auto',
            }}
        >
            {/* <h2 style={{ padding: '10px 0 12px 0' }}>
                <span
                    onClick={() => {
                        navigate('/');
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    Trang chủ
                </span>{' '}
                - Chi tiết sản phẩm
            </h2> */}
            <ProductDetailComponent idProduct={id} />
        </div>
    );
};

export default ProductDetailPage;
