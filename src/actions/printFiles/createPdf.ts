import { __DirnameService } from 'src/services/_dirname.service';
import QRCode from 'qrcode';
import { ticketRequest } from 'src/models';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export class CreatePdf {
  constructor(private __dirname: __DirnameService) {}

  async generateQRCode(dataValue: string) {
    try {
      //return await QRCode.toDataURL(data,{margin:0});
      return await QRCode.toDataURL(dataValue);
    } catch (err) {
      console.error('Error al generar el código QR:', err);
      return null;
    }
  }

  async fillInfo(dataArray: ticketRequest[]) {
    const directory = this.__dirname.getProjectRoot();
    let browser: any;
    // copyLatestPdf(dataArray , directory);

    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const mergedPdf = await PDFDocument.create();

      for (const data of dataArray) {
        const html = await this.generateHtmlTemplate(directory, data);
        const pdfPath = await this.generatePdf(
          page,
          html,
          dataArray,
          directory,
        );
        await this.mergePdf(mergedPdf, pdfPath);

        // fs.renameSync(pdfPath, directory + "/backup_public/");
        // Eliminar el PDF temporal después de agregarlo al merger
        fs.unlinkSync(pdfPath);
      }
      // console.log(data.img)
      if (dataArray[0].hasOwnProperty('img') && dataArray[0].img.length > 0)
        for (let i = 0; i < dataArray[0].img.length; i++) {
          await this.embedWatermark(
            mergedPdf,
            directory,
            dataArray[0].img[i].nameImg,
            dataArray[0].img[i].scale,
            dataArray[0].img[i].opacity,
            dataArray[0].img[i].posX,
            dataArray[0].img[i].posY,
            dataArray[0].img[i].ext,
          );
        }
      const finalPdfPath = this.getFinalPdfPath(dataArray, directory);
      await this.savePdf(mergedPdf, finalPdfPath);

      return {
        success: true,
        decs: 'PDF generado correctamente',
        nameFunc: 'fillInfo',
      };
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      return {
        success: false,
        decs: error.message || 'Error al generar el PDF',
        nameFunc: 'fillInfo',
      };
    } finally {
      if (browser) await browser.close();
    }
  }

  async generateHtmlTemplate(directory: string, data: ticketRequest) {
    const templatePath = path.join(
      directory,
      'etiquetasSkyYarn',
      data.fileName,
      `${data.fileName}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`El archivo de plantilla no existe: ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');
    const cssPath = path.join(
      directory,
      'etiquetasSkyYarn',
      data.fileName,
      `${data.fileName}.css`,
    );
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    html = html.replace(
      '<head>',
      `<style>${cssContent}</style><link rel="stylesheet" href="https://unpkg.com/primeflex@latest/primeflex.css" /></head>`,
    );

    for (const clave in data) {
      const regex = new RegExp(`{{${clave}}}`, 'g');
      html = html.replace(regex, data[clave]);
    }

    if (data.qrcode && data.qrcode.length > 0) {
      for (const qr of data.qrcode) {
        const qrCodeDataURL = qr.qrcodeDetail
          ? await this.generateQRCode(qr.qrcodeDetail)
          : '';
        html = html.replace(
          `{{${qr.idQrCode}}}`,
          `<img src="${qrCodeDataURL}" width="${qr.width}" alt="${qr.qrcodeDetail}" />`,
        );
      }
    }

    return html;
  }

  async generatePdf(page, html, dataArray, directory: string) {
    await page.setContent(html);
    await page.emulateMediaType('screen');

    const pdfPath = path.join(
      directory,
      'public',
      dataArray[0].printer === 'ticket' ? 'ticket.pdf' : 'sheet.pdf',
    );
    const pdfOptions = {
      width: dataArray[0].orientation === 'l' ? '297mm' : '210mm',
      height: dataArray[0].orientation === 'l' ? '210mm' : '297mm',
      printBackground: true,
      margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
    };

    await page.pdf({ path: pdfPath, ...pdfOptions });
    return pdfPath;
  }

  async mergePdf(mergedPdf, pdfPath: string) {
    const tempPdfBytes = fs.readFileSync(pdfPath);
    const tempPdf = await PDFDocument.load(tempPdfBytes);
    const copiedPages = await mergedPdf.copyPages(
      tempPdf,
      tempPdf.getPageIndices(),
    );
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  async embedWatermark( mergedPdf, directory, nameImg, scale, opacity, posX, posY, ext) {
    const pages = mergedPdf.getPages();
    const watermarkImagePath = path.join(
      directory,
      'public/img/' + nameImg + ext,
    );
    const imageBytes = fs.readFileSync(watermarkImagePath);
    let image;
    ext == '.png' ? (image = await mergedPdf.embedPng(imageBytes)) : (image = await mergedPdf.embedJpeg(imageBytes));
    const imageDims = image.scale(scale);

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawImage(image, {
        x: width / posX - imageDims.width / posX,
        y: height / posY - imageDims.height / posY,
        width: imageDims.width,
        height: imageDims.height,
        opacity: opacity,
      });
    });
  }

  getFinalPdfPath(dataArray: ticketRequest[], directory: string) {
    return path.join(directory, 'public', dataArray[0].printer === 'ticket' ? 'ticket.pdf' : 'sheet.pdf');
  }

  async savePdf(mergedPdf, finalPdfPath) {
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(finalPdfPath, pdfBytes);
  }
}
