import React, { useState, ReactNode } from 'react';

type AccordionItemProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
};

const Accordion: React.FC<AccordionItemProps> = ({
    title,
    children,
    defaultOpen = false,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="content">
            <p
                onClick={() => setIsOpen(!isOpen)}
                className="title"
            >
                {title}
            </p>
            {isOpen && (
                <div className="desc">
                    {children}
                </div>
            )}
        </div>
    );
};


export default Accordion;