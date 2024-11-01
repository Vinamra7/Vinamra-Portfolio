import React, { useRef } from "react";
import {motion, MotionValue, useScroll, useTransform} from "framer-motion";
import { cn } from "@/public/lib/utils";

interface ScrollRevealProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

const flatten = (children: React.ReactNode): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            if (child.type === React.Fragment) {
                result.push(...flatten(child.props.children));
            } else if (child.props.children) {
                result.push(React.cloneElement(child, {}));
            } else {
                result.push(child);
            }
        } else {
            const parts = String(child).split(/(\s+)/);
            result.push(
                ...parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>),
            );
        }
    });
    return result.flatMap((child) => (Array.isArray(child) ? child : [child]));
};

function OpacityChild({
                          children,
                          index,
                          total,
                          progress,
                      }: {
    children: React.ReactNode;
    index: number;
    total: number;
    progress: MotionValue<number>;
}) {
    const opacity = useTransform(progress, [index / total, (index + 1) / total], [0.5, 1]);
    let className = "";
    if (React.isValidElement(children)) {
        className = Reflect.get(children, "props")?.className;
    }
    return (
        <motion.span style={{ opacity }} className={cn(className)}>
            {children}
        </motion.span>
    );
}

export default function ScrollReveal({ children, className, ...props }: ScrollRevealProps) {
    const flat = flatten(children);
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    return (
        <div ref={ref} className={cn(className)} {...props}>
            {flat.map((child, index) => (
                <OpacityChild
                    progress={scrollYProgress}
                    index={index}
                    total={flat.length}
                    key={index}
                >
                    {child}
                </OpacityChild>
            ))}
        </div>
    );
}