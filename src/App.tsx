import { createRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@picocss/pico";

import * as pdfjsLib from "pdfjs-dist";
import { PDFThumb } from "./util/PDFHelpers";

import FileUpload from "./components/FileUpload";

import testPDF from "./test/1.pdf";

import Reorder, { reorder, reorderImmutable, reorderFromTo, reorderFromToImmutable } from "react-reorder";

function App() {
    const [files, setFiles] = useState([]);
    const [pageThumbnailSources, setPageThumbnailSources] = useState<Array<string>>([]);

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
                            setPageThumbnailSources((pageThumbnailSources) => [...pageThumbnailSources, thumbSrc]);
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
                {/* TODO: USE https://github.com/JakeSidSmith/react-reorder */}
                {pageThumbnailSources.map((src, i) => (
                    <div key={`page-thumb-${i}`}>
                        <img src={src} />
                        <div>{i + 1}</div>
                    </div>
                ))}

                <FileUpload onChange={handleFileUpload} />
            </div>

            <Reorder
                reorderId="my-list" // Unique ID that is used internally to track this list (required)
                reorderGroup="reorder-group" // A group ID that allows items to be dragged between lists of the same group (optional)
                component="ul" // Tag name or Component to be used for the wrapping element (optional), defaults to 'div'
                placeholderClassName="placeholder" // Class name to be applied to placeholder elements (optional), defaults to 'placeholder'
                draggedClassName="dragged" // Class name to be applied to dragged elements (optional), defaults to 'dragged'
                lock="horizontal" // Lock the dragging direction (optional): vertical, horizontal (do not use with groups)
                holdTime={500} // Default hold time before dragging begins (mouse & touch) (optional), defaults to 0
                touchHoldTime={500} // Hold time before dragging begins on touch devices (optional), defaults to holdTime
                mouseHoldTime={200} // Hold time before dragging begins with mouse (optional), defaults to holdTime
                onReorder={() => {}} // Callback when an item is dropped (you will need this to update your state)
                autoScroll={true} // Enable auto-scrolling when the pointer is close to the edge of the Reorder component (optional), defaults to true
                disabled={false} // Disable reordering (optional), defaults to false
                disableContextMenus={true} // Disable context menus when holding on touch devices (optional), defaults to true
                placeholder={
                    <div className="custom-placeholder" /> // Custom placeholder element (optional), defaults to clone of dragged element
                }
            >
                {
                    // ["a", "b", "c"].map((item) => <li key={item}>{item}</li>).toArray()
                    ["a", "b", "c"].map((item) => (
                        <li key={item}>{item}</li>
                    ))
                    /*
                Note this example is an ImmutableJS List so we must convert it to an array.
                I've left this up to you to covert to an array, as react-reorder updates a lot,
                and if I called this internally it could get rather slow,
                whereas you have greater control over your component updates.
                */
                }
            </Reorder>
        </div>
    );
}

export default App;
