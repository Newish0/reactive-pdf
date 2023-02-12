import { CSSProperties } from "react";

interface DivImgProps {
    src: string;
    height?: CSSProperties["height"];
    style?: CSSProperties;
}

export default function DivImg(props: DivImgProps) {
    return (
        <div
            style={{
                height: props.height,
                backgroundImage: `url(${props.src})`,
                backgroundSize: "contain",
                backgroundPosition: "top center",
                ...props.style,
            }}
        ></div>
    );
}
