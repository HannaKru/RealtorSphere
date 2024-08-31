import React from 'react';
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <button className="absolute top-2 right-2" onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;