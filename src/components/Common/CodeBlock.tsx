import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    onCopy?: (code: string) => void;
    [key: string]: unknown; // Allow additional props from react-markdown
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
    inline,
    className,
    children,
    onCopy,
}) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children || "").replace(/\n$/, "");

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
                    onClick={() => onCopy?.(code)}
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
                >
                    {code}
                </SyntaxHighlighter>
            </Card.Body>
        </Card>
    );
};
