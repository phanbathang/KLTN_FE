import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orderItems: [],
    orderItemSelected: [],
    shippingAddress: {},
    paymentMethod: '',
    itemsPrice: 0,
    shippingPrice: 0,
    totalPrice: 0,
    user: '',
    isPaid: false,
    paidAt: '',
    isDelivered: false,
    deliveredAt: '',
    isSuccessOrder: false,
};

export const orderSlide = createSlice({
    name: 'order',
    initialState,
    reducers: {
        addOrderProduct: (state, action) => {
            const { orderItem } = action.payload;
            const itemOrder = state?.orderItems?.find(
                (item) => item?.product === orderItem.product,
            );
            if (itemOrder) {
                if (itemOrder.amount <= itemOrder.countInStock) {
                    itemOrder.amount += orderItem?.amount;
                    state.isSuccessOrder = true;
                    state.isErrorOrder = false;
                }
            } else {
                state.orderItems.push(orderItem);
                state.isSuccessOrder = true; // Thêm dòng này để cập nhật trạng thái
            }
        },

        resetOrder: (state) => {
            state.isSuccessOrder = false;
        },

        setOrderItems: (state, action) => {
            state.orderItems = action.payload; // Cập nhật giỏ hàng từ localStorage
        },

        resetOrderItem: (state) => {
            state.orderItems = [];
        },

        increaseAmount: (state, action) => {
            const { idProduct } = action.payload;
            const itemOrder = state?.orderItems?.find(
                (item) => item?.product === idProduct,
            );
            const itemOrderSelected = state?.orderItemSelected?.find(
                (item) => item?.product === idProduct,
            );
            if (itemOrder) itemOrder.amount++;
            if (itemOrderSelected) itemOrderSelected.amount++;
        },

        decreaseAmount: (state, action) => {
            const { idProduct } = action.payload;
            const itemOrder = state?.orderItems?.find(
                (item) => item?.product === idProduct,
            );
            const itemOrderSelected = state?.orderItemSelected?.find(
                (item) => item?.product === idProduct,
            );
            if (itemOrder) itemOrder.amount--;
            if (itemOrderSelected) itemOrderSelected.amount--;
        },

        removeOrderProduct: (state, action) => {
            const { idProduct } = action.payload;
            // Lọc ra các sản phẩm không có id trùng khớp với idProduct
            state.orderItems = state?.orderItems?.filter(
                (item) => item?.product !== idProduct,
            );
            state.orderItemSelected = state?.orderItemSelected?.filter(
                (item) => item?.product !== idProduct,
            );
        },

        removeAllOrderProduct: (state, action) => {
            const { listChecked } = action.payload;
            const itemOrders = state?.orderItems?.filter(
                (item) => !listChecked.includes(item.product),
            );
            const itemOrderSelected = state?.orderItemSelected?.filter(
                (item) => !listChecked.includes(item.product),
            );
            state.orderItems = itemOrders;
            state.orderItemSelected = itemOrderSelected;
        },

        selectedOrder: (state, action) => {
            const { listChecked } = action.payload;
            const orderSelected = [];
            state.orderItems.forEach((order) => {
                if (listChecked.includes(order.product)) {
                    orderSelected.push(order);
                }
            });
            state.orderItemSelected = orderSelected;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    addOrderProduct,
    increaseAmount,
    decreaseAmount,
    removeOrderProduct,
    removeAllOrderProduct,
    selectedOrder,
    resetOrder,
    resetOrderItem,
    setOrderItems,
} = orderSlide.actions;

export default orderSlide.reducer;
