import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  // Tiempo máximo de espera para cada petición (en ms)
  private timeoutDuration = 30000;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Añadir timeout a todas las peticiones
    return next.handle(request).pipe(
      timeout(this.timeoutDuration),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';
        
        // Error de conectividad (Sin internet o servidor caído)
        if (error.error instanceof ProgressEvent && error.error.type === 'error') {
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet o inténtelo más tarde.';
        }
        // Error de timeout
        else if (error.constructor && error.constructor.name === 'TimeoutError') {
          errorMessage = 'El servidor está tardando demasiado en responder. Por favor, inténtelo más tarde.';
        }
        // Error de CORS
        else if (error.status === 0) {
          errorMessage = 'Error de acceso al servidor. Contacte al administrador del sistema.';
        }
        // Errores de autenticación
        else if (error.status === 401) {
          errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
          // Aquí podrías redireccionar al login o limpiar tokens
        }
        // Error de permisos
        else if (error.status === 403) {
          errorMessage = 'No tiene permisos para realizar esta acción.';
        }
        // Error del servidor
        else if (error.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor inténtelo más tarde o contacte soporte.';
        }
        // Error de validación desde el back
        else if (error.status === 400 || error.status === 422) {
          errorMessage = this.extractServerErrorMessage(error) || 'Los datos enviados no son válidos.';
        }        // Error no encontrado
        else if (error.status === 404) {
          const serverMessage = this.extractServerErrorMessage(error);
          if (serverMessage) {
            // Preservar el mensaje del servidor y la estructura del error
            const modifiedError = { ...error };
            modifiedError.error = { ...modifiedError.error, message: serverMessage };
            return throwError(() => modifiedError);
          } else {
            errorMessage = 'El recurso solicitado no existe.';
          }
        }
        // Crear un nuevo error con el mensaje formateado
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  // Método para determinar si debe preservar el mensaje del servidor
private shouldPreserveServerMessage(url: string, message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Para URLs de validación de examen, preservar mensajes específicos
  if (url.includes('/validate-exam-access') || url.includes('/applicant/')) {
    return lowerMessage.includes('postulante no encontrado') ||
           lowerMessage.includes('no encontrado') ||
           lowerMessage.includes('dni') ||
           lowerMessage.includes('documento') ||
           lowerMessage.includes('not found');
  }
  
  // Para URLs de conversión de postulantes, preservar mensajes específicos
  if (url.includes('/enroll/')) {
    return lowerMessage.includes('secciones disponibles') ||
           lowerMessage.includes('no hay secciones disponibles') ||
           lowerMessage.includes('documentos') ||
           lowerMessage.includes('puntaje') ||
           lowerMessage.includes('pago') ||
           lowerMessage.includes('ya es estudiante');
  }

  // Para URLs de gestión de secciones, preservar mensajes específicos
  if (url.includes('/course-section') || url.includes('/section')) {
    return lowerMessage.includes('ya existe una sección') ||
           lowerMessage.includes('duplicate') ||
           lowerMessage.includes('duplicada') ||
           lowerMessage.includes('conflict') ||
           lowerMessage.includes('conflicto') ||
           lowerMessage.includes('teacher') ||
           lowerMessage.includes('schedule') ||
           lowerMessage.includes('vacancies') ||
           lowerMessage.includes('required');
  }
  
  // Agregar otras URLs/casos donde se quiera preservar mensajes específicos
  // Por ejemplo:
  // if (url.includes('/student/') && lowerMessage.includes('documento duplicado')) {
  //   return true;
  // }
  
  return false;
}

  
  // Método para extraer mensaje del servidor
  private extractServerErrorMessage(error: HttpErrorResponse): string | null {
  if (error.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (typeof error.error === 'object') {
      // Busca en message, error, y también en error.error.message
      if (error.error.message) return error.error.message;
      if (error.error.error) return error.error.error;
      if (error.error.error && error.error.error.message) return error.error.error.message;
    }
  }
  // Si hay un mensaje en el objeto principal de error
  return error.message || null;
}
}