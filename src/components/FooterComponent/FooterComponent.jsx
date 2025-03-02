import React from 'react';
import styles from './FooterComponent.module.scss';
import { FacebookOutlined } from '@ant-design/icons';

const FooterComponent = () => {
    return (
        <div className={styles.Wrapper}>
            <div className={styles.WrapperFooter}>
                <h1>Về chúng tôi</h1>
                <p
                    style={{
                        fontSize: '15px',
                        letterSpacing: '1px',
                        color: 'rgba(102, 102, 102, 0.85)',
                        lineHeight: '1.5',
                        paddingTop: '20px',
                    }}
                >
                    Website chính thức và duy nhất của THANGBOOK. Hiện tại chúng
                    mình chỉ nhân đơn hàng trên website chứ không nhận ở nơi nào
                    khác nhé
                </p>
            </div>

            <div className={styles.WrapperFooter}>
                <h1>Thông tin</h1>
                <p
                    style={{
                        fontSize: '15px',
                        color: '#007784',
                        lineHeight: '1.5',
                        paddingTop: '20px',
                    }}
                >
                    Giới thiệu
                </p>
                <p
                    style={{
                        fontSize: '15px',
                        color: '#007784',
                        lineHeight: '1.5',
                        paddingTop: '20px',
                    }}
                >
                    Chính sách bảo mật
                </p>
                <p
                    style={{
                        fontSize: '15px',
                        color: '#007784',
                        lineHeight: '1.5',
                        paddingTop: '20px',
                    }}
                >
                    Điều khoản
                </p>
            </div>

            <div className={styles.WrapperFooter}>
                <h1>Hỗ trợ</h1>
                <p
                    style={{
                        fontSize: '15px',
                        color: 'rgba(102, 102, 102, 0.85)',
                        lineHeight: '1.5',
                        paddingTop: '20px',
                    }}
                >
                    Mọi thắc mắc và góp ý cần hỗ trợ xin vui lòng liên hệ
                    Fanpage
                </p>
                <a
                    href="https://www.facebook.com/phan.ba.thang.111582/"
                    target="_blank"
                    style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg"
                        style={{ width: '50px', marginRight: '-5px' }}
                    />
                </a>
            </div>
        </div>
    );
};
export default FooterComponent;
