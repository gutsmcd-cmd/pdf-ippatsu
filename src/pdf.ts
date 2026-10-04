import { PDFDocument } from 'pdf-lib'

const A4_W = 595.28
const A4_H = 841.89
const MARGIN = 28
const MAX_EDGE = 2000

export async function photosToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('PDF一発')
  doc.setCreator('PDF一発')
  for (const file of files) {
    const { bytes, width, height } = await imageToJpeg(file)
    const image = await doc.embedJpg(bytes)
    const landscape = width > height
    const pageW = landscape ? A4_H : A4_W
    const pageH = landscape ? A4_W : A4_H
    const maxW = pageW - MARGIN * 2
    const maxH = pageH - MARGIN * 2
    const scale = Math.min(maxW / width, maxH / height)
    const drawW = width * scale
    const drawH = height * scale
    const page = doc.addPage([pageW, pageH])
    page.drawImage(image, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    })
  }
  return doc.save()
}

export async function joinPdfs(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  out.setTitle('PDF一発')
  out.setCreator('PDF一発')
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const src = await PDFDocument.load(bytes)
    const copied = await out.copyPages(src, src.getPageIndices())
    for (const page of copied) out.addPage(page)
  }
  return out.save()
}

async function imageToJpeg(file: File): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('jpeg'))
      }, 'image/jpeg', 0.92)
    })
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height }
  } finally {
    bitmap.close()
  }
}
