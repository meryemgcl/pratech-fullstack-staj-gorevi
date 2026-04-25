const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");

// db.json yoksa boş halde oluştur
function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ izinler: [], nextId: 1 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Gün farkı hesaplama - bitiş dahil
function gunFarki(baslangic, bitis) {
  const a = new Date(baslangic);
  const b = new Date(bitis);
  return Math.round((b - a) / 86400000) + 1;
}

// POST /izin-talep
app.post("/izin-talep", (req, res) => {
  const { adSoyad, izinTuru, baslangicTarihi, bitisTarihi, aciklama } = req.body;

  if (!adSoyad || !adSoyad.trim()) {
    return res.status(400).json({ mesaj: "Ad soyad boş bırakılamaz." });
  }
  if (!izinTuru) {
    return res.status(400).json({ mesaj: "İzin türü seçmelisiniz." });
  }
  if (!baslangicTarihi) {
    return res.status(400).json({ mesaj: "Lütfen başlangıç tarihi seçiniz." });
  }
  if (!bitisTarihi) {
    return res.status(400).json({ mesaj: "Lütfen bitiş tarihi seçiniz." });
  }

  const gecerliTurler = ["Yıllık İzin", "Sağlık İzni", "Mazeret İzni"];
  if (!gecerliTurler.includes(izinTuru)) {
    return res.status(400).json({ mesaj: "Geçersiz izin türü." });
  }

  if (new Date(bitisTarihi) < new Date(baslangicTarihi)) {
    return res.status(400).json({ mesaj: "Bitiş tarihi başlangıç tarihinden önce olamaz." });
  }

  const db = getDB();
  const yeni = {
    id: db.nextId++,
    adSoyad: adSoyad.trim(),
    izinTuru,
    baslangicTarihi,
    bitisTarihi,
    gunSayisi: gunFarki(baslangicTarihi, bitisTarihi),
    aciklama: aciklama ? aciklama.trim() : "",
    durum: "Beklemede",
    tarih: new Date().toISOString(),
  };

  db.izinler.unshift(yeni);
  saveDB(db);

  return res.status(201).json({ mesaj: "Talebiniz alındı.", talep: yeni });
});

// GET /izinler
app.get("/izinler", (req, res) => {
  const db = getDB();
  let liste = db.izinler;

  // basit filtreler
  if (req.query.durum) {
    liste = liste.filter((x) => x.durum === req.query.durum);
  }

  res.json({ toplam: liste.length, izinler: liste });
});

// PUT /izin-durum/:id
app.put("/izin-durum/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { durum } = req.body;

  if (!["Onaylandı", "Reddedildi"].includes(durum)) {
    return res.status(400).json({ mesaj: "Durum 'Onaylandı' veya 'Reddedildi' olmalıdır." });
  }

  const db = getDB();
  const idx = db.izinler.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ mesaj: "Talep bulunamadı." });
  }

  db.izinler[idx].durum = durum;
  saveDB(db);

  res.json({ mesaj: `Talep ${durum}.`, talep: db.izinler[idx] });
});

// istatistik endpoint - yönetici ekranındaki kartlar için
app.get("/istatistikler", (req, res) => {
  const db = getDB();
  const izinler = db.izinler;
  res.json({
    toplam: izinler.length,
    beklemede: izinler.filter((x) => x.durum === "Beklemede").length,
    onaylandi: izinler.filter((x) => x.durum === "Onaylandı").length,
    reddedildi: izinler.filter((x) => x.durum === "Reddedildi").length,
  });
});

app.listen(3001, () => {
  console.log("API ayakta → http://localhost:3001");
});
