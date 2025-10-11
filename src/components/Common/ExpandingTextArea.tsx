import React, { KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { FormControl, FormControlProps } from "react-bootstrap";

type ExpandingTextAreaProps = {
    maxHeight?: string;
    onSubmit?: (text: string) => void;
    onChange?: (text: string) => void;
    placeholder?: string;
    styleProps?: FormControlProps;
};

export const ExpandingTextArea: React.FC<ExpandingTextAreaProps> = ({
    maxHeight = "15rem",
    onSubmit,
    onChange,
    placeholder = "Enter your message here",
    styleProps,
}) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        const textarea = textAreaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const scrollHeight = textarea.scrollHeight;
            let maxHeightPx;

            if (maxHeight.endsWith("rem")) {
                maxHeightPx = parseFloat(maxHeight) * 16; // Convert maxHeight from rem to px
            } else if (maxHeight.endsWith("px")) {
                maxHeightPx = parseFloat(maxHeight); // maxHeight is already in px
            } else {
                maxHeightPx = parseFloat(maxHeight) * 16; // Default to rem if no unit is specified
            }

            const newHeight = Math.min(scrollHeight, maxHeightPx);
            textarea.style.height = `${newHeight / 16}rem`; // Convert newHeight from px to rem
        }
    }, [maxHeight]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!textAreaRef.current) return;
        onChange?.(textAreaRef.current.value);
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (textAreaRef.current?.value && onSubmit) {
            onSubmit(textAreaRef.current.value);
            textAreaRef.current.value = "";
            adjustHeight();
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [adjustHeight]);

    return (
        <FormControl
            {...styleProps}
            as="textarea"
            ref={textAreaRef}
            onChange={adjustHeight}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            style={{
                resize: "none",
                minHeight: "3rem",
                maxHeight,
                overflow: "auto",
                border: "none",
                outline: "none",
            }}
            placeholder={placeholder}
        />
    );
};
