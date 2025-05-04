import React, { useEffect, useRef, useState } from 'react';
import styles from './AdminUser.module.scss';
import { Button, Form, Input, Modal, Space, Upload } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { useDispatch, useSelector } from 'react-redux';
import { useMutationHook } from '../../hooks/useMutationHook';
import * as UserService from '../../services/UserService.js';
import { useQuery } from '@tanstack/react-query';
import { Bounce, toast } from 'react-toastify';
import { getBase64 } from '../../ultils.js';
import DrawerComponent from '../DrawerComponent/DrawerComponent.jsx';
import ModalComponent from '../ModalComponent/ModalComponent.jsx';
import Loading from '../LoadingComponent/Loading.jsx';

const AdminUser = () => {
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState('');
    const user = useSelector((state) => state?.user);
    const token = user?.access_token;
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [stateUserDetail, setStateUserDetail] = useState({
        name: '',
        email: '',
        isAdmin: false,
        phone: '',
        avatar: '',
        address: '',
    });

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };

    const handleDeleteUser = () => {
        mutationDelete.mutate(
            {
                id: rowSelected,
                access_token: token,
            },
            {
                onSettled: () => {
                    queryUser.refetch();
                },
            },
        );
    };

    const handleCancel = () => {
        setIsOpenDrawer(false);
        setIsModalOpen(false);
        setStateUserDetail({
            name: '',
            email: '',
            isAdmin: false,
            phone: '',
        });
        form.resetFields();
    };

    const [form] = Form.useForm();

    const mutationUpdate = useMutationHook((data) => {
        const { id, access_token, ...rests } = data;
        return UserService.updateUser(id, rests, access_token);
    });

    const mutationDelete = useMutationHook((data) => {
        const { id, access_token } = data;
        return UserService.deleteUser(id, access_token);
    });

    const mutationDeleteMany = useMutationHook((data) => {
        const { access_token, ...ids } = data;
        return UserService.deleteManyUser(ids, access_token);
    });

    const getAllUser = async () => {
        const res = await UserService.getAllUser(user?.access_token);
        return res;
    };

    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            fetchGetDetailUser(rowSelected);
        }
    }, [rowSelected, isOpenDrawer]);

    const fetchGetDetailUser = async (rowSelected) => {
        const res = await UserService.getDetailUser(rowSelected, token);

        if (res?.data) {
            setStateUserDetail({
                name: res?.data?.name,
                email: res?.data?.email,
                isAdmin: res?.data?.isAdmin,
                phone: res?.data?.phone,
                address: res?.data?.address,
                avatar: res?.data?.avatar,
            });
        }
    };

    useEffect(() => {
        if (stateUserDetail) {
            form.setFieldsValue(stateUserDetail);
        }
    }, [stateUserDetail, form]);

    const handleDetailUser = () => {
        setIsOpenDrawer(true);
        if (rowSelected) {
            fetchGetDetailUser(rowSelected);
        }
    };

    const handleDetailUserDelete = () => {
        setIsModalOpenDelete(true);
        if (rowSelected) {
            fetchGetDetailUser(rowSelected);
        }
    };

    const closeDrawer = () => {
        setIsOpenDrawer(false);
        handleCancel(); // Reset state khi đóng drawer
    };

    const handleDeleteUserMany = (ids) => {
        mutationDeleteMany.mutate(
            {
                ids: ids,
                access_token: token,
            },
            {
                onSettled: () => {
                    queryUser.refetch();
                },
            },
        );
    };

    const {
        data: dataUpdate,
        isSuccess: isSuccessUpdate,
        isError: isErrorUpdate,
        error: errorUpdate,
    } = mutationUpdate;

    const {
        data: dataDelete,
        isSuccess: isSuccessDelete,
        isError: isErrorDelete,
        error: errorDelete,
    } = mutationDelete;

    const {
        data: dataDeleteMany,
        isSuccess: isSuccessDeleteMany,
        isError: isErrorDeleteMany,
        error: errorDeleteMany,
    } = mutationDeleteMany;

    const queryUser = useQuery({
        queryKey: ['users'],
        queryFn: UserService.getAllUser,
    });

    const { isLoading: isLoadingUser, isFetching, data: users } = queryUser;

    const renderAction = () => {
        return (
            <div>
                <DeleteOutlined
                    style={{
                        color: 'red',
                        fontSize: '30px',
                        cursor: 'pointer',
                    }}
                    onClick={handleDetailUserDelete}
                />
                <EditOutlined
                    style={{
                        color: 'orange',
                        fontSize: '30px',
                        marginLeft: '10px',
                        cursor: 'pointer',
                    }}
                    onClick={handleDetailUser}
                />
            </div>
        );
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            width: 220,
            sorter: (a, b) => a.name.length - b.name.length,
            ...getColumnSearchProps('name'),
        },

        {
            title: 'Email',
            dataIndex: 'email',
            width: 220,
        },

        {
            title: 'Phone',
            dataIndex: 'phone',
            width: 150,
            ...getColumnSearchProps('phone'),
        },

        {
            title: 'Address',
            dataIndex: 'address',
            width: 300,
            sorter: (a, b) => a.address.length - b.address.length,
            ...getColumnSearchProps('address'),
        },

        {
            title: 'Admin',
            dataIndex: 'isAdmin',
            width: 140,
            sorter: (a, b) => a.isAdmin.length - b.isAdmin.length,
            // ...getColumnSearchProps('isAdmin'),
            filters: [
                {
                    text: 'True',
                    value: 'True',
                },
                {
                    text: 'False',
                    value: 'False',
                },
            ],
            onFilter: (value, record) => {
                return record.isAdmin === value;
            },
            // if (value === 'True') {
            //     return record.isAdmin === true;
            // }
        },

        {
            title: 'Action',
            dataIndex: 'action',
            render: renderAction,
        },
    ];
    const dataTable =
        users?.data.length &&
        users?.data.map((user) => {
            return {
                ...user,
                key: user._id,
                phone: `0${user?.phone}`,
                isAdmin: user.isAdmin ? 'True' : 'False',
            };
        });

    //Cap nhat nguoi dung
    useEffect(() => {
        if (isSuccessUpdate && dataUpdate?.status === 'OK') {
            handleCancel();
            toast.success('Chỉnh sửa tài khoản thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorUpdate || dataUpdate?.status === 'ERR') {
            toast.error('Chỉnh sửa tài khoản không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessUpdate, isErrorUpdate]);

    //Xoa nguoi dung
    useEffect(() => {
        if (isSuccessDelete && dataDelete?.status === 'OK') {
            handleCancelDelete();
            toast.success('Xóa tài khoản thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorDelete || dataDelete?.status === 'ERR') {
            toast.error('Xóa tài khoản không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessDelete, isErrorDelete]);

    //Xoa nhieu nguoi dung
    useEffect(() => {
        if (isSuccessDeleteMany && dataDeleteMany?.status === 'OK') {
            toast.success('Xóa tài khoản thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorDeleteMany || dataDeleteMany?.status === 'ERR') {
            toast.error('Xóa tài khoản không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessDeleteMany, isErrorDeleteMany]);

    // const handleOnchange = (e) => {
    //     setStateUser({
    //         ...stateUser,
    //         [e.target.name]: e.target.value,
    //     });
    // };

    const handleOnchangeDetail = (e) => {
        setStateUserDetail({
            ...stateUserDetail,
            [e.target.name]: e.target.value,
        });
    };

    const handleOnchangeAvatarDetail = async ({ fileList }) => {
        const file = fileList[0];
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setStateUserDetail({
            ...stateUserDetail,
            avatar: file.preview,
        });
    };

    const onUpdateUser = () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                // token,
                ...stateUserDetail,
            },
            {
                onSettled: () => {
                    queryUser.refetch();
                },
            },
        );
    };
    return (
        <Loading isLoading={isLoadingUser || isFetching} size="small">
            <div>
                <h1 className={styles.WrapperHeader}>Quản lý người dùng</h1>
                <div style={{ marginTop: '20px' }}>
                    <TableComponent
                        style={{ position: 'relative' }}
                        handleDeleteMany={handleDeleteUserMany}
                        columns={columns}
                        data={dataTable}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: (event) => {
                                    setRowSelected(record._id);
                                },
                            };
                        }}
                    />
                </div>
                <DrawerComponent
                    title="Chi tiết người dùng"
                    isOpen={isOpenDrawer}
                    onClose={closeDrawer}
                    width="50%"
                >
                    <Form
                        name="basic"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        style={{
                            maxWidth: 600,
                            marginTop: '30px',
                            marginRight: '20%',
                        }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdateUser}
                        autoComplete="on"
                        form={form}
                    >
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your name!',
                                },
                            ]}
                        >
                            <Input
                                value={stateUserDetail.name}
                                onChange={handleOnchangeDetail}
                                name="name"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your email!',
                                },
                            ]}
                        >
                            <Input
                                value={stateUserDetail.email}
                                onChange={handleOnchangeDetail}
                                name="email"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>
                        <Form.Item
                            label="isAdmin"
                            name="isAdmin"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your admin!',
                                },
                            ]}
                        >
                            <Input
                                value={stateUserDetail.isAdmin}
                                onChange={handleOnchangeDetail}
                                name="isAdmin"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your phone!',
                                },
                            ]}
                        >
                            <Input
                                value={stateUserDetail.phone}
                                onChange={handleOnchangeDetail}
                                name="phone"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Address"
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your address!',
                                },
                            ]}
                        >
                            <Input
                                value={stateUserDetail.address}
                                onChange={handleOnchangeDetail}
                                name="address"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Avatar"
                            name="avatar"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your avatar!',
                                },
                            ]}
                        >
                            <Upload
                                onChange={handleOnchangeAvatarDetail}
                                showUploadList={false}
                                maxCount={1}
                            >
                                <Button className={styles.WrapperSelect}>
                                    Upload png only
                                </Button>
                                {stateUserDetail?.avatar && (
                                    <img
                                        src={stateUserDetail?.avatar}
                                        style={{
                                            height: '55px',
                                            width: '55px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                        }}
                                        alt="avatar"
                                    />
                                )}
                            </Upload>
                        </Form.Item>

                        <Form.Item label={null}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    left: '100%',
                                    marginTop: '20px',
                                    padding: '25px 15px 25px 15px',
                                    backgroundColor: '#76b8bf',
                                }}
                            >
                                Chỉnh sửa người dùng
                            </Button>
                        </Form.Item>
                    </Form>
                </DrawerComponent>
                <ModalComponent
                    title="Xóa người dùng"
                    open={isModalOpenDelete}
                    onCancel={handleCancelDelete}
                    style={{ top: '50px' }}
                    // onOk={handleDeleteUser}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={handleCancelDelete}
                            style={{
                                borderColor: '#76b8bf',
                                color: '#000',
                            }}
                        >
                            Hủy
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            style={{
                                backgroundColor: '#76b8bf', // Màu nền của nút OK
                                borderColor: '#76b8bf', // Đảm bảo viền có màu giống nền
                            }}
                            onClick={handleDeleteUser} // Hàm xử lý khi nhấn nút OK
                        >
                            OK
                        </Button>,
                    ]}
                >
                    <div>Bạn có chắc chắn xóa người dùng này không?</div>
                </ModalComponent>
            </div>
        </Loading>
    );
};

export default AdminUser;
