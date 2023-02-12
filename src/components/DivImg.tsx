import { CSSProperties } from "react";

interface DivImgProps {
    src: string;
    height?: CSSProperties["height"];
    style?: CSSProperties;
    className?: string;
}

export default function DivImg(props: DivImgProps) {
    return (
        <div
            className={props.className}
            style={{
                height: props.height,
                width: "100%",
                backgroundImage: `url(${props.src})`,
                backgroundSize: "contain",
                backgroundPosition: "top center",
                ...props.style,
            }}
        ></div>
    );
}
