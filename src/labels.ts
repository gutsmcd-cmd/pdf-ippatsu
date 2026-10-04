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
