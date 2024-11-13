import { Box, Tooltip, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { Document, Page } from "react-pdf";
import { Rnd } from "react-rnd";

export default function PDFEditor({ pdf, page, onPageChange, onLoadedPdfChange, objects, onObjectsChange }) {
    const [pdfCvsDims, setPdfCvsDims] = useState(null); // { width: 0, height: 0 }
    const [loadedPdf, setLoadedPdf] = useState(null);
    const [rndUUID, setRndUUID] = useState(Math.random());
    const pdfCanvasRef = useRef(null)
    const pdfCanvasPosRef = useRef(null)

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setPdfCvsDims({ width, height });
            }
        });


        const checkResize = setInterval(() => {
            const bounding = pdfCanvasRef.current.getBoundingClientRect()
            const changed = JSON.stringify(bounding) != JSON.stringify(pdfCanvasPosRef.current)
            if (changed) {
                pdfCanvasPosRef.current = bounding
                setRndUUID(Math.random());
            }
        }, 10)

        if (pdfCanvasRef.current) {
            observer.observe(pdfCanvasRef.current);
        }

        return () => {
            observer.disconnect();
            clearInterval(checkResize)
        };
    }, []);

    const handlePageLoad = () => {
        setRndUUID(Math.random());
    }



    // Handler function to update a specific object
    const handleObjectUpdate = (id, newObjectData) => {
        // Find the index of the object by reference
        const index = objects.findIndex(obj => obj.id === id);
        if (index === -1) return; // Object not found

        // Create a shallow copy of the objects array with the updated object
        const updatedObjects = [...objects];
        updatedObjects[index] = { ...objects[index], ...newObjectData };

        // Trigger the parent callback with the updated array
        onObjectsChange(updatedObjects);
    };

    const onDocumentLoadSuccess = (pdfObj) => {
        onLoadedPdfChange(pdfObj);
        setLoadedPdf(pdfObj);
        onPageChange(1);
    }

    useEffect(
        () => {
            onLoadedPdfChange(null);
            setLoadedPdf(null);
            onPageChange(1);
        }, [pdf])



    return (
        <Box ref={pdfCanvasRef} sx={{ border: 1 }}>
            <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                    pageNumber={page}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onLoadSuccess={handlePageLoad}
                />
            </Document>
            {loadedPdf && pdfCvsDims ? objects?.filter(o => o.page == page).map((object, idx) => (
                <Rnd
                    key={`${rndUUID}.${page}.${idx}`}
                    bounds="parent"
                    size={{ width: object.width * pdfCvsDims.width, height: object.width * pdfCvsDims.width }}
                    position={{ x: object.x * pdfCvsDims.width, y: object.y * pdfCvsDims.height }}
                    dragHandleClassName="draggableQR"
                    style={{
                        border: '1px solid black',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        zIndex: 1,
                    }}
                    lockAspectRatio={true}
                    onDragStop={(e, d) => {
                        // Call the handler with the object reference and new data
                        handleObjectUpdate(object.id, {
                            x: d.x / pdfCvsDims.width,
                            y: d.y / pdfCvsDims.height
                        });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        handleObjectUpdate(object.id, {
                            width: ref.offsetWidth / pdfCvsDims.width,
                            x: position.x / pdfCvsDims.width,
                            y: position.y / pdfCvsDims.height,
                        });
                    }}
                >
                    <img src={URL.createObjectURL(object.image)} style={{ width: "100%", height: "100%" }} />
                    <Tooltip sx={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} title={object.label}>
                        <div className="draggableQR" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}></div>
                    </Tooltip>
                    
                </Rnd>
            )) : null}
        </Box>
    )
}