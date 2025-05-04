import React, { useEffect, useRef, useState } from 'react';
import styles from './AdminRule.module.scss';
import { Button, Form, Input, Modal, Space } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import TableComponent from '../TableComponent/TableComponent';
import { useSelector } from 'react-redux';
import { useMutationHook } from '../../hooks/useMutationHook';
import * as RuleService from '../../services/RuleService.js';
import { useQuery } from '@tanstack/react-query';
import { Bounce, toast } from 'react-toastify';
import DrawerComponent from '../DrawerComponent/DrawerComponent.jsx';
import ModalComponent from '../ModalComponent/ModalComponent.jsx';
import Loading from '../LoadingComponent/Loading.jsx';

const AdminRule = () => {
    const user = useSelector((state) => state?.user);
    const token = user?.access_token;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState('');
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [stateRuleDetail, setStateRuleDetail] = useState({
        title: '',
        contents: [],
        latePenaltyFee: 0, // Thêm latePenaltyFee vào state
    });

    const [form] = Form.useForm();

    const mutationCreate = useMutationHook((data) => {
        const { access_token, ...rests } = data;
        return RuleService.createRule(rests, access_token);
    });

    const mutationUpdate = useMutationHook((data) => {
        const { id, access_token, ...rests } = data;
        return RuleService.updateRule(id, rests, access_token);
    });

    const mutationDelete = useMutationHook((data) => {
        const { id, access_token } = data;
        return RuleService.deleteRule(id, access_token);
    });

    const getAllRule = async () => {
        const res = await RuleService.getAllRule();
        return res;
    };

    const queryRule = useQuery({
        queryKey: ['rules'],
        queryFn: RuleService.getAllRule,
    });

    const { isLoading: isLoadingRule, isFetching, data: rules } = queryRule;

    const {
        data: dataCreate,
        isSuccess: isSuccessCreate,
        isError: isErrorCreate,
        error: errorCreate,
    } = mutationCreate;

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

    const fetchGetDetailRule = async (rowSelected) => {
        const res = await RuleService.getDetailRule(rowSelected, token);
        if (res?.data) {
            setStateRuleDetail({
                title: res?.data?.title,
                contents: res?.data?.contents,
                latePenaltyFee: res?.data?.latePenaltyFee || 0, // Lấy latePenaltyFee từ API
            });
        }
    };

    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            fetchGetDetailRule(rowSelected);
        }
    }, [rowSelected, isOpenDrawer]);

    useEffect(() => {
        if (stateRuleDetail) {
            form.setFieldsValue({
                title: stateRuleDetail.title,
                contents: stateRuleDetail.contents.join('\n'),
                latePenaltyFee: stateRuleDetail.latePenaltyFee, // Thêm latePenaltyFee vào form
            });
        }
    }, [stateRuleDetail, form]);

    const handleCancel = () => {
        setIsOpenDrawer(false);
        setIsModalOpen(false);
        setStateRuleDetail({
            title: '',
            contents: [],
            latePenaltyFee: 0, // Reset latePenaltyFee
        });
        form.resetFields();
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };

    const handleDeleteRule = () => {
        mutationDelete.mutate(
            {
                id: rowSelected,
                access_token: token,
            },
            {
                onSettled: () => {
                    queryRule.refetch();
                },
            },
        );
    };

    const handleDetailRule = () => {
        setIsOpenDrawer(true);
        if (rowSelected) {
            fetchGetDetailRule(rowSelected);
        }
    };

    const handleDetailRuleDelete = () => {
        setIsModalOpenDelete(true);
        if (rowSelected) {
            fetchGetDetailRule(rowSelected);
        }
    };

    const closeDrawer = () => {
        setIsOpenDrawer(false);
        handleCancel();
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
            title: 'Title',
            dataIndex: 'title',
            width: 220,
            sorter: (a, b) => a.title.length - b.title.length,
            ...getColumnSearchProps('title'),
        },
        {
            title: 'Content',
            dataIndex: 'contents',
            width: 600,
            render: (contents) => (
                <ul>
                    {contents.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            ),
        },
        {
            title: 'Phí phạt trễ hạn (VNĐ/ngày)',
            dataIndex: 'latePenaltyFee',
            width: 200,
            sorter: (a, b) => a.latePenaltyFee - b.latePenaltyFee,
            render: (fee) => `${fee.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: () => (
                <div>
                    <DeleteOutlined
                        style={{
                            color: 'red',
                            fontSize: '30px',
                            cursor: 'pointer',
                        }}
                        onClick={handleDetailRuleDelete}
                    />
                    <EditOutlined
                        style={{
                            color: 'orange',
                            fontSize: '30px',
                            marginLeft: '10px',
                            cursor: 'pointer',
                        }}
                        onClick={handleDetailRule}
                    />
                </div>
            ),
        },
    ];

    const dataTable =
        rules?.data?.length &&
        rules?.data.map((rule) => ({
            ...rule,
            key: rule._id,
        }));

    useEffect(() => {
        if (isSuccessCreate && dataCreate?.status === 'OK') {
            handleCancel();
            toast.success('Tạo quy định thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorCreate || dataCreate?.status === 'ERR') {
            toast.error('Tạo quy định không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessCreate, isErrorCreate]);

    useEffect(() => {
        if (isSuccessUpdate && dataUpdate?.status === 'OK') {
            handleCancel();
            toast.success('Chỉnh sửa quy định thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorUpdate || dataUpdate?.status === 'ERR') {
            toast.error('Chỉnh sửa quy định không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessUpdate, isErrorUpdate]);

    useEffect(() => {
        if (isSuccessDelete && dataDelete?.status === 'OK') {
            handleCancelDelete();
            toast.success('Xóa quy định thành công.', {
                style: { fontSize: '1.5rem' },
            });
        } else if (isErrorDelete || dataDelete?.status === 'ERR') {
            toast.error('Xóa quy định không thành công.', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccessDelete, isErrorDelete]);

    const handleOnchangeDetail = (e) => {
        const { name, value } = e.target;
        setStateRuleDetail({
            ...stateRuleDetail,
            [name]:
                name === 'contents'
                    ? value.split('\n').filter((item) => item.trim())
                    : name === 'latePenaltyFee'
                    ? Number(value) || 0 // Chuyển đổi thành số
                    : value,
        });
    };

    const onCreateRule = () => {
        mutationCreate.mutate(
            {
                access_token: token,
                ...stateRuleDetail,
            },
            {
                onSettled: () => {
                    queryRule.refetch();
                },
            },
        );
    };

    const onUpdateRule = () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                access_token: token,
                ...stateRuleDetail,
            },
            {
                onSettled: () => {
                    queryRule.refetch();
                },
            },
        );
    };

    return (
        <Loading isLoading={isLoadingRule || isFetching} size="small">
            <div>
                <h1 className={styles.WrapperHeader}>Quản lý quy định</h1>
                <div style={{ marginTop: '20px' }}>
                    <Button
                        className={styles.WrapperAddRule}
                        onClick={() => {
                            setIsModalOpen(true);
                            setStateRuleDetail({
                                title: '',
                                contents: [],
                                latePenaltyFee: 0,
                            });
                            form.resetFields();
                        }}
                    >
                        Thêm quy định
                    </Button>
                    <TableComponent
                        style={{ position: 'relative' }}
                        columns={columns}
                        data={dataTable}
                        enableExport={false}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: (event) => {
                                    setRowSelected(record._id);
                                },
                            };
                        }}
                    />
                </div>
                <ModalComponent
                    title="Thêm quy định"
                    open={isModalOpen}
                    onCancel={handleCancel}
                    style={{ top: '50px' }}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={handleCancel}
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
                                backgroundColor: '#76b8bf',
                                borderColor: '#76b8bf',
                            }}
                            onClick={onCreateRule}
                        >
                            OK
                        </Button>,
                    ]}
                >
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        style={{
                            maxWidth: 600,
                            marginTop: '30px',
                        }}
                        initialValues={{ remember: true }}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Tiêu đề"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tiêu đề!',
                                },
                            ]}
                        >
                            <Input
                                value={stateRuleDetail.title}
                                onChange={handleOnchangeDetail}
                                name="title"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Nội dung"
                            name="contents"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập nội dung!',
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={6}
                                value={stateRuleDetail.contents.join('\n')}
                                onChange={handleOnchangeDetail}
                                name="contents"
                                placeholder="Nhập mỗi mục trên một dòng"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Phí phạt trễ hạn"
                            name="latePenaltyFee"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập phí phạt trễ hạn!',
                                },
                                {
                                    type: 'number',
                                    min: 0,
                                    message: 'Phí phạt phải là số không âm!',
                                },
                            ]}
                        >
                            <Input
                                type="number"
                                value={stateRuleDetail.latePenaltyFee}
                                onChange={handleOnchangeDetail}
                                name="latePenaltyFee"
                                className={styles.WrapperInput}
                                addonAfter="VNĐ/ngày"
                            />
                        </Form.Item>
                    </Form>
                </ModalComponent>
                <DrawerComponent
                    title="Chi tiết quy định"
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
                        onFinish={onUpdateRule}
                        autoComplete="off"
                        form={form}
                    >
                        <Form.Item
                            label="Tiêu đề"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tiêu đề!',
                                },
                            ]}
                        >
                            <Input
                                value={stateRuleDetail.title}
                                onChange={handleOnchangeDetail}
                                name="title"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Nội dung"
                            name="contents"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập nội dung!',
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={6}
                                value={stateRuleDetail.contents.join('\n')}
                                onChange={handleOnchangeDetail}
                                name="contents"
                                placeholder="Nhập mỗi mục trên một dòng"
                                className={styles.WrapperInput}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Phí phạt trễ hạn"
                            name="latePenaltyFee"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập phí phạt trễ hạn!',
                                },
                                {
                                    type: 'number',
                                    min: 0,
                                    message: 'Phí phạt phải là số không âm!',
                                },
                            ]}
                        >
                            <Input
                                type="number"
                                value={stateRuleDetail.latePenaltyFee}
                                onChange={handleOnchangeDetail}
                                name="latePenaltyFee"
                                className={styles.WrapperInput}
                                addonAfter="VNĐ/ngày"
                            />
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
                                Chỉnh sửa quy định
                            </Button>
                        </Form.Item>
                    </Form>
                </DrawerComponent>
                <ModalComponent
                    title="Xóa quy định"
                    open={isModalOpenDelete}
                    onCancel={handleCancelDelete}
                    style={{ top: '50px' }}
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
                                backgroundColor: '#76b8bf',
                                borderColor: '#76b8bf',
                            }}
                            onClick={handleDeleteRule}
                        >
                            OK
                        </Button>,
                    ]}
                >
                    <div>Bạn có chắc chắn xóa quy định này không?</div>
                </ModalComponent>
            </div>
        </Loading>
    );
};

export default AdminRule;
