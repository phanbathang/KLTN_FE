import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './RulePage.module.scss';
import * as RuleService from '../../services/RuleService.js';

const RulePage = () => {
    const getAllRules = async () => {
        const res = await RuleService.getAllRule();
        return res;
    };

    const {
        isLoading,
        data: rules,
        error,
    } = useQuery({
        queryKey: ['rules'],
        queryFn: getAllRules,
        onError: (err) => {
            console.error('Failed to fetch rules:', err);
            toast.error('Không thể tải quy định', {
                style: { fontSize: '1.5rem' },
            });
        },
    });

    if (isLoading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    if (error || !rules?.data?.length) {
        return (
            <div className={styles.error}>
                Không có quy định nào để hiển thị.
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Quy Định Thuê Sách</h1>

            {rules.data.map((rule, index) => (
                <section key={rule._id} className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        {`${index + 1}. ${rule.title}`}
                    </h2>
                    <ul className={styles.list}>
                        {rule.contents.map((content, idx) => (
                            <li key={idx}>{content}</li>
                        ))}
                    </ul>
                </section>
            ))}

            <p className={styles.note}>
                (*) Mọi quy định có thể thay đổi theo thời điểm và sẽ được cập
                nhật tại trang này.
            </p>
        </div>
    );
};

export default RulePage;
