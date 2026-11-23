# Learning Portfolio — CS100 POWER UP! (Final System & Demo)
 
เว็บแอปสำหรับสร้าง Personal Learning Portfolio เพิ่มผลงาน/ประสบการณ์การเรียนรู้ และ **แลกเปลี่ยน Portfolio Item ข้ามกลุ่ม**
ผ่าน Challenge Booth โดยเก็บข้อมูลที่ฝั่ง Server เป็นไฟล์ JSON บน AWS EC2
โปรเจกต์กลุ่มรายวิชา CS100 (Submission 2 of 2)
 
| รายการ | ข้อมูล |
|---|---|
| **Public URL (EC2)** | http://52.201.239.253  ← IP ล่าสุดก่อนส่ง/วัน Demo |
| **Repository** | https://github.com/pongrapeejuey/Team-Project |
| **Challenge ของกลุ่ม** | เขียนหลังให้คุณงง |
 
> Public IP ของ EC2 ใน Learner Lab เปลี่ยนได้เมื่อ Stop/Start เครื่อง ตรวจ URL ใหม่ทุกครั้งและแจ้งตามช่องทางที่รายวิชากำหนด
 
---
 
## Features
 
- **Create Portfolio:** ชื่อที่ต้องการแสดง, What I Enjoy, What I've Tried, What I'm Curious About
- **Add Portfolio Item:** เพิ่มได้หลายรายการต่อ Portfolio (Title, Type, Date, Role, Skills, Description, Reflection 4 ช่อง, Evidence URL)
- **Validation:** ตรวจที่ Frontend และตรวจซ้ำที่ Server ก่อนบันทึก
- **Server-side Storage:** บันทึก/อ่าน Portfolio ผ่าน `echo.php` เป็นไฟล์ JSON บน EC2 (ข้อมูลอยู่หลัง Restart/Reboot)
- **Import Portfolio Item:** วาง JSON ใน Textarea (หรือเลือกไฟล์ `.json`) → ตรวจรูปแบบ → เลือก Portfolio ปลายทาง → ตรวจ/แก้ Reflection → Save
- **ป้องกัน Item ซ้ำ:** Import ID เดิมซ้ำจะไม่สร้างรายการซ้ำโดยไม่ตั้งใจ
- **Export:** Export Portfolio ของตนเองเป็น `my-portfolio.json`
- **localStorage:** ใช้เก็บเฉพาะข้อมูลชั่วคราว (Form Draft / Theme) ไม่ใช่แหล่งข้อมูลหลัก
- **Responsive:** Desktop และ Mobile (Bootstrap 5.3.3 ผ่าน CDN)


> สถานะการทำงานแต่ละฟีเจอร์ให้ทีมอัปเดตก่อนส่ง ดูรายละเอียดบั๊กที่รู้จักในหัวข้อ Known Issues

## การติดตั้งและรันบน AWS EC2
 
### สิ่งที่ต้องมี
- AWS Learner Lab + EC2 (Ubuntu 22.04/24.04)
- Apache + PHP (`apache2`, `php`, `libapache2-mod-php`)
### 1) สร้างและตั้งค่า EC2
1. สร้าง Instance แล้วตั้ง **Security Group** เปิดเฉพาะ Port ที่จำเป็น
   - `22` (SSH) — จำกัด Source เป็น IP ของทีมถ้าทำได้
   - `80` (HTTP) — เปิดให้ `0.0.0.0/0`
   - ไม่เปิด Port อื่น
2. SSH เข้าเครื่อง แล้วติดตั้ง
```bash
sudo apt update
sudo apt install -y apache2 php libapache2-mod-php git
sudo systemctl enable apache2     # เปิดเองหลัง Reboot
```
 
### 2) Deploy โค้ด
```bash
cd /var/www/html
sudo rm -f index.html
sudo git clone https://github.com/pongrapeejuey/Team-Project.git .
```
 
### 3) ตั้งโฟลเดอร์เก็บข้อมูล (นอก Web Root)
```bash
sudo mkdir -p /var/lib/powerup-data
echo '[]' | sudo tee /var/lib/powerup-data/portfolio.json
sudo chown -R www-data:www-data /var/lib/powerup-data
sudo chmod 750 /var/lib/powerup-data
```
`echo.php` อ่าน/เขียนไฟล์ที่ `/var/lib/powerup-data/portfolio.json` เท่านั้น
ผู้ใช้จึงดาวน์โหลดไฟล์ JSON ตรง ๆ ผ่าน URL ไม่ได้ ต้องผ่าน `echo.php`
 
### 4) ตรวจสอบ
- เปิด http://52.201.239.253 จาก Browser/เครื่องอื่น ต้องเห็นหน้าเว็บ
- http://52.201.239.253/portfolio.json ได้ 404/403 (ไม่ได้ไฟล์ข้อมูล)
### อัปเดตโค้ดหลังแก้ไข
```bash
cd /var/www/html && sudo git pull
```
 
### รันในเครื่องตัวเอง (ทดสอบก่อน Deploy)
```bash
git clone https://github.com/pongrapeejuey/Team-Project.git
cd Team-Project
php -S localhost:8000
```
เปิด `http://localhost:8000` (ต้องใช้ PHP เพราะมี `echo.php`; Live Preview/Live Server จะไม่รัน PHP)
 
---
 
## วิธีทดลอง Challenge และ Import/Export Portfolio Item
 
### Challenge ของกลุ่มเรา
- **ชื่อ / ประเภท:** เขียนหลังให้คุณงง — mix
- **วิธีเล่น:** 1. ผู้เล่นยืนเรียงแถวหน้ากระดาน (จำนวนคนปรับตามผู้เข้าร่วม) Host บอก "คำ" เป้าหมายให้คนท้ายแถวดูลับๆ 


  2.คนท้ายแถววาดภาพสื่อความหมายของคำนั้นลงบนหลังคนข้างหน้า แล้วส่งต่อการวาดไปเรื่อยๆ จนถึงคนหน้าสุด (ห้ามพูดหรือส่งเสียงใบ้) 


  3.ไล่ถามทีละคนตั้งแต่คนหน้าสุดจนถึงคนท้ายสุดว่า "คิดว่าคืออะไร" แล้วให้คนท้ายสุดเฉลยคำตั้งต้น
- **เกณฑ์ทำสำเร็จ:** คำทายของคนหน้าสุดตรงกับคำที่ Host กำหนดให้คนท้ายแถว (หรือหากทายตรงกันทั้งแถว/ตรงกับคำหลักตามที่ Host ตกลงไว้ก่อนเริ่ม) และรับข้อมูล Portfolio Item JSON ไปบันทึกในระบบได้ครบถ้วน
- **เวลาโดยประมาณ:** 5–10 นาที
### ขั้นตอนแลกเปลี่ยน (Host → Tester)
**Host (เจ้าของบูธ)**
1. ให้เพื่อนต่างกลุ่มทำ Challenge จนสำเร็จ
2. สร้าง Portfolio Item JSON ของผู้เข้าร่วม (ชื่อ, วันที่, หลักฐาน URL) แล้วกด **Copy JSON** (หรือดาวน์โหลด `portfolio-item.json`)
3. ส่งต่อให้ผู้เข้าร่วมด้วย Copy/Paste หรือไฟล์ `.json`
**Tester (ผู้เข้าร่วม) — ในระบบของกลุ่มตนเอง**
1. วาง JSON ลงช่อง Textarea แล้วกด **Import** (หรือเลือกไฟล์ `.json`)
2. ระบบตรวจ JSON/Field/ชนิดข้อมูล และ ID ซ้ำ ถ้าผิดจะแจ้งเตือนและไม่บันทึก
3. เลือก **Portfolio ปลายทาง**
4. ตรวจ/แก้ **Reflection ทั้ง 4 ช่อง** ให้ตรงกับสิ่งที่ทำจริง
5. กด **Save** (บันทึกลง Server) → Refresh หรือเปิดอีก Browser ต้องยังเห็น Item
6. กด **Export** เพื่อได้ `my-portfolio.json` (เฉพาะ Portfolio ของตนเอง)
### ตัวอย่าง Portfolio Item JSON (ข้อมูลสมมติ)
```json
{
  "id": "item002",
  "title": "Spot the Request",
  "type": "Challenge",
  "date": "2026-11-24",
  "role": "Player",
  "description": "Played challenge G01-C01 from Group 01",
  "skills": ["DevTools", "HTTP"],
  "reflection": {
    "whatIDid": "Found the GET and POST requests in the Network tab",
    "whatILearned": "POST data is in the request body, not the URL",
    "challenge": "Finding the Payload tab",
    "nextStep": "Try it on my own app"
  },
  "evidence": ["https://example.com/screenshot-network-tab.png"],
}
```
 
กฎของข้อมูล: `skills` เป็น `string[]`, `reflection` เป็น object ที่มี `whatIDid`, `whatILearned`, `challenge`, `nextStep`
และ `evidence` เป็น `string[]` ของ URL อย่างน้อย 1 รายการ (คงโครงสร้างเดิมจาก Checkpoint ไม่เปลี่ยนชื่อ/ชนิด Field)
 
---
 
## ความปลอดภัยเบื้องต้น
 
- ไฟล์ JSON อยู่นอก Web Root และเข้าถึงผ่าน `echo.php` เท่านั้น
- Server ตรวจข้อมูลซ้ำก่อนบันทึก (ชนิดข้อมูล, Field ที่จำเป็น, รูปแบบ URL/วันที่) และตอบ `400` เมื่อข้อมูลผิด
- Security Group เปิดเฉพาะ Port 22 และ 80
- ไม่เก็บ Password / AWS Credentials / Private Key (`.pem`) ใน Repository — ใช้ `.gitignore` (`*.pem`, `.env`, `*.key`)
  หากเผลอ Commit ความลับ ต้องยกเลิก/เปลี่ยนความลับนั้น ไม่ใช่แค่ลบไฟล์
- ใช้เฉพาะข้อมูลทดลองที่ไม่ sensitive ไม่มีระบบ Login (การเลือกชื่อ/Profile ไม่ใช่การยืนยันตัวตน)
---
 
## การทดสอบ (Functional Tests)
 
| การทดสอบ | วิธีทดสอบ | หลักฐาน |
|---|---|---|
| Cross-device & Persistence | บันทึกจาก Browser A → เปิดใน Browser B; Restart Apache / Reboot EC2 แล้วข้อมูลยังอยู่ | https://drive.google.com/file/d/1VQPMBjWcvqmACCHObqxc0zVv_-_IWJZd/view?usp=sharing |
| Server Validation & File Access | ส่งข้อมูลผิดต้องถูกปฏิเสธ; เปิด `/portfolio.json` ตรง ๆ ต้องไม่ได้ไฟล์ | https://drive.google.com/file/d/1CmAwNteAdKCygxL-yR2suHPX8UYzqfoJ/view?usp=sharing |
| Cross-group Exchange | ทำ Challenge → Copy JSON → Paste/Import → เลือก Portfolio → แก้ Reflection → Save → Refresh | https://drive.google.com/file/d/1rDbxfXIzYTrlmplaPAiIp3e11sYrYGqx/view?usp=sharing |
| Invalid JSON & Duplicate | วาง JSON พัง/Field ผิดชนิด/ID ซ้ำ ต้องแจ้งเตือนและไม่บันทึก | https://drive.google.com/file/d/1sHuGxRk1Pj7IbCopgxoMKLTh8izxX5FO/view?usp=sharing |
| EC2 & Security Group | แสดงการตั้งค่า Port ที่เปิด | https://drive.google.com/file/d/1FcYGzn_4KDi130qfmtDVu5XODiQOOZVF/view?usp=sharing |
 
ผลทดสอบและหลักฐานเพิ่มเติมอยู่ใน GitHub Issues (Checkpoint: [#1](https://github.com/pongrapeejuey/Team-Project/issues/1)–[#4](https://github.com/pongrapeejuey/Team-Project/issues/4))
 
---

## ทีมและการทำงานร่วมกัน
 
Workflow: **Issue → Implement → Test → Commit → Close** ทุกงานมีผู้รับผิดชอบ วิธีทดสอบ และหลักฐาน
commit message อ้างเลข Issue เช่น `Add server validation (#30)`
