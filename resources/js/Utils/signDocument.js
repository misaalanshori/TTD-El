import { router } from "@inertiajs/react";
import generatePDF from "./generatePDF";

export default async function signDocument(surat, callbacks = {onError: console.error}) {
    const pdfRes = await fetch(`/${surat.file_asli}`);
    const blob = await pdfRes.blob()
    const imgblobs = {}
    await Promise.all(surat.signature.map(async (v) => {
        const resp = await fetch(`/${v.qrcode_file}`);
        imgblobs[v.id] = await resp.blob();
    }))
    const objects = surat.signature.map(v => {
        const signature_transform = JSON.parse(v.approval.signature_transform)
        return {
            id: v.id,
            width: signature_transform.width,
            x: signature_transform.x,
            y: signature_transform.y,
            page: signature_transform.page,
            label: v.approval.user.name,
            image: imgblobs[v.id],
            editable: false,
            data: v
        }
    });
    const newPDF = await generatePDF(blob, objects);
    router.post(route("storeSignedDocument", { surat: surat.id }), { file_edited: newPDF }, callbacks);
}