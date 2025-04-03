import { PDFArray, PDFDocument, PDFName, PDFString } from "pdf-lib";

export default async function generatePDF(pdfBlob, objects) {
    const pdfBytes = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfPages = pdfDoc.getPages();
    await Promise.all(objects.map(async (v) => {
        const page = pdfPages[v.page-1];
        const imgBytes = await v.image.arrayBuffer();
        const img = await pdfDoc.embedPng(imgBytes);
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const xPos = v.x * pageWidth;
        const yPos = pageHeight - (v.y * pageHeight) - (v.width * pageWidth);
        const size = v.width * pageWidth

        // Draw QR
        page.drawImage(img, {
            x: xPos,
            y: yPos,
            width: size,
            height: size,
        })

        // Draw Link Annotation
        const signatureLink = `${window.location.origin}/verifikasi/${v.id}`;
        const existingAnnotations = page.node.lookup(PDFName.of('Annots'), PDFArray);
        const linkAnnotation = pdfDoc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [xPos, yPos, xPos + size, yPos + size],
            Border: [0, 0, 0],
            A: {
                Type: 'Action',
                S: 'URI',
                URI: PDFString.of(signatureLink),
            },
        });
        const linkAnnotationRef = pdfDoc.context.register(linkAnnotation);
        existingAnnotations.push(linkAnnotationRef);
        page.node.set(PDFName.of('Annots'), pdfDoc.context.obj(existingAnnotations));
    }))
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    return modifiedPdfBlob;
}
