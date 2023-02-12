export default function PseudoPage(
    props: React.HTMLAttributes<HTMLDivElement>
) {
    return (
        <div
            {...props}
            style={{
                position: "relative",
                aspectRatio: "8.5/11",
                margin: "auto",
                maxHeight: "100%",
                maxWidth: "100%",
                border: "5px dashed var(--primary)",
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}
