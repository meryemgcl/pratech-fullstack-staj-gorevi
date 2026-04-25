# Pratech İzin Sistemi

Stajyer Görev 2 — Personel İzin Talebi Modülü

## Kurulum

### Backend

```bash
cd backend
npm install
node server.js
```

API `http://localhost:3001` adresinde çalışmaya başlar. Veriler `db.json` dosyasına kaydedilir, ilk çalıştırmada otomatik oluşur.

### Frontend

`frontend/index.html` dosyasını tarayıcıda açmanız yeterli. Backend çalışmadan API çağrıları başarısız olur.

---

## API

| Method | Endpoint | Ne yapar |
|---|---|---|
| POST | `/izin-talep` | Yeni izin talebi oluşturur |
| GET | `/izinler` | Talepleri listeler, `?durum=Beklemede` gibi filtrelenebilir |
| PUT | `/izin-durum/:id` | Talebi onaylar veya reddeder |
| GET | `/istatistikler` | Durum sayılarını döner |

### Örnek istek

```bash
# Yeni talep
curl -X POST http://localhost:3001/izin-talep \
  -H "Content-Type: application/json" \
  -d '{"adSoyad":"Mehmet Yılmaz","izinTuru":"Yıllık İzin","baslangicTarihi":"2026-05-10","bitisTarihi":"2026-05-14"}'

# Onayla
curl -X PUT http://localhost:3001/izin-durum/1 \
  -H "Content-Type: application/json" \
  -d '{"durum":"Onaylandı"}'
```

### Validasyon

- Ad soyad, izin türü, başlangıç ve bitiş tarihi zorunlu. Eksikse `400` döner.
- Bitiş tarihi başlangıçtan önce olamaz.
- Frontend tarafında da aynı kontroller var, API'ye geçersiz veri gitmeden önce form yakalatıyor.

---

## Klasör yapısı

```
pratech-izin/
├── backend/
│   ├── server.js
│   ├── db.json          (otomatik oluşur)
│   └── package.json
├── frontend/
│   └── index.html
└── README.md
```

---

## Ekranlar

**Personel ekranı:** İzin türü seçilir, tarih aralığı girilir, isteğe bağlı açıklama eklenebilir. Bitiş tarihi başlangıçtan önce seçilemiyor, eksik alan bırakılınca form göndermeden hata mesajı çıkıyor.

**Yönetici ekranı:** Gelen talepler tablo halinde listeleniyor. Üstte toplam/beklemede/onaylandı/reddedildi sayıları görünüyor. Durum filtrelemesi var. Beklemedeki talepler için onayla/reddet butonları tablonun yanında, tıklayınca sayfa yenilenmeden anlık olarak güncelleniyor.

---

Sorularınız için: info@pratech.tr
