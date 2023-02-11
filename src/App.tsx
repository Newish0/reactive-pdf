import { createRef, useEffect, useRef, useState } from "react";

import "./App.css";
import "@picocss/pico";

import * as pdfjsLib from "pdfjs-dist";
import { degrees, PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";

import { PDFThumb } from "./util/PDFHelpers";

import FileUpload from "./components/FileUpload";

import ArrangeablePage from "./components/ArrangeablePage";

import { v4 as uuidv4 } from "uuid";

import {
    GridContextProvider,
    GridDropZone,
    GridItem,
    swap,
} from "react-grid-dnd";

interface PDFPageData {
    src: string;
    file: File;
    pdfData: ArrayBuffer | string;
    pageNumber: number;
    id: string;
}

function App() {
    const [pages, setPages] = useState<Array<PDFPageData>>([]);

    const handleFileUpload = (files: FileList) => {
        const file = files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e?.target?.result) {
                const pdfData = e?.target?.result;
                const pdfId = uuidv4();

                // FIXME: service worker may mismatch version since from different source
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/pdf.worker.js";

                const loadingTask = pdfjsLib.getDocument(pdfData);
                (async function () {
                    const pdf = await loadingTask.promise;

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const thumbSrc = await PDFThumb.create(page);

                        if (thumbSrc)
                            setPages((pages) => [
                                ...pages,
                                {
                                    src: thumbSrc,
                                    file,
                                    pdfData,
                                    pageNumber: i,
                                    id: pdfId,
                                },
                            ]);
                    }
                })();
            }
        };
        reader.readAsDataURL(file);
    };

    const processPages = async () => {
        const pdfPagesMap = new Map<File, PDFPage[]>();
        const newPdfDoc = await PDFDocument.create();

        console.debug("PAGES TO PROCESS", pages);

        for (const page of pages) {
            const { file, pdfData, pageNumber } = page;

            if (!pdfPagesMap.has(file)) {
                const pdfDoc = await PDFDocument.load(pdfData);
                const indices = pdfDoc.getPageIndices();
                const pdfPages = await newPdfDoc.copyPages(pdfDoc, indices);

                pdfPagesMap.set(file, pdfPages);
            }

            const curPages = pdfPagesMap.get(file);

            if (!curPages) throw new Error("PDF Pages not found in map.");

            newPdfDoc.addPage(curPages[pageNumber - 1]);
        }

        const newPdfBytes = await newPdfDoc.save();

        var blob = new Blob([newPdfBytes], { type: "application/pdf" });
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        var fileName = "merged.pdf";
        link.download = fileName;
        link.click();
    };

    const onChange = (
        sourceId: string,
        sourceIndex: number,
        targetIndex: number
    ) => {
        if (sourceIndex >= pages.length || targetIndex >= pages.length) return;
        let swappedPages = swap(pages, sourceIndex, targetIndex);
        setPages(swappedPages);
    };

    const dndRowHeight = 192;
    const dndColWidth = 192;
    const dndNumRow = Math.floor(
        Math.min(window.innerWidth, 1140) / dndColWidth
    );
    const dndMargin = 48;

    return (
        <div className="App">
            <header>
                <div className="container">
                    <h1>Reactive PDF Tool</h1>
                </div>
            </header>

            <main className="container">
                <GridContextProvider onChange={onChange}>
                    <div className="container">
                        <GridDropZone
                            id="pages"
                            boxesPerRow={dndNumRow}
                            rowHeight={dndRowHeight + dndMargin}
                            style={{
                                height: Math.max(
                                    dndRowHeight + dndMargin,
                                    Math.ceil((pages.length + 1) / dndNumRow) *
                                        (dndRowHeight + dndMargin)
                                ),
                            }}
                        >
                            {pages.map((p, i) => (
                                <GridItem
                                    key={`item-${i}-${p.id}-${p.pageNumber}`}
                                >
                                    <div
                                        style={{
                                            height: dndRowHeight,
                                            maxWidth: dndColWidth,
                                            marginInline: "8px",
                                            backgroundImage: `url(${p.src})`,
                                            backgroundSize: "contain",
                                            backgroundPosition: "top center",
                                        }}
                                    ></div>
                                </GridItem>
                            ))}

                            <GridItem draggable="false">
                                <div
                                    style={{
                                        height: dndRowHeight,
                                        textAlign: "center",
                                    }}
                                >
                                    <FileUpload
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        clearFileOnUpload={true}
                                    />
                                </div>
                            </GridItem>
                        </GridDropZone>
                    </div>
                </GridContextProvider>

                <br />
                <button onClick={processPages}>Process</button>
            </main>
        </div>
    );
}

export default App;
