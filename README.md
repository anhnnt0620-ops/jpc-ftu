# JPC FTU — CLB Tiếng Nhật Trường Đại học Ngoại Thương

Trang thông tin chính thức & tuyển thành viên thế hệ mới của CLB Tiếng Nhật Trường Đại học Ngoại Thương (**JPC FTU**), tích hợp công nghệ đồ họa 3D WebGL và chuyển động cao cấp.

---

## 🚀 Công Nghệ Tích Hợp

- **Node.js & Vite**: Môi trường phát triển hiện đại, tối ưu tốc độ đóng gói và hot reload.
- **Three.js (r174)**: Engine WebGL 3D với kịch bản bàn tay chuyển động sinh học (*Bio-Kinematic 3D Hand*) và Nút thắt Vô cực (*Musubi Knot*).
- **Post-Processing (UnrealBloomPass)**: Hiệu ứng phát sáng hào quang vàng kim điện ảnh (*Cinematic Golden Bloom*).
- **GSAP (GreenSock)**: Timeline animation & chuyển động camera 3D mượt mà.
- **Lenis Smooth Scroll**: Cuộn trang theo quán tính mượt mà đồng bộ với Camera 3D Parallax.
- **Canvas Confetti**: Pháo hoa hạt vàng kim và cánh hoa anh đào khi tương tác.
- **GitHub Pages Ready**: Tương thích hoàn toàn với GitHub Pages tự động qua GitHub Actions hoặc lệnh CLI.

---

## 🛠 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Khởi động môi trường phát triển (Local Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ mở tại `http://localhost:3000/`.

### 3. Đóng gói cho Production / GitHub Pages
```bash
npm run build
```
Bản dựng tối ưu được tạo trong thư mục `dist/`.

### 4. Xuất bản lên GitHub Pages
```bash
npm run deploy
```
*Hoặc đẩy code lên nhánh `main`/`master` để GitHub Actions tự động build và deploy lên GitHub Pages.*

---

Chi tiết API đồ họa và kịch bản 3D xem tại: [3D_GUIDE.md](./3D_GUIDE.md).
