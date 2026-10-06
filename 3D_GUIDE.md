# Hướng Dẫn Sử Dụng & Phát Triển Website JPC FTU (Node.js + 3D Animation Stack)

Hệ thống website **JPC FTU** hiện được nâng cấp toàn diện trên nền tảng **Node.js** với bộ công cụ đồ họa 3D WebGL và Animation cao cấp nhất hiện nay, tương thích 100% khi xem trên **GitHub Pages** hoặc bất kỳ hosting tĩnh nào.

---

## 1. Danh Sách Thư Viện 3D & Animation Đã Cài Đặt (Node.js)

- **Three.js (`three` r174 + `@types/three`)**: Engine WebGL 3D hàng đầu.
- **UnrealBloomPass & EffectComposer (`three/examples/jsm/...`)**: Post-processing hào quang vàng kim điện ảnh (*Cinematic Golden Bloom*).
- **GSAP (`gsap` 3.12 + ScrollTrigger)**: Điều khiển chuyển động và timeline camera 3D siêu mượt.
- **Lenis (`lenis`)**: Thư viện Smooth Momentum Scroll chuẩn Awwwards, đồng bộ mượt mà giữa thao tác cuộn trang và góc quay Camera 3D Parallax.
- **Canvas-Confetti (`canvas-confetti`)**: Pháo hoa hạt vàng kim & cánh hoa anh đào chúc mừng khi bấm nút CTA / nộp đơn.
- **Vite (`vite`)**: Bundler & Dev Server siêu tốc độ hỗ trợ Hot Module Replacement (HMR).
- **GitHub Pages Deploy (`gh-pages` + GitHub Actions)**: Tự động hóa quá trình đóng gói và xuất bản lên GitHub Pages.

---

## 2. Các Lệnh Thao Tác với Node.js

Mở Terminal tại thư mục dự án và chạy các lệnh sau:

### 2.1. Cài đặt lại thư viện (nếu clone máy mới)
```bash
npm install
```

### 2.2. Khởi động môi trường phát triển (Local Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:3000/` với tính năng cập nhật tức thì (HMR).

### 2.3. Đóng gói cho GitHub Pages (Production Build)
```bash
npm run build
```
Toàn bộ source code, hình ảnh, font chữ, âm thanh sẽ được biên dịch và đóng gói tối ưu vào thư mục `dist/` với đường dẫn tương đối (`./`), sẵn sàng để host trên bất kỳ server nào.

### 2.4. Xem trước bản đóng gói
```bash
npm run preview
```

### 2.5. Xuất bản lên GitHub Pages qua lệnh CLI
```bash
npm run deploy
```
Lệnh này sẽ tự động build và đẩy thư mục `dist/` lên nhánh `gh-pages` của repository GitHub.

---

## 3. Cách Bật GitHub Pages Trên Repository GitHub

Dự án đã được tích hợp sẵn file cấu hình tự động [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml).

Để kích hoạt xem trang trên GitHub Pages:
1. Vào trang Repository trên GitHub (`https://github.com/anhnnt0620-ops/jpc-ftu`).
2. Nhấp vào tab **Settings** $\rightarrow$ chọn mục **Pages** ở thanh bên trái.
3. Trong mục **Build and deployment** $\rightarrow$ **Source**:
   - Chọn **GitHub Actions** (được khuyên dùng, GitHub sẽ tự động build qua Vite và deploy mỗi khi push code lên `main`/`master`).
   - *Hoặc* chọn **Deploy from a branch** $\rightarrow$ chọn nhánh `gh-pages` $\rightarrow$ bấm **Save**.
4. Website của bạn sẽ hiển thị tại địa chỉ: `https://anhnnt0620-ops.github.io/jpc-ftu/`

---

## 4. Kịch Bản Animation 3D: Nắm Chặt $\rightarrow$ Búng Tay $\rightarrow$ Bài Bay Ra

1. **Giai đoạn 1 (0s $\rightarrow$ 1.35s) - Xoáy Tròn Năng Lượng & Nắm Tay (Swirl & Clench)**:
   - 68+ mảnh thẻ bài vàng óng xoay hình xoắn ốc (Vortex) hút năng lượng vào lòng bàn tay 3D PBR.
   - Bàn tay 3D chuyển động theo sóng cơ sinh học (*Bio-Kinematic Wave*), nhẹ nhàng khép lại chuẩn bị thế búng.
2. **Giai đoạn 2 (1.35s $\rightarrow$ 1.84s) - Khóa Thế Búng Tay (Friction Lock & Tension)**:
   - Đầu ngón cái và ngón giữa miết chặt vào nhau tích lũy lực ma sát, ngón trỏ vươn nhẹ điệu nghệ.
   - Cổ tay ngả về sau nạp thế đàn hồi.
3. **Giai đoạn 3 (1.84s $\rightarrow$ 2.15s) - Khoảnh Khắc Búng Tay (25ms Snap Impact)**:
   - Ngón giữa búng mạnh vào gò mô cái (*Thenar pad*), cổ tay bật giật lùi nhẹ (*Kinetic Recoil*).
   - **Post-Processing Bloom Flare** chớp sáng rực rỡ cùng tia sét sóng xung kích 3D (*Golden Shockwave Ring*).
   - 85+ tia lửa hạt sáng phóng 360 độ từ đầu ngón tay.
   - Web Audio API tổng hợp âm thanh tách ngón (*Crisp Snap*) và chuông pha lê (*Golden Chime SFX*).
4. **Giai đoạn 4 (2.15s $\rightarrow$ 3.6s) - Các Lá Bài Bay Ra & Xuất Hiện Nút Thắt Vô Cực**:
   - 4 lá bài chủ lực (**一期**, **JPC**, **FTU**, **一会**) phóng vút từ bàn tay ra đáp vào 4 góc màn hình.
   - Bàn tay 3D biến chuyển thành biểu tượng Nút thắt Vô cực mạ vàng (*Musubi Torus Knot*) phát sáng hào quang bloom cùng 2 vòng quỹ đạo thiên thể xoay ngược chiều.
5. **Giai đoạn 5 (3.6s+) - Bồng Bềnh, Cuộn Mượt Parallax & Gõ Chữ**:
   - Cuộn trang với **Lenis Smooth Scroll**: Camera 3D di chuyển tịnh tiến theo chiều sâu trục Z và nghiêng nhẹ theo độ cuộn của trang web.

---

## 5. Danh Sách API Mở Rộng (`window.JPC3D` & Hiệu Ứng)

Bạn có thể gọi trực tiếp ở bất kỳ file JavaScript nào:

### 5.1. Bắn Pháo Hoa Cánh Hoa Anh Đào & Vàng Kim
```javascript
window.fireJapaneseConfetti();
```

### 5.2. Kích hoạt lại toàn bộ hiệu ứng Búng tay 3D
```javascript
window.JPC3D.playSnapIntro(
  () => console.log('Búng tay thành công!'),
  () => console.log('Hoàn thành kịch bản intro!')
);
```

### 5.3. Kích hoạt hiệu ứng nhịp đập & phát sáng (Pulse with Bloom)
```javascript
window.JPC3D.pulse(1.4);
```

### 5.4. Bật/Tắt chế độ xoay tự do Camera bằng chuột (OrbitControls)
```javascript
window.JPC3D.enableOrbitControls(true); // Bật
window.JPC3D.enableOrbitControls(false); // Tắt
```

### 5.5. Tải mô hình 3D thực tế (`.glb` / `.gltf`)
```javascript
window.JPC3D.loadGLTF('Image/my_model.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.set(0.5, 0.5, 0.5);
  model.position.set(0, -1, 0);
  console.log('Mô hình 3D đã sẵn sàng!', model);
});
```

### 5.6. Di chuyển Camera 3D bằng GSAP
```javascript
window.JPC3D.animateCamera({
  x: 0,
  y: 2,
  z: 10,
  duration: 2.0,
  ease: 'power3.out'
});
```
