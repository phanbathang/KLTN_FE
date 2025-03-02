import React, { useEffect, useState } from 'react';
import InputForm from '../../components/InputForm/InputForm';
import styles from './ProfileUser.module.scss';
import ButtonComponents from '../../components/ButtonComponents/ButtonComponents';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../services/UserService.js';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import { Bounce, toast } from 'react-toastify';
import { updateUser } from '../../redux/slides/userSlide.js';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getBase64 } from '../../ultils.js';

const ProfileUser = () => {
    const user = useSelector((state) => state.user);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const { data, isSuccess, isError, error } = mutation;

    useEffect(() => {
        setEmail(user?.email);
        setName(user?.name);
        setPhone(user?.phone);
        setAddress(user?.address);
        setAvatar(user?.avatar);
    }, [user]);

    useEffect(() => {
        if (isSuccess || data?.status === 'OK') {
            setIsSubmitting(true);
            setIsSubmitting(false);
            toast.success('Cập nhật hồ sơ thành công', {
                style: { fontSize: '1.5rem' },
            });
            mutation.reset();
            handleGetDetailUser(user?.id, user?.access_token);
        } else if (isError || data?.status === 'ERR') {
            const errorMessage =
                error?.response?.data?.message ||
                data?.message ||
                'An unexpected error occurred';
            toast.error(errorMessage, {
                style: { fontSize: '1.5rem' },
            });
            mutation.reset();
        }
    }, [isSuccess, isError, data]);

    const handleGetDetailUser = async (id, token) => {
        const res = await UserService.getDetailUser(id, token);
        dispatch(updateUser({ ...res?.data, access_token: token }));
    };

    const handleOnchangeEmail = (value) => {
        setEmail(value);
    };

    const handleOnchangeName = (value) => {
        setName(value);
    };

    const handleOnchangePhone = (value) => {
        setPhone(value);
    };

    const handleOnchangeAddress = (value) => {
        setAddress(value);
    };

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
        <div>
            <div style={{ width: '1000px', margin: '0 auto' }}>
                <h1 style={{ marginTop: '20px' }}>Thông tin người dùng</h1>
                <div style={{ fontSize: '1.5rem', color: '#333' }}>
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                </div>
                <div className={styles.WrapperContainer}>
                    <div
                        style={{
                            flex: '1',
                            marginLeft: '6%',
                        }}
                    >
                        <div className={styles.WrapperSection}>
                            <span>Tên</span>
                            <InputForm
                                style={{ marginBottom: '15px' }}
                                className={styles.WrapperInput}
                                value={name}
                                onChange={handleOnchangeName}
                            />
                            <ButtonComponents
                                onClick={handleUpdate}
                                className={styles.WrapperButton}
                                textButton="Cập nhật"
                            />
                        </div>
                        <div className={styles.WrapperSection}>
                            <span>Email</span>
                            <InputForm
                                style={{ marginBottom: '15px' }}
                                className={styles.WrapperInput}
                                value={email}
                                onChange={handleOnchangeEmail}
                            />
                            <ButtonComponents
                                onClick={handleUpdate}
                                className={styles.WrapperButton}
                                textButton="Cập nhật"
                            />
                        </div>
                        <div className={styles.WrapperSection}>
                            <span>Số điện thoại</span>
                            <InputForm
                                style={{ marginBottom: '15px' }}
                                className={styles.WrapperInput}
                                value={phone}
                                onChange={handleOnchangePhone}
                            />
                            <ButtonComponents
                                onClick={handleUpdate}
                                className={styles.WrapperButton}
                                textButton="Cập nhật"
                            />
                        </div>
                        <div className={styles.WrapperSection}>
                            <span>Địa chỉ</span>
                            <InputForm
                                style={{ marginBottom: '15px' }}
                                className={styles.WrapperInput}
                                value={address}
                                onChange={handleOnchangeAddress}
                            />
                            <ButtonComponents
                                onClick={handleUpdate}
                                className={styles.WrapperButton}
                                textButton="Cập nhật"
                            />
                        </div>
                    </div>
                    <div className={styles.WrapperPicture}>
                        <Upload
                            onChange={handleOnchangeAvatar}
                            showUploadList={false}
                            maxCount={1}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                className={styles.WrapperSelect}
                            >
                                Upload png only
                            </Button>
                        </Upload>
                        {avatar && (
                            <img
                                src={avatar}
                                style={{
                                    height: '70px',
                                    width: '70px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginTop: '30px',
                                    marginBottom: '30px',
                                }}
                                alt="avatar"
                            />
                        )}
                        <ButtonComponents
                            onClick={handleUpdate}
                            className={styles.WrapperSelect}
                            textButton="Chọn ảnh"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUser;
