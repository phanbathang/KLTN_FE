import axios from 'axios';

export const getConfig = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/payment/config`,
    );
    return res.data;
};

export const getAccessTokenPaypal = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/payment/getAccessTokenPaypal`,
    );
    return res.data;
};

export const refundOrder = async (captureId) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/payment/refundPayment`,
        { captureId },
    );
    return res.data;
};

export const createVNPayPayment = (data) => {
    return axios.post(`${process.env.REACT_APP_API_URL}/payment/vnpay`, data); // Thay URL bằng backend của bạn
};

export const returnVNPayPayment = async (data) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/payment/vnpay/return`,
        data,
    );
    return res.data;
};
