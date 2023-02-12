import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { degrees, PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
import * as PDFHelper from "../util/PDFHelper";
import FileUpload from "./FileUpload";
import { v4 as uuidv4 } from "uuid";
import { GridItem, swap } from "react-grid-dnd";
import DynamicGridDnd from "./DynamicGridDnd";
import DivImg from "./DivImg";
import { FaTrash } from "react-icons/fa";

interface PDFPageData {
    src: string;
    file: File;
    pdfData: ArrayBuffer | string;
    pageNumber: number;
    id: string;
}

export default function PDFRearranger() {
    const [pages, setPages] = useState<Array<PDFPageData>>([]);
    const [outputName, setOutputName] = useState("merged.pdf");
    const [isExporting, setIsExporting] = useState(false);

    const handleFileUpload = (files: FileList) => {
        const file = files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e?.target?.result) {
                const pdfData = e?.target?.result;
                const pdfId = uuidv4();

                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    PDFHelper.PDFJS_WORKER_SRC;

                const loadingTask = pdfjsLib.getDocument(pdfData);
                (async function () {
                    const pdf = await loadingTask.promise;

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);

                        const thumbSrc = await PDFHelper.createThumb(page, {
                            scale: 0.32,
                        });

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

    const exportPages = async () => {
        setIsExporting(true);

        const pdfPagesMap = new Map<File, PDFPage[]>();
        const newPdfDoc = await PDFDocument.create();

        console.debug("PAGES TO EXPORT", pages);

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
        PDFHelper.downloadPDF(newPdfBytes, outputName);

        setIsExporting(false);
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

    const dndRowHeight = 220;
    const dndColWidth = 192;

    return (
        <React.Fragment>
            <DynamicGridDnd
                onChange={onChange}
                rowHeight={dndRowHeight}
                colWidth={dndColWidth}
                maxWidth={1142}
                rowMargin={"auto"}
                numItems={pages.length}
                id={"pages-dnd"}
            >
                {pages.map((p, i) => (
                    <GridItem key={`item-${i}-${p.id}-${p.pageNumber}`}>
                        <DivImg
                            src={p.src}
                            height={dndRowHeight}
                            style={{ marginInline: "8px" }}
                        />

                        <div style={{ position: "absolute", top: 0, right: 0}}>
                            <small>
                                {/* // TODO */}
                            </small>
                        </div>
                    </GridItem>
                ))}

                <GridItem>
                    <FileUpload
                        accept=".pdf"
                        onChange={handleFileUpload}
                        clearFileOnUpload={true}
                        style={{
                            height: dndRowHeight,
                            textAlign: "center",
                        }}
                    />
                </GridItem>
            </DynamicGridDnd>
            <br />
            <input
                type="text"
                defaultValue={outputName}
                onChange={(evt) => setOutputName(evt.target.value)}
            />
            {isExporting ? (
                <button
                    onClick={exportPages}
                    aria-busy="true"
                    className="secondary"
                >
                    Exporting...
                </button>
            ) : (
                <button onClick={exportPages}>Export</button>
            )}
        </React.Fragment>
    );
}
