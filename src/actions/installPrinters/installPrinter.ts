import { execFile } from 'child_process';
import { installPrinterRequest } from 'src/models';
import { __DirnameService } from 'src/services/_dirname.service';

export class InstallPrinter {
  constructor(private __dirname: __DirnameService) {}

  installPrint(data: installPrinterRequest): Promise<any> {
    const directory = this.__dirname.getProjectRoot();
    console.log(directory);
    return new Promise<any>((resolve: any, reject: any) => {
      execFile( 'sh ' + directory + '/archivos_SH/install' + data.typePrinter + 'Printer.sh', (err, result, stderr) => {
          if (err) {
            console.log(`error: ${err}`);
            return reject({
              success: false,
              nameFunc: 'installPrint' + data.typePrinter,
              decs: err.cmd || err.message,
            });
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return reject({
              success: false,
              nameFunc: 'installPrint' + data.typePrinter,
              decs: stderr,
            });
          }
          console.log('PrintSheet installed successfully', result);
          resolve({
            success: true,
            nameFunc: 'installPrint' + data.typePrinter,
            decs: result,
          });
        },
      );
    });
  }
}
