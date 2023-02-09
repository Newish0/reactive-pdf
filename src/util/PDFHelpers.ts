import * as pdfjsLib from "pdfjs-dist";
import { GetViewportParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";


export class PDFThumb {
    public static async create(page: PDFPageProxy, params: GetViewportParameters = { scale: 1 }) {
        let viewport = page.getViewport(params);

        // Support HiDPI-screens.
        let outputScale = window.devicePixelRatio || 1;

        // Prepare canvas using PDF page dimensions.
        let tmpCanvas = document.createElement("canvas");
        let context = tmpCanvas.getContext("2d");

        tmpCanvas.width = Math.floor(viewport.width * outputScale);
        tmpCanvas.height = Math.floor(viewport.height * outputScale);
        tmpCanvas.style.width = Math.floor(viewport.width) + "px";
        tmpCanvas.style.height = Math.floor(viewport.height) + "px";

        let transform =
            outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : undefined;

        if (!context) return null;

        // Render PDF page into canvas context.
        let renderContext = {
            canvasContext: context,
            transform,
            viewport,
        };
        await page.render(renderContext).promise;

        return tmpCanvas.toDataURL();
    }
};

