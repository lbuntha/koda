import React from 'react';

interface RichTextProps {
    text: string;
    className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ text, className = "" }) => {
    return (
        <span className={className}>
            {text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-indigo-600 dark:text-indigo-400 font-extrabold">{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={j} className="text-slate-500 dark:text-slate-400 font-serif italic">{part.slice(1, -1)}</em>;
                        }
                        return <span key={j}>{part}</span>;
                    })}
                    {i < text.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))}
        </span>
    );
};
