// Selector de ficheros de Google (Google Picker), cargado solo cuando se usa.
import { DRIVE_MIME_TYPES, type DriveFile } from './driveFiles'

type PickerResponse = { action: string; docs?: DriveFile[] }

type PickerBuilder = {
  addView: (view: unknown) => PickerBuilder
  enableFeature: (feature: string) => PickerBuilder
  setOAuthToken: (token: string) => PickerBuilder
  setDeveloperKey: (key: string) => PickerBuilder
  setAppId: (appId: string) => PickerBuilder
  setLocale: (locale: string) => PickerBuilder
  setCallback: (callback: (response: PickerResponse) => void) => PickerBuilder
  build: () => { setVisible: (visible: boolean) => void }
}

type PickerApi = {
  Action: { PICKED: string; CANCEL: string }
  Feature: { MULTISELECT_ENABLED: string }
  ViewId: { DOCS: string }
  DocsView: new (viewId: string) => {
    setMimeTypes: (types: string) => unknown
    setIncludeFolders: (include: boolean) => unknown
  }
  PickerBuilder: new () => PickerBuilder
}

declare global {
  interface Window {
    gapi?: { load: (name: string, callback: () => void) => void }
    google?: { picker?: PickerApi }
  }
}

let loading: Promise<PickerApi> | null = null

function loadPicker(): Promise<PickerApi> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () =>
      window.gapi!.load('picker', () => resolve(window.google!.picker!))
    script.onerror = () => {
      loading = null
      reject(new Error('No se pudo cargar el selector de Google'))
    }
    document.head.append(script)
  })
  return loading
}

/** Abre el selector de Drive; devuelve los ficheros elegidos (vacío si se cancela). */
export async function pickDriveFiles(token: string): Promise<DriveFile[]> {
  const picker = await loadPicker()
  return new Promise((resolve) => {
    const view = new picker.DocsView(picker.ViewId.DOCS)
    view.setMimeTypes(DRIVE_MIME_TYPES.join(','))
    view.setIncludeFolders(true)
    new picker.PickerBuilder()
      .addView(view)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(token)
      .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY ?? '')
      .setAppId(import.meta.env.VITE_GOOGLE_APP_ID ?? '')
      .setLocale('es')
      .setCallback((response) => {
        if (response.action === picker.Action.PICKED)
          resolve(response.docs ?? [])
        else if (response.action === picker.Action.CANCEL) resolve([])
      })
      .build()
      .setVisible(true)
  })
}
