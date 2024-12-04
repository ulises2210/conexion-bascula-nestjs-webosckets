import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class __DirnameService {
  getProjectRoot(): string {
    // Ruta del directorio actual
    const currentDir = __dirname;

    // Retroceder al directorio raíz del proyecto
    const rootDir = path.resolve(currentDir, '..', '..');

    return rootDir;
  }
}
