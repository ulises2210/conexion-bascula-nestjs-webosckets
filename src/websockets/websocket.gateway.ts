import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('cliente conected : ' + client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('cliente disconnected : ' + client.id);
  }

  // metodo de prueba , ejemplo
  @SubscribeMessage('mensaje')
  handleMensaje(@MessageBody() data: any) {
    console.log('Recibido mensaje : ' + data);
  }

  @SubscribeMessage('typeConnectionScale')
  handleTypeConnectionScale(@MessageBody() data: any) {
    // abrir puerto
    console.log(data);
    // console.log('Recibido mensaje : ' + data);
  }

  @SubscribeMessage('ticket')
  handlePrintFile(@MessageBody() data: any) {
    // abrir puerto
    console.log(data);
    // console.log('Recibido mensaje : ' + data);
  }

  @SubscribeMessage('installPrint')
  handleInstallPrinter(@MessageBody() data: any) {
    // abrir puerto
    console.log(data);
    // console.log('Recibido mensaje : ' + data);
  }

}
