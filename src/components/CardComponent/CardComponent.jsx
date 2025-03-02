import { Card, Image } from 'antd';
import React from 'react';
import styles from './CardComponent.module.scss';
import { StarFilled } from '@ant-design/icons';
import logo from '../../assets/images/logo.png';
import { useNavigate } from 'react-router-dom';
import { convertPrice } from '../../ultils';

const CardComponent = (props) => {
    const {
        countInStock,
        description,
        image,
        name,
        price,
        rating,
        type,
        discount,
        selled,
        id,
    } = props;

    const navigate = useNavigate();
    const handleDetailProduct = (id) => {
        navigate(`/product-detail/${id}`);
    };

    return (
        <Card
            className={styles.WrapperCardStyle}
            hoverable
            headStyle={{ width: '200px', height: '200px' }}
            bodyStyle={{ padding: '20px 15px 15px 15px' }}
            cover={
                <img
                    alt="example"
                    src={image}
                    style={{
                        height: '320px',
                        objectFit: 'cover',
                        padding: '15px 15px 0 15px',
                    }}
                />
            }
            onClick={() => countInStock !== 0 && handleDetailProduct(id)}
            disabled={countInStock === 0}
        >
            <img className={styles.WrapperImg} src={logo} />
            <div className={styles.StyleNameProduct}>{name}</div>
            <div className={styles.WrapperReportText}>
                <span style={{ marginRight: '4px' }}>
                    <span>{rating}</span>
                    <StarFilled
                        style={{
                            fontSize: '12px',
                            color: 'yellow ',
                        }}
                    />
                </span>
                <span> | Đã bán {selled || 100}+</span>
            </div>
            <div className={styles.WrapperPriceText}>
                {convertPrice(price)}
                <span className={styles.WrapperDiscountText}>
                    -{discount || 5}%
                </span>
            </div>
            <div className={styles.WrapperDetail}>Chi tiết</div>
        </Card>
    );
};

export default CardComponent;
