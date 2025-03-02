import axios from 'axios';

export const getAllBorrows = async (access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/borrow/getAllBorrows`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const createBorrow = async (data, access_token) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/borrow/createBorrow`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const getAllBorrowDetail = async (id, access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/borrow/getAllBorrowDetail/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const getBorrowDetail = async (id, access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/borrow/getBorrowDetail/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const returnBorrow = async (id, access_token) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/borrow/returnBorrow/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const getDeletedBorrows = async (access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/borrow/getDeletedBorrows`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};
