// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

var options = { opacity: 0.5 }
console.log(options)
contextBridge.exposeInMainWorld('electronAPI', {
    setWindowAttributes: (options) => ipcRenderer.invoke('window:set-attributes', options)
})

console.log("running preload")