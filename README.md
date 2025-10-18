## 🌀 Swapify

### 🎯 **Proje Tanımı**

**Swapify**, kullanıcıların kendi ürünlerini takas edebildiği, ilan oluşturabildiği ve birbirleriyle etkileşime girebildiği modern bir takas uygulamasıdır.  
Uygulama; kullanıcı kimlik doğrulaması (Auth), ürün CRUD işlemleri, profil yönetimi, bildirim sistemi ve teklif (trade) özellikleriyle tam fonksiyonel bir deneyim sunar.

---

## 🛠️ **Teknolojiler**

| Katman                      | Teknoloji                                    |
| --------------------------- | -------------------------------------------- |
| **Frontend**                | React (Vite), CSS (StyleSheet yapısı), Axios |
| **Backend**                 | Node.js, Express.js                          |
| **Database**                | PostgreSQL                                   |
| **Gerçek Zamanlı İletişim** | Socket.IO                                    |
| **Kimlik Doğrulama**        | JWT (JSON Web Token)                         |
| **Diğer**                   | Bcrypt, Dotenv, Nodemon                      |

---

## 🚀 **Başlangıç**

### 1️⃣ **Projeyi Klonla**

```bash
git clone https://github.com/ozzencdonmezer/swapify.git
cd swapify
```

---

### 2️⃣ **Backend’i Başlat**

```bash
cd backend
npm install
npm start
```

> Backend varsayılan olarak `http://localhost:5000` portunda çalışır.

---

### 3️⃣ **Frontend’i Başlat**

```bash
cd frontend
npm install
npm run dev
```

> Frontend varsayılan olarak `http://localhost:5173` adresinde çalışır.

---

## 🧩 **Database Kurulumu (PostgreSQL)**

1. **PostgreSQL’i yükle**  
   Eğer yüklü değilse [https://www.postgresql.org/download/](https://www.postgresql.org/download/) adresinden kurulum yap.

2. **Yeni bir veritabanı oluştur:**

   ```sql
   CREATE DATABASE swapify;
   ```

3. **.env dosyasını oluştur ve aşağıdaki bilgileri gir:**
   (backend klasörünün içine `.env` dosyası oluştur)

   ```bash
   PORT=5000
   DATABASE_URL=postgresql://<kullanici_adi>:<sifre>@localhost:5432/swapify
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=cloud_name
   CLOUDINARY_API_KEY=cloud_api_key
   CLOUDINARY_API_SECRET=cloud_api_secret
   ```

4. **Veritabanı tablolarını oluştur:**  
   Eğer `pg` veya `sequelize` gibi bir ORM kullanıyorsan, migration veya init script’i çalıştır:

   ```bash
   npm run migrate
   ```

   veya manuel olarak SQL tablolarını oluştur:

   ```sql
   CREATE TABLE users (...);
   CREATE TABLE products (...);
   CREATE TABLE trades (...);
   CREATE TABLE trad-offers (...);
   CREATE TABLE notifications (...);
   CREATE TABLE favorites (...);
   ```

5. **Bağlantıyı test et:**
   ```bash
   npm start
   ```
   Terminalde “Database connected successfully” mesajını görüyorsan her şey tamam 🎉

---

## 💡 **Özellikler**

✅ Kullanıcı kayıt & giriş (JWT ile)  
✅ Ürün ekleme, düzenleme, silme, görüntüleme  
✅ Diğer kullanıcıların ürünlerini keşfetme  
✅ Favori ürünler listesi  
✅ Profil sayfası (kendi ürünlerin, bilgilerin)  
✅ Ürün teklif (trade) sistemi  
✅ Gerçek zamanlı bildirimler (Socket.IO)  
✅ Filtreleme & arama özelliği

---

## 🧱 **Planlanan Geliştirmeler**

🚧 Kullanıcılar arası mesajlaşma sistemi  
🚧 Takas geçmişi görüntüleme  
🚧 Ürün değerlendirme ve yorumlar  
🚧 Admin paneli

---

## 👤 **Geliştirici**

**Özenç Dönmezer**  
📧 [ozzencben@gmail.com](mailto:ozzencben@gmail.com)  
🔗 [LinkedIn Profilim](https://www.linkedin.com/in/%C3%B6zen%C3%A7-d%C3%B6nmezer-769125357/)

---

## 📜 **Lisans**

Bu proje açık kaynaklıdır ve kişisel & eğitim amaçlı kullanım için serbesttir.
