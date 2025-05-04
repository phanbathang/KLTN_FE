import React, { useEffect, useRef, useState } from 'react';
import styles from './AdminProduct.module.scss';
import { Button, Form, Input, Modal, Select, Space, Upload } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { convertPrice, renderOptions, renderOptionsUpdate } from '../../ultils';
import * as ProductService from '../../services/ProductService.js';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import DrawerComponent from '../DrawerComponent/DrawerComponent.jsx';
import { useSelector } from 'react-redux';
import ModalComponent from '../ModalComponent/ModalComponent.jsx';
import Loading from '../LoadingComponent/Loading.jsx';

const AdminProduct = () => {
    // const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState('');
    const user = useSelector((state) => state?.user);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [typeSelect, setTypeSelect] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const searchInput = useRef(null);

    const [stateProduct, setStateProduct] = useState({
        name: '',
        type: '',
        price: '',
        description: '',
        image: '',
        countInStock: '',
        rating: '',
        newType: '',
        discount: '',
        isForSale: true,
        isForRent: true,
        rentalPrice: '',
        rentalDuration: '',
    });

    const [stateProductDetail, setStateProductDetail] = useState({
        name: '',
        type: '',
        price: '',
        description: '',
        image: '',
        countInStock: '',
        rating: '',
        discount: '',
        isForSale: true,
        isForRent: true,
        rentalPrice: '',
        rentalDuration: '',
    });

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };

    const handleDeleteProduct = () => {
        mutationDelete.mutate(
            {
                id: rowSelected,
            },
            {
                onSettled: () => {
                    queryProduct.refetch();
                },
            },
        );
    };

    const handleCancel = () => {
        setIsOpenDrawer(false);
        setIsModalOpen(false);
        setStateProduct({
            name: '',
            type: '',
            price: '',
            description: '',
            image: '',
            countInStock: '',
            rating: '',
            discount: '',
            isForSale: true,
            isForRent: true,
            rentalPrice: '',
            rentalDuration: '',
        });
        // setStateProductDetail({
        //     name: '',
        //     type: '',
        //     price: '',
        //     description: '',
        //     image: '',
        //     countInStock: '',
        //     rating: '',
        //     discount: '',
        // });
        form.resetFields();
    };

    const [form] = Form.useForm();
    const [formCreate] = Form.useForm();
    const [formEdit] = Form.useForm();

    const mutation = useMutationHook((data) => {
        const {
            name,
            type,
            price,
            description,
            image,
            rating,
            countInStock,
            discount,
            isForSale,
            isForRent,
            rentalPrice,
            rentalDuration,
        } = data;
        const res = ProductService.createProduct({
            name,
            type,
            price,
            description,
            image,
            countInStock,
            rating,
            discount,
            isForSale,
            isForRent,
            rentalPrice,
            rentalDuration,
        });
        return res;
    });

    const mutationUpdate = useMutationHook(({ id, ...data }) => {
        return ProductService.updateProduct(id, data);
    });

    const mutationDelete = useMutationHook(({ id }) => {
        return ProductService.deleteProduct(id);
    });

    const mutationDeleteMany = useMutationHook(({ ...ids }) => {
        return ProductService.deleteManyProduct(ids);
    });

    const getAllProduct = async () => {
        const res = await ProductService.getAllProduct();
        return res;
    };

    const fetchGetDetailProduct = async (rowSelected) => {
        const res = await ProductService.getDetailProduct(rowSelected);
        if (res?.data) {
            setStateProductDetail({
                name: res?.data?.name,
                type: res?.data?.type,
                price: res?.data?.price,
                description: res?.data?.description,
                image: res?.data?.image,
                countInStock: res?.data?.countInStock,
                rating: res?.data?.rating,
                discount: res?.data?.discount,
                isForSale: res?.data?.isForSale,
                isForRent: res?.data?.isForRent,
                rentalPrice: res?.data?.rentalPrice,
                rentalDuration: res?.data?.rentalDuration,
            });
        }
    };

    useEffect(() => {
        if (!isModalOpen) {
            formEdit.setFieldsValue(stateProductDetail);
        } else {
            formCreate.setFieldsValue({
                name: '',
                type: '',
                price: '',
                description: '',
                image: '',
                countInStock: '',
                rating: '',
                discount: '',
                isForSale: true,
                isForRent: true,
                rentalPrice: '',
                rentalDuration: '',
            });
        }
    }, [stateProductDetail, isModalOpen, formCreate, formEdit]);

    console.log('state', stateProduct, stateProductDetail);

    useEffect(() => {
        form.setFieldsValue(stateProductDetail);
    }, [stateProductDetail, form]);

    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            fetchGetDetailProduct(rowSelected);
        }
    }, [rowSelected, isOpenDrawer]);

    const handleDetailProduct = () => {
        setIsOpenDrawer(true);
        if (rowSelected) {
            fetchGetDetailProduct(rowSelected);
        }
    };

    const closeDrawer = () => {
        form.resetFields(); // Reset form về trạng thái ban đầu
        setStateProductDetail({}); // Xóa hết dữ liệu sản phẩm trước đó

        setIsOpenDrawer(false);
        // handleCancel(); // Reset state khi đóng drawer
    };

    const handleDeleteProductMany = (ids) => {
        mutationDeleteMany.mutate(
            {
                ids: ids,
            },
            {
                onSettled: () => {
                    queryProduct.refetch();
                },
            },
        );
    };

    const { data, isLoading, isSuccess, isError, error } = mutation;

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

    const queryProduct = useQuery({
        queryKey: ['products'],
        queryFn: ProductService.getAllProduct,
    });

    const typeProduct = useQuery({
        queryKey: ['type-products'],
        queryFn: ProductService.getAllTypeProduct,
    });

    const {
        isLoading: isLoadingProduct,
        isFetching,
        data: products,
    } = queryProduct;

    const renderAction = () => {
        return (
            <div>
                <DeleteOutlined
                    style={{
                        color: 'red',
                        fontSize: '30px',
                        cursor: 'pointer',
                    }}
                    onClick={() => setIsModalOpenDelete(true)}
                />
                <EditOutlined
                    style={{
                        color: 'orange',
                        fontSize: '30px',
                        marginLeft: '10px',
                        cursor: 'pointer',
                    }}
                    onClick={handleDetailProduct}
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
            width: 250,
            align: 'center',
            sorter: (a, b) => a.name.length - b.name.length,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            align: 'center',
            render: (imageUrl) => (
                <img
                    src={imageUrl}
                    alt="Product"
                    style={{ width: 100, height: 150, objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            width: 150,
            sorter: (a, b) => a.price - b.price,
            align: 'center',
            filters: [
                {
                    text: '>= 200',
                    value: '>=',
                },
                {
                    text: '<= 200',
                    value: '<=',
                },
            ],
            onFilter: (value, record) => {
                if (value === '>=') {
                    return record.price >= 200;
                }
                return record.price <= 200;
            },
        },
        {
            title: 'Discount(%)',
            dataIndex: 'discount',
            align: 'center',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            width: 120,
            sorter: (a, b) => a.rating - b.rating,
            align: 'center',

            filters: [
                {
                    text: '>= 3',
                    value: '>=',
                },
                {
                    text: '<= 3',
                    value: '<=',
                },
            ],
            onFilter: (value, record) => {
                if (value === '>=') {
                    return record.rating >= 3;
                }
                return record.rating <= 3;
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
            align: 'center',
        },
        {
            title: 'CountInStock',
            dataIndex: 'countInStock',
            align: 'center',
            sorter: (a, b) => a.countInStock - b.countInStock,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            align: 'center',
            width: 120,
            render: renderAction,
        },
    ];

    const dataTable =
        products?.data.length &&
        products?.data.map((product) => {
            return {
                ...product,
                key: product._id,
                price: convertPrice(product?.price),
                isForSale: product.isForSale ? 'True' : 'False',
                isForRent: product.isForRent ? 'True' : 'False',
            };
        });

    //Tao san pham
    useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            handleCancel();
            toast.success('Tạo sản phẩm thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isError || data?.status === 'ERR') {
            toast.error('Tạo sản phẩm không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccess, isError]);

    //Cap nhat san pham
    useEffect(() => {
        if (isSuccessUpdate && dataUpdate?.status === 'OK') {
            handleCancel();
            toast.success('Chỉnh sửa sản phẩm thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorUpdate || dataUpdate?.status === 'ERR') {
            toast.error('Chỉnh sửa sản phẩm không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessUpdate, isErrorUpdate]);

    //Xoa san pham
    useEffect(() => {
        if (isSuccessDelete && dataDelete?.status === 'OK') {
            handleCancelDelete();
            toast.success('Xóa sản phẩm thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorDelete || dataDelete?.status === 'ERR') {
            toast.error('Xóa sản phẩm không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessDelete, isErrorDelete]);

    //Xoa nhieu san pham
    useEffect(() => {
        if (isSuccessDeleteMany && dataDeleteMany?.status === 'OK') {
            toast.success('Xóa sản phẩm thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorDeleteMany || dataDeleteMany?.status === 'ERR') {
            toast.error('Xóa sản phẩm không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessDeleteMany, isErrorDeleteMany]);

    const onFinish = () => {
        const params = {
            name: stateProduct.name,
            type:
                stateProduct.type === 'add_type'
                    ? stateProduct.newType
                    : stateProduct.type,
            price: stateProduct.price,
            description: stateProduct.description,
            image: stateProduct.image,
            countInStock: stateProduct.countInStock,
            rating: stateProduct.rating,
            discount: stateProduct.discount,
            isForSale: stateProduct.isForSale,
            isForRent: stateProduct.isForRent,
            rentalPrice: stateProduct.rentalPrice,
            rentalDuration: stateProduct.rentalDuration,
        };
        mutation.mutate(params, {
            onSettled: () => {
                queryProduct.refetch();
            },
        });
    };

    console.log('onFinish', onFinish);

    const handleOnchange = (e) => {
        setStateProduct({
            ...stateProduct,
            [e.target.name]: e.target.value,
        });
    };

    const handleOnchangeDetail = (e) => {
        if (!e) return;
        // setStateProductDetail({
        //     ...stateProductDetail,
        //     [e.target.name]: e.target.value,
        // });
        // Xử lý khi chọn giá trị từ Select
        if (e.target && e.target.name) {
            setStateProductDetail({
                ...stateProductDetail,
                [e.target.name]: e.target.value, // Xử lý các trường hợp Input hoặc các phần tử có name và value
            });
        } else if (e) {
            setStateProductDetail({
                ...stateProductDetail,
                type: e, // Đối với Select, giá trị là e (thường là value)
            });
        }
    };

    const handleOnchangeAvatar = async ({ fileList }) => {
        const file = fileList[0];
        if (!file.url && !file.preview) {
            try {
                // Tạo FormData để gửi file lên server
                const formData = new FormData();
                formData.append('file', file.originFileObj);
                formData.append('upload_preset', 'xvfxjxgm'); // Thay bằng upload preset của bạn

                // Gọi API upload lên Cloudinary
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/dk6phxjab/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                const data = await response.json();
                if (data.secure_url) {
                    setStateProduct({
                        ...stateProduct,
                        image: data.secure_url, // Lưu URL từ Cloudinary
                    });
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Upload ảnh thất bại');
            }
        }
    };

    const handleOnchangeAvatarDetail = async ({ fileList }) => {
        if (isUploading) return; // Chặn nếu đang upload

        const file = fileList[0];
        if (!file || (!file.url && !file.preview)) {
            try {
                setIsUploading(true);

                const formData = new FormData();
                formData.append('file', file.originFileObj);
                formData.append('upload_preset', 'xvfxjxgm');

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/dk6phxjab/image/upload`,
                    { method: 'POST', body: formData },
                );

                const data = await response.json();
                if (data.secure_url) {
                    setStateProductDetail((prev) => ({
                        ...prev,
                        image: data.secure_url,
                    }));
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Upload ảnh thất bại');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const onUpdateProduct = () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                // token: user?.access_token,
                ...stateProductDetail,
            },
            {
                onSettled: () => {
                    queryProduct.refetch();
                },
            },
        );
    };

    const fetchAllTypeProduct = async (value) => {
        const res = await ProductService.getAllTypeProduct();
        return res;
    };

    const handleChangeSelect = (value) => {
        setStateProduct({
            ...stateProduct,
            type: value,
        });
    };

    return (
        <Loading isLoading={isLoadingProduct || isFetching} size="small">
            <div>
                <div>
                    <h1 className={styles.WrapperHeader}>Quản lý sản phẩm</h1>
                    <Button
                        className={styles.WrapperAddProduct}
                        onClick={() => {
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                    >
                        {/* <PlusOutlined style={{ fontSize: '60px' }} /> */}
                        Thêm sản phẩm
                    </Button>
                    <div style={{ marginTop: '20px' }}>
                        <TableComponent
                            handleDeleteMany={handleDeleteProductMany}
                            columns={columns}
                            isLoading={isLoadingProduct}
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
                    <Modal
                        forceRender
                        title="Tạo sản phẩm"
                        open={isModalOpen}
                        onCancel={handleCancel}
                        footer={null}
                        style={{ top: '50px' }}
                    >
                        <Form
                            name="basic"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{
                                maxWidth: 600,
                                marginTop: '30px',
                                marginRight: '20%',
                            }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            autoComplete="off"
                            form={formCreate}
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
                                    value={stateProduct.name}
                                    onChange={handleOnchange}
                                    name="name"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Type"
                                name="type"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your type!',
                                    },
                                ]}
                            >
                                <Select
                                    value={stateProduct.type}
                                    onChange={handleChangeSelect}
                                    name="type"
                                    className={styles.WrapperInput}
                                    options={renderOptions(
                                        typeProduct?.data?.data,
                                    )}
                                />
                            </Form.Item>
                            {stateProduct.type === 'add_type' && (
                                <Form.Item
                                    label="New type"
                                    name="newType"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please input your newType!',
                                        },
                                    ]}
                                >
                                    <Input
                                        value={stateProduct.newType}
                                        onChange={handleOnchange}
                                        name="newType"
                                        className={styles.WrapperInput}
                                    />
                                </Form.Item>
                            )}

                            <Form.Item
                                label="Price"
                                name="price"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your price!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.price}
                                    onChange={handleOnchange}
                                    name="price"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Count InStock"
                                name="countInStock"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your countInStock!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.countInStock}
                                    onChange={handleOnchange}
                                    name="countInStock"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Rating"
                                name="rating"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your rating!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.rating}
                                    onChange={handleOnchange}
                                    name="rating"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Discount"
                                name="discount"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input discount of product!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.discount}
                                    onChange={handleOnchange}
                                    name="discount"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your description!',
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    value={stateProduct.description}
                                    onChange={handleOnchange}
                                    name="description"
                                    className={styles.WrapperInput}
                                    style={{ height: '150px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="isForSale"
                                name="isForSale"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your isForSale!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.isForSale}
                                    onChange={handleOnchange}
                                    name="isForSale"
                                    className={styles.WrapperInput}
                                    readOnly
                                />
                            </Form.Item>

                            <Form.Item
                                label="isForRent"
                                name="isForRent"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your isForRent!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.isForRent}
                                    onChange={handleOnchange}
                                    name="isForRent"
                                    className={styles.WrapperInput}
                                    readOnly
                                />
                            </Form.Item>

                            <Form.Item
                                label="rentalPrice"
                                name="rentalPrice"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your rentalPrice!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.rentalPrice}
                                    onChange={handleOnchange}
                                    name="rentalPrice"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>

                            <Form.Item
                                label="rentalDuration"
                                name="rentalDuration"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your rentalDuration!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProduct.rentalDuration}
                                    onChange={handleOnchange}
                                    name="rentalDuration"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Image"
                                name="image"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your image!',
                                    },
                                ]}
                            >
                                <Upload
                                    onChange={handleOnchangeAvatar}
                                    showUploadList={false}
                                    maxCount={1}
                                    beforeUpload={() => false} // Ngăn chặn upload tự động
                                    multiple={false}
                                >
                                    <Button className={styles.WrapperSelect}>
                                        Tải lên ảnh (PNG/JPG)
                                    </Button>
                                    {stateProduct?.image && (
                                        <img
                                            src={stateProduct?.image}
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
                                        left: '84%',
                                        marginTop: '20px',
                                        padding: '25px 15px 25px 15px',
                                        backgroundColor: '#76b8bf',
                                    }}
                                >
                                    Tạo sản phẩm
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                    <DrawerComponent
                        title="Chi tiết sản phẩm"
                        isOpen={isOpenDrawer}
                        // onClose={closeDrawer}
                        onClose={() => {
                            form.resetFields(); // Xóa dữ liệu khi nhấn Hủy
                            setStateProductDetail({});
                            setIsOpenDrawer(false);
                        }}
                        width="50%"
                    >
                        <Form
                            name="basic"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 16 }}
                            style={{
                                maxWidth: 600,
                                marginTop: '10px',
                                marginRight: '20%',
                            }}
                            initialValues={{ remember: true }}
                            onFinish={onUpdateProduct}
                            autoComplete="on"
                            form={formEdit}
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
                                    value={stateProductDetail.name}
                                    onChange={handleOnchangeDetail}
                                    name="name"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Type"
                                name="type"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your type!',
                                    },
                                ]}
                            >
                                {/* <Input
                                    value={stateProductDetail.type}
                                    onChange={handleOnchangeDetail}
                                    name="type"
                                    className={styles.WrapperInput}
                                /> */}

                                <Select
                                    value={stateProductDetail.type}
                                    onChange={handleOnchangeDetail}
                                    name="type"
                                    className={styles.WrapperInput}
                                    // style={{ width: '130%' }}
                                    options={renderOptionsUpdate(
                                        typeProduct?.data?.data,
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Price"
                                name="price"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your price!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.price}
                                    onChange={handleOnchangeDetail}
                                    name="price"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Count InStock"
                                name="countInStock"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your countInStock!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.countInStock}
                                    onChange={handleOnchangeDetail}
                                    name="countInStock"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Rating"
                                name="rating"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your rating!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.rating}
                                    onChange={handleOnchangeDetail}
                                    name="rating"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Discount"
                                name="discount"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input discount of product !',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.discount}
                                    onChange={handleOnchangeDetail}
                                    name="discount"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your description!',
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    value={stateProductDetail.description}
                                    onChange={handleOnchangeDetail}
                                    name="description"
                                    className={styles.WrapperInput}
                                    style={{ height: '150px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="isForSale"
                                name="isForSale"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your isForSale!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.isForSale}
                                    onChange={handleOnchangeDetail}
                                    name="isForSale"
                                    className={styles.WrapperInput}
                                    readOnly
                                />
                            </Form.Item>

                            <Form.Item
                                label="isForRent"
                                name="isForRent"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your isForRent!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.isForRent}
                                    onChange={handleOnchangeDetail}
                                    name="isForRent"
                                    className={styles.WrapperInput}
                                    readOnly
                                />
                            </Form.Item>

                            <Form.Item
                                label="rentalPrice"
                                name="rentalPrice"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your rentalPrice!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.rentalPrice}
                                    onChange={handleOnchangeDetail}
                                    name="rentalPrice"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>

                            <Form.Item
                                label="rentalDuration"
                                name="rentalDuration"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your rentalDuration!',
                                    },
                                ]}
                            >
                                <Input
                                    value={stateProductDetail.rentalDuration}
                                    onChange={handleOnchangeDetail}
                                    name="rentalDuration"
                                    className={styles.WrapperInput}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Image"
                                name="image"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your image!',
                                    },
                                ]}
                            >
                                <Upload
                                    onChange={handleOnchangeAvatarDetail}
                                    showUploadList={false}
                                    maxCount={1}
                                    multiple={false}
                                >
                                    <Button className={styles.WrapperSelect}>
                                        Tải lên ảnh (PNG/JPG)
                                    </Button>
                                    {stateProductDetail?.image && (
                                        <img
                                            src={stateProductDetail?.image}
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
                                        left: '110%',
                                        marginTop: '20px',
                                        padding: '25px 15px 25px 15px',
                                        backgroundColor: '#76b8bf',
                                    }}
                                >
                                    Chỉnh sửa sản phẩm
                                </Button>
                            </Form.Item>
                        </Form>
                    </DrawerComponent>
                    <ModalComponent
                        title="Xóa sản phẩm"
                        open={isModalOpenDelete}
                        onCancel={handleCancelDelete}
                        style={{ top: '50px' }}
                        onOk={handleDeleteProduct}
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
                                onClick={handleDeleteProduct} // Hàm xử lý khi nhấn nút OK
                            >
                                OK
                            </Button>,
                        ]}
                    >
                        <div>Bạn có chắc chắn xóa sản phẩm này không?</div>
                    </ModalComponent>
                </div>
            </div>
        </Loading>
    );
};

export default AdminProduct;
