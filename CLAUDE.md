# Race Condition Lab: E-commerce Flash Sale (System Security Project)

## 🎯 Project Overview
แลปจำลองช่องโหว่ Race Condition (TOCTOU) บนระบบสั่งซื้อสินค้าแบบ Flash Sale โดยใช้ Next.js เวอร์ชั่นล่าสุด และ SQLite เพื่อแสดงให้เห็นว่า logic error ในระดับ code สามารถข้ามผ่านระบบที่ใช้ framework ทันสมัยได้

## 🛠 Tech Stack
- **Framework:** Next.js เวอร์ชั่นล่าสุด  (App Router)
- **Database:** SQLite (Better-sqlite3)
- **Environment:** Node.js 22+

## 🛡 Security Lab Context
- **Vulnerability:** Race Condition (Time-of-Check to Time-of-Use)
- **Scenario:** การรุมกดซื้อสินค้าที่มีชิ้นสุดท้ายพร้อมกัน (Concurrent Requests)
- **Goal:** แฮกเกอร์สามารถสั่งซื้อสินค้าได้เกินจำนวนสต็อกที่มีจริง (Stock overselling)

## 📋 Coding Conventions
- **API Routes:** เก็บไว้ใน `app/api/`
- **Database:** ใช้ `lib/db.ts` สำหรับ singleton connection
- **State:** ห้ามใช้ Global variable ในการเก็บสต็อก (เพื่อให้จำลองการเข้าถึง DB จริง)

## 🚀 Build & Run Commands
- `npm install` - ติดตั้ง dependencies
- `npm run dev` - เริ่มต้น dev server (Next.js 16.2)
- `python3 exploit.py` - สคริปต์สำหรับจำลองการโจมตี