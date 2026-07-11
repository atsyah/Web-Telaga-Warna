const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 1. Pastikan folder "uploads" tersedia untuk menyimpan video
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Konfigurasi Multer (Penyimpanan & Penamaan File)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Simpan ke folder uploads/
    },
    filename: function (req, file, cb) {
        // Beri nama unik menggunakan timestamp agar file tidak tertimpa
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'telagawarna-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Filter agar pengguna hanya bisa upload file video
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Format tidak didukung. Harap upload file video.'), false);
    }
};

// Inisialisasi Multer
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Batas ukuran file (contoh: maksimal 50MB)
});

// 4. Pengaturan Folder Statis
// Pastikan file HTML kamu (index.html, upload-video.html) ada di dalam folder bernama "public"
app.use(express.static('public')); 
// Buka akses ke folder uploads agar video bisa ditampilkan nanti
app.use('/uploads', express.static('uploads'));

// 5. Endpoint '/upload' (Sesuai dengan fetch di JavaScript kamu)
app.post('/upload', (req, res) => {
    // 'video' harus sama persis dengan name="video" di <input type="file"> HTML kamu
    upload.single('video')(req, res, function (err) {
        if (err) {
            // Tangkap error dari Multer atau fileFilter
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Tolong pilih file video terlebih dahulu.' });
        }
        
        // Jika berhasil, kirim respons ke frontend
        res.status(200).json({ 
            message: 'Video berhasil diupload!',
            file: req.file.filename 
        });
    });
});

// Jalankan server// Endpoint baru untuk mengambil daftar video di folder uploads
app.get('/videos', (req, res) => {
    const uploadDir = './uploads';
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal membaca folder video' });
        }
        // Kirim daftar nama file ke frontend
        res.json(files);
    });
});
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});