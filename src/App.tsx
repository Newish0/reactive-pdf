import { createRef, useState } from "react";

import "./App.css";
import "@picocss/pico";

import * as pdfjsLib from "pdfjs-dist";
import { degrees, PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";

import { PDFThumb } from "./util/PDFHelpers";

import FileUpload from "./components/FileUpload";

import ArrangeablePage from "./components/ArrangeablePage";

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
}

function App() {
    const [pages, setPages] = useState<Array<PDFPageData>>([]);

    const handleFileUpload = (files: FileList) => {
        const file = files[0];
        console.debug(file);

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
                            setPages((pages) => [
                                ...pages,
                                {
                                    src: thumbSrc,
                                    file,
                                    pdfData,
                                    pageNumber: i,
                                },
                            ]);
                    }
                })();
            }
        };
        reader.readAsDataURL(file);

        // pdfjsLib.getDocument(testPDF);
    };

    const swapPage = (a: number, b: number) => {
        if (a < 0 || a >= pages.length || b < 0 || b >= pages.length)
            return null;

        let pagesNewState = [...pages];
        let tmp = pagesNewState[a];
        pagesNewState[a] = pagesNewState[b];
        pagesNewState[b] = tmp;

        setPages(pagesNewState);
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

    const [items, setItems] = useState<string[]>([
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "c",
        "d",
        "e",
        "f",
    ]);

    function onChange(
        sourceId: string,
        sourceIndex: number,
        targetIndex: number
    ) {
        let swappedPages = swap(pages, sourceIndex, targetIndex);
        setPages(swappedPages);
    }

    const dndRowHeight = 192;

    return (
        <div className="App">
            <header>
                <div className="container">
                    <h1>Reactive PDF Tool</h1>
                </div>
            </header>

            <main>
                <GridContextProvider onChange={onChange}>
                    <div className="container">
                        <GridDropZone
                            id="pages"
                            boxesPerRow={4}
                            rowHeight={dndRowHeight + 48}
                            style={{
                                height: Math.max(
                                    dndRowHeight + 48,
                                    Math.ceil((pages.length + 1) / 4) *
                                        (dndRowHeight + 48)
                                ),
                            }}
                        >
                            {pages.map((p, i) => (
                                <GridItem key={`item-${i}`}>
                                    <div
                                        style={{
                                            height: dndRowHeight,
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                backgroundImage: `url(${p.src})`,
                                                backgroundSize: "contain",
                                                backgroundPosition: "center",
                                            }}
                                        >
                                            {p.pageNumber}
                                        </div>
                                    </div>
                                </GridItem>
                            ))}

                            <GridItem>
                                <div
                                    style={{
                                        height: dndRowHeight,
                                        textAlign: "center",
                                    }}
                                >
                                    <FileUpload onChange={handleFileUpload} />
                                </div>
                            </GridItem>
                        </GridDropZone>
                    </div>
                </GridContextProvider>

                <br />
                <button onClick={processPages}>Process</button>
            </main>

            {/* <GridContextProvider onChange={onChange}>
                <GridDropZone
                    id="items"
                    boxesPerRow={4}
                    rowHeight={280}
                    style={{ height: 280 }}
                >
                    {items.map((item: string) => (
                        <GridItem key={item}>
                            <div>{item}</div>
                        </GridItem>
                    ))}
                </GridDropZone>
            </GridContextProvider> */}
        </div>
    );
}

export default App;
