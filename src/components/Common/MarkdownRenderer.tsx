import React, { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { useToaster } from "@context";

interface MarkdownRendererProps {
    content: string;
}

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: unknown; // Allow additional props from react-markdown
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
}) => {
    const { toast } = useToaster();

    const copyToClipboard = useCallback(
        async (code: string) => {
            try {
                await navigator.clipboard.writeText(code);
                toast.info({
                    title: "Copied!",
                    message: "Code copied to clipboard",
                    duration: 2000,
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

    const CodeBlock: React.FC<CodeBlockProps> = ({
        inline,
        className,
        children,
    }) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";
        const code = String(children || "").replace(/\n$/, "");

        if (inline) {
            return <code className="bg-light p-1 rounded">{children}</code>;
        }

        return (
            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center bg-dark text-white">
                    <span className="text-capitalize">
                        {language || "Code"}
                    </span>
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
                <Card.Body className="p-0">
                    <SyntaxHighlighter
                        style={atomDark}
                        language={language}
                        PreTag="div"
                        className="mb-0"
                    >
                        {code}
                    </SyntaxHighlighter>
                </Card.Body>
            </Card>
        );
    };

    return (
        <ReactMarkdown
            components={{
                code: CodeBlock,
                h1: ({ children }) => <h1 className="h4 mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="h5 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="h6 mb-2">{children}</h3>,
                h4: ({ children }) => <h4 className="h6 mb-2">{children}</h4>,
                h5: ({ children }) => <h5 className="h6 mb-2">{children}</h5>,
                h6: ({ children }) => <h6 className="h6 mb-2">{children}</h6>,
                blockquote: ({ children }) => (
                    <blockquote className="blockquote border-start border-3 border-secondary ps-3 mb-3">
                        {children}
                    </blockquote>
                ),
                table: ({ children }) => (
                    <div className="table-responsive mb-3">
                        <table className="table table-striped">
                            {children}
                        </table>
                    </div>
                ),
                ul: ({ children }) => <ul className="mb-3">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3">{children}</ol>,
                p: ({ children }) => <p className="mb-3">{children}</p>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};
