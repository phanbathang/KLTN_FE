import React, { useEffect, useState } from 'react';
import ButtonComponents from '../../components/ButtonComponents/ButtonComponents';
import styles from './SignUpPage.module.scss';
import imageIcon from '../../assets/images/logo-login.png';
import { Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import InputForm from '../../components/InputForm/InputForm';
import InputFormPassword from '../../components/InputFormPassword/InputFormPassword';
import * as UserService from '../../services/UserService.js';
import { useMutationHook } from '../../hooks/useMutationHook.js';
import Loading from '../../components/LoadingComponent/Loading.jsx';
// import * as toast from '../../components/MessageComponent/MessageComponent';
import { Bounce, toast } from 'react-toastify';

const SignUpPage = () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
        navigate('/sign-in');
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mutation = useMutationHook((data) => UserService.signUpUser(data));

    const { data, isLoading, isSuccess, isError, error } = mutation;

    useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                handleSignIn();
                toast.success('Tạo tài khoản thành công. Vui lòng đăng nhập', {
                    style: { fontSize: '1.5rem' },
                });
            }, 2000);
        } else if (isError || data?.status === 'ERR') {
            const errorMessage =
                error?.response?.data?.message ||
                data?.message ||
                'An unexpected error occurred';
            toast.error(errorMessage, {
                style: { fontSize: '1.5rem' },
            });
        }
    }, [isSuccess, isError, data]);

    const handleOnchangeEmail = (value) => {
        setEmail(value);
    };

    const handleOnchangePassword = (value) => {
        setPassword(value);
    };

    const handleOnchangeConfirmPassword = (value) => {
        setConfirmPassword(value);
    };

    const handleSignUp = () => {
        if (!email || !password || !confirmPassword) {
            toast.error('Please fill out all fields.');
            return;
        }
        mutation.mutate({ email, password, confirmPassword });
    };

    return (
        <div
            style={{
                background: 'rgba(0, 0, 0, 0.53)',
                display: 'flex',
                justifyContent: 'center',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <div className={styles.Wrapper}>
                <div className={styles.WrapperLoginLeft}>
                    <h1 style={{ fontSize: '3rem' }}>Tạo tài khoản</h1>
                    <p
                        style={{
                            fontSize: '1.5rem',
                            opacity: '0.9',
                            marginBottom: '20px',
                        }}
                    >
                        Nhập email và mật khẩu để đăng kí tài khoản MixiShop
                    </p>
                    <InputForm
                        placeholder="abc@gmail.com"
                        style={{ marginBottom: '15px' }}
                        value={email}
                        onChange={handleOnchangeEmail}
                    />
                    <InputFormPassword
                        style={{
                            width: '384px',
                            display: 'flex',
                        }}
                        placeholder="Input password"
                        value={password}
                        onChange={handleOnchangePassword}
                    />
                    <InputFormPassword
                        style={{
                            marginTop: '15px',
                            width: '384px',
                            display: 'flex',
                        }}
                        placeholder="Confirm input password"
                        value={confirmPassword}
                        onChange={handleOnchangeConfirmPassword}
                    />
                    {/* {data?.status === 'ERR' && <span>{data?.message}</span>} */}
                    <Loading isLoading={isLoading || isSubmitting}>
                        <ButtonComponents
                            disabled={
                                !email.length ||
                                !password.length ||
                                !confirmPassword.length
                            }
                            onClick={handleSignUp}
                            className={styles.WrapperButtonBuy}
                            textButton="Đăng kí"
                        ></ButtonComponents>
                    </Loading>
                    <div
                        style={{
                            paddingTop: '20px',
                            fontSize: '1.3rem',
                            color: '#2561b1',
                            display: 'flex',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={handleSignIn}
                    >
                        Đăng nhập bằng email
                    </div>
                    {/* <div
                        style={{
                            paddingTop: '20px',
                            fontSize: '1.5rem',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        Hoặc tiếp tục bằng
                    </div>
                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg"
                            style={{ width: '35px', marginRight: '25px' }}
                        />
                        <img
                            src="https://cdn.pixabay.com/photo/2021/05/24/09/15/google-logo-6278331_960_720.png"
                            style={{ width: '35px' }}
                        />
                    </div> */}
                </div>
                <div className={styles.WrapperLoginRight}>
                    <Image
                        src={imageIcon}
                        preview={false}
                        style={{ width: '150px' }}
                    />
                    <div
                        style={{
                            paddingTop: '20px',
                            fontSize: '1.5rem',
                        }}
                    >
                        Mua sắm tại THANGBOOK
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
