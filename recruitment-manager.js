/**
 * JPC FTU — Recruitment & CMS Manager Module ("KOKESHI HỌA KÝ")
 * -------------------------------------------------------------
 * Features:
 * 1. 4 Main Rounds in 1 horizontal grid row + Horizontal Result Banner below
 * 2. 3D Flip Card Mascot Integration (Default: Mono, Hover: Color + Scale + Outer Glow)
 * 3. Recruitment Detail Modal with split/book animation, liquid fluid ink background,
 *    floating mascot talisman with soft radiant glow, 4-point star divider & custom scrollbar
 * 4. Hidden Admin CMS Integration:
 *    - Custom file upload for Mono Mascot, Color Mascot, and Popup Artwork (Base64)
 *    - Edit Round Name, Official Title, Date, Short Description & Modal Full Description
 *    - Real-time live DOM update upon saving
 *    - Backup JSON export & restore defaults
 */

export const RECRUIT_STORAGE_KEY = 'jpc_recruitment_rounds_v2';

export const DEFAULT_ROUNDS = [
  {
    id: 'round-1',
    stepNo: 'Vòng 1',
    title: 'Khai Nhãn',
    date: '01/10 – 20/10/2026',
    shortDesc: 'Điền form đăng ký trực tuyến với thông tin cơ bản & nguyện vọng chọn Ban.',
    monoUrl: 'Image/Monochrome/Vòng 1 - Mono.png',
    colorUrl: 'Image/Color/Vòng 1 - Color.png',
    popupUrl: 'Image/Khung Popup - Tuyển Gen/Vòng 1 - Popup.png',
    fullDesc: `"Vòng 1: Khai Nhãn" (開眼 - Khai mở tầm nhìn và ước vọng) chính là bước khởi đầu trên hành trình bước chân vào thế giới của JPC FTU thế hệ Gen 22 — "Kokeshi Họa Ký".

Trong văn hóa truyền thống Nhật Bản, búp bê Daruma khi mới được tạo ra chưa hề có mắt. Người sở hữu sẽ tự tay vẽ con mắt thứ nhất để gửi gắm một tâm nguyện lớn lao, và chỉ khi mục tiêu đã hoàn thành thì con mắt thứ hai mới được điểm sắc trọn vẹn. "Khai Nhãn" chính là thời khắc bạn chấm nét bút đầu tiên lên con búp bê Daruma của chính mình: xác định mục tiêu, bộc lộ khát khao và chọn cho mình bến đỗ tại JPC FTU.

Nội dung & Hình thức tham gia:
• Điền đơn đăng ký trực tuyến: Hoàn thành form ứng tuyển chính thức do JPC FTU phát hành, chia sẻ thông tin bản thân, sở thích, thế mạnh và lý do muốn gắn bó với CLB.
• Chọn nguyện vọng Ban: Lựa chọn 1 trong 5 Ban chuyên môn (Ban Tổ chức, Ban Chuyên môn, Ban Thông tin, Ban Nhân sự, Ban Đối ngoại).
• Trả lời các câu hỏi tình huống mở: Cơ hội để thể hiện góc nhìn cá nhân, sự nhiệt huyết và nét cá tính độc bản của bạn.

Đừng ngần ngại nếu bạn chưa từng học tiếng Nhật — JPC luôn rộng mở chào đón mọi trái tim khao khát học hỏi, trải nghiệm và hòa nhập cùng một gia đình ấm áp!`
  },
  {
    id: 'round-2',
    stepNo: 'Vòng 2',
    title: 'Hòa Nhịp',
    date: '23/10 – 25/10/2026',
    shortDesc: 'Gặp gỡ, thảo luận nhóm để thể hiện cá tính, bản lĩnh và tinh thần đồng đội.',
    monoUrl: 'Image/Monochrome/Vòng 2 - Mono.png',
    colorUrl: 'Image/Color/Vòng 2 - Color.png',
    popupUrl: 'Image/Khung Popup - Tuyển Gen/Vòng 2 - Popup.png',
    fullDesc: `"Vòng 2: Hòa Nhịp" (和 - Sự hòa hợp và nhịp đập đồng điệu), mang hình tượng Zashiki-warashi (ざしきわらし) — thần linh mang lại may mắn, tiếng cười và sự ấm áp sum vầy trong những ngôi nhà truyền thống Nhật Bản.

Sau khi vượt qua Vòng Khai Nhãn, bạn sẽ bước vào buổi gặp gỡ trực tiếp cùng các ứng viên khác. Tại đây, sự hòa hợp và tinh thần tương trợ lẫn nhau chính là chìa khóa mở cánh cửa tiếp theo.

Nội dung & Hoạt động chính:
• Phỏng vấn nhóm & Ice-breaking: Tham gia vào các hoạt động gắn kết sôi nổi để làm quen với đồng đội mới và ban giám khảo.
• Thảo luận & Giải quyết tình huống (Case study): Cùng nhóm của mình giải quyết một đề bài thực tế ngắn hạn, đòi hỏi sự phối hợp nhịp nhàng, lắng nghe tích cực và phân chia công việc hợp lý.
• Thuyết trình & Phản biện nhóm: Đại diện nhóm trình bày ý tưởng trước hội đồng giám khảo và cùng nhau giải đáp các câu hỏi phản biện.

"Hòa Nhịp" không tìm kiếm một cá nhân nổi trội đơn lẻ mà tìm kiếm sự thấu hiểu, lắng nghe và khả năng cùng nhau tỏa sáng trong một tập thể!`
  },
  {
    id: 'round-3-1',
    stepNo: 'Vòng 3.1',
    title: 'Phá Phong',
    date: '27/10 – 04/11/2026',
    shortDesc: 'Thực chiến cùng đồng đội đến từ các Ban qua đề bài được giao.',
    monoUrl: 'Image/Monochrome/Vòng 3.1 - Mono.png',
    colorUrl: 'Image/Color/Vòng 3.1 - Color.png',
    popupUrl: 'Image/Khung Popup - Tuyển Gen/Vòng 3.1 - Popup.png',
    fullDesc: `"Vòng 3.1: Phá Phong" (破風 - Cưỡi gió phá sóng, bứt phá giới hạn), đại diện bởi linh vật Tengu (てんぐ) quyền năng với đôi cánh sải rộng giữa tầng không bão táp, biểu trưng cho sự quả cảm, tốc độ và năng lực thực chiến phi thường.

Đây là chặng thử thách Teamwork kéo dài nhất của kỳ tuyển Gen 22. Bạn sẽ được phân vào một đội ngũ liên ban — mô phỏng chính xác mô hình vận hành dự án thực tế tại JPC FTU.

Nội dung & Thử thách thực chiến:
• Đề bài dự án thực tế (Project Pitch): Mỗi đội sẽ nhận đề bài xây dựng một sự kiện văn hóa, một chiến dịch truyền thông hoặc một kế hoạch chuyên môn hoàn chỉnh.
• Phối hợp liên ban tác chiến: Từng thành viên đảm nhận vai trò đúng với nguyện vọng Ban đã đăng ký (lên timeline tổ chức, sản xuất nội dung hình ảnh, thiết kế chương trình học thuật hoặc mời tài trợ).
• Chạy việc & Đánh giá quá trình: Hội đồng đánh giá không chỉ nhìn vào sản phẩm cuối cùng mà chú trọng tinh thần trách nhiệm, khả năng chịu áp lực và cách bạn vượt qua xung đột trong nhóm.

Hãy giương cao cánh buồm, cùng đồng đội phá tan cơn gió ngược để biến ý tưởng trên giấy thành hiện thực!`
  },
  {
    id: 'round-3-2',
    stepNo: 'Vòng 3.2',
    title: 'Chân diện',
    date: '08/11 – 09/11/2026',
    shortDesc: 'Trò chuyện chuyên sâu cùng Trưởng - Phó Ban các ban chuyên trách.',
    monoUrl: 'Image/Monochrome/Vòng 3.2 - Mono.png',
    colorUrl: 'Image/Color/Vòng 3.2 - Color.png',
    popupUrl: 'Image/Khung Popup - Tuyển Gen/Vòng 3.2 - Popup.png',
    fullDesc: `"Vòng 3.2: Chân diện" (真面 - Bộ mặt chân thật, cuộc đối thoại từ trái tim), gắn liền với hình tượng mặt nạ Kitsune (きつね - Hồ Ly Thần) bí ẩn và tinh anh của đền thần Inari. Chiếc mặt nạ được gỡ xuống cũng là lúc bạn đối diện chân thực nhất với chính mình.

Đây là vòng phỏng vấn cá nhân 1-1 chuyên sâu cuối cùng trước khi cánh cổng Gen 22 chính thức khép lại.

Nội dung & Không gian trò chuyện:
• Đối thoại cùng Trưởng/Phó Ban: Cuộc trò chuyện ấm cúng, cởi mở giữa bạn và những người dẫn dắt trực tiếp của Ban bạn muốn gắn bó trong nhiệm kỳ tới.
• Đánh giá mức độ phù hợp văn hóa: Khám phá sự tương thích giữa định hướng cá nhân của bạn với văn hóa làm việc và giá trị cốt lõi của JPC FTU.
• Lắng nghe tâm tư & giải đáp nguyện vọng: Bạn hoàn toàn có quyền đặt câu hỏi ngược lại cho các anh chị về kỳ vọng, áp lực và lộ trình phát triển bản thân nếu trở thành thành viên chính thức.

Hãy giữ vững tâm thế tự tin và là chính mình một cách chân thật nhất — bởi vì sự chân thành chính là điểm chạm lớn nhất!`
  },
  {
    id: 'round-result',
    stepNo: 'Kết quả',
    title: 'Công bố kết quả',
    date: '12/11/2026',
    shortDesc: 'Chào đón các gương mặt xuất sắc chính thức trở thành thế hệ Gen 22 của JPC - FTU!',
    monoUrl: 'Image/Monochrome/Vòng 1 - Mono.png',
    colorUrl: 'Image/Color/Vòng 1 - Color.png',
    popupUrl: 'Image/Khung Popup - Tuyển Gen/Vòng 1 - Popup.png',
    fullDesc: `"KOKESHI HỌA KÝ — HOÀN THÀNH BỨC TRANH GEN 22"

Sau những chặng đường thử thách đầy cam go nhưng ngập tràn cảm xúc từ Khai Nhãn, Hòa Nhịp cho đến Phá Phong và Chân diện, kỳ tuyển thành viên Gen 22 của CLB Tiếng Nhật FTU đã chính thức về đích!

Chào đón các thế hệ Gen mới:
• Danh sách trúng tuyển chính thức sẽ được công bố trực tiếp trên Fanpage CLB Tiếng Nhật FTU và gửi email thông báo chi tiết đến từng ứng viên.
• Những bức thư mời nhập gia (Offer Letter) đặc biệt sẽ được gửi tới hòm thư cá nhân kèm theo hướng dẫn tham gia buổi Welcome Day đầu tiên.
• Hành trình thanh xuân rực rỡ, những dự án bùng nổ và tình bạn gắn kết dưới mái nhà chung JPC FTU đang chờ đón bạn phía trước.

Chúc mừng bạn đã vẽ nên con mắt thứ hai rực rỡ cho Daruma của chính mình và chính thức trở thành một mảnh ghép của JPC FTU Gen 22!`
  }
];

export class RecruitmentManager {
  constructor() {
    this.rounds = [];
    this.editingRoundId = 'round-1';
    this.init();
  }

  init() {
    this.loadRounds();
    this.renderUI();
    this.bindDOM();
  }

  /* ==========================================================
     1. DATA STORAGE
     ========================================================== */
  loadRounds() {
    try {
      const stored = localStorage.getItem(RECRUIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          this.rounds = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('[RecruitmentManager] Could not read localStorage:', err);
    }
    this.rounds = JSON.parse(JSON.stringify(DEFAULT_ROUNDS));
    this.saveRounds();
  }

  saveRounds() {
    try {
      localStorage.setItem(RECRUIT_STORAGE_KEY, JSON.stringify(this.rounds));
    } catch (err) {
      console.error('[RecruitmentManager] Failed to save rounds:', err);
      alert('Không thể lưu dữ liệu (có thể do dung lượng ảnh tải lên quá lớn). Vui lòng nén bớt ảnh trước khi lưu!');
    }
  }

  /* ==========================================================
     2. FRONTEND RENDERING (4 MAIN ROUNDS IN 1 ROW + RESULT BANNER)
     ========================================================== */
  renderUI() {
    this.renderRoundsGrid();
    this.renderResultBanner();
  }

  renderRoundsGrid() {
    const gridContainer = document.getElementById('joinRoundsGrid');
    if (!gridContainer) return;

    // Filter the 4 main rounds: round-1, round-2, round-3-1, round-3-2
    const mainRounds = this.rounds.filter(r => r.id !== 'round-result');

    let html = '';
    mainRounds.forEach((round) => {
      html += `
        <article class="join__step" data-round-id="${round.id}" tabindex="0" role="button" aria-label="Xem chi tiết ${this.escapeHTML(round.stepNo)}: ${this.escapeHTML(round.title)}">
          <!-- Mascot Container with 3D Flip Card Effect & Soft Outer Glow -->
          <div class="join__mascot-wrapper">
            <div class="join__mascot-glow" aria-hidden="true"></div>
            <div class="join__mascot-card">
              <div class="join__mascot-face join__mascot-face--mono">
                <img src="${this.escapeHTML(round.monoUrl)}" alt="${this.escapeHTML(round.stepNo)} - Mono" class="join__mascot-img" loading="lazy">
              </div>
              <div class="join__mascot-face join__mascot-face--color">
                <img src="${this.escapeHTML(round.colorUrl)}" alt="${this.escapeHTML(round.stepNo)} - Color" class="join__mascot-img" loading="lazy">
              </div>
            </div>
          </div>

          <!-- Step Info -->
          <span class="join__step-no">${this.escapeHTML(round.stepNo)}</span>
          <span class="join__step-date">${this.escapeHTML(round.date)}</span>
          <h3 class="join__step-title">${this.escapeHTML(round.title)}</h3>
          <p class="join__step-desc">${this.escapeHTML(round.shortDesc)}</p>
          <div class="join__step-action" aria-hidden="true">
            <span>Chi tiết vòng</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </article>
      `;
    });

    gridContainer.innerHTML = html;

    // Attach click and keyboard events
    gridContainer.querySelectorAll('.join__step').forEach((card) => {
      const openHandler = () => {
        const id = card.getAttribute('data-round-id');
        this.openDetailModal(id);
      };
      card.addEventListener('click', openHandler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHandler();
        }
      });
    });
  }

  renderResultBanner() {
    const resultContainer = document.getElementById('joinResultContainer');
    if (!resultContainer) return;

    const resultRound = this.rounds.find(r => r.id === 'round-result') || DEFAULT_ROUNDS[4];

    resultContainer.innerHTML = `
      <article class="join__result-banner" id="joinResultBanner" data-round-id="${resultRound.id}" tabindex="0" role="button" aria-label="Xem chi tiết Công bố kết quả">
        <div class="join__result-banner-glow" aria-hidden="true"></div>
        <div class="join__result-col join__result-col--badge">
          <div class="join__result-pill">
            <span class="join__result-pill-icon" aria-hidden="true">🎊</span>
            <div class="join__result-pill-text">
              <span class="join__result-tag">${this.escapeHTML(resultRound.stepNo)}</span>
              <span class="join__result-date">${this.escapeHTML(resultRound.date)}</span>
            </div>
          </div>
        </div>

        <div class="join__result-col join__result-col--info">
          <h3 class="join__result-title">${this.escapeHTML(resultRound.title)}</h3>
          <p class="join__result-desc">${this.escapeHTML(resultRound.shortDesc)}</p>
        </div>

        <div class="join__result-col join__result-col--action">
          <div class="join__result-action-btn">
            <span>Xem chi tiết</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </article>
    `;

    const banner = document.getElementById('joinResultBanner');
    if (banner) {
      const openHandler = () => {
        this.openDetailModal(resultRound.id);
      };
      banner.addEventListener('click', openHandler);
      banner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHandler();
        }
      });
    }
  }

  /* ==========================================================
     3. RECRUITMENT DETAIL MODAL CONTROLLER
     ========================================================== */
  openDetailModal(roundId) {
    const round = this.rounds.find(r => r.id === roundId);
    if (!round) return;

    const modal = document.getElementById('joinDetailModal');
    if (!modal) return;

    // Populate Data
    const thumbEl = document.getElementById('joinModalThumb');
    const stepNoEl = document.getElementById('joinModalStepNo');
    const titleEl = document.getElementById('joinModalTitle');
    const dateEl = document.getElementById('joinModalDate');
    const descEl = document.getElementById('joinModalDesc');

    if (thumbEl) {
      thumbEl.src = round.popupUrl || round.colorUrl || round.monoUrl;
      thumbEl.alt = `${round.stepNo} - ${round.title}`;
    }
    if (stepNoEl) stepNoEl.textContent = round.stepNo;
    if (titleEl) titleEl.textContent = round.title;
    if (dateEl) dateEl.textContent = round.date;

    if (descEl) {
      const paragraphs = (round.fullDesc || round.shortDesc || '')
        .split('\n')
        .filter(p => p.trim().length > 0)
        .map(p => `<p>${this.escapeHTML(p)}</p>`)
        .join('');
      descEl.innerHTML = paragraphs;
      descEl.scrollTop = 0;
    }

    // Stop Lenis & Lock Body Scroll
    window.lenis?.stop();
    document.body.classList.add('modal-scroll-lock');

    // Show modal
    modal.classList.remove('is-closing');
    modal.classList.add('is-open');

    // Focus close button
    const closeBtn = document.getElementById('joinModalCloseBtn');
    if (closeBtn) closeBtn.focus();
  }

  closeDetailModal() {
    const modal = document.getElementById('joinDetailModal');
    if (!modal || !modal.classList.contains('is-open') || modal.classList.contains('is-closing')) return;

    modal.classList.add('is-closing');
    setTimeout(() => {
      modal.classList.remove('is-open', 'is-closing');
      this.checkAndRestoreScroll();
    }, 350);
  }

  checkAndRestoreScroll() {
    const eventModal = document.getElementById('eventDetailModal');
    const joinModal = document.getElementById('joinDetailModal');
    const loginModal = document.getElementById('adminLoginModal');
    const adminPortal = document.getElementById('adminPortal');

    const isEventOpen = eventModal && eventModal.classList.contains('is-open');
    const isJoinOpen = joinModal && joinModal.classList.contains('is-open');
    const isLoginOpen = loginModal && loginModal.classList.contains('is-open');
    const isPortalOpen = adminPortal && !adminPortal.hidden;

    if (!isEventOpen && !isJoinOpen && !isLoginOpen && !isPortalOpen) {
      document.body.classList.remove('modal-scroll-lock');
      window.lenis?.start();
      window.JPC3D?.resume?.();
    }
  }

  /* ==========================================================
     4. ADMIN CMS INTEGRATION FOR RECRUITMENT
     ========================================================== */
  setupAdminUI() {
    this.renderAdminRoundsList();
    this.selectRoundForEdit(this.editingRoundId || this.rounds[0].id);
    this.bindAdminDOM();
  }

  renderAdminRoundsList() {
    const listEl = document.getElementById('adminRecruitList');
    if (!listEl) return;

    let html = '';
    this.rounds.forEach((round) => {
      const isActive = this.editingRoundId === round.id;
      html += `
        <article class="admin-card-item admin-card-item--recruit ${isActive ? 'is-active' : ''}" data-round-id="${round.id}">
          <div class="admin-card-item__thumb admin-card-item__thumb--contain">
            <img src="${this.escapeHTML(round.colorUrl || round.monoUrl)}" alt="mascot">
          </div>
          <div class="admin-card-item__info">
            <div class="admin-card-item__badge-row">
              <span class="admin-round-pill">${this.escapeHTML(round.stepNo)}</span>
              <span class="admin-round-date">📅 ${this.escapeHTML(round.date)}</span>
            </div>
            <h4 class="admin-card-item__title">${this.escapeHTML(round.title)}</h4>
            <p class="admin-card-item__desc">${this.escapeHTML(round.shortDesc)}</p>
            <div class="admin-card-item__actions">
              <button type="button" class="admin-card-btn admin-card-btn--edit" data-action="edit-round" data-round-id="${round.id}">
                ✏️ Chỉnh Sửa
              </button>
            </div>
          </div>
        </article>
      `;
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('.admin-card-item--recruit').forEach((item) => {
      const id = item.getAttribute('data-round-id');
      item.addEventListener('click', () => {
        this.selectRoundForEdit(id);
      });
    });
  }

  selectRoundForEdit(id) {
    const round = this.rounds.find(r => r.id === id);
    if (!round) return;

    this.editingRoundId = id;

    // Update active highlight in sidebar list
    const listEl = document.getElementById('adminRecruitList');
    if (listEl) {
      listEl.querySelectorAll('.admin-card-item--recruit').forEach(item => {
        item.classList.toggle('is-active', item.getAttribute('data-round-id') === id);
      });
    }

    // Update Form Header
    const formTitle = document.getElementById('adminRecruitFormTitle');
    if (formTitle) {
      formTitle.textContent = `Chỉnh Sửa: ${round.stepNo} — ${round.title}`;
    }

    // Populate Fields
    const stepNoInput = document.getElementById('formRecruitStepNo');
    const titleInput = document.getElementById('formRecruitTitle');
    const dateInput = document.getElementById('formRecruitDate');
    const shortDescInput = document.getElementById('formRecruitShortDesc');
    const fullDescInput = document.getElementById('formRecruitFullDesc');

    if (stepNoInput) stepNoInput.value = round.stepNo || '';
    if (titleInput) titleInput.value = round.title || '';
    if (dateInput) dateInput.value = round.date || '';
    if (shortDescInput) shortDescInput.value = round.shortDesc || '';
    if (fullDescInput) fullDescInput.value = round.fullDesc || '';

    // Set preview images
    this.setPreviewImage('formRecruitMonoPreview', round.monoUrl);
    this.setPreviewImage('formRecruitColorPreview', round.colorUrl);
    this.setPreviewImage('formRecruitPopupPreview', round.popupUrl);

    // Scroll form to top
    const formScroll = document.getElementById('adminRecruitEditorScroll');
    if (formScroll) formScroll.scrollTop = 0;
  }

  saveRoundFromForm() {
    const round = this.rounds.find(r => r.id === this.editingRoundId);
    if (!round) return;

    const stepNo = document.getElementById('formRecruitStepNo')?.value.trim();
    const title = document.getElementById('formRecruitTitle')?.value.trim();
    const date = document.getElementById('formRecruitDate')?.value.trim();
    const shortDesc = document.getElementById('formRecruitShortDesc')?.value.trim();
    const fullDesc = document.getElementById('formRecruitFullDesc')?.value.trim();

    if (!stepNo) {
      alert('Vui lòng nhập Thứ tự / Tên vòng (ví dụ: Vòng 1)!');
      document.getElementById('formRecruitStepNo')?.focus();
      return;
    }
    if (!title) {
      alert('Vui lòng nhập Tên chính thức của vòng (ví dụ: Khai Nhãn)!');
      document.getElementById('formRecruitTitle')?.focus();
      return;
    }
    if (!date) {
      alert('Vui lòng nhập Thời gian diễn ra!');
      document.getElementById('formRecruitDate')?.focus();
      return;
    }
    if (!shortDesc) {
      alert('Vui lòng nhập Đoạn text ngắn hiển thị ngoài UI!');
      document.getElementById('formRecruitShortDesc')?.focus();
      return;
    }
    if (!fullDesc) {
      alert('Vui lòng nhập Nội dung text dài hiển thị trong Modal chi tiết!');
      document.getElementById('formRecruitFullDesc')?.focus();
      return;
    }

    const monoImg = document.getElementById('formRecruitMonoPreview')?.querySelector('img')?.src;
    const colorImg = document.getElementById('formRecruitColorPreview')?.querySelector('img')?.src;
    const popupImg = document.getElementById('formRecruitPopupPreview')?.querySelector('img')?.src;

    if (!monoImg) {
      alert('Vui lòng tải lên hoặc giữ file mascot bản Mono (Đen - Đỏ)!');
      return;
    }
    if (!colorImg) {
      alert('Vui lòng tải lên hoặc giữ file mascot bản Color (Bản màu)!');
      return;
    }
    if (!popupImg) {
      alert('Vui lòng tải lên hoặc giữ file Khung Popup đại diện trong Modal!');
      return;
    }

    // Update round object
    round.stepNo = stepNo;
    round.title = title;
    round.date = date;
    round.shortDesc = shortDesc;
    round.fullDesc = fullDesc;
    round.monoUrl = monoImg;
    round.colorUrl = colorImg;
    round.popupUrl = popupImg;

    this.saveRounds();
    this.renderUI();
    this.renderAdminRoundsList();

    alert(`Đã lưu thành công nội dung cho "${stepNo} — ${title}"! Giao diện trên trang chính đã được cập nhật ngay lập tức.`);
  }

  resetCurrentRoundToDefault() {
    const defRound = DEFAULT_ROUNDS.find(r => r.id === this.editingRoundId);
    if (!defRound) return;

    if (confirm(`Khôi phục dữ liệu gốc ban đầu cho "${defRound.stepNo} — ${defRound.title}"?`)) {
      const idx = this.rounds.findIndex(r => r.id === this.editingRoundId);
      if (idx !== -1) {
        this.rounds[idx] = JSON.parse(JSON.stringify(defRound));
        this.saveRounds();
        this.renderUI();
        this.renderAdminRoundsList();
        this.selectRoundForEdit(this.editingRoundId);
        alert(`Đã khôi phục dữ liệu gốc cho ${defRound.stepNo}!`);
      }
    }
  }

  resetAllRoundsToDefault() {
    if (confirm('Khôi phục toàn bộ 5 vòng thi tuyển Gen về cấu hình gốc ban đầu?')) {
      this.rounds = JSON.parse(JSON.stringify(DEFAULT_ROUNDS));
      this.saveRounds();
      this.renderUI();
      this.renderAdminRoundsList();
      this.selectRoundForEdit(this.rounds[0].id);
      alert('Đã khôi phục toàn bộ các vòng tuyển thành viên về mặc định!');
    }
  }

  setPreviewImage(containerId, src) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (src) {
      container.innerHTML = `<img src="${this.escapeHTML(src)}" alt="preview">`;
      container.setAttribute('data-has-image', 'true');
    } else {
      container.innerHTML = '<span class="admin-file-placeholder">Chưa chọn ảnh</span>';
      container.removeAttribute('data-has-image');
    }
  }

  bindFileInput(inputId, previewId, maxW, maxH) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Use PNG to preserve transparency for mascots!
          const compressedDataUrl = canvas.toDataURL('image/png');
          this.setPreviewImage(previewId, compressedDataUrl);
        };
        img.src = readEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  bindAdminDOM() {
    if (this._adminBound) return;
    this._adminBound = true;

    // Save buttons
    const btnSave = document.getElementById('adminBtnSaveRecruit');
    const btnSaveTop = document.getElementById('adminBtnSaveRecruitTop');
    const btnResetRound = document.getElementById('adminBtnResetRound');

    if (btnSave) {
      btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveRoundFromForm();
      });
    }
    if (btnSaveTop) {
      btnSaveTop.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveRoundFromForm();
      });
    }
    if (btnResetRound) {
      btnResetRound.addEventListener('click', () => {
        this.resetCurrentRoundToDefault();
      });
    }

    // File Uploads: Preserve transparency with PNG (max 800x800)
    this.bindFileInput('formRecruitMonoFile', 'formRecruitMonoPreview', 800, 800);
    this.bindFileInput('formRecruitColorFile', 'formRecruitColorPreview', 800, 800);
    this.bindFileInput('formRecruitPopupFile', 'formRecruitPopupPreview', 800, 1050);

    // Wheel isolation
    const scrollContainers = [
      document.getElementById('adminRecruitList'),
      document.getElementById('adminRecruitEditorScroll'),
      document.getElementById('formRecruitShortDesc'),
      document.getElementById('formRecruitFullDesc'),
      document.getElementById('joinModalDesc')
    ];
    scrollContainers.forEach(el => {
      if (el && !el._hasWheelHandler) {
        el._hasWheelHandler = true;
        el.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
      }
    });
  }

  /* ==========================================================
     5. DOM BINDINGS & SHORTCUTS
     ========================================================== */
  bindDOM() {
    const modalCloseBtn = document.getElementById('joinModalCloseBtn');
    const modalBackdrop = document.getElementById('joinModalBackdrop');

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closeDetailModal());
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeDetailModal());
    }

    // Keyboard ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('joinDetailModal');
        if (modal && modal.classList.contains('is-open')) {
          this.closeDetailModal();
        }
      }
    });
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Global initialization & attachment to window
let recruitmentManagerInstance = null;
export function initRecruitmentManager() {
  if (!recruitmentManagerInstance) {
    recruitmentManagerInstance = new RecruitmentManager();
    window.RecruitmentManager = recruitmentManagerInstance;
  }
  return recruitmentManagerInstance;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRecruitmentManager);
} else {
  initRecruitmentManager();
}

export default RecruitmentManager;
