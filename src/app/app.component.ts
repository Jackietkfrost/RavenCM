import { Component, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Raven Character Manager';

  // Assign variable to reference to the window controls element in the dom.
  @ViewChild('windowControls') winControls!: ElementRef;

  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  //Construct the component. Makes an object of the electron service type, a handy class from the ngx-electron package.
  constructor(private _electronService: ElectronService) {}

  //Runs on initialization
  ngOnInit() {
    //Events recieved from the main process, using ipc. We modify the class of the window controls in order to affect how the underlying title bar buttons are being displayed.
    this._electronService.ipcRenderer.on('win_maximized', (evt, arg) => {
      this.winControls!.nativeElement.classList.add('maximized');
    })
    
    this._electronService.ipcRenderer.on('win_unmaximized', (evt, arg) => {
      this.winControls!.nativeElement.classList.remove('maximized');
    })

    //Maximize window at start. We do this here so that the title bar buttons are in sync with the current window state.
    this._electronService.ipcRenderer.send("win_maximize");
  }

  ngAfterViewInit() {
    this.menuTriggers.map((item) => {
      item.menuOpened.subscribe(() => {
        console.log(item.menu)
        this.menuTriggers.map((i) => {
          if(i!=item){
            i.closeMenu();
          }
        })
      })
    })
  }

  //Button functions which send IPC messages to the main process.
  minimize() {
    this._electronService.ipcRenderer.send("win_minimize");
  }

  maximize() {
    this._electronService.ipcRenderer.send("win_maximize");
  }

  restore() {
    this._electronService.ipcRenderer.send("win_restore");
  }

  close() {
    this._electronService.ipcRenderer.send("win_close");
  }

  closeTitleMenu(){
    this.menuTriggers.map((item) => {
      item.closeMenu();
    })
  }

}
