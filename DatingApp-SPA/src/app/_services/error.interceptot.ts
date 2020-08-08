import {Injectable} from '@angular/core';
import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpInterceptor } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: import('@angular/common/http').HttpRequest<any>, 
  next: import('@angular/common/http').HttpHandler):import('rxjs').Observable<import('@angular/common/http').HttpEvent<any>> {
    return next
      .handle(req)
      .pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              return throwError(error.statusText);
            }

            const applicationError = error.headers.get('Application-Error');
            if (applicationError) {
              return throwError(applicationError);
            }

            const serverError = error.error;
            let modelStateErrors = '';
            if (serverError.errors && typeof serverError.errors === 'object') {
              const errorObj = serverError.errors;
              for (const key in errorObj.errors) {
                if (errorObj[key]) {
                  modelStateErrors += errorObj[key][0] + '\n';
                }
              }
            }
            return throwError(modelStateErrors || serverError || 'Server Error');
          }
        })
      );
  }
};

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  };