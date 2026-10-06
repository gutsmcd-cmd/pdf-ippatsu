export type Lang = 'ja' | 'en'

export type ButtonKey =
  | 'lang'
  | 'photos'
  | 'pdfs'
  | 'choose'
  | 'up'
  | 'down'
  | 'remove'
  | 'clear'
  | 'make'

const labels: Record<Lang, Record<ButtonKey, string>> = {
  ja: {
    lang: 'English',
    photos: '写真をPDF',
    pdfs: 'PDFを結合',
    choose: 'ファイルを選ぶ',
    up: '上へ',
    down: '下へ',
    remove: '削除',
    clear: 'クリア',
    make: 'PDFを作る',
  },
  en: {
    lang: '日本語',
    photos: 'Photos to PDF',
    pdfs: 'Join PDFs',
    choose: 'Choose files',
    up: 'Up',
    down: 'Down',
    remove: 'Remove',
    clear: 'Clear',
    make: 'Make PDF',
  },
}

export function buttonLabel(lang: Lang, key: ButtonKey): string {
  return labels[lang][key]
}

export type TextKey =
  | 'title'
  | 'lead'
  | 'footnote'
  | 'needImages'
  | 'needPdfs'
  | 'photoFailed'
  | 'joinFailed'

const texts: Record<Lang, Record<TextKey, string>> = {
  ja: {
    title: 'PDF一発',
    lead: '選んだ写真を1枚のPDFにします。PDFは選んだ順のまま1つにします。処理はこのブラウザの中だけで、ファイルは保存しません。',
    footnote: '写真はA4に収めて1ページずつ。最初の読み込みのあと、通信せずに使えます。最大30ファイル。',
    needImages: 'JPEG、PNG、WebP、GIFを選んでください。',
    needPdfs: 'PDFを選んでください。',
    photoFailed: 'この画像はPDFにできませんでした。',
    joinFailed: 'このPDFは結合できませんでした。暗号化されたPDFは扱えません。',
  },
  en: {
    title: 'PDF Joiner',
    lead: 'Turns the photos you choose into one PDF. Joins PDFs into one, in the order you choose. Everything stays in this browser. Your files are not saved.',
    footnote: 'One photo per A4 page. Works offline after the first load. Up to 30 files.',
    needImages: 'Choose JPEG, PNG, WebP or GIF files.',
    needPdfs: 'Choose PDF files.',
    photoFailed: 'Could not make a PDF from these images.',
    joinFailed: 'Could not join these PDFs. Encrypted PDFs are not supported.',
  },
}

export function text(lang: Lang, key: TextKey): string {
  return texts[lang][key]
}
