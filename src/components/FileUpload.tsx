import { CSSProperties } from "react";
import { FaPlus } from "react-icons/fa";
import PseudoPage from "./PseudoPage";

interface FileUploadProps {
    onChange: (files: FileList) => void;
    accept?: string;
    clearFileOnUpload?: boolean;
    style?: CSSProperties;
}

export default function FileUpload({
    onChange: changeHandler,
    accept,
    clearFileOnUpload,
    style,
}: FileUploadProps) {
    return (
        <PseudoPage style={style}>
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
        </PseudoPage>
    );
}
