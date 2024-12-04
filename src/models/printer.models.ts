export interface ticketRequest {
  type: string;
  fileName: string;
  printer: 'sheet' | 'ticket';
  qrCode?: QrDetails[];
  orientation: 'l' | 'p';
  format: [number, number];
  img?: ImgDetails[];
  [x: string]: any;
}

export interface QrDetails {
  width: string;
  height: string;
  qrcodeDetail: string;
  idQrCode: string;
}

export interface ResponseLoading {
  success: boolean;
  nameFunc: string;
  decs: any;
}

export interface ImgDetails {
  width: string;
  height: string;
  nameImg: string;
  idImg: string;
  // por defacul 0.5
  scale: number;
  // por defacul 0.3
  opacity: number;
  // por defacul 2
  posX: number;
  // por defacul 2
  posY: number;
  ext: '.png' | '.jpg';
}

export interface installPrinterRequest {
  typePrinter: 'sheet' | 'ticket';
}
