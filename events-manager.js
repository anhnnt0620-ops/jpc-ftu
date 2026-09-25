/**
 * JPC FTU — Events & CMS Manager Module
 * -------------------------------------------------------------
 * Features:
 * 1. Main Events Timeline with vertical timeframe and branch connectors
 * 2. Dynamic sorting (descending by date)
 * 3. Event Detail Modal with book/split transition, liquid background,
 *    4-pointed gradient glowing star, 1:1 thumbnail, and custom scrollbar
 * 4. Hidden Admin CMS (CRUD, file upload to base64, JSON export/import, PIN protection)
 */

const STORAGE_KEY = 'jpc_events_list_v2';
const ADMIN_PIN_KEY = 'jpc_admin_pin_v1';
const DEFAULT_PIN = 'jpc2026';

// 2 Default Seed Events matching UI Sự kiện.png & Màn hình nhỏ.png
const DEFAULT_EVENTS = [
  {
    id: 'evt-thoitra-2026',
    title: 'THỜI TRÀ 2026 — TRÀ KÍNH (茶鏡)',
    date: '2026-10-18',
    dateDisplay: '18/10/2026',
    timeframe: '10/2026',
    shortDesc: 'Không gian trải nghiệm Trà Đạo và Thư Pháp truyền thống Nhật Bản, nơi tĩnh tâm và thưởng thức tinh hoa văn hóa xứ Phù Tang.',
    coverUrl: 'Image/event-thoitra-cover.png',
    thumbUrl: 'Image/event-thoitra-thumb.png',
    fullDesc: `"Thời Trà 2026 — Trà Kính (茶鏡)" là chuỗi workshop trải nghiệm văn hóa truyền thống chuyên sâu do Ban Chuyên môn JPC FTU dày công chuẩn bị.

Lấy cảm hứng từ triết lý "Nhất kỳ nhất hội" (一期一会 - Ichi-go ichi-e) của Trà Đạo Nhật Bản, sự kiện mang đến một không gian thanh tịnh, tách biệt khỏi nhịp sống vội vã thường nhật, đưa người tham gia bước vào thế giới thiền định qua từng chén trà Matcha thơm nồng và nghệ thuật viết Thư pháp (Shodou).

Các hoạt động chính tại workshop:
• Thưởng thức & Tìm hiểu Trà Đạo (Sadou): Được hướng dẫn trực tiếp quy trình pha trà, ý nghĩa của từng cử chỉ, cách thưởng thức bánh ngọt Wagashi truyền thống kết hợp trà xanh nguyên bản.
• Trải nghiệm Thư Pháp (Shodou): Tự tay cầm bút lông, mài mực và viết lên những ước nguyện bằng chữ Hán (Kanji) trên giấy Washi thượng hạng mang về làm kỷ niệm.
• Trưng bày trang phục Kimono & cổ vật: Cơ hội thử mặc Yukata/Kimono truyền thống và chụp hình lưu niệm trong không gian bài trí theo phong cách Washitsu cổ điển.

"Trà Kính" — soi chiếu tâm hồn qua làn nước trà thanh khiết, tìm lại sự an yên và niềm rung cảm trước cái đẹp giản dị của văn hóa Nhật Bản.`
  },
  {
    id: 'evt-quyet-chien-nb',
    title: '和の決戦 — QUYẾT CHIẾN NHẬT BẢN',
    date: '2026-04-04',
    dateDisplay: '15/02 – 04/04/2026',
    timeframe: '04/2026',
    shortDesc: 'Cuộc thi tìm hiểu văn hóa Nhật Bản thường niên của JPC, trải qua ba vòng: Sơ loại, Bán kết và Chung kết.',
    coverUrl: 'Image/event-feature.png',
    thumbUrl: 'Image/event-feature.png',
    fullDesc: `"和の決戦 — QUYẾT CHIẾN NHẬT BẢN" là sự kiện học thuật và văn hóa thường niên tiêu biểu nhất của CLB Tiếng Nhật Trường Đại học Ngoại Thương (JPC FTU).

Trải qua hơn một thập kỷ rực rỡ, Quyết Chiến Nhật Bản không chỉ là một đấu trường tri thức gay cấn, mà còn là ngày hội giao lưu văn hóa quy mô lớn dành cho tất cả các bạn học sinh, sinh viên yêu mến ngôn ngữ và đất nước mặt trời mọc trên khắp địa bàn Hà Nội.

Cuộc thi được tổ chức bài bản qua 3 vòng thi đầy thử thách:
• Vòng 1 (Sơ loại - 15/02): Đánh giá kiến thức tổng quan về địa lý, lịch sử, văn hóa truyền thống và hiện đại của Nhật Bản qua bài thi trực tuyến.
• Vòng 2 (Bán kết - 07-21/03): Tranh tài phản xạ, thuyết trình nhóm và giải mã các câu đố văn hóa hóc búa để chọn ra các đội thi xuất sắc nhất.
• Vòng 3 (Đêm Chung kết - 04/04): Đêm hội bùng nổ của tài năng, bản lĩnh và niềm đam mê với sân khấu hoành tráng, sự góp mặt của các chuyên gia Nhật Bản cùng giải thưởng danh giá từ các nhà tài trợ lớn.

Tham gia "Quyết Chiến Nhật Bản", bạn không chỉ khẳng định năng lực tiếng Nhật mà còn kết nối với hàng nghìn bạn bè cùng chung lý tưởng!`
  }
];

class EventsManager {
  constructor() {
    this.events = [];
    this.activeEvent = null;
    this.isAdminAuthenticated = false;
    this.editingEventId = null;

    this.init();
  }

  init() {
    this.loadEvents();
    this.bindDOM();
    this.bindShortcuts();
    this.renderTimeline();
  }

  /* ==========================================================
     1. DATA STORAGE & SORTING LOGIC
     ========================================================== */
  loadEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.events = parsed;
          this.sortEvents();
          return;
        }
      }
    } catch (err) {
      console.warn('[EventsManager] Could not read localStorage:', err);
    }
    // Default fallback
    this.events = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
    this.sortEvents();
    this.saveEvents();
  }

  saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (err) {
      console.error('[EventsManager] Failed to save events:', err);
      alert('Không thể lưu dữ liệu (có thể do dung lượng ảnh tải lên quá lớn). Vui lòng nén bớt ảnh trước khi lưu!');
    }
  }

  /**
   * Sort events in descending order (Newest first, Oldest last)
   */
  sortEvents() {
    this.events.sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01').getTime();
      const dateB = new Date(b.date || '1970-01-01').getTime();
      return dateB - dateA;
    });
  }

  /* ==========================================================
     2. TIMELINE FRONTEND RENDERING
     ========================================================== */
  renderTimeline() {
    const container = document.getElementById('eventsTimelineContainer');
    if (!container) return;

    if (this.events.length === 0) {
      container.innerHTML = `
        <div class="events-timeline__empty">
          <p>Hiện chưa có sự kiện nào được công bố.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="events-timeline">
        <!-- Vertical Timeframe Axis on Left -->
        <div class="events-timeline__axis" aria-hidden="true">
          <div class="events-timeline__axis-line"></div>
        </div>

        <!-- Events List -->
        <div class="events-timeline__items">
    `;

    this.events.forEach((evt) => {
      const dateFormatted = evt.dateDisplay || evt.date || '';
      const timeframeBadge = evt.timeframe || (evt.date ? evt.date.substring(0, 7) : '');

      html += `
        <div class="events-timeline__row" data-event-id="${evt.id}">
          <!-- Branch connector from vertical axis to card -->
          <div class="events-timeline__marker-box" aria-hidden="true">
            <div class="events-timeline__node">
              <span class="events-timeline__node-glow"></span>
              <span class="events-timeline__node-dot"></span>
            </div>
            <div class="events-timeline__branch"></div>
            ${timeframeBadge ? `<span class="events-timeline__badge">${timeframeBadge}</span>` : ''}
          </div>

          <!-- Main Event Card matching UI Sự kiện.png -->
          <article class="events-timeline__card" data-action="open-detail" data-event-id="${evt.id}" tabindex="0" role="button" aria-label="Xem chi tiết sự kiện ${this.escapeHTML(evt.title)}">
            <!-- Cover Image Banner (Full viền theo tỉ lệ chuẩn event-feature.png) -->
            <div class="events-card__cover-wrap">
              <img src="${this.escapeHTML(evt.coverUrl)}" alt="${this.escapeHTML(evt.title)}" class="events-card__cover" loading="lazy">
            </div>

            <!-- Card Content -->
            <div class="events-card__body">
              <div class="events-card__meta">
                <span class="events-card__date-chip">
                  <svg class="events-card__calendar-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  ${this.escapeHTML(dateFormatted)}
                </span>
              </div>
              <h3 class="events-card__title">${this.escapeHTML(evt.title)}</h3>
              <p class="events-card__desc">${this.escapeHTML(evt.shortDesc)}</p>

              <!-- Requested Call-to-Action -->
              <div class="events-card__cta-row">
                <span class="events-card__cta-text">
                  <span>Nhấn vào để xem chi tiết sự kiện</span>
                  <svg class="events-card__cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
              </div>
            </div>
          </article>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach click and keyboard events
    const cards = container.querySelectorAll('.events-timeline__card');
    cards.forEach((card) => {
      const openHandler = () => {
        const id = card.getAttribute('data-event-id');
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

  /* ==========================================================
     3. EVENT DETAIL MODAL CONTROLLER
     ========================================================== */
  openDetailModal(eventId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return;

    this.activeEvent = evt;

    const modal = document.getElementById('eventDetailModal');
    if (!modal) return;

    // Populate data
    const thumbEl = document.getElementById('eventModalThumb');
    const titleEl = document.getElementById('eventModalTitle');
    const dateEl = document.getElementById('eventModalDate');
    const descEl = document.getElementById('eventModalDesc');

    if (thumbEl) {
      thumbEl.src = evt.thumbUrl || evt.coverUrl || 'Image/event-feature.png';
      thumbEl.alt = evt.title;
    }
    if (titleEl) titleEl.textContent = evt.title;
    if (dateEl) dateEl.textContent = evt.dateDisplay || evt.date || '';
    if (descEl) {
      const paragraphs = (evt.fullDesc || evt.shortDesc || '')
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

    // Refresh & reset description scroll position to top once modal is visible in the DOM
    const resetScroll = () => {
      if (descEl) descEl.scrollTop = 0;
    };
    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
      requestAnimationFrame(resetScroll);
    });
    setTimeout(resetScroll, 60);

    // Accessibility focus
    const closeBtn = document.getElementById('eventModalCloseBtn');
    if (closeBtn) closeBtn.focus();
  }

  closeDetailModal() {
    const modal = document.getElementById('eventDetailModal');
    if (!modal || !modal.classList.contains('is-open') || modal.classList.contains('is-closing')) return;

    // Pre-reset scroll before close animation completes
    const descEl = document.getElementById('eventModalDesc');
    if (descEl) descEl.scrollTop = 0;

    modal.classList.add('is-closing');
    setTimeout(() => {
      modal.classList.remove('is-open', 'is-closing');
      if (descEl) descEl.scrollTop = 0;
      this.checkAndRestoreScroll();
    }, 350);
  }

  checkAndRestoreScroll() {
    const detailModal = document.getElementById('eventDetailModal');
    const joinModal = document.getElementById('joinDetailModal');
    const loginModal = document.getElementById('adminLoginModal');
    const adminPortal = document.getElementById('adminPortal');

    const isDetailOpen = detailModal && detailModal.classList.contains('is-open');
    const isJoinOpen = joinModal && joinModal.classList.contains('is-open');
    const isLoginOpen = loginModal && loginModal.classList.contains('is-open');
    const isPortalOpen = adminPortal && !adminPortal.hidden;

    if (!isDetailOpen && !isJoinOpen && !isLoginOpen && !isPortalOpen) {
      document.body.classList.remove('modal-scroll-lock');
      window.lenis?.start();
      // Resume 3D background rendering once UI modal is fully dismissed
      window.JPC3D?.resume?.();
    }
  }

  /* ==========================================================
     4. HIDDEN ADMIN CMS CONTROLLER (DEDICATED STUDIO UI)
     ========================================================== */
  triggerAdmin() {
    if (this.isAdminAuthenticated) {
      this.openAdminPortal();
    } else {
      this.openAdminLoginModal();
    }
  }

  openAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (!modal) return;

    window.lenis?.stop();
    document.body.classList.add('modal-scroll-lock');
    window.JPC3D?.pause?.();

    modal.classList.remove('is-closing');
    modal.classList.add('is-open');

    const pinInput = document.getElementById('adminPinInput');
    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 100);
    }
  }

  closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (!modal) return;

    modal.classList.add('is-closing');
    setTimeout(() => {
      modal.classList.remove('is-open', 'is-closing');
      this.checkAndRestoreScroll();
    }, 250);
  }

  authenticateAdmin(pin) {
    const savedPin = localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_PIN;
    if (pin === savedPin || pin === DEFAULT_PIN) {
      this.isAdminAuthenticated = true;
      this.closeAdminLoginModal();
      this.openAdminPortal();
      return true;
    } else {
      alert('Mã PIN không chính xác! Vui lòng thử lại.');
      const pinInput = document.getElementById('adminPinInput');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
      return false;
    }
  }

  openAdminPortal() {
    const portal = document.getElementById('adminPortal');
    if (!portal) return;

    window.lenis?.stop();
    document.body.classList.add('modal-scroll-lock');
    window.JPC3D?.pause?.();

    portal.hidden = false;

    // Render list and select active event
    this.renderAdminList();
    if (this.editingEventId) {
      this.selectEventForEdit(this.editingEventId);
    } else if (this.events.length > 0) {
      this.selectEventForEdit(this.events[0].id);
    } else {
      this.openCreateEventForm();
    }

    this.isolateWheels();
  }

  closeAdminPortal(shouldScrollToEvents = false) {
    const portal = document.getElementById('adminPortal');
    if (!portal) return;

    portal.hidden = true;

    // Clean up hash if #admin
    if (window.location.hash === '#admin') {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (_) {}
    }

    this.checkAndRestoreScroll();

    if (shouldScrollToEvents) {
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo('#events', { offset: -60, duration: 1 });
        } else {
          document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    }
  }

  renderAdminList() {
    const listEl = document.getElementById('adminEventList');
    const countEl = document.getElementById('adminEventCount');
    if (countEl) {
      countEl.textContent = `${this.events.length} sự kiện`;
    }
    if (!listEl) return;

    if (this.events.length === 0) {
      listEl.innerHTML = '<p class="admin-empty-text" style="text-align:center; padding: 2.5rem 1rem; color: rgba(244,236,216,0.6);">Chưa có sự kiện nào. Bấm nút "+ Thêm Sự Kiện Mới" ở trên để tạo!</p>';
      return;
    }

    let html = '';
    this.events.forEach((evt) => {
      const isActive = this.editingEventId === evt.id;
      html += `
        <article class="admin-card-item ${isActive ? 'is-active' : ''}" data-id="${evt.id}">
          <div class="admin-card-item__thumb">
            <img src="${this.escapeHTML(evt.thumbUrl || evt.coverUrl)}" alt="thumb">
          </div>
          <div class="admin-card-item__info">
            <h4 class="admin-card-item__title" title="${this.escapeHTML(evt.title)}">${this.escapeHTML(evt.title)}</h4>
            <div class="admin-card-item__meta">
              <span>📅 ${this.escapeHTML(evt.dateDisplay || evt.date)}</span>
              ${evt.timeframe ? `<span>🏷️ ${this.escapeHTML(evt.timeframe)}</span>` : ''}
            </div>
            <p class="admin-card-item__desc">${this.escapeHTML(evt.shortDesc)}</p>
            <div class="admin-card-item__actions">
              <button type="button" class="admin-card-btn admin-card-btn--edit" data-action="edit" data-id="${evt.id}">
                ✏️ Sửa
              </button>
              <button type="button" class="admin-card-btn admin-card-btn--delete" data-action="delete" data-id="${evt.id}">
                🗑️ Xóa
              </button>
            </div>
          </div>
        </article>
      `;
    });

    listEl.innerHTML = html;

    // Attach listeners
    listEl.querySelectorAll('.admin-card-item').forEach((item) => {
      const id = item.getAttribute('data-id');
      item.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="delete"]')) return;
        this.selectEventForEdit(id);
      });
    });

    listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.deleteEvent(id);
      });
    });
  }

  selectEventForEdit(id) {
    const evt = this.events.find(e => e.id === id);
    if (!evt) return;

    this.editingEventId = id;

    // Update list UI active highlight
    const listEl = document.getElementById('adminEventList');
    if (listEl) {
      listEl.querySelectorAll('.admin-card-item').forEach(item => {
        item.classList.toggle('is-active', item.getAttribute('data-id') === id);
      });
    }

    // Update Editor Header
    const formTitle = document.getElementById('adminFormTitle');
    const editorTag = document.getElementById('adminEditorTag');
    const deleteBtn = document.getElementById('adminBtnDeleteEvent');

    if (formTitle) formTitle.textContent = `Chỉnh Sửa: ${evt.title}`;
    if (editorTag) editorTag.textContent = 'Chế độ chỉnh sửa';
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';

    // Populate Fields
    document.getElementById('formEventTitle').value = evt.title || '';
    document.getElementById('formEventDate').value = evt.date || '';
    document.getElementById('formEventDateDisplay').value = evt.dateDisplay || '';
    document.getElementById('formEventTimeframe').value = evt.timeframe || '';
    document.getElementById('formEventShortDesc').value = evt.shortDesc || '';
    document.getElementById('formEventFullDesc').value = evt.fullDesc || '';

    // Set preview images
    this.setPreviewImage('formCoverPreview', evt.coverUrl);
    this.setPreviewImage('formThumbPreview', evt.thumbUrl);

    // Scroll editor to top
    const editorScroll = document.querySelector('.admin-portal__editor-scroll');
    if (editorScroll) editorScroll.scrollTop = 0;
  }

  openCreateEventForm() {
    this.editingEventId = null;

    // Clear active state in list
    const listEl = document.getElementById('adminEventList');
    if (listEl) {
      listEl.querySelectorAll('.admin-card-item').forEach(item => item.classList.remove('is-active'));
    }

    // Update Editor Header
    const formTitle = document.getElementById('adminFormTitle');
    const editorTag = document.getElementById('adminEditorTag');
    const deleteBtn = document.getElementById('adminBtnDeleteEvent');

    if (formTitle) formTitle.textContent = 'Thêm Sự Kiện Mới';
    if (editorTag) editorTag.textContent = 'Tạo sự kiện mới';
    if (deleteBtn) deleteBtn.style.display = 'none';

    this.resetAdminForm();

    const titleInput = document.getElementById('formEventTitle');
    if (titleInput) titleInput.focus();

    // Scroll editor to top
    const editorScroll = document.querySelector('.admin-portal__editor-scroll');
    if (editorScroll) editorScroll.scrollTop = 0;
  }

  resetAdminForm() {
    const form = document.getElementById('adminEventForm');
    if (form) form.reset();

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('formEventDate');
    if (dateInput) dateInput.value = today;

    this.setPreviewImage('formCoverPreview', null);
    this.setPreviewImage('formThumbPreview', null);
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

  saveEventFromForm() {
    const title = document.getElementById('formEventTitle').value.trim();
    const date = document.getElementById('formEventDate').value.trim();
    const dateDisplay = document.getElementById('formEventDateDisplay').value.trim() || this.formatDateDisplay(date);
    const timeframe = document.getElementById('formEventTimeframe').value.trim() || (date ? date.substring(0, 7) : '');
    const shortDesc = document.getElementById('formEventShortDesc').value.trim();
    const fullDesc = document.getElementById('formEventFullDesc').value.trim();

    if (!title) {
      alert('Vui lòng nhập Tên sự kiện!');
      document.getElementById('formEventTitle')?.focus();
      return;
    }
    if (!date) {
      alert('Vui lòng chọn Ngày tổ chức để hệ thống tự động sắp xếp!');
      document.getElementById('formEventDate')?.focus();
      return;
    }
    if (!shortDesc) {
      alert('Vui lòng nhập Mô tả ngắn hiển thị ở trang chính!');
      document.getElementById('formEventShortDesc')?.focus();
      return;
    }
    if (!fullDesc) {
      alert('Vui lòng nhập Thông tin chi tiết sự kiện!');
      document.getElementById('formEventFullDesc')?.focus();
      return;
    }

    // Read preview sources (either newly uploaded base64 or retained URLs)
    const coverImg = document.getElementById('formCoverPreview')?.querySelector('img')?.src;
    const thumbImg = document.getElementById('formThumbPreview')?.querySelector('img')?.src;

    if (!coverImg) {
      alert('Vui lòng tải lên Ảnh Cover / Banner cho sự kiện!');
      return;
    }
    if (!thumbImg) {
      alert('Vui lòng tải lên Ảnh Thumbnail vuông (1:1) cho Modal sự kiện!');
      return;
    }

    let savedId = this.editingEventId;
    if (this.editingEventId) {
      // Edit existing
      const idx = this.events.findIndex(e => e.id === this.editingEventId);
      if (idx !== -1) {
        this.events[idx] = {
          ...this.events[idx],
          title,
          date,
          dateDisplay,
          timeframe,
          shortDesc,
          fullDesc,
          coverUrl: coverImg,
          thumbUrl: thumbImg
        };
      }
    } else {
      // Create new
      savedId = 'evt-' + Date.now();
      const newEvent = {
        id: savedId,
        title,
        date,
        dateDisplay,
        timeframe,
        shortDesc,
        fullDesc,
        coverUrl: coverImg,
        thumbUrl: thumbImg
      };
      this.events.unshift(newEvent);
    }

    this.sortEvents();
    this.saveEvents();
    this.renderTimeline();
    this.renderAdminList();
    this.selectEventForEdit(savedId);

    // Visual feedback
    alert(`Đã lưu thành công sự kiện "${title}"! Dữ liệu trên trang chính đã được cập nhật ngay lập tức.`);
  }

  deleteEvent(id) {
    const evt = this.events.find(e => e.id === id);
    if (!evt) return;

    if (confirm(`Bạn có chắc chắn muốn xóa sự kiện "${evt.title}" không?`)) {
      this.events = this.events.filter(e => e.id !== id);
      this.saveEvents();
      this.renderTimeline();
      this.renderAdminList();

      if (this.editingEventId === id) {
        if (this.events.length > 0) {
          this.selectEventForEdit(this.events[0].id);
        } else {
          this.openCreateEventForm();
        }
      }
    }
  }

  resetToDefaults() {
    if (confirm('Khôi phục toàn bộ danh sách sự kiện về 2 sự kiện mẫu ban đầu? (Bạn có thể khôi phục các vòng tuyển Gen tại tab Tuyển Thành Viên)')) {
      this.events = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
      this.sortEvents();
      this.saveEvents();
      this.renderTimeline();
      this.renderAdminList();
      if (this.events.length > 0) {
        this.selectEventForEdit(this.events[0].id);
      }
      alert('Đã khôi phục dữ liệu sự kiện mặc định thành công!');
    }
  }

  exportJSON() {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      events: this.events,
      recruitmentRounds: window.RecruitmentManager ? window.RecruitmentManager.rounds : []
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jpc_cms_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let importedCount = 0;

        // 1. Check for recruitment rounds
        if (parsed.recruitmentRounds && Array.isArray(parsed.recruitmentRounds)) {
          if (window.RecruitmentManager) {
            window.RecruitmentManager.rounds = parsed.recruitmentRounds;
            window.RecruitmentManager.saveRounds();
            window.RecruitmentManager.renderUI();
            window.RecruitmentManager.renderAdminRoundsList();
            importedCount++;
          }
        }

        // 2. Check for events
        const eventsArray = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.events) ? parsed.events : null);
        if (eventsArray && eventsArray.length > 0) {
          this.events = eventsArray;
          this.sortEvents();
          this.saveEvents();
          this.renderTimeline();
          this.renderAdminList();
          if (this.events.length > 0) {
            this.selectEventForEdit(this.events[0].id);
          }
          importedCount++;
        }

        if (importedCount > 0) {
          alert('Nhập dữ liệu JSON CMS thành công!');
        } else {
          alert('File JSON không hợp lệ hoặc không chứa dữ liệu sự kiện / tuyển thành viên!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Isolate mouse wheel on scroll containers so rolling wheel inside sidebar, editor, or textarea scrolls ONLY that specific container!
   */
  isolateWheels() {
    const scrollContainers = [
      document.getElementById('eventModalDesc'),
      document.getElementById('adminEventList'),
      document.querySelector('.admin-portal__editor-scroll'),
      document.getElementById('formEventShortDesc'),
      document.getElementById('formEventFullDesc'),
      document.getElementById('adminRecruitList'),
      document.getElementById('adminRecruitEditorScroll'),
      document.getElementById('joinModalDesc')
    ];
    scrollContainers.forEach(el => {
      if (el && !el._hasWheelHandler) {
        el._hasWheelHandler = true;
        el.addEventListener('wheel', (e) => {
          e.stopPropagation();
        }, { passive: true });
      }
    });
  }

  /* ==========================================================
     5. DOM BINDINGS & EVENT LISTENERS
     ========================================================== */
  bindDOM() {
    // 1. Event Detail Modal close triggers
    const modalCloseBtn = document.getElementById('eventModalCloseBtn');
    const modalBackdrop = document.getElementById('eventModalBackdrop');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closeDetailModal());
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeDetailModal());
    }

    // 2. Admin Login Modal triggers
    const loginCloseBtn = document.getElementById('adminLoginCloseBtn');
    const loginBackdrop = document.getElementById('adminLoginBackdrop');
    if (loginCloseBtn) {
      loginCloseBtn.addEventListener('click', () => this.closeAdminLoginModal());
    }
    if (loginBackdrop) {
      loginBackdrop.addEventListener('click', () => this.closeAdminLoginModal());
    }

    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('adminPinInput')?.value.trim();
        this.authenticateAdmin(pin);
      });
    }

    // 3. Admin Studio Portal Navigation & Tool Buttons
    const btnAddNew = document.getElementById('adminBtnAddNew');
    const btnCancelForm = document.getElementById('adminBtnCancelForm');
    const btnCancelForm2 = document.getElementById('adminBtnCancelForm2');
    const btnSaveEvent = document.getElementById('adminBtnSaveEvent');
    const btnSaveEventTop = document.getElementById('adminBtnSaveEventTop');
    const btnDeleteEvent = document.getElementById('adminBtnDeleteEvent');
    const btnResetDefaults = document.getElementById('adminBtnResetDefaults');
    const btnExportJSON = document.getElementById('adminBtnExportJSON');
    const btnImportJSON = document.getElementById('adminBtnImportJSON');
    const inputImportFile = document.getElementById('adminInputImportFile');
    const btnViewSite = document.getElementById('adminBtnViewSite');
    const btnLogout = document.getElementById('adminBtnLogout');

    // Tab Switchers: Events vs Recruitment
    const tabEvents = document.getElementById('adminTabEvents');
    const tabRecruitment = document.getElementById('adminTabRecruitment');
    const paneEvents = document.getElementById('adminTabPaneEvents');
    const paneRecruitment = document.getElementById('adminTabPaneRecruitment');

    if (tabEvents && tabRecruitment && paneEvents && paneRecruitment) {
      tabEvents.addEventListener('click', () => {
        tabEvents.classList.add('is-active');
        tabRecruitment.classList.remove('is-active');
        paneEvents.classList.add('is-active');
        paneRecruitment.classList.remove('is-active');
        paneEvents.style.display = '';
        paneRecruitment.style.display = 'none';
      });

      tabRecruitment.addEventListener('click', () => {
        tabRecruitment.classList.add('is-active');
        tabEvents.classList.remove('is-active');
        paneRecruitment.classList.add('is-active');
        paneEvents.classList.remove('is-active');
        paneEvents.style.display = 'none';
        paneRecruitment.style.display = '';
        window.RecruitmentManager?.setupAdminUI?.();
      });
    }

    if (btnAddNew) {
      btnAddNew.addEventListener('click', () => this.openCreateEventForm());
    }
    if (btnCancelForm) {
      btnCancelForm.addEventListener('click', () => this.openCreateEventForm());
    }
    if (btnCancelForm2) {
      btnCancelForm2.addEventListener('click', () => this.openCreateEventForm());
    }
    if (btnSaveEvent) {
      btnSaveEvent.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveEventFromForm();
      });
    }
    if (btnSaveEventTop) {
      btnSaveEventTop.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveEventFromForm();
      });
    }
    if (btnDeleteEvent) {
      btnDeleteEvent.addEventListener('click', () => {
        if (this.editingEventId) this.deleteEvent(this.editingEventId);
      });
    }
    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', () => this.resetToDefaults());
    }
    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', () => this.exportJSON());
    }
    if (btnImportJSON && inputImportFile) {
      btnImportJSON.addEventListener('click', () => inputImportFile.click());
      inputImportFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.importJSON(e.target.files[0]);
          e.target.value = '';
        }
      });
    }
    if (btnViewSite) {
      btnViewSite.addEventListener('click', () => this.closeAdminPortal(true));
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        this.isAdminAuthenticated = false;
        this.closeAdminPortal(false);
      });
    }

    // 4. File input readers with compression & Base64 conversion
    this.bindFileInput('formCoverFile', 'formCoverPreview', 1411, 551);
    this.bindFileInput('formThumbFile', 'formThumbPreview', 600, 600);

    // 5. Footer secret lock icon trigger
    const secretLock = document.getElementById('adminSecretLock');
    if (secretLock) {
      secretLock.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerAdmin();
      });
    }

    this.isolateWheels();
  }

  /**
   * Reads image from user's computer, resizes if needed, and sets preview
   */
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

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          this.setPreviewImage(previewId, compressedDataUrl);
        };
        img.src = readEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Keyboard shortcuts & Hash routing
   */
  bindShortcuts() {
    // 1. ESC key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const detailModal = document.getElementById('eventDetailModal');
        const joinModal = document.getElementById('joinDetailModal');
        const loginModal = document.getElementById('adminLoginModal');
        const adminPortal = document.getElementById('adminPortal');

        if (detailModal && detailModal.classList.contains('is-open')) {
          this.closeDetailModal();
        } else if (joinModal && joinModal.classList.contains('is-open')) {
          window.RecruitmentManager?.closeDetailModal?.();
        } else if (loginModal && loginModal.classList.contains('is-open')) {
          this.closeAdminLoginModal();
        } else if (adminPortal && !adminPortal.hidden) {
          this.closeAdminPortal(false);
        }
      }

      // 2. Secret shortcut: Ctrl + Shift + A opens Admin CMS
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        this.triggerAdmin();
      }

      // 3. Ctrl + S in Admin saves active form (Event or Recruitment)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        const adminPortal = document.getElementById('adminPortal');
        if (adminPortal && !adminPortal.hidden) {
          e.preventDefault();
          const paneRecruit = document.getElementById('adminTabPaneRecruitment');
          if (paneRecruit && paneRecruit.classList.contains('is-active')) {
            window.RecruitmentManager?.saveRoundFromForm?.();
          } else {
            this.saveEventFromForm();
          }
        }
      }
    });

    // 4. Hash routing check on load and hashchange (#admin)
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        this.triggerAdmin();
      }
    };
    window.addEventListener('hashchange', checkHash);
    checkHash();
  }

  formatDateDisplay(isoDate) {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (_) {}
    return isoDate;
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
let eventsManagerInstance = null;
function initEventsManager() {
  if (!eventsManagerInstance) {
    eventsManagerInstance = new EventsManager();
    window.EventsManager = eventsManagerInstance;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEventsManager);
} else {
  initEventsManager();
}

export default EventsManager;
