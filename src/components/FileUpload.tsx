import { FaPlus } from "react-icons/fa";

interface FileUploadProps {
    onChange: (files: FileList) => void;
    accept?: string;
    clearFileOnUpload?: boolean;
}

export default function FileUpload({
    onChange: changeHandler,
    accept,
    clearFileOnUpload,
}: FileUploadProps) {
    return (
        <div
            style={{
                position: "relative",
                aspectRatio: "8.5/11",
                margin: "auto",
                maxHeight: "100%",
                maxWidth: "100%",
                border: "5px dashed var(--primary)",
            }}
            data-tooltip="Click or drop to add file"
        >
            <input
                type="file"
                name="file"
                accept={accept ?? ""}
                style={{
                    height: "100%",
                    margin: 0,
                    cursor: "pointer",
                    opacity: 0,
                }}
                onChange={(evt) => {
                    changeHandler(evt.target.files as FileList);
                    if (clearFileOnUpload) evt.target.value = "";
                }}
                title="Click or drop to add file"
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
