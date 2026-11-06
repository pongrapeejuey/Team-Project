# Learning Portfolio — CS100 POWER UP! (Checkpoint 1)

เว็บแอปสำหรับสร้าง Personal Learning Portfolio และเพิ่มผลงาน/ประสบการณ์การเรียนรู้ได้หลายรายการ
ทำงานบน Browser ทั้งหมด (HTML, CSS, Bootstrap, JavaScript) และบันทึกข้อมูลด้วย `localStorage`
โปรเจกต์กลุ่มรายวิชา CS100

- **Repository:** https://github.com/pongrapeejuey/Team-Project
- **Commit SHA ที่ส่งตรวจ:** `[ใส่ SHA เต็มจาก git log -1 หลังโค้ดนิ่ง]`

## Features

- **Create Portfolio:** ชื่อที่ต้องการแสดง, What I Enjoy, What I've Tried, What I'm Curious About
- **Add Portfolio Item:** เพิ่มได้หลายรายการต่อหนึ่ง Portfolio
  (Title, Type, Date, Role, Skills, Description, Reflection 4 ช่อง, Evidence)
- **Validation:** ตรวจช่องที่จำเป็น รูปแบบ URL ของ Evidence และรูปแบบวันที่ พร้อมข้อความแจ้งเตือน
- **Save & Load:** บันทึกลง `localStorage` และข้อมูลยังอยู่หลัง Refresh
- **Multiple Portfolios:** รองรับหลาย Portfolio โดยข้อมูลไม่ปะปนกัน
- **Responsive:** ใช้งานได้ทั้ง Desktop และ Mobile (Bootstrap 5.3.3 ผ่าน CDN)

> สถานะการทำงานแต่ละฟีเจอร์ให้ทีมอัปเดตก่อนส่ง ดูรายละเอียดบั๊กที่รู้จักในหัวข้อ Known Issues

## วิธีเปิดและทดลองใช้งาน

### สิ่งที่ต้องมี
- Git
- VS Code พร้อมส่วนขยาย **Live Preview** (หรือ Live Server)
- Browser ทั่วไป (เช่น Chrome, Edge)
- ต้องต่ออินเทอร์เน็ต เพราะโหลด Bootstrap จาก CDN

### ขั้นตอน
1. Clone repository
   ```bash
   git clone https://github.com/pongrapeejuey/Team-Project.git
   cd Team-Project
   ```
2. เปิดโฟลเดอร์ `Team-Project` ใน VS Code (File → Open Folder)
3. คลิกขวาที่ `index.html` → **Show Preview** (Live Preview) หรือ **Open with Live Server**
4. เปิดหน้าเว็บที่ `http://127.0.0.1:3000/index.html`
   (พอร์ตอาจต่างกันตามเครื่อง ใช้ URL ที่ VS Code แสดง)

### ลองใช้งานตามลำดับ
1. กรอกฟอร์ม **สร้าง Portfolio ใหม่** แล้วกดสร้าง (สร้างอย่างน้อย 2 Portfolios)
2. ในฟอร์ม **เพิ่ม Portfolio Item** เลือก Portfolio แล้วกรอกข้อมูลให้ครบ กดบันทึก (ทำให้ได้อย่างน้อย 2 Items ต่อ Portfolio)
3. กด **Refresh (F5)** ข้อมูลต้องยังอยู่ครบ
4. ทดลองกรอกข้อมูลผิด เช่น เว้นช่องว่าง หรือ Evidence ที่ไม่ใช่ URL ต้องมีข้อความแจ้งเตือนและไม่บันทึก
5. ดูข้อมูลที่บันทึกได้ที่ DevTools (F12) → Application → Local Storage

> **ข้อจำกัดของ localStorage:** ข้อมูลเก็บแยกตาม Browser และ URL
> เปิดอีก Browser หรืออีกเครื่องจะไม่เห็นข้อมูลเดียวกัน (ใช้ URL เดียวกันตลอด อย่าสลับ `localhost` กับ `127.0.0.1`)

## โครงสร้างโปรเจกต์

```
Team-Project/
├── index.html        หน้าหลัก (ฟอร์มและส่วนแสดงผล)
├── CSS/style.css     custom CSS
├── app.js            JavaScript (ฟอร์ม, validation, JSON, localStorage)
└── README.md
```

> ข้อกำหนดของรายวิชาระบุ `css/style.css` ถ้าทีมย้ายไฟล์ (เช่น `css/`, `js/`) ให้แก้โครงสร้างด้านบนและ path ใน `index.html` ให้ตรงกัน

## โครงสร้างข้อมูล (JSON)

ใช้ชื่อ Field และชนิดข้อมูลตาม `portfolio-example.json` ของรายวิชา ตัวอย่าง 1 Portfolio Item (ข้อมูลสมมติ)

```json
{
  "id": "item001",
  "title": "My First Website",
  "type": "Course Assignment",
  "date": "2026-10-18",
  "role": "Developer",
  "description": "Created a personal website",
  "skills": ["HTML", "CSS"],
  "reflection": {
    "whatIDid": "Built the website",
    "whatILearned": "Responsive design",
    "challenge": "Mobile layout",
    "nextStep": "Improve the design"
  },
  "evidence": ["https://example.com/my-work"]
}
```

ไฟล์ตัวอย่างสำหรับส่งงาน: `sample-portfolio-1.json`, `sample-portfolio-2.json` (ข้อมูลสมมติ ไม่มีข้อมูลส่วนตัว)

## การทดสอบ

ผลทดสอบและหลักฐาน (ภาพ/คลิป) อยู่ใน GitHub Issues

| Issue | หัวข้อทดสอบ |
|---|---|
| [#1](https://github.com/pongrapeejuey/Team-Project/issues/1) | Responsive Desktop/Mobile |
| [#2](https://github.com/pongrapeejuey/Team-Project/issues/2) | Broken links และ relative paths |
| [#3](https://github.com/pongrapeejuey/Team-Project/issues/3) | Form validation |
| [#4](https://github.com/pongrapeejuey/Team-Project/issues/4) | JSON และ localStorage |

Checkpoint Tests ที่ต้องสาธิต: กรอกไม่ครบ/URL ผิด, สร้าง 2 Portfolios × 2 Items,
Save → Refresh → Load, เปิดอีก Browser, ดูบน Mobile

## Known Issues

- [ให้ทีมเติมตามสถานะจริง เช่น ฟอร์มส่วนไหนยังไม่ทำงาน พร้อมลิงก์ issue]

## ทีมและการทำงานร่วมกัน

ใช้ GitHub Issues ตาม workflow **Issue → Implement → Test → Commit → Close**
โดยทุกงานมีผู้รับผิดชอบ วิธีทดสอบ และหลักฐาน commit message อ้างเลข issue เช่น `Add form validation (#12)`

| สมาชิก | GitHub | บทบาท |
|---|---|---|
| [ชื่อ] | [@username] | [บทบาท] |
| [ชื่อ] | [@username] | [บทบาท] |
| [ชื่อ] | [@yanakonCharoenchaturong](https://github.com/yanakonCharoenchaturong) | Tester / Support |

## หมายเหตุ

- ข้อมูลทั้งหมดในระบบทดลองเป็นข้อมูลสมมติ ไม่มีข้อมูลส่วนตัวหรือข้อมูล sensitive
- ใช้ AI ช่วยศึกษาและเขียนโค้ดได้ แต่ผู้รับผิดชอบต้องตรวจ ทดสอบ และอธิบายโค้ดของตนเองได้
