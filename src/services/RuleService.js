import axios from 'axios';

export const createRule = async (data, access_token) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/rule/create`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const getAllRule = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/rule/get-all`,
    );
    return res.data;
};

export const getDetailRule = async (id, access_token) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/rule/get-detail/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const updateRule = async (id, data, access_token) => {
    const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/rule/update/${id}`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};

export const deleteRule = async (id, access_token) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/rule/delete/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        },
    );
    return res.data;
};
