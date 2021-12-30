const {app, BrowserWindow, screen, powerMonitor, dialog, ipcMain} = require('electron');
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
          devTools: false,
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false
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
      mainWindow.webContents.openDevTools();

      // create a custome event
      // create a custome event end

      // create a custom element
      // var trigger = document.createElement('span')
      // trigger.setAttribute('id', 'bantai');
      // console.log(document.getElementById('bantai'), 'render');
      // create a custom element end

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

    powerMonitor.on('suspend', () => {
      console.log('GOING TO SLEEP!');
      mainWindow.send('custom-suspend');
    });

    powerMonitor.on('lock-screen', () => {
      console.log('GOING TO LOCK!');
      mainWindow.send('custom-suspend');
      mainWindow.webContents.send('lockscreen', 'lockscreen value');
      // document.getElementById('bantai').click();
    });
    powerMonitor.on('unlock-screen', () => {
      console.log('GOING TO UNLOCK!');
      mainWindow.send('custom-suspend');
      mainWindow.webContents.send('unlockscreen', 'Hey');
    });
    // get idle time end