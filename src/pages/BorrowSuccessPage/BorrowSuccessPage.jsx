import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import styles from './BorrowSuccessPage.module.scss'; // Use OrderSuccessPage styles
import { useLocation } from 'react-router-dom';
import { convertPrice } from '../../ultils';
import { CheckCircleFilled } from '@ant-design/icons';
import Loading from '../../components/LoadingComponent/Loading.jsx';

const BorrowSuccessPage = () => {
    const location = useLocation();
    const { state } = location;

    // Định dạng ngày
    const formatDate = (date) => {
        if (!date) return 'Chưa xác định';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Kiểm tra nếu state hoặc borrows không tồn tại
    if (!state || !state.borrows?.length) {
        return (
            <div className={styles.Wrapper}>
                <div className={styles.Container}>
                    <h1 className={styles.Title}>Lỗi</h1>
                    <p>Không tìm thấy thông tin thuê sách.</p>
                </div>
            </div>
        );
    }

    return (
        <Loading isLoading={false}>
            <div className={styles.Wrapper}>
                <div className={styles.Container}>
                    <h1 className={styles.Title}>
                        <CheckCircleFilled
                            style={{
                                color: '#52c41a',
                                fontSize: '40px',
                                marginRight: '10px',
                                verticalAlign: 'middle',
                                marginBottom: '10px',
                            }}
                        />
                        Đã thuê thành công!
                    </h1>
                    <Row gutter={24}>
                        <Col style={{ width: '100%' }}>
                            <div>
                                {state.borrows.map((borrow) => (
                                    <Row
                                        key={borrow?.image}
                                        className={styles.WrapperRow}
                                    >
                                        <Col span={3}>
                                            <img
                                                src={borrow?.image}
                                                alt="Sản phẩm"
                                                className={styles.ProductImage}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <div className={styles.ProductName}>
                                                {borrow?.name}
                                            </div>
                                        </Col>
                                        <Col span={4}>
                                            <div className={styles.Price}>
                                                Giá tiền:{' '}
                                                <span
                                                    className={
                                                        styles.PriceValue
                                                    }
                                                >
                                                    {convertPrice(
                                                        borrow?.price,
                                                    )}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col
                                            span={3}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <div className={styles.Amount}>
                                                Số lượng:{' '}
                                                <span
                                                    className={
                                                        styles.AmountValue
                                                    }
                                                >
                                                    {borrow?.amount}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col
                                            span={44}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <div className={styles.Date}>
                                                Ngày mượn:{' '}
                                                <span
                                                    style={{ color: '#ea8500' }}
                                                >
                                                    {formatDate(
                                                        borrow?.borrowDate ||
                                                            state.borrowDate,
                                                    )}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col
                                            span={4}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <div className={styles.Date}>
                                                Ngày trả:{' '}
                                                <span
                                                    style={{ color: '#ea8500' }}
                                                >
                                                    {formatDate(
                                                        borrow?.returnDate ||
                                                            state.returnDate,
                                                    )}
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                ))}
                                <div className={styles.WrapperTotal}>
                                    Tổng tiền:{' '}
                                    <span className={styles.TotalValue}>
                                        {convertPrice(
                                            state?.priceTotalMemo || 0,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Loading>
    );
};

export default BorrowSuccessPage;
