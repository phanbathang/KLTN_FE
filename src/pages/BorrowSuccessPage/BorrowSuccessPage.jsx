import { Row, Col, Form } from 'antd';
import { useSelector } from 'react-redux';
import styles from './BorrowSuccessPage.module.scss';
import { useLocation } from 'react-router-dom';
import { orderContent } from '../../content';
import { convertPrice } from '../../ultils';
import { useMemo } from 'react';

const BorrowSuccessPage = () => {
    const order = useSelector((state) => state.order);
    const borrow = useSelector((state) => state.borrow);
    const location = useLocation();
    const { state } = location;

    return (
        <div
            style={{
                backgroundColor: '#f0f0f5',
                width: '100%',
                minHeight: '100vh',
                padding: '20px 130px 20px 130px',
            }}
        >
            <h1 style={{ marginBottom: '20px' }}>Đã thuê thành công!</h1>
            <Row gutter={16}>
                {/* Phần bên trái: Danh sách sản phẩm */}
                <Col style={{ width: '100%' }}>
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '5px',
                        }}
                    >
                        {/* Chọn phương thức giao hàng */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '10px' }}>
                                Thông tin thuê sách
                            </h3>
                            <div
                                style={{
                                    padding: '20px',
                                    backgroundColor: '#f0f8ff',
                                }}
                            >
                                <p>
                                    <strong>Ngày mượn:</strong>{' '}
                                    <span
                                        style={{
                                            color: '#ea8500',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {state.borrowDateRange.start}
                                    </span>
                                </p>
                                <p>
                                    <strong>Ngày trả:</strong>{' '}
                                    <span
                                        style={{
                                            color: '#ea8500',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {state.borrowDateRange.end}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {state.borrows?.map((borrow) => {
                            return (
                                <Row
                                    key={borrow?.image}
                                    className={styles.WrapperRow}
                                >
                                    <Col span={4}>
                                        <img
                                            src={borrow?.image}
                                            alt="Sản phẩm"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </Col>
                                    <Col span={5}>
                                        <div>{borrow?.name}</div>
                                    </Col>
                                    <Col span={4}>
                                        <div>
                                            Giá tiền:{' '}
                                            {convertPrice(borrow?.price)}
                                        </div>
                                    </Col>

                                    <Col
                                        span={4}
                                        style={{
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div>Số lượng: {borrow?.amount} </div>
                                    </Col>
                                    <Col
                                        span={7}
                                        style={{
                                            textAlign: 'center',
                                            color: '#ff4d4f',
                                        }}
                                    >
                                        Tổng:{' '}
                                        {convertPrice(
                                            borrow?.price * borrow?.amount,
                                        )}
                                    </Col>
                                </Row>
                            );
                        })}
                    </div>
                    <div className={styles.WrapperTotal}>
                        Tổng tiền: {convertPrice(state?.priceTotalMemo)}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default BorrowSuccessPage;
