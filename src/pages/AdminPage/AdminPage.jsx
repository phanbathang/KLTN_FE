import { Card, Col, Menu, Row, Statistic, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    BookOutlined,
    PieChartOutlined,
    ProfileOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import AdminUser from '../../components/AdminUser/AdminUser';
import AdminProduct from '../../components/AdminProduct/AdminProduct';
import AdminOrder from '../../components/AdminOrder/AdminOrder';
import AdminDeletedOrder from '../../components/AdminDeletedOrder/AdminDeletedOrder';
import AdminBorrow from '../../components/AdminBorrow/AdminBorrow';
import AdminDeletedBorrow from '../../components/AdminDeletedBorrow/AdminDeletedBorrow';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import styles from './AdminPage.module.scss';
import * as UserService from '../../services/UserService.js';
import * as ProductService from '../../services/ProductService.js';
import * as OrderService from '../../services/OrderService.js';
import * as BorrowService from '../../services/BorrowService.js';
import {
    checkAndRefreshToken,
    getAllUser,
} from '../../services/UserService.js';
import { getAllOrder, getDeletedOrders } from '../../services/OrderService.js';
import {
    getAllBorrows,
    getDeletedBorrows,
} from '../../services/BorrowService.js';
import { convertPrice } from '../../ultils.js';
import AdminRule from '../../components/AdminRule/AdminRule.jsx';

const { Title } = Typography;

const AdminPage = () => {
    const [keySelected, setKeySelected] = useState('dashboard');
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        cancelledOrders: 0,
        borrows: 0,
        cancelledBorrows: 0,
        revenue: 0,
    });
    const [salesData, setSalesData] = useState([]);
    const [borrowData, setBorrowData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6F61'];

    const items = [
        { key: 'dashboard', icon: <PieChartOutlined />, label: 'Dashboard' },
        { key: 'users', icon: <TeamOutlined />, label: 'Người dùng' },
        { key: 'products', icon: <AppstoreOutlined />, label: 'Sản phẩm' },
        {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: 'Đơn hàng',
            children: [
                { key: 'active-orders', label: 'Đơn hàng đã thanh toán' },
                { key: 'cancelled-orders', label: 'Đơn hàng đã hủy' },
            ],
        },
        {
            key: 'borrows',
            icon: <BookOutlined />,
            label: 'Danh sách mượn sách',
            children: [
                { key: 'active-borrows', label: 'Danh sách đang mượn' },
                { key: 'cancelled-borrows', label: 'Danh sách đã trả' },
            ],
        },
        { key: 'rule', icon: <ProfileOutlined />, label: 'Quy Định' },
    ];

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const access_token = await checkAndRefreshToken();
            if (!access_token) {
                console.error('No access token available');
                return;
            }

            // Fetch users
            const userData = await getAllUser();
            const totalUsers = userData?.data?.length || 0;

            // Fetch products
            const productData = await ProductService.getAllProduct('', 1000);
            const totalProducts = productData?.data?.length || 0;

            // Fetch orders
            const orderData = await getAllOrder(access_token);
            const totalOrders = orderData?.data?.length || 0;

            // Fetch cancelled orders
            const deletedOrderData = await OrderService.getDeletedOrders(
                access_token,
            );
            const totalCancelledOrders = deletedOrderData?.data?.length || 0;

            // Fetch active borrows
            const borrowDataResponse = await BorrowService.getAllBorrows(
                access_token,
            );
            const borrowData = Array.isArray(borrowDataResponse?.data)
                ? borrowDataResponse.data
                : [];
            const totalBorrows = borrowData.length;
            console.log('Borrow Data:', borrowData);

            // Fetch cancelled/returned borrows
            const deletedBorrowDataResponse =
                await BorrowService.getDeletedBorrows(access_token);
            const deletedBorrowData = Array.isArray(
                deletedBorrowDataResponse?.data,
            )
                ? deletedBorrowDataResponse.data
                : [];
            const totalCancelledBorrows = deletedBorrowData.length;
            console.log('Deleted Borrow Data:', deletedBorrowData);

            // Calculate revenue from orders and deleted borrows
            const orderRevenue =
                orderData?.data?.reduce(
                    (sum, order) => sum + (order.totalPrice || 0),
                    0,
                ) || 0;
            const borrowRevenue =
                deletedBorrowData?.reduce(
                    (sum, borrow) => sum + (borrow.revenue || 0),
                    0,
                ) || 0;
            const totalRevenue = orderRevenue + borrowRevenue;

            // Update stats
            setStats({
                users: totalUsers,
                products: totalProducts,
                orders: totalOrders,
                cancelledOrders: totalCancelledOrders,
                borrows: totalBorrows,
                cancelledBorrows: totalCancelledBorrows,
                revenue: totalRevenue,
            });

            // Sales and cancelled orders data by month
            const monthlySales = {};
            const monthlyCancelledOrders = {};
            orderData?.data?.forEach((order) => {
                const date = new Date(order.createdAt);
                if (!isNaN(date)) {
                    const month = date.toLocaleString('vi-VN', {
                        month: 'long',
                    });
                    monthlySales[month] =
                        (monthlySales[month] || 0) + (order.totalPrice || 0);
                    monthlyCancelledOrders[month] =
                        monthlyCancelledOrders[month] || 0;
                }
            });
            deletedOrderData?.data?.forEach((order) => {
                const date = new Date(order.createdAt);
                if (!isNaN(date)) {
                    const month = date.toLocaleString('vi-VN', {
                        month: 'long',
                    });
                    monthlyCancelledOrders[month] =
                        (monthlyCancelledOrders[month] || 0) + 1;
                }
            });

            const salesArray = Object.entries(monthlySales).map(
                ([name, value]) => ({
                    name,
                    value,
                    cancelledOrders: monthlyCancelledOrders[name] || 0,
                }),
            );
            setSalesData(salesArray);

            // Borrow and cancelled borrows data by month
            const monthlyBorrows = {};
            const monthlyCancelledBorrows = {};
            borrowData.forEach((borrow) => {
                if (borrow.createdAt) {
                    const date = new Date(borrow.createdAt);
                    if (!isNaN(date)) {
                        const monthNumber = date.getMonth(); // 0-11
                        const monthName = [
                            'Tháng Một',
                            'Tháng Hai',
                            'Tháng Ba',
                            'Tháng Tư',
                            'Tháng Năm',
                            'Tháng Sáu',
                            'Tháng Bảy',
                            'Tháng Tám',
                            'Tháng Chín',
                            'Tháng Mười',
                            'Tháng Mười Một',
                            'Tháng Mười Hai',
                        ][monthNumber];
                        monthlyBorrows[monthName] =
                            (monthlyBorrows[monthName] || 0) + 1;
                    }
                }
            });
            deletedBorrowData.forEach((borrow) => {
                if (borrow.createdAt) {
                    const date = new Date(borrow.createdAt);
                    if (!isNaN(date)) {
                        const monthNumber = date.getMonth(); // 0-11
                        const monthName = [
                            'Tháng Một',
                            'Tháng Hai',
                            'Tháng Ba',
                            'Tháng Tư',
                            'Tháng Năm',
                            'Tháng Sáu',
                            'Tháng Bảy',
                            'Tháng Tám',
                            'Tháng Chín',
                            'Tháng Mười',
                            'Tháng Mười Một',
                            'Tháng Mười Hai',
                        ][monthNumber];
                        monthlyCancelledBorrows[monthName] =
                            (monthlyCancelledBorrows[monthName] || 0) + 1;
                    }
                }
            });

            console.log('Monthly Borrows:', monthlyBorrows);
            console.log('Monthly Cancelled Borrows:', monthlyCancelledBorrows);

            const allMonths = [
                'Tháng Một',
                'Tháng Hai',
                'Tháng Ba',
                'Tháng Tư',
                'Tháng Năm',
                'Tháng Sáu',
                'Tháng Bảy',
                'Tháng Tám',
                'Tháng Chín',
                'Tháng Mười',
                'Tháng Mười Một',
                'Tháng Mười Hai',
            ];
            const borrowArray = allMonths.map((month) => ({
                name: month,
                borrows: monthlyBorrows[month] || 0,
                cancelledBorrows: monthlyCancelledBorrows[month] || 0,
            }));
            console.log('Borrow Array:', borrowArray);
            setBorrowData(borrowArray);

            // Product categories
            const typeData = await ProductService.getAllTypeProduct();
            const productTypes = typeData?.data || [];
            const categoryStats = {};
            productData?.data?.forEach((product) => {
                const type = product.type || 'Không xác định';
                categoryStats[type] = (categoryStats[type] || 0) + 1;
            });
            const categoryArray = Object.entries(categoryStats).map(
                ([name, value]) => ({
                    name,
                    value,
                }),
            );
            setCategoryData(categoryArray);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (keySelected === 'dashboard') {
            fetchDashboardData();
        }
    }, [keySelected]);

    // Custom Tooltip for Sales Chart
    const CustomSalesTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.customTooltip}>
                    <p>{`Tháng: ${label}`}</p>
                    <p>{`Doanh số: ${convertPrice(payload[0].value)}`}</p>
                    {payload[1] && (
                        <p>{`Đơn hàng đã hủy: ${payload[1].value}`}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip for Borrow Chart
    const CustomBorrowTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.customTooltip}>
                    <p>{`Tháng: ${label}`}</p>
                    <p>{`Số lượt mượn: ${payload[0].value}`}</p>
                    {payload[1] && <p>{`Số lượt trả: ${payload[1].value}`}</p>}
                </div>
            );
        }
        return null;
    };

    const renderPage = (key) => {
        switch (key) {
            case 'dashboard':
                return (
                    <div className={styles.dashboardContainer}>
                        <Title level={2} className={styles.dashboardTitle}>
                            Dashboard Quản Trị
                        </Title>
                        <Row gutter={[24, 24]} className={styles.statsRow}>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Người dùng"
                                        value={stats.users}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Sản phẩm"
                                        value={stats.products}
                                        prefix={<AppstoreOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Đơn hàng"
                                        value={stats.orders}
                                        prefix={<ShoppingCartOutlined />}
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Đơn hàng đã hủy"
                                        value={stats.cancelledOrders}
                                        prefix={<ShoppingCartOutlined />}
                                        valueStyle={{ color: '#ff7300' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Lượt mượn sách"
                                        value={stats.borrows}
                                        prefix={<BookOutlined />}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Lượt trả sách"
                                        value={stats.cancelledBorrows}
                                        prefix={<BookOutlined />}
                                        valueStyle={{ color: '#eb2f96' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    className={styles.statCard}
                                    loading={loading}
                                >
                                    <Statistic
                                        title="Doanh thu"
                                        value={stats.revenue}
                                        prefix="₫"
                                        valueStyle={{ color: '#f5222d' }}
                                        formatter={(value) =>
                                            convertPrice(value)
                                        }
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]} className={styles.chartRow}>
                            <Col
                                xs={24}
                                md={24}
                                style={{ paddingBottom: '20px' }}
                            >
                                <Card
                                    title="Phân loại sản phẩm"
                                    className={styles.chartCard}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                                label={({ name, percent }) =>
                                                    `${name}: ${(
                                                        percent * 100
                                                    ).toFixed(0)}%`
                                                }
                                            >
                                                {categoryData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                COLORS[
                                                                    index %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]} className={styles.chartRow}>
                            <Col
                                xs={24}
                                md={12}
                                style={{ padding: '18px 12px 12px 12px' }}
                            >
                                <Card
                                    title="Doanh số và Đơn hàng đã hủy theo tháng"
                                    className={styles.chartCard}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                            />
                                            <Tooltip
                                                content={<CustomSalesTooltip />}
                                            />
                                            <Legend />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="value"
                                                fill="#8884d8"
                                                name="Doanh số"
                                            />
                                            <Bar
                                                yAxisId="right"
                                                dataKey="cancelledOrders"
                                                fill="#ff7300"
                                                name="Đơn hàng đã hủy"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                            <Col
                                xs={24}
                                md={12}
                                style={{ padding: '18px 12px 12px 12px' }}
                            >
                                <Card
                                    title="Lượt mượn và trả sách theo tháng"
                                    className={styles.chartCard}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart data={borrowData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                            />
                                            <Tooltip
                                                content={
                                                    <CustomBorrowTooltip />
                                                }
                                            />
                                            <Legend />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="borrows"
                                                fill="#722ed1"
                                                name="Lượt mượn"
                                            />
                                            <Bar
                                                yAxisId="right"
                                                dataKey="cancelledBorrows"
                                                fill="#eb2f96"
                                                name="Lượt trả"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]} className={styles.chartRow}>
                            <Col
                                xs={24}
                                md={24}
                                style={{ padding: '18px 12px 12px 12px' }}
                            >
                                <Card
                                    title="Xu hướng doanh thu theo tháng"
                                    className={styles.chartCard}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <LineChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) =>
                                                    convertPrice(value)
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#82ca9d"
                                                name="Doanh số"
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                );
            case 'users':
                return <AdminUser />;
            case 'rule':
                return <AdminRule />;
            case 'products':
                return <AdminProduct />;
            case 'active-orders':
                return <AdminOrder />;
            case 'cancelled-orders':
                return <AdminDeletedOrder />;
            case 'active-borrows':
                return <AdminBorrow />;
            case 'cancelled-borrows':
                return <AdminDeletedBorrow />;
            default:
                return (
                    <div className={styles.placeholder}>
                        <h2>Chào mừng đến với trang quản trị</h2>
                        <p>Vui lòng chọn một mục từ menu bên trái để bắt đầu</p>
                    </div>
                );
        }
    };

    const handleClick = ({ key }) => {
        setKeySelected(key);
    };

    return (
        <>
            <HeaderComponent isHiddenSearch isHiddenCart isHidden />
            <div className={styles.adminContainer}>
                <div className={styles.sidebar}>
                    <Menu
                        mode="inline"
                        className={styles.sidebarMenu}
                        items={items}
                        onClick={handleClick}
                        selectedKeys={[keySelected]}
                        defaultOpenKeys={['orders', 'borrows']}
                    />
                </div>
                <div className={styles.content}>{renderPage(keySelected)}</div>
            </div>
        </>
    );
};

export default AdminPage;
