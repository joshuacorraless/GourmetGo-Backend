const QRCode = require('qrcode');

exports.generateBase64 = async (text) => {
  // Devuelve una imagen PNG codificada en base-64
  return await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
};
