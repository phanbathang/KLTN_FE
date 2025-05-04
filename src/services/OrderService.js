import axios from 'axios';

export const getAllOrder = async (access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/order/getAllOrder`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const createOrder = async (data) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/order/createOrder`,
        data,
    );
    return res.data;
};

export const getAllOrderDetail = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/order/getAllOrderDetail/${id}`,
    );
    return res.data;
};

export const getOrderDetail = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/order/getOrderDetail/${id}`,
    );
    return res.data;
};

export const cancelOrderDetail = async (id) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/order/cancelOrderDetail/${id}`,
    );
    return res.data;
};

export const getDeletedOrders = async (access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/order/getDeletedOrder`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const deleteCanceledOrder = async (id) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/borrow/deleteCanceledOrder/${id}`,
    );
    return res.data;
};
