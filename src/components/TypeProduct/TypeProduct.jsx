import React from 'react';
import { useNavigate } from 'react-router-dom';

const TypeProduct = ({ name }) => {
    const navigate = useNavigate();
    const handleNavigatetype = (type) => {
        navigate(
            `/product/${type
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                ?.replace(/ /g, '_')}`,
            { state: { selectedType: type } },
        );
    };
    return (
        <div
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}
            onClick={() => handleNavigatetype(name)}
        >
            {name}
        </div>
    );
};
export default TypeProduct;
