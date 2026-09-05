// Zero-G Notes: Matter.js Physics Engine & Renderer Controller
(function () {
  'use strict';

  // --- 1. DOM Elements & State ---
  const bodyEl = document.body;
  const viewportEl = document.getElementById('viewport');
  const hudContainer = document.getElementById('hud-container');
  const hudEl = document.getElementById('hud');
  const hudHandle = document.getElementById('hud-drag-handle');
  const notesContainer = document.getElementById('notes-container');
  const btnAddNote = document.getElementById('btn-add-note');
  const btnToolEraser = document.getElementById('btn-tool-eraser');
  const btnOpenVault = document.getElementById('btn-open-vault');
  const vaultCountBadge = document.getElementById('vault-count-badge');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const themeIndicatorIcon = document.getElementById('theme-indicator-icon');
  const themeIndicatorLabel = document.getElementById('theme-indicator-label');
  const btnZeroGImpulse = document.getElementById('btn-zero-g-impulse');
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsPanel = document.getElementById('settings-panel');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const vaultDrawer = document.getElementById('vault-drawer');
  const btnCloseVault = document.getElementById('btn-close-vault');
  const vaultList = document.getElementById('vault-list');
  const vaultEmpty = document.getElementById('vault-empty');
  const vaultMetaCount = document.getElementById('vault-meta-count');
  const syncStatusIndicator = document.getElementById('sync-status-indicator');
  const syncStatusText = document.getElementById('sync-status-text');
  const toggleGravity = document.getElementById('toggle-gravity');
  const sliderOpacity = document.getElementById('slider-opacity');
  const valOpacity = document.getElementById('val-opacity');
  const sliderSize = document.getElementById('slider-size');
  const valSize = document.getElementById('val-size');
  const btnMinimize = document.getElementById('btn-minimize');
  const btnClose = document.getElementById('btn-close');

  let currentTheme = 'cute'; // 'cute' | 'space'
  let gravityEnabled = false;
  let noteOpacity = 0.94;
  let currentScale = 1.0;
  let eraserModeActive = false;
  let noteSequenceCounter = 1;

  const notes = new Map(); // id -> { id, body, element, title, text, colorIndex, isEditing, isDragging, width, height, createdAt }

  const COLOR_PALETTES = {
    cute: ['color-pink', 'color-mint', 'color-lavender', 'color-cream', 'color-sky'],
    space: ['color-pink', 'color-mint', 'color-lavender', 'color-cream', 'color-sky']
  };

  const BASE_WIDTH = 250;
  const BASE_HEIGHT = 165;

  // --- 2. Matter.js Zero-G Engine Setup ---
  const { Engine, World, Bodies, Body, Composite } = Matter;
  const engine = Engine.create();
  // Default zero-G (disabled gravity)
  engine.gravity.x = 0;
  engine.gravity.y = 0;
  engine.gravity.scale = 0;

  // --- 3. Viewport Boundaries (Static invisible colliders) ---
  let walls = [];
  const WALL_THICKNESS = 200;

  function setupBoundaries() {
    walls.forEach(w => Composite.remove(engine.world, w));
    walls = [];

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Top, Bottom, Left, Right
    const topWall = Bodies.rectangle(w / 2, -WALL_THICKNESS / 2, w * 3, WALL_THICKNESS, {
      isStatic: true,
      restitution: 0.96,
      friction: 0.1
    });
    const bottomWall = Bodies.rectangle(w / 2, h + WALL_THICKNESS / 2, w * 3, WALL_THICKNESS, {
      isStatic: true,
      restitution: 0.6,
      friction: 0.8
    });
    const leftWall = Bodies.rectangle(-WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 3, {
      isStatic: true,
      restitution: 0.96,
      friction: 0.1
    });
    const rightWall = Bodies.rectangle(w + WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 3, {
      isStatic: true,
      restitution: 0.96,
      friction: 0.1
    });

    walls = [topWall, bottomWall, leftWall, rightWall];
    Composite.add(engine.world, walls);
  }

  window.addEventListener('resize', () => {
    setupBoundaries();
  });
  setupBoundaries();

  // --- 4. Dynamic Click-Through Hit Testing ---
  let isHoveringInteractive = false;

  function checkInteractiveTarget(target) {
    if (!target) return false;
    return !!target.closest('#hud-container, #hud, #settings-panel, #vault-drawer, .note-card, button, input, textarea, label, .custom-slider, .toggle-switch');
  }

  window.addEventListener('mousemove', (e) => {
    const isInteractive = checkInteractiveTarget(e.target);
    if (isInteractive !== isHoveringInteractive) {
      isHoveringInteractive = isInteractive;
      if (window.electronAPI) {
        window.electronAPI.setIgnoreMouseEvents(!isHoveringInteractive, { forward: true });
      }
    }
  });

  // Ensure initial mouseout or window leave resets click-through
  window.addEventListener('mouseleave', () => {
    isHoveringInteractive = false;
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  // --- 5. Theme Controller ---
  function setTheme(theme) {
    currentTheme = theme;
    if (theme === 'space') {
      bodyEl.classList.remove('theme-cute');
      bodyEl.classList.add('theme-space');
      themeIndicatorIcon.textContent = '🌌';
      themeIndicatorLabel.textContent = 'Space';
    } else {
      bodyEl.classList.remove('theme-space');
      bodyEl.classList.add('theme-cute');
      themeIndicatorIcon.textContent = '🌸';
      themeIndicatorLabel.textContent = 'Cute';
    }
    triggerSave();
  }

  function toggleTheme() {
    setTheme(currentTheme === 'cute' ? 'space' : 'cute');
  }

  btnToggleTheme.addEventListener('click', toggleTheme);

  if (window.electronAPI && window.electronAPI.onToggleThemeShortcut) {
    window.electronAPI.onToggleThemeShortcut(() => {
      toggleTheme();
    });
  }

  // --- 6. Eraser Tool (Delete Mode) ---
  function setEraserMode(active) {
    eraserModeActive = active;
    btnToolEraser.classList.toggle('active', eraserModeActive);
    bodyEl.classList.toggle('eraser-mode-active', eraserModeActive);
  }

  btnToolEraser.addEventListener('click', () => {
    setEraserMode(!eraserModeActive);
  });

  // --- 7. Settings Panel Controls ---
  btnToggleSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    vaultDrawer.classList.add('collapsed');
    settingsPanel.classList.toggle('collapsed');
  });

  btnCloseSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.add('collapsed');
  });

  // Gravity Mechanics
  function setGravity(enabled) {
    gravityEnabled = !!enabled;
    toggleGravity.checked = gravityEnabled;

    if (gravityEnabled) {
      engine.gravity.y = 1.0;
      engine.gravity.scale = 0.001;
      notes.forEach(note => {
        Matter.Sleeping.set(note.body, false);
      });
    } else {
      engine.gravity.y = 0;
      engine.gravity.scale = 0;
      notes.forEach(note => {
        const releaseVy = -1.0 - Math.random() * 2.0;
        const releaseVx = (Math.random() - 0.5) * 1.5;
        Body.setVelocity(note.body, { x: releaseVx, y: releaseVy });
        Body.setAngularVelocity(note.body, (Math.random() - 0.5) * 0.02);
      });
    }
    triggerSave();
  }

  toggleGravity.addEventListener('change', (e) => {
    setGravity(e.target.checked);
  });

  // Opacity Slider (20% to 100%)
  function setNoteOpacity(val) {
    noteOpacity = Math.max(0.2, Math.min(1.0, val));
    const percent = Math.round(noteOpacity * 100);
    valOpacity.textContent = `${percent}%`;
    sliderOpacity.value = percent;
    document.documentElement.style.setProperty('--card-opacity', noteOpacity);
    triggerSave();
  }

  sliderOpacity.addEventListener('input', (e) => {
    setNoteOpacity(parseInt(e.target.value, 10) / 100);
  });

  // Note Size Adjustment (0.8x to 1.5x)
  function setNoteScale(newScale) {
    const targetScale = Math.max(0.8, Math.min(1.5, parseFloat(newScale)));
    const scaleRatio = targetScale / currentScale;
    currentScale = targetScale;

    valSize.textContent = `${currentScale.toFixed(2)}x`;
    sliderSize.value = currentScale;

    notes.forEach(note => {
      Matter.Body.scale(note.body, scaleRatio, scaleRatio);
      note.width = BASE_WIDTH * currentScale;
      note.height = BASE_HEIGHT * currentScale;
      note.element.style.width = `${note.width}px`;
      note.element.style.minHeight = `${note.height}px`;
    });

    triggerSave();
  }

  sliderSize.addEventListener('input', (e) => {
    setNoteScale(parseFloat(e.target.value));
  });

  // --- 8. Saved Notes Vault Drawer ---
  btnOpenVault.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.add('collapsed');
    vaultDrawer.classList.toggle('collapsed');
    renderVault();
  });

  btnCloseVault.addEventListener('click', (e) => {
    e.stopPropagation();
    vaultDrawer.classList.add('collapsed');
  });

  function renderVault() {
    const count = notes.size;
    vaultCountBadge.textContent = count;
    vaultMetaCount.textContent = `${count} Note${count === 1 ? '' : 's'} Floating`;

    if (count === 0) {
      vaultList.innerHTML = '';
      vaultEmpty.style.display = 'block';
      return;
    }

    vaultEmpty.style.display = 'none';
    vaultList.innerHTML = '';

    notes.forEach((note) => {
      const item = document.createElement('div');
      item.className = 'vault-item';
      item.title = 'Click to locate and focus note';

      const snippet = (note.text || '').trim().replace(/\n/g, ' ') || 'Empty note';

      item.innerHTML = `
        <div class="vault-item-info">
          <span class="vault-item-title">${escapeHtml(note.title)}</span>
          <span class="vault-item-snippet">${escapeHtml(snippet)}</span>
        </div>
        <button class="vault-item-delete" title="Delete note">🗑️</button>
      `;

      item.addEventListener('click', () => {
        highlightNote(note.id);
      });

      const delBtn = item.querySelector('.vault-item-delete');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(note.id);
      });

      vaultList.appendChild(item);
    });
  }

  function highlightNote(id) {
    const note = notes.get(id);
    if (!note || !note.element) return;

    note.element.classList.remove('highlight-pulse');
    // Force reflow
    void note.element.offsetWidth;
    note.element.classList.add('highlight-pulse');

    // Impart subtle attention-getting zero-g nudge
    Body.setVelocity(note.body, {
      x: (Math.random() - 0.5) * 1.2,
      y: -1.5
    });

    setTimeout(() => {
      if (note.element) note.element.classList.remove('highlight-pulse');
    }, 1300);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- 9. Note Management & Physics Entity Creation ---
  function getNextDefaultTitle() {
    let title = `Note ${noteSequenceCounter}`;
    noteSequenceCounter++;
    return title;
  }

  function createNote({ id, title, x, y, text = '', colorIndex = 0, vx, vy, angle = 0, createdAt } = {}) {
    const noteId = id || 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const noteTitle = title || getNextDefaultTitle();
    const spawnX = x !== undefined ? x : Math.max(160, Math.min(window.innerWidth - 160, window.innerWidth / 2 + (Math.random() - 0.5) * 400));
    const spawnY = y !== undefined ? y : Math.max(160, Math.min(window.innerHeight - 200, window.innerHeight / 2 + (Math.random() - 0.5) * 300));

    const noteW = BASE_WIDTH * currentScale;
    const noteH = BASE_HEIGHT * currentScale;

    // Create Matter.js physics body
    const body = Bodies.rectangle(spawnX, spawnY, noteW, noteH, {
      restitution: gravityEnabled ? 0.4 : 0.94,
      frictionAir: gravityEnabled ? 0.02 : 0.004,
      friction: 0.1,
      frictionStatic: 0.2,
      density: 0.001,
      angle: angle || (Math.random() - 0.5) * 0.1
    });

    // Random initial drift vector if not restored
    const initVx = vx !== undefined ? vx : (Math.random() - 0.5) * 1.5;
    const initVy = vy !== undefined ? vy : (Math.random() - 0.5) * 1.5;
    Body.setVelocity(body, { x: initVx, y: initVy });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.008);

    Composite.add(engine.world, body);

    // Create DOM element
    const cardEl = document.createElement('div');
    cardEl.className = `note-card ${COLOR_PALETTES[currentTheme][colorIndex % 5]}`;
    cardEl.id = noteId;
    cardEl.style.width = `${noteW}px`;
    cardEl.style.minHeight = `${noteH}px`;

    cardEl.innerHTML = `
      <div class="note-header">
        <div class="note-header-left">
          <div class="note-dot" title="Change accent color"></div>
          <input type="text" class="note-title-input" value="${escapeHtml(noteTitle)}" title="Click to rename note" spellcheck="false" />
        </div>
        <div class="note-actions">
          <button class="note-action-btn del-btn" title="Delete Note">✕</button>
        </div>
      </div>
      <div class="note-body">
        <textarea class="note-textarea" placeholder="Type a thought...">${text}</textarea>
      </div>
      <div class="telemetry-badge">
        <span class="telem-vel">V: 0.00</span>
        <span class="telem-rot">θ: 0.0°</span>
      </div>
    `;

    notesContainer.appendChild(cardEl);

    const noteObj = {
      id: noteId,
      body,
      element: cardEl,
      title: noteTitle,
      text: text,
      colorIndex: colorIndex || 0,
      width: noteW,
      height: noteH,
      createdAt: createdAt || Date.now(),
      isEditing: false,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      dragVelocity: { x: 0, y: 0 },
      lastPointerPos: { x: 0, y: 0 },
      lastPointerTime: 0
    };

    notes.set(noteId, noteObj);

    // --- Interactive Dragging & Tossing ---
    const headerEl = cardEl.querySelector('.note-header');
    const titleInput = cardEl.querySelector('.note-title-input');
    const textareaEl = cardEl.querySelector('.note-textarea');
    const dotEl = cardEl.querySelector('.note-dot');
    const delBtn = cardEl.querySelector('.del-btn');

    // Eraser Tool click-to-delete interception on card
    cardEl.addEventListener('click', (e) => {
      if (eraserModeActive) {
        e.stopPropagation();
        deleteNote(noteId);
      }
    });

    // Inline Title Editing
    titleInput.addEventListener('click', (e) => {
      if (eraserModeActive) return;
      e.stopPropagation();
    });

    titleInput.addEventListener('input', (e) => {
      noteObj.title = e.target.value;
      triggerSave();
    });

    titleInput.addEventListener('blur', (e) => {
      const trimmed = e.target.value.trim();
      if (!trimmed) {
        noteObj.title = `Note ${noteId.slice(-3)}`;
        titleInput.value = noteObj.title;
      } else {
        noteObj.title = trimmed;
      }
      triggerSave();
      renderVault();
    });

    // Drag handling via pointer
    headerEl.addEventListener('pointerdown', (e) => {
      if (eraserModeActive) return; // In eraser mode, header clicks delete rather than drag
      if (e.target === titleInput || e.target === dotEl || e.target === delBtn) return;
      e.preventDefault();
      noteObj.isDragging = true;
      cardEl.classList.add('is-dragging');

      noteObj.dragOffset = {
        x: body.position.x - e.clientX,
        y: body.position.y - e.clientY
      };
      noteObj.lastPointerPos = { x: e.clientX, y: e.clientY };
      noteObj.lastPointerTime = performance.now();
      noteObj.dragVelocity = { x: 0, y: 0 };

      Body.setAngularVelocity(body, 0);

      const onPointerMove = (moveEvt) => {
        if (!noteObj.isDragging) return;
        const now = performance.now();
        const dt = Math.max(1, now - noteObj.lastPointerTime);
        const currentTargetX = moveEvt.clientX + noteObj.dragOffset.x;
        const currentTargetY = moveEvt.clientY + noteObj.dragOffset.y;

        const vx = ((moveEvt.clientX - noteObj.lastPointerPos.x) / dt) * 16;
        const vy = ((moveEvt.clientY - noteObj.lastPointerPos.y) / dt) * 16;
        noteObj.dragVelocity = { x: vx, y: vy };

        noteObj.lastPointerPos = { x: moveEvt.clientX, y: moveEvt.clientY };
        noteObj.lastPointerTime = now;

        Body.setPosition(body, { x: currentTargetX, y: currentTargetY });
        Body.setVelocity(body, { x: 0, y: 0 });
      };

      const onPointerUp = () => {
        if (!noteObj.isDragging) return;
        noteObj.isDragging = false;
        cardEl.classList.remove('is-dragging');

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);

        const tossX = Math.max(-12, Math.min(12, noteObj.dragVelocity.x * 0.9));
        const tossY = Math.max(-12, Math.min(12, noteObj.dragVelocity.y * 0.9));
        Body.setVelocity(body, { x: tossX, y: tossY });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);

        triggerSave();
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });

    // Color cycle
    dotEl.addEventListener('click', (e) => {
      if (eraserModeActive) return;
      e.stopPropagation();
      noteObj.colorIndex = (noteObj.colorIndex + 1) % 5;
      const palette = COLOR_PALETTES[currentTheme];
      palette.forEach(c => cardEl.classList.remove(c));
      cardEl.classList.add(palette[noteObj.colorIndex]);
      triggerSave();
    });

    // Delete note button
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNote(noteId);
    });

    // Content editing
    textareaEl.addEventListener('focus', () => {
      if (eraserModeActive) return;
      noteObj.isEditing = true;
      Body.setVelocity(body, { x: body.velocity.x * 0.1, y: body.velocity.y * 0.1 });
      Body.setAngularVelocity(body, 0);
    });

    textareaEl.addEventListener('blur', () => {
      noteObj.isEditing = false;
      if (!gravityEnabled) {
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8
        });
      }
      triggerSave();
      renderVault();
    });

    textareaEl.addEventListener('input', (e) => {
      noteObj.text = e.target.value;
      triggerSave();
    });

    triggerSave();
    renderVault();
    return noteObj;
  }

  function deleteNote(id) {
    const noteObj = notes.get(id);
    if (!noteObj) return;

    Composite.remove(engine.world, noteObj.body);
    if (noteObj.element && noteObj.element.parentNode) {
      noteObj.element.parentNode.removeChild(noteObj.element);
    }
    notes.delete(id);
    triggerSave();
    renderVault();
  }

  // --- 10. Zero-G Cosmic Impulse ---
  function applyCosmicImpulse() {
    notes.forEach((note) => {
      const impulseAngle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 2.5;
      Body.setVelocity(note.body, {
        x: Math.cos(impulseAngle) * speed,
        y: Math.sin(impulseAngle) * speed
      });
      Body.setAngularVelocity(note.body, (Math.random() - 0.5) * 0.03);
    });
  }

  btnZeroGImpulse.addEventListener('click', applyCosmicImpulse);

  // --- 11. Add Note Button ---
  btnAddNote.addEventListener('click', () => {
    createNote();
  });

  // --- 12. Draggable Floating HUD ---
  let isHudDragging = false;
  let hudOffset = { x: 0, y: 0 };

  hudHandle.addEventListener('pointerdown', (e) => {
    isHudDragging = true;
    const rect = hudContainer.getBoundingClientRect();
    hudOffset.x = e.clientX - rect.left;
    hudOffset.y = e.clientY - rect.top;

    const onHudMove = (moveEvt) => {
      if (!isHudDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - rect.width - 10, moveEvt.clientX - hudOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, moveEvt.clientY - hudOffset.y));
      hudContainer.style.left = `${newX}px`;
      hudContainer.style.top = `${newY}px`;
      hudContainer.style.transform = 'none';
    };

    const onHudUp = () => {
      isHudDragging = false;
      window.removeEventListener('pointermove', onHudMove);
      window.removeEventListener('pointerup', onHudUp);
    };

    window.addEventListener('pointermove', onHudMove);
    window.addEventListener('pointerup', onHudUp);
  });

  // Window Controls
  btnMinimize.addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.minimizeApp();
  });

  btnClose.addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.closeApp();
  });

  // --- 13. Persistence System ---
  let saveDebounceTimer = null;

  function triggerSave() {
    if (syncStatusIndicator && syncStatusText) {
      syncStatusIndicator.classList.add('saving');
      syncStatusText.textContent = 'Saving...';
    }

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      saveState();
    }, 350);
  }

  function saveState() {
    if (!window.electronAPI) return;
    const notesData = [];
    notes.forEach((n) => {
      notesData.push({
        id: n.id,
        title: n.title,
        text: n.text,
        colorIndex: n.colorIndex,
        x: n.body.position.x,
        y: n.body.position.y,
        vx: n.body.velocity.x,
        vy: n.body.velocity.y,
        angle: n.body.angle,
        createdAt: n.createdAt
      });
    });

    window.electronAPI.saveNotesData({
      theme: currentTheme,
      gravityEnabled,
      noteOpacity,
      noteScale: currentScale,
      noteSequenceCounter,
      notes: notesData
    });

    if (syncStatusIndicator && syncStatusText) {
      syncStatusIndicator.classList.remove('saving');
      syncStatusText.textContent = 'All changes saved';
    }
  }

  async function loadState() {
    if (!window.electronAPI) return;
    try {
      const data = await window.electronAPI.getNotesData();
      if (data) {
        if (data.theme) setTheme(data.theme);
        if (data.gravityEnabled !== undefined) setGravity(data.gravityEnabled);
        if (data.noteOpacity !== undefined) setNoteOpacity(data.noteOpacity);
        if (data.noteScale !== undefined) setNoteScale(data.noteScale);
        if (data.noteSequenceCounter !== undefined) {
          noteSequenceCounter = data.noteSequenceCounter;
        }

        if (Array.isArray(data.notes) && data.notes.length > 0) {
          // Determine highest note number among titles to prevent collisions
          data.notes.forEach(noteData => {
            if (noteData.title) {
              const match = noteData.title.match(/Note\s*(\d+)/i);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num >= noteSequenceCounter) noteSequenceCounter = num + 1;
              }
            }
            createNote(noteData);
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Could not restore previous state:', err);
    }

    // Default starting notes if no saved state
    createNote({
      title: 'Quick Guide',
      text: '🌌 Welcome to Zero-G Notes!\n• Floating sticky notes with zero-gravity physics\n• Use the Eraser 🧹 tool in HUD to click & delete\n• Open Vault 📁 to manage and inspect all notes\n• Press Ctrl+T to switch between Light and Dark themes',
      x: window.innerWidth / 2 - 200,
      y: window.innerHeight / 2 - 60,
      colorIndex: 0
    });

    createNote({
      title: 'Experiment',
      text: '🌸 Tactile Paper & Architectural Slate\nDrag and launch notes into orbit, or toggle Earth gravity in Settings ⚙️!',
      x: window.innerWidth / 2 + 200,
      y: window.innerHeight / 2 + 60,
      colorIndex: 1
    });
  }

  // --- 14. Physics Engine Step & Synchronous DOM Render Loop ---
  let lastTime = performance.now();

  function renderLoop(currentTime) {
    const dt = Math.min(32, currentTime - lastTime);
    lastTime = currentTime;

    Engine.update(engine, dt);

    notes.forEach((note) => {
      const body = note.body;
      const el = note.element;

      const pad = 10;
      let px = body.position.x;
      let py = body.position.y;
      const halfW = note.width / 2;
      const halfH = note.height / 2;

      if (px < halfW + pad) {
        Body.setPosition(body, { x: halfW + pad, y: py });
        Body.setVelocity(body, { x: Math.abs(body.velocity.x) * 0.8, y: body.velocity.y });
      }
      if (px > window.innerWidth - halfW - pad) {
        Body.setPosition(body, { x: window.innerWidth - halfW - pad, y: py });
        Body.setVelocity(body, { x: -Math.abs(body.velocity.x) * 0.8, y: body.velocity.y });
      }
      if (py < halfH + pad) {
        Body.setPosition(body, { x: px, y: halfH + pad });
        Body.setVelocity(body, { x: body.velocity.x, y: Math.abs(body.velocity.y) * 0.8 });
      }
      if (py > window.innerHeight - halfH - pad) {
        Body.setPosition(body, { x: px, y: window.innerHeight - halfH - pad });
        Body.setVelocity(body, { x: body.velocity.x, y: -Math.abs(body.velocity.y) * 0.8 });
      }

      const screenX = body.position.x - halfW;
      const screenY = body.position.y - halfH;
      const deg = (body.angle * 180) / Math.PI;

      el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0px) rotate(${deg}deg)`;

      if (currentTheme === 'space') {
        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        const telemVel = el.querySelector('.telem-vel');
        const telemRot = el.querySelector('.telem-rot');
        if (telemVel) telemVel.textContent = `V: ${speed.toFixed(2)}`;
        if (telemRot) telemRot.textContent = `θ: ${(deg % 360).toFixed(0)}°`;
      }
    });

    requestAnimationFrame(renderLoop);
  }

  // Start loop and initialize state
  requestAnimationFrame(renderLoop);
  loadState();

})();
