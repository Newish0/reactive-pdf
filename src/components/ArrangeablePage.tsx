import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface ArrangeablePageProps {
    thumbnail: string;
    index: number;
    onClickLeft: (oldIndex: number) => void;
    onClickRight: (oldIndex: number) => void;
}

export default function ArrangeablePage(props: ArrangeablePageProps) {
    return (
        <div key={props.index}>
            <img src={props.thumbnail} style={{ maxWidth: "100%" }} />
            <div style={{textAlign: "center" }}>{props.index + 1}</div>
            <div style={{ textAlign: "center" }}>
                <span style={{display: "inline", marginInline: "8px"}}
                    onClick={() => {
                        props.onClickLeft(props.index);
                    }}
                >
                    <FaArrowLeft />
                </span>
                <span style={{display: "inline", marginInline: "8px"}}
                    onClick={() => {
                        props.onClickRight(props.index);
                    }}
                >
                    <FaArrowRight />
                </span>
            </div>
        </div>
    );
}
