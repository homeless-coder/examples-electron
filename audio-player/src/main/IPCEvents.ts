import {
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainEvent,
  OpenDialogOptions,
  MessageBoxOptions,
  SaveDialogOptions
} from 'electron'
import { IPCKey } from '../common/Constants'
import { readMusicMetadata } from './MusicMetadataReader'
import {
  getMainWindow,
  toggleShowGraphicEqualizerWindow
} from './WindowManager'

/**
 * Occurs when show of a file open dialog is requested.
 * @param ev Event data.
 * @param options Options of `dialog.showOpenDialog`.
 */
const onRequestShowOpenDialog = (
  ev: IpcMainEvent,
  options: OpenDialogOptions
) => {
  dialog
    .showOpenDialog(BrowserWindow.fromWebContents(ev.sender), options)
    .then((result) => ev.sender.send(IPCKey.FinishShowOpenDialog, null, result))
    .catch((err) => ev.sender.send(IPCKey.FinishShowOpenDialog, err))
}

/**
 * Occurs when show of a save dialog is requested.
 * @param ev Event data.
 * @param options Options of `dialog.showSaveDialog`.
 */
const onRequestShowSaveDialog = (
  ev: IpcMainEvent,
  options: SaveDialogOptions
) => {
  dialog
    .showSaveDialog(BrowserWindow.fromWebContents(ev.sender), options)
    .then((result) => ev.sender.send(IPCKey.FinishShowSaveDialog, null, result))
    .catch((err) => ev.sender.send(IPCKey.FinishShowSaveDialog, err))
}

/**
 * Occurs when show of a message box is requested.
 * @param ev Event data.
 * @param options Options of `dialog.showMessageBox`.
 */
const onRequestShowMessageBox = (
  ev: IpcMainEvent,
  options: MessageBoxOptions
) => {
  dialog
    .showMessageBox(BrowserWindow.fromWebContents(ev.sender), options)
    .then((result) => ev.sender.send(IPCKey.FinishShowMessageBox, null, result))
    .catch((err) => ev.sender.send(IPCKey.FinishShowMessageBox, err))
}

/**
 * Occurs when read music metadata is requested.
 * @param ev Event data.
 * @param filePath Path of the music file.
 */
const onRequestReadMusicMetadata = (ev: IpcMainEvent, filePath: string) => {
  readMusicMetadata(filePath)
    .then((data) => ev.sender.send(IPCKey.FinishReadMusicMetadata, null, data))
    .catch((err) => ev.sender.send(IPCKey.FinishReadMusicMetadata, err))
}

/**
 * Occurs when show effector window is requested.
 * @param ev Event data.
 */
const onRequestShowEffector = (ev: IpcMainEvent) => {
  toggleShowGraphicEqualizerWindow()
  ev.sender.send(IPCKey.FinishShowEffector)
}

/**
 * Occurs when the status of the equalizer is requested to apply on the main window.
 * @param ev Event data.
 * @param connect If true to connect the effector, Otherwise disconnect.
 * @param gains Gain values.
 */
const onRequestApplyEqualizerState = (
  ev: IpcMainEvent,
  connect: boolean,
  gains: number[]
) => {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.webContents.send(
      IPCKey.RequestApplyEqualizerState,
      connect,
      gains
    )
  }

  ev.sender.send(IPCKey.FinishApplyEqualizerState)
}

/**
 * A value indicating that an IPC events has been initialized.
 */
let initialized = false

/**
 * Initialize IPC events.
 */
export const initializeIpcEvents = () => {
  if (initialized) {
    return
  }
  initialized = true

  ipcMain.on(IPCKey.RequestShowOpenDialog, onRequestShowOpenDialog)
  ipcMain.on(IPCKey.RequestShowSaveDialog, onRequestShowSaveDialog)
  ipcMain.on(IPCKey.RequestShowMessageBox, onRequestShowMessageBox)
  ipcMain.on(IPCKey.RequestReadMusicMetadata, onRequestReadMusicMetadata)
  ipcMain.on(IPCKey.RequestShowEffector, onRequestShowEffector)
  ipcMain.on(IPCKey.RequestApplyEqualizerState, onRequestApplyEqualizerState)
}

/**
 * Release IPC events.
 */
export const releaseIpcEvents = () => {
  if (initialized) {
    ipcMain.removeAllListeners(IPCKey.RequestShowOpenDialog)
    ipcMain.removeAllListeners(IPCKey.RequestShowSaveDialog)
    ipcMain.removeAllListeners(IPCKey.RequestShowMessageBox)
    ipcMain.removeAllListeners(IPCKey.RequestReadMusicMetadata)
    ipcMain.removeAllListeners(IPCKey.RequestShowEffector)
    ipcMain.removeAllListeners(IPCKey.RequestApplyEqualizerState)
  }

  initialized = false
}
