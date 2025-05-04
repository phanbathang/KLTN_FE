import React, { useEffect, useState } from 'react';
import InputForm from '../../components/InputForm/InputForm';
import styles from './ProfileUser.module.scss';
import ButtonComponents from '../../components/ButtonComponents/ButtonComponents';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../services/UserService.js';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import { toast } from 'react-toastify';
import { updateUser } from '../../redux/slides/userSlide.js';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getBase64 } from '../../ultils.js';

const ProfileUser = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');

    const mutation = useMutationHook(async (data) => {
        const { id, access_token, ...rests } = data;
        const res = await UserService.updateUser(id, rests, access_token);
        return res;
    });
    const { data, isSuccess, isError } = mutation;

    useEffect(() => {
        setEmail(user?.email || '');
        setName(user?.name || '');
        setPhone(user?.phone || '');
        setAddress(user?.address || '');
        setAvatar(user?.avatar || '');
    }, [user]);

    useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            toast.success('Cập nhật hồ sơ thành công', {
                style: { fontSize: '1.5rem' },
            });
            handleGetDetailUser(user?.id, user?.access_token);
        } else if (isError || data?.status === 'ERR') {
            toast.error(data?.message || 'Có lỗi xảy ra', {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccess, isError, data]);

    const handleGetDetailUser = async (id, token) => {
        const res = await UserService.getDetailUser(id, token);
        dispatch(updateUser({ ...res?.data, access_token: token }));
    };

    const handleOnchangeEmail = (value) => setEmail(value);
    const handleOnchangeName = (value) => setName(value);
    const handleOnchangePhone = (value) => setPhone(value);
    const handleOnchangeAddress = (value) => setAddress(value);

    const handleOnchangeAvatar = async ({ fileList }) => {
        const file = fileList[0];
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setAvatar(file.preview);
    };

    const handleUpdate = () => {
        mutation.mutate({
            id: user?.id,
            name,
            email,
            phone,
            address,
            avatar,
            access_token: user?.access_token,
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Hồ sơ người dùng</h1>
            <p className={styles.subtitle}>
                Quản lý thông tin để bảo mật tài khoản
            </p>
            <div className={styles.profileCard}>
                <div className={styles.formSection}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tên</label>
                        <InputForm
                            className={styles.input}
                            value={name}
                            onChange={handleOnchangeName}
                            placeholder="Nhập tên của bạn"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <InputForm
                            className={styles.input}
                            value={email}
                            onChange={handleOnchangeEmail}
                            placeholder="Nhập email của bạn"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Số điện thoại</label>
                        <InputForm
                            className={styles.input}
                            value={phone}
                            onChange={handleOnchangePhone}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Địa chỉ</label>
                        <InputForm
                            className={styles.input}
                            value={address}
                            onChange={handleOnchangeAddress}
                            placeholder="Nhập địa chỉ"
                        />
                    </div>

                    <button
                        onClick={handleUpdate}
                        className={styles.updateButton}
                        disabled={mutation.isLoading}
                    >
                        Cập nhật thông tin
                    </button>
                </div>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper}>
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="Avatar"
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                Chưa có ảnh
                            </div>
                        )}
                    </div>
                    <Upload
                        onChange={handleOnchangeAvatar}
                        showUploadList={false}
                        maxCount={1}
                    >
                        <Button
                            icon={<UploadOutlined />}
                            className={styles.uploadButton}
                        >
                            Chọn ảnh
                        </Button>
                    </Upload>
                </div>
            </div>
        </div>
    );
};

export default ProfileUser;
