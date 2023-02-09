import { FaPlus } from "react-icons/fa";

interface FileUploadProps {
    onChange: (files: FileList) => void;
}

export default function FileUpload({
    onChange: changeHandler,
}: FileUploadProps) {
    return (
        <div
            style={{
                position: "relative",
                aspectRatio: "8.5/11",
                width: "100%",
                border: "5px dashed var(--primary)",
            }}
        >
            <input
                type="file"
                name="file"
                style={{
                    height: "100%",
                    margin: 0,
                    cursor: "pointer",
                    opacity: 0,
                }}
                onChange={(evt) => {
                    changeHandler(evt.target.files as FileList);
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                }}
            >
                <FaPlus />
            </div>
        </div>
    );
}
