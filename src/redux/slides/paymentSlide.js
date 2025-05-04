import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    captureId: null, // Giá trị mặc định là null
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setCaptureId: (state, action) => {
            state.captureId = action.payload; // Gán giá trị captureId từ action
        },
        clearCaptureId: (state) => {
            state.captureId = null; // Xóa captureId khi hoàn tiền thành công
        },
    },
});

export const { setCaptureId, clearCaptureId } = paymentSlice.actions;
export default paymentSlice.reducer;
