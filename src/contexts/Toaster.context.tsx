import { useMap } from "@hooks";
import * as Sentry from "@sentry/react";
import React, { createContext, useCallback, useContext } from "react";
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

// Global toast service for non-React code (e.g., Apollo Client)
let globalToastService: ToasterContextProps["toast"] | null = null;

export const setGlobalToastService = (
    service: ToasterContextProps["toast"] | null
) => {
    globalToastService = service;
};

export const showToast = {
    success: (options: ToastOptions) => {
        if (globalToastService) {
            globalToastService.success(options);
        } else {
            console.warn("Toast service not initialized:", options);
        }
    },
    danger: (options: ToastOptions) => {
        // Log danger toasts to Sentry for monitoring
        Sentry.logger.error(`Danger Toast: ${options.title || "Error"}`, {
            level: "error",
            extra: {
                title: options.title,
                message:
                    typeof options.message === "string"
                        ? options.message
                        : "React component",
            },
        });

        if (globalToastService) {
            globalToastService.danger(options);
        } else {
            console.warn("Toast service not initialized:", options);
        }
    },
    warning: (options: ToastOptions) => {
        if (globalToastService) {
            globalToastService.warning(options);
        } else {
            console.warn("Toast service not initialized:", options);
        }
    },
    info: (options: ToastOptions) => {
        if (globalToastService) {
            globalToastService.info(options);
        } else {
            console.warn("Toast service not initialized:", options);
        }
    },
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

    const addToast = useCallback(
        (type: string, options: ToastOptions) => {
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
        },
        [removeItem, setItem]
    );

    const success = useCallback(
        (options: ToastOptions) => addToast("success", options),
        [addToast]
    );
    const danger = useCallback(
        (options: ToastOptions) => addToast("danger", options),
        [addToast]
    );
    const warning = useCallback(
        (options: ToastOptions) => addToast("warning", options),
        [addToast]
    );
    const info = useCallback(
        (options: ToastOptions) => addToast("info", options),
        [addToast]
    );

    const contextValue = React.useMemo(
        () => ({ toast: { success, danger, warning, info } }),
        [success, danger, warning, info]
    );

    // Register global toast service on mount
    React.useEffect(() => {
        setGlobalToastService({ success, danger, warning, info });
        return () => setGlobalToastService(null);
    }, [success, danger, warning, info]);

    return (
        <ToasterContext.Provider value={contextValue}>
            {children}
            <ToastContainer position="bottom-end" className="p-3">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        bg={toast.type}
                        onClose={
                            toast.closable
                                ? () => removeItem(toast.id)
                                : undefined
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
