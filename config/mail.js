const nodemailer = require('nodemailer');
const dotenv     = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // App Password de Google
  }
});

module.exports = transporter;
