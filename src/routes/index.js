import AdminPage from '../pages/AdminPage/AdminPage';
import BorrowPage from '../pages/BorrowPage/BorrowPage';
import BorrowSuccessPage from '../pages/BorrowSuccessPage/BorrowSuccessPage';
import DetailBorrowPage from '../pages/DetailBorrowPage/DetailBorrowPage';
import DetailOrderPage from '../pages/DetailOrderPage/DetailOrderPage';
import HomePage from '../pages/HomePage/HomePage';
import MyBorrowPage from '../pages/MyBorrowPage/MyBorrowPage';
import MyOrderPage from '../pages/MyOrderPage/MyOrderPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
import OrderPage from '../pages/OrderPage/OrderPage';
import OrderSuccessPage from '../pages/OrderSuccessPage/OrderSuccessPage';
import PaymentPage from '../pages/PaymentPage/PaymentPage';
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage';
import ProductsPage from '../pages/ProductsPage/ProductsPage';
import ProfileUser from '../pages/ProfileUser/ProfileUser';
import SignInPage from '../pages/SignInPage/SignInPage';
import SignUpPage from '../pages/SignUpPage/SignUpPage';
import TypeProductPage from '../pages/TypeProductPage/TypeProductPage';

export const routes = [
    {
        path: '/',
        page: HomePage,
        isShowHeader: true,
    },

    {
        path: '/order',
        page: OrderPage,
        isShowHeader: true,
    },

    {
        path: '/borrow',
        page: BorrowPage,
        isShowHeader: true,
    },

    {
        path: '/payment',
        page: PaymentPage,
        isShowHeader: true,
    },

    {
        path: '/orderSuccess',
        page: OrderSuccessPage,
        isShowHeader: true,
    },

    {
        path: '/borrowSuccess',
        page: BorrowSuccessPage,
        isShowHeader: true,
    },

    {
        path: '/my-order',
        page: MyOrderPage,
        isShowHeader: true,
    },

    {
        path: '/my-borrow',
        page: MyBorrowPage,
        isShowHeader: true,
    },

    {
        path: '/detailOrder/:id',
        page: DetailOrderPage,
        isShowHeader: true,
    },

    {
        path: '/detailBorrow/:id',
        page: DetailBorrowPage,
        isShowHeader: true,
    },

    {
        path: '/products',
        page: ProductsPage,
        isShowHeader: true,
    },

    {
        path: '/product/:type',
        page: TypeProductPage,
        isShowHeader: true,
    },

    {
        path: '/sign-in',
        page: SignInPage,
        isShowHeader: false,
    },

    {
        path: '/sign-up',
        page: SignUpPage,
        isShowHeader: false,
    },

    {
        path: '/product-detail/:id',
        page: ProductDetailPage,
        isShowHeader: true,
    },

    {
        path: '/profile-user',
        page: ProfileUser,
        isShowHeader: true,
    },

    {
        path: '/system/admin',
        page: AdminPage,
        isShowHeader: false,
        isPrivate: true,
    },

    {
        path: '*',
        page: NotFoundPage,
    },
];
