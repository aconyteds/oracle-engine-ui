import React from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
}) => {
    return (
        <ReactMarkdown
            components={{
                code: (props) => <CodeBlock {...props} />,
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
