import { Spin } from 'antd';
import React from 'react';

const Loading = ({ children, isLoading, delays = 200 }) => {
    return (
        <Spin spinning={isLoading} delay={delays}>
            {children}
        </Spin>
    );
};

export default Loading;
