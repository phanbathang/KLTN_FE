import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    id: '',
    access_token: '',
    isAdmin: false,
};

export const userSlide = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, action) => {
            const {
                name = '',
                email = '',
                phone = '',
                address = '',
                avatar = '',
                _id = '',
                access_token = '',
                isAdmin,
                refreshToken = '',
            } = action.payload;
            state.name = name || email;
            state.email = email;
            state.phone = phone;
            state.address = address;
            state.avatar = avatar;
            state.id = _id;
            state.access_token = access_token;
            state.isAdmin = isAdmin;
            state.refreshToken = refreshToken;
        },
        resetUser: (state) => {
            state.name = '';
            state.email = '';
            state.phone = '';
            state.address = '';
            state.avatar = '';
            state.id = '';
            state.access_token = '';
            state.isAdmin = false;
        },
    },
});

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlide.actions;

export default userSlide.reducer;
