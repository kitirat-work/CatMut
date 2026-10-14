# CatMut

เครื่องมือสร้างวอลเปเปอร์ลาย cutting mat ดาวน์โหลดเป็น SVG หรือ PNG
Vite + React (JavaScript) แปลงมาจาก `cutmat.html` เวอร์ชันล่าสุด และใช้ design system "CatMut"

## เริ่มใช้งาน

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # ได้ผลลัพธ์ที่ dist/
npm run preview   # ดู build จริง
```

ต้องใช้ Node 18 ขึ้นไป

## โครงสร้าง

```
design-system/           ต้นฉบับ design system (อ่านอย่างเดียวในเชิงแนวคิด)
  tokens.json            สี ฟอนต์ ระยะ มุมโค้ง เงา
  README.md              หลักการภาพและน้ำเสียงข้อความ
  components/*.md        แนวทางของ Button, Switch, LayerChip, PresetSwatch, MatSample
scripts/build-tokens.mjs สร้าง src/styles/tokens.css จาก tokens.json
src/
  lib/
    generator.js         ตัวสร้าง SVG (ฟังก์ชันล้วน build(S, opts)) ย้ายมาจาก HTML เดิมโดยไม่แก้ตรรกะ
    constants.js         ค่าเริ่มต้น พรีเซ็ตสี อัตราส่วน เลเยอร์ รูปแบบเงา
    fonts.js             รายการ Google Fonts, เพิ่มฟอนต์เอง, อัปโหลดไฟล์ฟอนต์ (ฝังลง SVG/PNG)
    download.js          ดาวน์โหลด SVG/PNG, คัดลอกโค้ด
  components/
    ui.jsx               Button, Switch, Chip, PresetSwatch, Segmented, Section, Row, Slider, ช่องกรอก
    panel/*.jsx          แผงควบคุมแต่ละส่วน (สี, ขนาด, ลวดลาย, เงา, ข้อความ, ฟอนต์เพิ่มเติม)
    MatPreview.jsx       แสดงตัวอย่าง
    ExportBar.jsx        ปุ่มส่งออกและดูโค้ด
    Toast.jsx            ข้อความแจ้งสถานะ
  styles/
    tokens.css           สร้างอัตโนมัติ ห้ามแก้ตรงๆ
    app.css              สไตล์ของหน้าจอ (ใช้ตัวแปรจาก tokens.css)
  App.jsx                เก็บ state ทั้งหมดและประกอบหน้า
```

## แก้ design token

แก้ที่ `design-system/tokens.json` แล้วรัน `npm run tokens` เพื่อสร้าง `src/styles/tokens.css` ใหม่
ธีมสว่าง/มืดตามระบบของผู้ใช้ และบังคับได้ด้วย `data-theme="light"` หรือ `data-theme="dark"` บน `<html>`

## Deploy ขึ้น GitHub Pages

```bash
make deploy                        # หรือ ./scripts/deploy-pages.sh
./scripts/deploy-pages.sh --no-push   # commit ไว้ในเครื่อง ยังไม่ push
```

script จะ build ด้วย base แบบ relative แล้วคัดลอก `dist/` ไปแทนที่โฟลเดอร์ `catmut/` ใน repo
`kitirat-work.github.io` (ค่าเริ่มต้นอยู่ที่ `../kitirat-work.github.io` ถ้ายังไม่มีจะ clone ให้) จากนั้น commit และ push ขึ้น `main`
เปลี่ยนค่าได้ด้วย env `PAGES_DIR`, `PAGES_REPO`, `PAGES_BRANCH`, `PAGES_SUBDIR`

## หมายเหตุ

- ฟอนต์ Newsreader, IBM Plex Sans Thai และ IBM Plex Mono โหลดจาก Google Fonts ผ่าน `index.html` ต้องออนไลน์ถึงจะเห็นฟอนต์จริง
- ในไฟล์ SVG ที่ส่งออก ฟอนต์จาก Google Fonts จะใส่เป็นลิงก์ (`@import`) ส่วนฟอนต์ที่อัปโหลดจะฝังลงในไฟล์ ใช้ได้ทุกที่
- การดาวน์โหลดใช้ลิงก์ดาวน์โหลดของเบราว์เซอร์ทั้งหมด (ฉบับ HTML เดิมเรียก API ของ Claude artifact ก่อน ตัดออกแล้ว)
