const {app, BrowserWindow, screen, powerMonitor, dialog} = require('electron');
    const url = require("url");
    const path = require("path");

    var showPrompt = true;
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

      // var hasConfirmedClose = false;
      // mainWindow.on('closed', function (e) {
      //   // mainWindow = null;
      //   if(!hasConfirmedClose){
      //     debugger;
      //     e.preventDefault();
      //     var prompt = dialog.showMessageBox(mainWindow, {
      //       message: 'Are you sure you want to quit bro',
      //       type: 'warning',
      //       buttons: ['Yes', 'No'],
      //       title: 'Confirm',
      //     })
      //   }
      // });

      mainWindow.on('close', function(e) {
        if(showPrompt){
          e.preventDefault();
          var prompt = dialog.showMessageBox(mainWindow, {
            message: 'Are you sure you want to quit',
            type: 'warning',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
          })
          console.log(prompt, 'prompt');
          prompt.then(promptResponse => {
            console.log(promptResponse, 'response then');
            if(promptResponse.response == 0){
              showPrompt = false;
              mainWindow.close();
            }
          })
        }
      });

      mainWindow.setMenu(null);
    }

    // app.on('ready', createWindow);

    // app.on('window-all-closed', function (e) {
    //   // if (process.platform !== 'darwin') app.quit()
    //   var prompt = dialog.showMessageBox(mainWindow, {
    //     message: 'Are you sure you want to quit brrro',
    //     type: 'warning',
    //     buttons: ['Yes', 'No'],
    //     title: 'Confirm',
    //   })
    //   e.preventDefault();
    // })

    // app.on('before-quit', function (e) {
    //   // if (process.platform !== 'darwin') app.quit()
    //   var prompt = dialog.showMessageBox(mainWindow, {
    //     message: 'Are you sure you want to quit brrro',
    //     type: 'warning',
    //     buttons: ['Yes', 'No'],
    //     title: 'Confirm',
    //   })
    //   e.preventDefault();
    // })

    app.on('activate', function () {
      if (mainWindow === null) createWindow()
    })

    // get idle time
    let state = powerMonitor.getSystemIdleState(1);
    console.log(state, 'current state');
    let idleTime = powerMonitor.getSystemIdleTime();
    console.log(idleTime, 'idle time');
    // get idle time end