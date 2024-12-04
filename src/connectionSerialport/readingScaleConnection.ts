import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';

class SerialPortManager {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  public eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Abre un puerto serie. Si el puerto está abierto, lo cierra y lo reconfigura.
   * @param pathPort - Ruta del puerto serie.
   */
  public openPort(pathPort: string): void {
    if (this.port && this.port.isOpen) {
      this.port.close(() => {
        console.log(`Puerto cerrado: ${this.port?.path}`);
        this.configurePort(pathPort);
      });
    } else {
      this.configurePort(pathPort);
    }
  }

  /**
   * Configura y abre un puerto serie.
   * @param pathPort - Ruta del puerto serie.
   */
  private configurePort(pathPort: string): void {
    const options = {
      path: pathPort,
      baudRate: 9600,
      autoOpen: true,
    };

    this.port = new SerialPort(options);

    this.port.on('open', () => {
      console.log(`Puerto abierto: ${pathPort}`);
      this.parser = this.port?.pipe(new ReadlineParser({ delimiter: '\r\n' }));
      this.emitData();
    });

    this.port.on('close', () => {
      console.log(`Puerto cerrado: ${pathPort}`);
    });

    this.port.on('error', (err: Error) => {
      console.error('Error en el puerto: ', err.message);
    });
  }

  /**
   * Emite los datos recibidos desde el puerto serie si son nuevos.
   */
  private emitData(): void {
    let lastValue: string | null = null;

    if (this.parser) {
      this.parser.on('data', (data: string) => {
        const match = data.match(/(\d+(\.\d+)?)\s*kg/);
        if (match) {
          const currentValue = match[1];

          if (currentValue !== lastValue) {
            lastValue = currentValue;

            // Emitir el valor mediante EventEmitter
            this.eventEmitter.emit('newValue', lastValue);
          }
        }
      });
    }
  }

  /**
   * Cierra el puerto serie si está abierto.
   */
  public closePort(): void {
    if (this.port && this.port.isOpen) {
      this.port.close(() => {
        console.log(`Puerto cerrado: ${this.port?.path}`);
      });
    }
  }
}

export default SerialPortManager;
