import { ReactNode } from "react";
import { GridContextProvider, GridDropZone } from "react-grid-dnd";
import { useWindowSize } from "../util/CustomHooks";

interface DynamicGridDndProps {
    children: ReactNode[];

    rowHeight: number;
    colWidth: number;
    maxWidth: number;
    rowMargin: number | "auto";
    numItems: number;
    id: string;

    onChange: (
        sourceId: string,
        sourceIndex: number,
        targetIndex: number,
        targetId?: string
    ) => void;
}

export default function DynamicGridDnd({
    rowHeight,
    colWidth,
    maxWidth,
    rowMargin,
    numItems,
    children,
    onChange,
    id,
}: DynamicGridDndProps) {
    const [windowWidth, windowHeight] = useWindowSize();

    if (rowMargin === "auto") {
        rowMargin = Math.max(windowWidth, windowHeight) * 0.025;
    }
    
    const numRow = Math.floor(Math.min(windowWidth, maxWidth) / colWidth);
    const totalHeight = Math.max(
        rowHeight + rowMargin,
        Math.ceil((numItems + 1) / numRow) * (rowHeight + rowMargin)
    );

    return (
        <GridContextProvider onChange={onChange}>
            <div className="container">
                <GridDropZone
                    id={id}
                    boxesPerRow={numRow}
                    rowHeight={rowHeight + rowMargin}
                    style={{
                        height: isFinite(totalHeight) ? totalHeight : 0,
                    }}
                >
                    {children}
                </GridDropZone>
            </div>
        </GridContextProvider>
    );
}
