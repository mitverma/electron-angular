const {app, BrowserWindow, screen, powerMonitor} = require('electron');
    const url = require("url");
    const path = require("path");


    let screenSizeInfo;
    // get width and height of window
    app.whenReady().then(() => {
      screenSizeInfo = screen.getPrimaryDisplay().workAreaSize;
      createWindow();
    });
    // get width and height of window end

    let mainWindow

    function createWindow () {
      mainWindow = new BrowserWindow({
        width: screenSizeInfo && screenSizeInfo.width || 800,
        height: screenSizeInfo && screenSizeInfo.height || 600,
        
        webPreferences: {
          nodeIntegration: true,
          devTools: false
        },
        
      })

      mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, `./dist/electron-angular/index.html`),
          protocol: "file:",
          slashes: true
        })
      );
      // Open the DevTools.
      mainWindow.webContents.openDevTools()

      mainWindow.on('closed', function () {
        mainWindow = null
      });
      mainWindow.setMenu(null);
    }

    // app.on('ready', createWindow);

    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', function () {
      if (mainWindow === null) createWindow()
    })

    // get idle time
    let state = powerMonitor.getSystemIdleState(1);
    console.log(state, 'current state');
    let idleTime = powerMonitor.getSystemIdleTime();
    console.log(idleTime, 'idle time');
    // get idle time end