import { Button, Input } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import styles from './style.module.scss';
import InputComponents from '../InputComponents/InputComponents';
import ButtonComponents from '../ButtonComponents/ButtonComponents';

const ButtonInputSearch = (props) => {
    const { size, placeholder, textButton, className } = props;
    return (
        <div
            style={{
                display: 'flex',
                position: 'absolute',
                left: '130px',
                width: '100%',
                top: '-20px',
            }}
        >
            <InputComponents
                size={size}
                placeholder={placeholder}
                className={styles.wrapperInput}
                {...props}
            />
        </div>
    );
};
export default ButtonInputSearch;
