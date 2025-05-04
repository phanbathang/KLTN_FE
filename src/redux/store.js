import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productReducer from './slides/productSlide';
import userReducer from './slides/userSlide';
import orderReducer from './slides/orderSlide';
import borrowReducer from './slides/borrowSlide';
import paymentReducer from './slides/paymentSlide';

import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['user'],
    whitelist: ['product', 'order', 'payment', 'borrow'], // Chỉ lưu reducer product (bao gồm wishlist)
};

const rootReducer = combineReducers({
    product: productReducer,
    user: userReducer,
    order: orderReducer,
    borrow: borrowReducer,
    payment: paymentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

// Export cả store và persistor
export const persistor = persistStore(store);
export default store;
