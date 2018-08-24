/*************************
 * 主函数                   *
 * author: Shayne C      *
 * createTime:2016.12.28 *
 * updateTime:2017.8.1   *
 *************************/

const {
  app,
  globalShortcut,
  BrowserWindow,
  session,
  shell
} = require('electron')
const path = require('path')
const url = require('url')
const ipclistener = require('./apps/ipclistener')
const fs = require('fs')
const config = require(path.resolve(__dirname, '../app/config'));
const interceptUrlArr = ['youku.com/v_show', 'm.youku.com/video']

const linesArr = ["http://yun.baiyug.cn/vip/index.php?url=",
  "http://api.wlzhan.com/sudu/?url=",
  "http://jx.598110.com/duo/index.php?url=",
  "http://jiexi.071811.cc/jx2.php?url=",
  "http://jqaaa.com/jq3/?url=&url=",
  "http://api.xiaomil.com/a/index.php?url=",
  "https://jiexi.071811.cc/jx2.php?url=",
  "http://api.xiaomil.com/a/index.php?url=",
  "http://api.pucms.com/?url=",
  "http://api.baiyug.cn/vip/index.php?url=",
  "https://api.flvsp.com/?url=",
  "http://api.xfsub.com/index.php?url=",
  "http://65yw.2m.vc/chaojikan.php?url=",
  "http://www.82190555.com/index/qqvod.php?url=",
  "http://vip.jlsprh.com/index.php?url=",
  "http://2gty.com/apiurl/yun.php?url="
]

global.lineNum = 0

// 若需要用到httpServer，则创建httpServer

if (config.useServer) {
  const creatServer = require('./apps/server')

  // 创建httpServer
  let PORT = config.localServerConfig.PORT
  let root = path.resolve(__dirname, '../app/' + config.localServerConfig.root)
  creatServer(PORT, root)
}

// 发起app监听

ipclistener.appListener();

// 创建窗口对象

let defaultUrl = url.format({
  pathname: path.join(__dirname, 'index.html'),
  protocol: 'file:',
  slashes: true
})

let win

// app加载完成事件

app.on('ready', () => {

  // 创建窗口

  win = createWindow({
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    width: config.width,
    height: config.height,
    title: config.title,
    center: true,
    fullscreen: config.fullscreen,
    fullscreenable: config.fullscreenable
  }, defaultUrl)

  // 发起window监听

  ipclistener.windowListener(win);

})

// app监听窗口关闭事件
app.on('window-all-closed', () => {
  // 判断是否为mac os，若为mac os 启用command+q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  console.log()
  // 此处为了适应mac os的dock
  if (!win.isVisible()) {
    win.show()
  }
})

app.on('before-quit', () => {
  win._closed = true
})

app.on('web-contents-created', (event, contents) => {
  if (contents.getType() == 'webview') {
    contents.on('will-navigate', (event, url) => {
      for (var i = 0; i < interceptUrlArr.length; i++) {
        if (url.indexOf(interceptUrlArr[i]) !== -1) {
          console.log(url)
          console.log(global.lineNum)
          let win2 = new BrowserWindow({
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            width: config.width,
            height: config.height,
            title: config.title,
            center: true,
            fullscreen: config.fullscreen,
            fullscreenable: config.fullscreenable
          })
          win2.loadURL(linesArr[global.lineNum] + url, {
            "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1"
          })
          if (process.platform !== 'darwin') {
            win2.setMenu(null)
          }
          event.preventDefault()
          break
        }
      }
    })
  }
})

// 全局键盘监听事件

function registerShortcut() {

  // 开发者工具

  globalShortcut.register('CommandOrControl+Shift+i', () => {
    win.webContents.toggleDevTools()
  })

  // 全屏

  globalShortcut.register('F11', () => {
    if (!win.isFullScreen()) {
      win.setFullScreen(true)
    } else {
      win.setFullScreen(false)
    }
  })
}

// 创建窗口函数

function createWindow(option, defaultUrl) {

  let mainWindow

  // 窗口对象配置

  mainWindow = new BrowserWindow(option)

  // 默认地址设定

  mainWindow.loadURL(defaultUrl)

  // 去除默认菜单

  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null)
  }

  // 监听窗口关闭事件
  mainWindow.on('close', (event) => {
    if (!mainWindow._closed && process.platform === 'darwin') {
      event.preventDefault()
      mainWindow.hide()
      return;
    }
    mainWindow = null
    // console.log(mainWindow)
    // // 如果是mac，则关闭即为隐藏
    // if (process.platform === 'darwin') {
    //     mainWindow.hide()
    // }
    // else{
    //     mainWindow = null
    // }
  })

  mainWindow.on('closed', (event) => {
    // mainWindow = null
  })

  // 窗口失去焦点时移除快捷键以免与系统快捷键冲突

  mainWindow.on('blur', () => {
    globalShortcut.unregisterAll();
  });

  // 窗口获取焦点时绑定快捷键

  mainWindow.on('focus', () => {
    registerShortcut();
  });

  // 监听窗口创建完成事件

  app.on('browser-window-created', function(event, window) {})

  return mainWindow
}