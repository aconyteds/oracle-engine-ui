import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback } from "react";
import { Button, Card } from "react-bootstrap";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useToaster } from "../../contexts";

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: unknown; // Allow additional props from react-markdown
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
    inline,
    className,
    children,
}) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children || "").replace(/\n$/, "");
    const { toast } = useToaster();

    const copyToClipboard = useCallback(
        async (code: string) => {
            try {
                await navigator.clipboard.writeText(code);
                toast.info({
                    title: "Copied!",
                    message: "Code copied to clipboard",
                    duration: null,
                });
            } catch {
                toast.danger({
                    title: "Copy Failed",
                    message: "Failed to copy code to clipboard",
                    duration: 3000,
                });
            }
        },
        [toast]
    );

    if (inline) {
        return <code className="bg-light p-1 rounded">{children}</code>;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center bg-dark text-white">
                <span className="text-capitalize">{language || "Code"}</span>
                <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                    className="d-flex align-items-center gap-1"
                >
                    <FontAwesomeIcon icon={faCopy} size="sm" />
                    Copy
                </Button>
            </Card.Header>
            <Card.Body className="p-0 pb-1 bg-dark border-top">
                <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    className="mb-0 mt-0"
                    wrapLongLines={true}
                    codeTagProps={{
                        style: {
                            wordBreak: "break-word",
                        } as React.CSSProperties,
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </Card.Body>
        </Card>
    );
};
