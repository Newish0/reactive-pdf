import { createRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@picocss/pico";

import * as pdfjsLib from "pdfjs-dist";
import { PDFThumb } from "./util/PDFHelpers";

import FileUpload from "./components/FileUpload";

import testPDF from "./test/1.pdf";

import { Draggable } from "react-drag-reorder";


function App() {
    const [files, setFiles] = useState([]);
    const [pageThumbnailSources, setPageThumbnailSources] = useState<
        Array<string>
    >([]);

    const handleFileUpload = (files: FileList) => {
        console.log(files[0]);

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e?.target?.result) {
                const pdfData = e?.target?.result;

                // FIXME: service worker may mismatch version since from different source
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/pdf.worker.js";

                const loadingTask = pdfjsLib.getDocument(pdfData);
                (async function () {
                    const pdf = await loadingTask.promise;

                    // Fetch the first page.

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);

                        const thumbSrc = await PDFThumb.create(page);

                        if (thumbSrc)
                            setPageThumbnailSources((pageThumbnailSources) => [
                                ...pageThumbnailSources,
                                thumbSrc,
                            ]);
                    }
                })();
            }
        };
        reader.readAsDataURL(files[0]);

        // pdfjsLib.getDocument(testPDF);
    };

    console.log(pageThumbnailSources);

    return (
        <div className="App">
            <div className="free-grid">

                // TODO: USE https://github.com/JakeSidSmith/react-reorder
                {pageThumbnailSources.map((src, i) => (
                    <div key={`page-thumb-${i}`}>
                        <img src={src} />
                        <div>{i + 1}</div>
                    </div>
                ))}

                <FileUpload onChange={handleFileUpload} />
            </div>

        </div>
    );
}

export default App;
