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

export const createBorrow = async (data) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/borrow/createBorrow`,
        data,
    );
    return res.data;
};

export const getAllBorrowDetail = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/borrow/getAllBorrowDetail/${id}`,
    );
    return res.data;
};

export const getBorrowDetail = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/borrow/getBorrowDetail/${id}`,
    );
    return res.data;
};

export const returnBorrow = async (id) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/borrow/returnBorrow/${id}`,
    );
    return res.data;
};

export const returnBorrowItem = async (borrowId, itemId) => {
    const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/borrow/returnBorrowItem/${borrowId}/${itemId}`,
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

export const deleteCanceledBorrow = async (id) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/borrow/deleteCanceledBorrow/${id}`,
    );
    return res.data;
};
