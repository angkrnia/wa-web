const express = require('express');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 5000;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

client.on('disconnected', (reason) => {
    console.log(`WhatsApp Web diputuskan (${reason}).`);
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qrCode) => {
  qrcode.generate(qrCode, { small: true });
  console.log('Silakan scan kode QR dengan aplikasi WhatsApp Anda.');
});

client.on('ready', () => {
  console.log('WhatsApp Web siap digunakan!');
});

client.initialize();

app.use(express.json());

app.post('/send-message', (req, res) => {
	try {
		const { phone_number, message } = req.body;

		if (!phone_number || !message) {
		  return res.status(400).json({ message: 'phone_number and message is required.' });
		}

		// Kirim pesan
		client.sendMessage(`${phone_number}@c.us`, message)
		  .then(() => {
			console.log('Pesan terkirim.');
			res.json({ success: true, message: 'Pesan terkirim.' });
		  })
		  .catch((error) => {
			console.error('Gagal mengirim pesan:', error);
			res.status(500).json({ message: 'Gagal mengirim pesan.' });
		  });
	} catch (error) {
		return res.status(500).json({ message: 'Terjadi kesalahan.' });
	}
});

// Endpoint untuk mereset authentication dan session
app.get('/reset-session', (req, res) => {
  // Hentikan client WhatsApp Web
  client.destroy();

  // Inisialisasi kembali client WhatsApp Web
  client.initialize();

  console.log('Authentication dan session telah di-reset. Silakan scan QR code kembali.');
  res.send('Authentication dan session telah di-reset. Silakan scan QR code kembali.');
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
