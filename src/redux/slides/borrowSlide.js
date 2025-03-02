import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    borrowItems: [], // Luôn khởi tạo là một mảng
    borrowItemSelected: [],
    rentalPeriod: 14,
    totalRentalPrice: 0,
    user: '',
    isBorrowed: false,
    borrowedAt: '',
    isSuccessBorrow: false,
};

export const borrowSlice = createSlice({
    name: 'borrow',
    initialState,
    reducers: {
        addBorrowProduct: (state, action) => {
            const { borrowItem } = action.payload;

            if (!borrowItem || !borrowItem.product) {
                console.error('borrowItem không hợp lệ:', borrowItem);
                return;
            }

            // Kiểm tra nếu borrowItems bị null/undefined thì gán lại là mảng rỗng
            if (!Array.isArray(state.borrowItems)) {
                state.borrowItems = [];
            }

            const existingItem = state.borrowItems.find(
                (item) => item?.product === borrowItem.product,
            );

            if (existingItem) {
                existingItem.amount += borrowItem.amount || 1;
            } else {
                state.borrowItems.push({
                    ...borrowItem,
                    amount: borrowItem.amount || 1,
                });
            }

            state.isSuccessBorrow = true;
        },

        resetBorrow: (state) => {
            state.isSuccessBorrow = false;
        },

        setBorrowItems: (state, action) => {
            state.borrowItems = action.payload; // Cập nhật giỏ hàng từ localStorage
        },

        resetBorrowItem: (state) => {
            state.borrowItems = [];
        },

        increaseAmount: (state, action) => {
            const { idProduct } = action.payload;
            const item = state.borrowItems?.find(
                (item) => item?.product === idProduct,
            );
            if (item) item.amount++;
        },

        decreaseAmount: (state, action) => {
            const { idProduct } = action.payload;
            const item = state.borrowItems?.find(
                (item) => item?.product === idProduct,
            );
            if (item && item.amount > 1) item.amount--;
        },

        removeBorrowProduct: (state, action) => {
            const { idProduct } = action.payload;
            state.borrowItems = state.borrowItems?.filter(
                (item) => item?.product !== idProduct,
            );
            state.borrowItemSelected = state.borrowItemSelected?.filter(
                (item) => item?.product !== idProduct,
            );

            localStorage.removeItem('cartBook_');
        },

        removeAllBorrowProduct: (state, action) => {
            const { listChecked } = action.payload;
            state.borrowItems =
                state.borrowItems?.filter(
                    (item) => !listChecked.includes(item?.product),
                ) || [];
            state.borrowItemSelected =
                state.borrowItemSelected?.filter(
                    (item) => !listChecked.includes(item?.product),
                ) || [];
            localStorage.removeItem('cartBook_');
        },

        selectedBorrow: (state, action) => {
            const { listChecked } = action.payload;
            state.borrowItemSelected =
                state.borrowItems?.filter((item) =>
                    listChecked.includes(item?.product),
                ) || [];
        },

        setBorrowInfo: (state, action) => {
            state.borrowItemSelected = action.payload.borrowItems;
            state.borrowDate = action.payload.borrowDate;
            state.returnDate = action.payload.returnDate;
        },
    },
});

export const {
    addBorrowProduct,
    resetBorrow,
    setBorrowItems,
    resetBorrowItem,
    increaseAmount,
    decreaseAmount,
    removeBorrowProduct,
    removeAllBorrowProduct,
    selectedBorrow,
    setBorrowInfo,
} = borrowSlice.actions;

export default borrowSlice.reducer;
