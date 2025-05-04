import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    search: '',
    wishlist: [],
};

export const productSlide = createSlice({
    name: 'product',
    initialState,
    reducers: {
        searchProduct: (state, action) => {
            state.search = action.payload;
        },
        addToWishlist: (state, action) => {
            const product = action.payload.wishlist;
            if (!product || !product.id) {
                console.warn('Invalid product or missing id:', product);
                return;
            }

            if (state.wishlist.length >= 10) {
                return;
            }

            const isExist = state.wishlist.find(
                (item) => item.id === String(product.id),
            );
            if (!isExist) {
                state.wishlist.unshift({ ...product, id: String(product.id) });
                console.log('Wishlist after add:', state.wishlist);
            }
        },
        removeFromWishlist: (state, action) => {
            state.wishlist = state.wishlist.filter(
                (item) => item.id !== String(action.payload),
            );
            console.log('Wishlist after remove:', state.wishlist);
        },
        setWishlist: (state, action) => {
            console.log('Setting wishlist:', action.payload);
            state.wishlist = action.payload || [];
        },
        resetWishlist: (state) => {
            state.wishlist = [];
            console.log('Wishlist reset');
        },
    },
});

export const {
    searchProduct,
    addToWishlist,
    removeFromWishlist,
    resetWishlist,
    setWishlist,
} = productSlide.actions;

export default productSlide.reducer;
