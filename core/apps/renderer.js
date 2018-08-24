/**
 * 渲染进程
 * author:chenshenhao
 * createTime:2017.4.5
 * updateTime:2017.8.14
 */
const electron = require('electron')
const shell = electron.shell
const app = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
const fs = require('fs')
const path = require('path')
const config = require(path.resolve(__dirname, '../../app/config'));
const staticUrl = config.staticUrl

console.log(staticUrl)

onload = () => {
  document.title = config.title
  let webview = document.getElementById('webview');
  webview.src = staticUrl
  webview.addEventListener('console-message', (e) => {
    console.log('Guest page logged a message:', e.message)
  })

  webview.addEventListener('will-navigate', (e) => {

    webview.stop()
    console.log(e)
  })
  // 此处是对弹出新窗口的拦截，本app目前只支持一个窗口
  webview.addEventListener('new-window', (e) => {
    e.preventDefault();
    webview.loadURL(e.url);
  });
  webview.addEventListener('dom-ready', (e) => {
    // webview.openDevTools()
    // webview.loadURL();
    console.log(webview.src)
  })
  webview.addEventListener('keydown', (e) => {
    if (process.platform !== 'darwin') {
      if (e.keyCode === 123) {
        if (webview.isDevToolsOpened()) {
          webview.closeDevTools()
        } else {
          webview.openDevTools()
        }
      }
    } else {
      if (e.keyCode === 123) {
        if (webview.isDevToolsOpened()) {
          webview.closeDevTools()
        } else {
          webview.openDevTools()
        }
      }
    }
  })

  const lineNodes = document.querySelectorAll("#lines > li")
  for (var i = 0; i < lineNodes.length; i++) {
    lineNodes[i].onclick = function() {
      var lineNum = this.getAttribute('line')
      app.send('changeLine', lineNum)
      document.querySelector("#lines > p").innerHTML = '当前线路 ---- 线路' + (parseInt(lineNum) + 1)
    }
  }
}

const downloadSuccess = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('downloadSuccess', message);
  console.log(obj.id + obj.message)
};
const downloadProgress = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('downloadProgress', message);
  console.log("下载任务" + obj.id + ":" + obj.progress)
};
const downloadStart = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('downloadStart', message);
  console.log(obj.id + obj.message)
};
const downloadFailed = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('downloadFailed', message);
  console.log(obj.id + obj.message)
};
const uploadSuccess = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('uploadSuccess', message);
  console.log(obj.id + obj.message + obj.body)
};
const uploadProgress = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('uploadProgress', message);
  console.log("上传" + obj.id + ":" + obj.progress)
};
const uploadStart = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('uploadStart', message);
  console.log(obj.id + obj.message)
};
const uploadFailed = (event, message) => {
  let obj = JSON.parse(message);
  let webview = document.getElementById('webview');
  webview.send('uploadFailed', message);
  console.log(obj.id + obj.message)
};


app.on('uploadProgress', uploadProgress)
app.on('uploadStart', uploadStart)
app.on('uploadSuccess', uploadSuccess)
app.on('uploadFailed', uploadFailed)
app.on('downloadProgress', downloadProgress)
app.on('downloadStart', downloadStart)
app.on('downloadSuccess', downloadSuccess)
app.on('downloadFailed', downloadFailed)