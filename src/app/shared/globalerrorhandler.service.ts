import { Injectable, ErrorHandler } from '@angular/core';

@Injectable()
export class GlobalerrorhandlerService implements ErrorHandler  {

  constructor() { }

  handleError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
 
     if (chunkFailedMessage.test(error.message)) {
       window.location.reload();
     }
   }
}
