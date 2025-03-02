import { orderContent } from './content';

export const isJsonString = (data) => {
    try {
        JSON.parse(data);
    } catch (error) {
        return false;
    }
    return true;
};

export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export const renderOptions = (arr) => {
    let result = [];
    if (arr) {
        result = arr?.map((opt) => {
            return {
                value: opt,
                label: opt,
            };
        });
    }
    result.push({
        label: 'Thêm type',
        value: 'add_type',
    });
    return result;
};

export const renderOptionsUpdate = (arr) => {
    let result = [];
    if (arr) {
        result = arr?.map((opt) => {
            return {
                value: opt,
                label: opt,
            };
        });
    }
    return result;
};

export const convertPrice = (price) => {
    try {
        const result = price?.toLocaleString().replaceAll(',', '.');
        return `${result} VND`;
    } catch (error) {
        return null;
    }
};

export const convertDataChart = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return [];
    }

    const typeCounts = {};

    // Lặp qua từng đơn hàng
    orders.forEach((order) => {
        if (Array.isArray(order.orderItems)) {
            order.orderItems.forEach((item) => {
                if (item?.type) {
                    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
                }
            });
        }
    });

    // Chuyển đối tượng thành mảng để hiển thị trên biểu đồ
    return Object.entries(typeCounts).map(([type, value]) => ({
        name: type, // Loại sách
        value: value, // Số lượng xuất hiện
    }));
};

export const convertDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch (error) {
        return null;
    }
};
