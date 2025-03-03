import { useMap } from "@hooks";
import React, { createContext, useContext, useCallback } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

interface ToastOptions {
    id?: string;
    title?: React.ReactNode | string;
    message: React.ReactNode | string;
    duration?: number | null;
    closable?: boolean;
}

interface ToasterContextProps {
    toast: {
        success: (options: ToastOptions) => void;
        danger: (options: ToastOptions) => void;
        warning: (options: ToastOptions) => void;
        info: (options: ToastOptions) => void;
    };
}

const ToasterContext = createContext<ToasterContextProps | undefined>(
    undefined
);

export const useToaster = () => {
    const context = useContext(ToasterContext);
    if (!context) {
        throw new Error("useToaster must be used within a ToasterProvider");
    }
    return context;
};

type InternalToast = ToastOptions & {
    type: string;
    id: string;
    duration: number | null;
    closable: boolean;
};

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const {
        array: toasts,
        setItem,
        removeItem,
    } = useMap<string, InternalToast>([]);

    const addToast = useCallback((type: string, options: ToastOptions) => {
        const id = Date.now();
        const toast = {
            id: id.toString(),
            duration: 5000,
            closable: false,
            ...options,
            type,
        };

        setItem(toast.id.toString(), toast);

        if (toast.duration === null) {
            return;
        }
        setTimeout(() => {
            removeItem(toast.id);
        }, options.duration || 5000);
    }, []);

    const success = (options: ToastOptions) => addToast("success", options);
    const danger = (options: ToastOptions) => addToast("danger", options);
    const warning = (options: ToastOptions) => addToast("warning", options);
    const info = (options: ToastOptions) => addToast("info", options);

    return (
        <ToasterContext.Provider
            value={{ toast: { success, danger, warning, info } }}
        >
            {children}
            <ToastContainer position="bottom-start" className="p-3">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        bg={toast.type}
                        onClose={() =>
                            toast.closable !== false && removeItem(toast.id)
                        }
                        delay={toast.duration || 5000}
                        autohide={toast.closable !== false}
                    >
                        {toast.title && (
                            <Toast.Header>
                                <strong className="me-auto">
                                    {toast.title}
                                </strong>
                            </Toast.Header>
                        )}
                        <Toast.Body>{toast.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToasterContext.Provider>
    );
};
