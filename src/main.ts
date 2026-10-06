import './style.css'
import { buttonLabel, text, type ButtonKey, type Lang, type TextKey } from './labels'
import { joinPdfs, photosToPdf } from './pdf'

type Mode = 'photos' | 'pdfs'

type Item = {
  id: string
  file: File
  preview: string | null
}

const LANG_KEY = 'pdf-ippatsu-lang'
const MAX_ITEMS = 30

const appNode = document.querySelector('#app')
if (!(appNode instanceof HTMLDivElement)) throw new Error('missing app')
const app: HTMLDivElement = appNode

let lang: Lang = readLang()
let mode: Mode = 'photos'
let items: Item[] = []
let busy = false
let status: TextKey | null = null

void persistStorage()

const fileInput = document.createElement('input')
fileInput.type = 'file'
fileInput.className = 'file-input'
fileInput.multiple = true
fileInput.addEventListener('change', () => {
  const picked = Array.from(fileInput.files ?? [])
  fileInput.value = ''
  void addFiles(picked)
})

render()

function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ja'
  } catch {
    return 'ja'
  }
}

function setLang(next: Lang) {
  lang = next
  try {
    localStorage.setItem(LANG_KEY, next)
  } catch {
    /* preference only; documents are never stored */
  }
  render()
}

async function persistStorage() {
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* optional; nothing is written for the user's files */
  }
}

function render() {
  document.documentElement.lang = lang === 'en' ? 'en' : 'ja'
  document.title = text(lang, 'title')
  app.innerHTML = ''

  const root = el('main', 'app')
  const header = el('header')
  const titles = el('div')
  const h1 = el('h1')
  h1.textContent = text(lang, 'title')
  const lead = el('p', 'lead')
  lead.textContent = text(lang, 'lead')
  titles.append(h1, lead)
  header.append(titles, button('lang', () => setLang(lang === 'ja' ? 'en' : 'ja')))

  const modes = el('div', 'modes')
  modes.append(
    button('photos', () => switchMode('photos'), mode === 'photos'),
    button('pdfs', () => switchMode('pdfs'), mode === 'pdfs'),
  )

  const actions = el('div', 'actions')
  actions.append(
    button('choose', () => {
      void persistStorage()
      fileInput.accept = mode === 'photos' ? 'image/jpeg,image/png,image/webp,image/gif' : 'application/pdf,.pdf'
      fileInput.click()
    }),
    button('clear', clearAll, false, items.length === 0),
    button('make', () => void makePdf(), false, busy || items.length === 0, true),
  )

  const list = el('ol', 'list')
  items.forEach((item, index) => {
    const row = el('li', 'row')
    if (item.preview) {
      const img = document.createElement('img')
      img.className = 'thumb'
      img.alt = ''
      img.src = item.preview
      row.append(img)
    } else {
      const mark = el('div', 'mark')
      mark.textContent = 'PDF'
      row.append(mark)
    }
    const name = el('div', 'name')
    name.textContent = item.file.name
    name.title = item.file.name
    const rowActions = el('div', 'row-actions')
    rowActions.append(
      button('up', () => move(index, -1), false, index === 0),
      button('down', () => move(index, 1), false, index === items.length - 1),
      button('remove', () => removeAt(index), false, false, false, true),
    )
    row.append(name, rowActions)
    list.append(row)
  })

  const note = el('p', 'status')
  note.textContent = status ? text(lang, status) : ''

  const foot = el('p', 'footnote')
  foot.textContent = text(lang, 'footnote')

  root.append(header, modes, actions, list, note, foot)
  app.append(root, fileInput)
}

function button(
  key: ButtonKey,
  onClick: () => void,
  pressed = false,
  disabled = false,
  primary = false,
  danger = false,
): HTMLButtonElement {
  const node = document.createElement('button')
  node.type = 'button'
  node.textContent = buttonLabel(lang, key)
  if (key === 'photos' || key === 'pdfs') node.setAttribute('aria-pressed', pressed ? 'true' : 'false')
  node.disabled = disabled
  if (primary) node.classList.add('primary')
  if (danger || key === 'remove') node.classList.add('danger')
  node.addEventListener('click', onClick)
  return node
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  return node
}

function switchMode(next: Mode) {
  if (next === mode) return
  clearAll()
  mode = next
  status = null
  render()
}

async function addFiles(files: File[]) {
  await persistStorage()
  const room = MAX_ITEMS - items.length
  const accepted = files.filter((file) => (mode === 'photos' ? isImage(file) : isPdf(file))).slice(0, Math.max(0, room))
  if (accepted.length === 0) {
    status = mode === 'photos' ? 'needImages' : 'needPdfs'
    render()
    return
  }
  for (const file of accepted) {
    const preview = mode === 'photos' ? URL.createObjectURL(file) : null
    items.push({ id: crypto.randomUUID(), file, preview })
  }
  status = null
  render()
}

function isImage(file: File): boolean {
  return /^image\/(jpeg|png|webp|gif)$/.test(file.type)
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function move(index: number, delta: number) {
  const next = index + delta
  if (next < 0 || next >= items.length) return
  const copy = items.slice()
  const [item] = copy.splice(index, 1)
  if (!item) return
  copy.splice(next, 0, item)
  items = copy
  render()
}

function removeAt(index: number) {
  const [item] = items.splice(index, 1)
  if (item?.preview) URL.revokeObjectURL(item.preview)
  render()
}

function clearAll() {
  for (const item of items) {
    if (item.preview) URL.revokeObjectURL(item.preview)
  }
  items = []
  status = null
  render()
}

async function makePdf() {
  if (busy || items.length === 0) return
  busy = true
  status = null
  render()
  try {
    await persistStorage()
    const files = items.map((item) => item.file)
    const bytes = mode === 'photos' ? await photosToPdf(files) : await joinPdfs(files)
    download(bytes, mode === 'photos' ? 'pdf-ippatsu-photos.pdf' : 'pdf-ippatsu-join.pdf')
    status = null
  } catch {
    status = mode === 'photos' ? 'photoFailed' : 'joinFailed'
  } finally {
    busy = false
    render()
  }
}

function download(bytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
