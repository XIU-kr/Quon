// QR Code Generator Application
let qrCode = null;
let currentType = 'url';
let logoImage = null;
let logoScale = 0.4;
let lastGeneratedContent = '';
let previewZoom = 1;
const PREVIEW_ZOOM_MIN = 0.75;
const PREVIEW_ZOOM_MAX = 1.8;
const PREVIEW_ZOOM_STEP = 0.1;
const DESIGN_PANEL_STATE_KEY = 'quon_design_panel_state';
const RECENT_SETTINGS_KEY = 'quon_recent_settings';
const DRAFT_INPUTS_KEY = 'quon_draft_inputs';
const CTA_VARIANT_KEY = 'quon_cta_variant';
const CTA_METRICS_KEY = 'quon_cta_metrics';
const GENERATION_HISTORY_KEY = 'quon_generation_history';
const HISTORY_PINS_KEY = 'quon_history_pins';
const CUSTOM_PRESETS_KEY = 'quon_custom_presets';
const METRICS_ENDPOINT_KEY = 'quon_metrics_endpoint';
const MAX_HISTORY_ITEMS = 5;
const QR_TYPES = ['url', 'text', 'vcard', 'email', 'tel', 'wifi'];
let isGenerating = false;
let ctaVariant = 0;
let ctaMetrics = { impressions: [0, 0, 0], clicks: [0, 0, 0], conversions: [0, 0, 0] };
let ctaPendingConversion = false;
let generationHistory = [];
let historyPins = [null, null];
let customPresets = { slot1: null, slot2: null, slot3: null };

const DESIGN_PRESETS = {
    business: {
        dotsType: 'rounded',
        cornerSquareType: 'square',
        cornerDotType: 'square',
        dotsColor: '#10243f',
        backgroundColor: '#ffffff'
    },
    event: {
        dotsType: 'classy-rounded',
        cornerSquareType: 'extra-rounded',
        cornerDotType: 'dot',
        dotsColor: '#5a246e',
        backgroundColor: '#fff8f2'
    },
    wifi: {
        dotsType: 'square',
        cornerSquareType: 'square',
        cornerDotType: 'square',
        dotsColor: '#0d513a',
        backgroundColor: '#effff8'
    },
    cafe: {
        dotsType: 'rounded',
        cornerSquareType: 'extra-rounded',
        cornerDotType: 'dot',
        dotsColor: '#5b3a1f',
        backgroundColor: '#fff5e8'
    },
    retail: {
        dotsType: 'square',
        cornerSquareType: 'square',
        cornerDotType: 'dot',
        dotsColor: '#1a2f5f',
        backgroundColor: '#f4f8ff'
    },
    portfolio: {
        dotsType: 'classy',
        cornerSquareType: 'dot',
        cornerDotType: 'dot',
        dotsColor: '#11293f',
        backgroundColor: '#f8fcff'
    }
};

function initializeAdsenseUnits() {
    const adUnits = document.querySelectorAll('.adsbygoogle');
    if (!adUnits.length) {
        return;
    }

    adUnits.forEach((adUnit) => {
        if (adUnit.getAttribute('data-adsbygoogle-status') === 'done') {
            return;
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.error('[AdSense] Failed to initialize ad unit:', error);
        }
    });
}

function updatePreviewZoomLabel() {
    const zoomLabel = document.getElementById('preview-zoom-level');
    if (!zoomLabel) {
        return;
    }

    zoomLabel.textContent = `${Math.round(previewZoom * 100)}%`;
}

function applyPreviewZoom() {
    const qrElements = document.querySelectorAll('#qr-code-container canvas, #qr-code-container svg');
    qrElements.forEach((element) => {
        element.style.transform = `scale(${previewZoom})`;
        element.style.transformOrigin = 'center center';
    });
    updatePreviewZoomLabel();
}

function setPreviewZoom(nextZoom) {
    previewZoom = Math.max(PREVIEW_ZOOM_MIN, Math.min(PREVIEW_ZOOM_MAX, nextZoom));
    applyPreviewZoom();
    saveRecentSettings();
}

function initializeDesignPanelState() {
    const groups = Array.from(document.querySelectorAll('.design-group'));
    if (!groups.length) {
        return;
    }

    let savedState = {};
    try {
        const raw = localStorage.getItem(DESIGN_PANEL_STATE_KEY);
        if (raw) {
            savedState = JSON.parse(raw);
        }
    } catch (error) {
        savedState = {};
    }

    groups.forEach((group, index) => {
        const groupKey = group.dataset.group || `group-${index}`;
        if (Object.prototype.hasOwnProperty.call(savedState, groupKey)) {
            group.open = Boolean(savedState[groupKey]);
        }

        group.addEventListener('toggle', () => {
            const nextState = {};
            groups.forEach((entry, entryIndex) => {
                const key = entry.dataset.group || `group-${entryIndex}`;
                nextState[key] = entry.open;
            });

            try {
                localStorage.setItem(DESIGN_PANEL_STATE_KEY, JSON.stringify(nextState));
            } catch (error) {
                // Ignore storage write errors
            }
        });
    });
}

function getDialCodeLabel(option, language) {
    const savedKoreanLabel = option.dataset.labelKo || option.textContent;
    const code = option.value || '';

    if (option.dataset.i18n) {
        return option.textContent;
    }

    if (language === 'ko') {
        return savedKoreanLabel;
    }

    return code;
}

function normalizeCountryOptionLabels(language) {
    const selectors = ['vcard-tel-country', 'tel-country'];

    selectors.forEach((id) => {
        const select = document.getElementById(id);
        if (!select) return;

        Array.from(select.options).forEach((option) => {
            if (!option.dataset.labelKo) {
                option.dataset.labelKo = option.textContent;
            }

            if (!option.value) {
                return;
            }

            option.textContent = getDialCodeLabel(option, language);
        });
    });
}

function syncCountryCodeOptions() {
    const sourceSelect = document.getElementById('vcard-tel-country');
    const targetSelect = document.getElementById('tel-country');

    if (!sourceSelect || !targetSelect) {
        return;
    }

    targetSelect.innerHTML = sourceSelect.innerHTML;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize language first (wait for it to load)
    await initLanguage();
    initializeAdsenseUnits();
    initializeDesignPanelState();
    
    initializeEventListeners();
    syncCountryCodeOptions();
    normalizeCountryOptionLabels(getCurrentLanguage());
    restoreRecentSettings();
    restoreDraftInputs();
    restoreCtaMetrics();
    initializeCtaVariant();
    restoreGenerationHistory();
    restoreHistoryPins();
    restoreCustomPresets();
    markPresetSelection();
    renderGenerationHistory();
    renderHistoryPins();
    refreshCustomPresetButtons();
    renderCtaAnalytics();
    createInitialQRCode();
    // Disable download buttons initially
    document.getElementById('download-png').disabled = true;
    document.getElementById('download-svg').disabled = true;
    const mobilePng = document.getElementById('mobile-download-png');
    const mobileSvg = document.getElementById('mobile-download-svg');
    if (mobilePng) mobilePng.disabled = true;
    if (mobileSvg) mobileSvg.disabled = true;
});

function initializeCtaVariant() {
    const candidates = [0, 1, 2];
    const saved = Number(localStorage.getItem(CTA_VARIANT_KEY));
    if (Number.isInteger(saved) && candidates.includes(saved)) {
        ctaVariant = saved;
    } else {
        ctaVariant = Math.floor(Math.random() * candidates.length);
        localStorage.setItem(CTA_VARIANT_KEY, String(ctaVariant));
    }

    applyCtaVariant();
    trackCtaMetric('impressions');
}

function applyCtaVariant() {
    const cta = document.querySelector('.hero-actions .btn-primary');
    if (!cta) {
        return;
    }

    const keyMap = ['hero.cta.primary.variant1', 'hero.cta.primary.variant2', 'hero.cta.primary.variant3'];
    const key = keyMap[ctaVariant] || keyMap[0];
    cta.textContent = t(key);
}

function restoreCtaMetrics() {
    try {
        const raw = localStorage.getItem(CTA_METRICS_KEY);
        if (!raw) {
            return;
        }

        const parsed = JSON.parse(raw);
        const hasShape = parsed
            && Array.isArray(parsed.impressions)
            && Array.isArray(parsed.clicks)
            && Array.isArray(parsed.conversions)
            && parsed.impressions.length === 3
            && parsed.clicks.length === 3
            && parsed.conversions.length === 3;

        if (hasShape) {
            ctaMetrics = parsed;
        }
    } catch (error) {
        ctaMetrics = { impressions: [0, 0, 0], clicks: [0, 0, 0], conversions: [0, 0, 0] };
    }
}

function persistCtaMetrics() {
    try {
        localStorage.setItem(CTA_METRICS_KEY, JSON.stringify(ctaMetrics));
    } catch (error) {
        // Ignore storage write errors
    }
}

function emitMetricEvent(kind, value) {
    try {
        if (typeof window.gtag === 'function') {
            window.gtag('event', `cta_${kind}`, {
                event_category: 'engagement',
                event_label: `variant_${ctaVariant + 1}`,
                value
            });
        }

        const endpoint = localStorage.getItem(METRICS_ENDPOINT_KEY);
        if (endpoint && navigator.sendBeacon) {
            const payload = JSON.stringify({ kind, value, variant: ctaVariant + 1, timestamp: Date.now() });
            navigator.sendBeacon(endpoint, payload);
        }
    } catch (error) {
        // Ignore analytics transport errors
    }
}

function trackCtaMetric(kind) {
    if (!ctaMetrics[kind] || typeof ctaMetrics[kind][ctaVariant] !== 'number') {
        return;
    }

    ctaMetrics[kind][ctaVariant] += 1;
    persistCtaMetrics();
    emitMetricEvent(kind, ctaMetrics[kind][ctaVariant]);
    renderCtaAnalytics();
}

function renderCtaAnalytics() {
    const impressions = ctaMetrics.impressions[ctaVariant] || 0;
    const clicks = ctaMetrics.clicks[ctaVariant] || 0;
    const conversions = ctaMetrics.conversions[ctaVariant] || 0;
    const rate = impressions > 0 ? Math.round((conversions / impressions) * 1000) / 10 : 0;

    const impressionsEl = document.getElementById('analytics-impressions');
    const clicksEl = document.getElementById('analytics-clicks');
    const conversionsEl = document.getElementById('analytics-conversions');
    const rateEl = document.getElementById('analytics-rate');

    if (impressionsEl) impressionsEl.textContent = String(impressions);
    if (clicksEl) clicksEl.textContent = String(clicks);
    if (conversionsEl) conversionsEl.textContent = String(conversions);
    if (rateEl) rateEl.textContent = `${rate}%`;
}

function applyDesignPreset(presetKey) {
    const preset = DESIGN_PRESETS[presetKey];
    if (!preset) {
        return;
    }

    const mappings = [
        ['dots-type', preset.dotsType],
        ['corner-square-type', preset.cornerSquareType],
        ['corner-dot-type', preset.cornerDotType],
        ['dots-color', preset.dotsColor],
        ['background-color', preset.backgroundColor]
    ];

    mappings.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });

    markPresetSelection(presetKey);
    saveRecentSettings();
    generateQRCode({ silent: true, focusDownload: false, recordHistory: false });
    showNotification(t('preset.applied'), 'success');
}

function markPresetSelection(activePresetKey = null) {
    let resolvedPresetKey = activePresetKey;

    if (!resolvedPresetKey) {
        const current = {
            dotsType: document.getElementById('dots-type')?.value,
            cornerSquareType: document.getElementById('corner-square-type')?.value,
            cornerDotType: document.getElementById('corner-dot-type')?.value,
            dotsColor: document.getElementById('dots-color')?.value,
            backgroundColor: document.getElementById('background-color')?.value
        };

        resolvedPresetKey = Object.entries(DESIGN_PRESETS).find(([, preset]) => {
            return preset.dotsType === current.dotsType
                && preset.cornerSquareType === current.cornerSquareType
                && preset.cornerDotType === current.cornerDotType
                && preset.dotsColor.toLowerCase() === (current.dotsColor || '').toLowerCase()
                && preset.backgroundColor.toLowerCase() === (current.backgroundColor || '').toLowerCase();
        })?.[0] || null;
    }

    const buttons = document.querySelectorAll('.preset-btn');
    buttons.forEach((button) => {
        const preset = button.dataset.preset;
        const isActive = resolvedPresetKey ? preset === resolvedPresetKey : false;
        button.classList.toggle('is-active', isActive);
    });
}

function getCurrentDesignSettings() {
    return {
        dotsType: document.getElementById('dots-type')?.value,
        cornerSquareType: document.getElementById('corner-square-type')?.value,
        cornerDotType: document.getElementById('corner-dot-type')?.value,
        dotsColor: document.getElementById('dots-color')?.value,
        backgroundColor: document.getElementById('background-color')?.value
    };
}

function restoreCustomPresets() {
    try {
        const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
        if (!raw) {
            return;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            customPresets = {
                slot1: parsed.slot1 || null,
                slot2: parsed.slot2 || null,
                slot3: parsed.slot3 || null
            };
        }
    } catch (error) {
        customPresets = { slot1: null, slot2: null, slot3: null };
    }
}

function persistCustomPresets() {
    try {
        localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
    } catch (error) {
        // Ignore storage write errors
    }
}

function refreshCustomPresetButtons() {
    const buttons = document.querySelectorAll('.custom-preset-btn[data-action="apply"]');
    buttons.forEach((button) => {
        const slot = button.dataset.slot;
        button.disabled = !customPresets[slot];
    });
}

function saveCustomPreset(slot) {
    customPresets[slot] = getCurrentDesignSettings();
    persistCustomPresets();
    refreshCustomPresetButtons();
    showNotification(t('preset.custom.saved'), 'success');
}

function applyCustomPreset(slot) {
    const preset = customPresets[slot];
    if (!preset) {
        showNotification(t('preset.custom.empty'));
        return;
    }

    Object.entries(preset).forEach(([idKey, value]) => {
        const elementIdMap = {
            dotsType: 'dots-type',
            cornerSquareType: 'corner-square-type',
            cornerDotType: 'corner-dot-type',
            dotsColor: 'dots-color',
            backgroundColor: 'background-color'
        };
        const element = document.getElementById(elementIdMap[idKey]);
        if (element) {
            element.value = value;
        }
    });

    markPresetSelection();
    saveRecentSettings();
    generateQRCode({ silent: true, focusDownload: false, recordHistory: false });
    showNotification(t('preset.custom.applied'), 'success');
}

function restoreHistoryPins() {
    try {
        const raw = localStorage.getItem(HISTORY_PINS_KEY);
        if (!raw) {
            return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 2) {
            historyPins = parsed;
        }
    } catch (error) {
        historyPins = [null, null];
    }
}

function persistHistoryPins() {
    try {
        localStorage.setItem(HISTORY_PINS_KEY, JSON.stringify(historyPins));
    } catch (error) {
        // Ignore storage write errors
    }
}

function assignPin(slotIndex, itemId) {
    historyPins[slotIndex] = itemId;
    persistHistoryPins();
    renderHistoryPins();
}

function renderHistoryPins() {
    const pinButtons = document.querySelectorAll('.pin-slot');
    pinButtons.forEach((button) => {
        const slot = Number(button.dataset.slot);
        const itemId = historyPins[slot];
        const item = generationHistory.find((entry) => entry.id === itemId);
        const content = button.querySelector('.pin-empty, .pin-content');

        if (!item) {
            if (content) {
                content.className = 'pin-empty';
                content.textContent = t('history.pin.empty');
            }
            return;
        }

        if (content) {
            content.className = 'pin-content';
            content.textContent = `${t(`type.${item.type}`)} - ${item.preview}`;
        }
    });
}

function evaluateScanQuality() {
    const list = document.getElementById('quality-list');
    const actions = document.getElementById('quality-actions');
    if (!list) {
        return;
    }

    const dotsColor = document.getElementById('dots-color')?.value || '#000000';
    const backgroundColor = document.getElementById('background-color')?.value || '#ffffff';
    const luminance = (hex) => {
        const value = hex.replace('#', '');
        const chunk = value.length === 3
            ? value.split('').map((c) => c + c).join('')
            : value;
        const [r, g, b] = [chunk.slice(0, 2), chunk.slice(2, 4), chunk.slice(4, 6)].map((v) => parseInt(v, 16) / 255);
        const convert = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
    };

    const l1 = luminance(dotsColor);
    const l2 = luminance(backgroundColor);
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    const warnings = [];
    const actionButtons = [];
    if (contrast < 4.5) {
        warnings.push({ key: 'quality.warn.contrast', warning: true });
        actionButtons.push({ action: 'contrast', labelKey: 'quality.fix.contrast' });
    }
    if (logoImage) {
        warnings.push({ key: 'quality.warn.logo', warning: true });
        if (logoScale > 0.25) {
            actionButtons.push({ action: 'logo', labelKey: 'quality.fix.logo' });
        }
    }
    if (warnings.length === 0) {
        warnings.push({ key: 'quality.ok', warning: false });
    }

    list.innerHTML = '';
    warnings.forEach((entry) => {
        const li = document.createElement('li');
        li.className = entry.warning ? 'quality-item-warning' : 'quality-item-ok';
        li.textContent = t(entry.key);
        list.appendChild(li);
    });

    if (actions) {
        actions.innerHTML = '';
        actionButtons.forEach((entry) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quality-fix-btn';
            button.dataset.action = entry.action;
            button.textContent = t(entry.labelKey);
            actions.appendChild(button);
        });
    }
}

function applyQualityFix(action) {
    if (action === 'contrast') {
        const dots = document.getElementById('dots-color');
        const background = document.getElementById('background-color');
        if (dots) dots.value = '#10243f';
        if (background) background.value = '#ffffff';
        markPresetSelection();
        saveRecentSettings();
        generateQRCode({ silent: true, focusDownload: false, recordHistory: false });
        showNotification(t('quality.fix.applied.contrast'), 'success');
        return;
    }

    if (action === 'logo' && logoImage) {
        logoScale = 0.24;
        generateQRCode({ silent: true, focusDownload: false, recordHistory: false });
        showNotification(t('quality.fix.applied.logo'), 'success');
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    document.addEventListener('languageChanged', (event) => {
        normalizeCountryOptionLabels(event.detail.language);
        applyCtaVariant();
        renderGenerationHistory();
        renderHistoryPins();
        renderCtaAnalytics();
        evaluateScanQuality();
    });

    // Type selector buttons
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchQRType(this.dataset.type);
        });
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', generateQRCode);

    const clearHistoryButton = document.getElementById('clear-history-btn');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            generationHistory = [];
            historyPins = [null, null];
            persistGenerationHistory();
            persistHistoryPins();
            renderGenerationHistory();
            renderHistoryPins();
            showNotification(t('history.cleared'), 'success');
        });
    }

    const fillExampleButton = document.getElementById('preview-fill-example');
    if (fillExampleButton) {
        fillExampleButton.addEventListener('click', fillExampleContent);
    }

    const heroExampleButton = document.getElementById('hero-example-btn');
    if (heroExampleButton) {
        heroExampleButton.addEventListener('click', () => {
            fillExampleContent();
            document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    const primaryHeroCta = document.querySelector('.hero-actions .btn-primary');
    if (primaryHeroCta) {
        primaryHeroCta.addEventListener('click', () => {
            trackCtaMetric('clicks');
            ctaPendingConversion = true;
        });
    }

    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyDesignPreset(button.dataset.preset);
        });
    });

    const marketPresetButtons = document.querySelectorAll('.preset-market-item');
    marketPresetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyDesignPreset(button.dataset.preset);
        });
    });

    const customPresetButtons = document.querySelectorAll('.custom-preset-btn');
    customPresetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const slot = button.dataset.slot;
            if (button.dataset.action === 'save') {
                saveCustomPreset(slot);
            }
            if (button.dataset.action === 'apply') {
                applyCustomPreset(slot);
            }
        });
    });

    const pinSlotButtons = document.querySelectorAll('.pin-slot');
    pinSlotButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const slot = Number(button.dataset.slot);
            const itemId = historyPins[slot];
            const item = generationHistory.find((entry) => entry.id === itemId);
            if (!item) {
                return;
            }
            applyFormSnapshot(item.snapshot);
            saveDraftInputs();
            generateQRCode({ silent: true, focusDownload: false, recordHistory: false });
            showNotification(t('history.pin.applied'), 'success');
        });
    });

    const zoomInButton = document.getElementById('preview-zoom-in');
    const zoomOutButton = document.getElementById('preview-zoom-out');
    const zoomResetButton = document.getElementById('preview-zoom-reset');

    if (zoomInButton && zoomOutButton && zoomResetButton) {
        zoomInButton.addEventListener('click', () => setPreviewZoom(previewZoom + PREVIEW_ZOOM_STEP));
        zoomOutButton.addEventListener('click', () => setPreviewZoom(previewZoom - PREVIEW_ZOOM_STEP));
        zoomResetButton.addEventListener('click', () => setPreviewZoom(1));
        updatePreviewZoomLabel();
    }

    // Download buttons
    document.getElementById('download-png').addEventListener('click', () => downloadQR('png'));
    document.getElementById('download-svg').addEventListener('click', () => downloadQR('svg'));

    const mobileGenerate = document.getElementById('mobile-generate');
    if (mobileGenerate) {
        mobileGenerate.addEventListener('click', () => generateQRCode());
    }

    const mobileDownloadPng = document.getElementById('mobile-download-png');
    if (mobileDownloadPng) {
        mobileDownloadPng.addEventListener('click', () => downloadQR('png'));
    }

    const mobileDownloadSvg = document.getElementById('mobile-download-svg');
    if (mobileDownloadSvg) {
        mobileDownloadSvg.addEventListener('click', () => downloadQR('svg'));
    }

    const mobileShare = document.getElementById('mobile-share');
    if (mobileShare) {
        mobileShare.addEventListener('click', shareCurrentQr);
    }

    const qualityActions = document.getElementById('quality-actions');
    if (qualityActions) {
        qualityActions.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            const action = target.dataset.action;
            if (!action) {
                return;
            }
            applyQualityFix(action);
        });
    }

    // Logo upload
    document.getElementById('logo-upload').addEventListener('change', handleLogoUpload);

    // Customization options - live update
    const customizationInputs = [
        'dots-type', 'corner-square-type', 'corner-dot-type',
        'dots-color', 'background-color'
    ];
    
    customizationInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                markPresetSelection();
                saveRecentSettings();
                generateQRCode();
            });
        }
    });

    // Input fields - generate on Enter key and clear inline errors
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(field => {
        if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            field.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && field.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    generateQRCode();
                }
            });
        }

        field.addEventListener('input', () => {
            field.classList.remove('is-invalid');
            const sibling = field.nextElementSibling;
            if (sibling && sibling.classList && sibling.classList.contains('field-error')) {
                sibling.remove();
            }
            saveDraftInputs();
        });

        field.addEventListener('change', saveDraftInputs);
    });

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            generateQRCode();
        }
    });

    // Country code checkbox toggles for vCard
    document.getElementById('vcard-use-country-code').addEventListener('change', function() {
        const countryGroup = document.getElementById('vcard-country-group');
        countryGroup.style.display = this.checked ? 'block' : 'none';
    });

    // Country code checkbox toggles for Tel
    document.getElementById('tel-use-country-code').addEventListener('change', function() {
        const countryGroup = document.getElementById('tel-country-group');
        countryGroup.style.display = this.checked ? 'block' : 'none';
    });
}

function togglePreviewExampleButton(visible) {
    const fillButton = document.getElementById('preview-fill-example');
    if (!fillButton) {
        return;
    }

    fillButton.classList.toggle('is-hidden', !visible);
}

function setPreviewEmptyState(isEmpty) {
    const previewStage = document.querySelector('.preview-stage');
    const previewContainer = document.getElementById('qr-code-container');

    if (previewStage) {
        previewStage.classList.toggle('is-empty', isEmpty);
    }

    if (previewContainer) {
        previewContainer.classList.toggle('is-empty', isEmpty);
    }
}

function saveRecentSettings() {
    const settings = {
        type: currentType,
        previewZoom,
        dotsType: document.getElementById('dots-type')?.value,
        cornerSquareType: document.getElementById('corner-square-type')?.value,
        cornerDotType: document.getElementById('corner-dot-type')?.value,
        dotsColor: document.getElementById('dots-color')?.value,
        backgroundColor: document.getElementById('background-color')?.value
    };

    try {
        localStorage.setItem(RECENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        // Ignore storage write errors
    }
}

function restoreRecentSettings() {
    try {
        const raw = localStorage.getItem(RECENT_SETTINGS_KEY);
        if (!raw) {
            return;
        }

        const saved = JSON.parse(raw);
        if (saved && QR_TYPES.includes(saved.type)) {
            switchQRType(saved.type);
        }

        const selectMappings = [
            ['dots-type', saved.dotsType],
            ['corner-square-type', saved.cornerSquareType],
            ['corner-dot-type', saved.cornerDotType],
            ['dots-color', saved.dotsColor],
            ['background-color', saved.backgroundColor]
        ];

        selectMappings.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
            }
        });

        if (typeof saved.previewZoom === 'number' && Number.isFinite(saved.previewZoom)) {
            setPreviewZoom(saved.previewZoom);
        } else {
            updatePreviewZoomLabel();
        }
    } catch (error) {
        updatePreviewZoomLabel();
    }
}

function fillExampleContent() {
    if (currentType === 'url') {
        document.getElementById('url-input').value = 'https://www.sn0wman.kr';
    }

    if (currentType === 'text') {
        document.getElementById('text-input').value = 'Scan this code to view a quick demo message.';
    }

    if (currentType === 'vcard') {
        document.getElementById('vcard-fullname').value = 'Hong Gil Dong';
        document.getElementById('vcard-tel').value = '01012345678';
        document.getElementById('vcard-email').value = 'hello@example.com';
        document.getElementById('vcard-org').value = 'Quon Team';
    }

    if (currentType === 'email') {
        document.getElementById('email-to').value = 'hello@example.com';
        document.getElementById('email-subject').value = 'Quick hello from Quon';
        document.getElementById('email-body').value = 'Hi! This is a sample email QR code.';
    }

    if (currentType === 'tel') {
        document.getElementById('tel-number').value = '01012345678';
    }

    if (currentType === 'wifi') {
        document.getElementById('wifi-ssid').value = 'Quon_WiFi';
        document.getElementById('wifi-password').value = 'sample-password';
    }

    generateQRCode();
    showNotification(t('message.success.prefilled'), 'success');
}

function updatePreviewStatus(messageKey, showFillAction = false) {
    const statusElement = document.getElementById('preview-status');
    if (!statusElement) {
        return;
    }

    statusElement.textContent = t(messageKey);
    togglePreviewExampleButton(showFillAction);
}

function clearValidationErrors() {
    document.querySelectorAll('.input-field.is-invalid').forEach((field) => {
        field.classList.remove('is-invalid');
    });

    document.querySelectorAll('.field-error').forEach((entry) => {
        entry.remove();
    });
}

function setFieldError(fieldId, messageKey) {
    const field = document.getElementById(fieldId);
    if (!field) {
        return;
    }

    field.classList.add('is-invalid');
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = t(messageKey);
    error.setAttribute('role', 'alert');
    field.insertAdjacentElement('afterend', error);
}

function validateCurrentInput() {
    clearValidationErrors();

    if (currentType === 'url' && !document.getElementById('url-input').value.trim()) {
        setFieldError('url-input', 'message.error.empty');
        return false;
    }

    if (currentType === 'vcard') {
        const fullName = document.getElementById('vcard-fullname').value.trim();
        const lastName = document.getElementById('vcard-lastname').value.trim();
        const firstName = document.getElementById('vcard-firstname').value.trim();
        const tel = document.getElementById('vcard-tel').value.trim();

        if (!fullName && !lastName && !firstName) {
            setFieldError('vcard-fullname', 'message.error.name');
            return false;
        }

        if (!tel) {
            setFieldError('vcard-tel', 'message.error.tel');
            return false;
        }
    }

    if (currentType === 'email' && !document.getElementById('email-to').value.trim()) {
        setFieldError('email-to', 'message.error.email');
        return false;
    }

    if (currentType === 'tel' && !document.getElementById('tel-number').value.trim()) {
        setFieldError('tel-number', 'message.error.tel');
        return false;
    }

    if (currentType === 'wifi' && !document.getElementById('wifi-ssid').value.trim()) {
        setFieldError('wifi-ssid', 'message.error.wifi');
        return false;
    }

    return true;
}

function setGeneratingState(nextState) {
    isGenerating = nextState;
    const generateButton = document.getElementById('generate-btn');
    if (!generateButton) {
        return;
    }

    generateButton.disabled = nextState;
    generateButton.classList.toggle('is-loading', nextState);
    generateButton.textContent = nextState ? t('button.generating') : t('button.generate');
}

// Switch between QR code types
function switchQRType(type) {
    currentType = type;
    clearValidationErrors();
    saveRecentSettings();

    // Update active button
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Update active form
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`form-${type}`).classList.add('active');
}

// Handle logo upload
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            logoImage = event.target.result;
            logoScale = 0.4;
            generateQRCode();
            evaluateScanQuality();
        };
        reader.readAsDataURL(file);
    } else {
        logoImage = null;
        generateQRCode();
        evaluateScanQuality();
    }
}

// Generate QR code content based on type
function getQRContent() {
    let content = '';

    switch (currentType) {
        case 'url':
            content = document.getElementById('url-input').value.trim();
            if (content && !content.startsWith('http://') && !content.startsWith('https://')) {
                content = 'https://' + content;
            }
            break;

        case 'text':
            content = document.getElementById('text-input').value.trim();
            break;

        case 'vcard':
            // Get name fields
            const fullName = document.getElementById('vcard-fullname').value.trim();
            const lastName = document.getElementById('vcard-lastname').value.trim();
            const firstName = document.getElementById('vcard-firstname').value.trim();
            
            // Determine which name to use
            // Note: If both full name and separate names are provided, full name takes precedence
            let name = '';
            let familyName = '';
            let givenName = '';
            
            if (fullName) {
                // Use full name - try to split it if it has spaces
                name = fullName;
                const nameParts = fullName.split(' ');
                if (nameParts.length > 1) {
                    // Korean naming convention: first part is family name, rest is given name
                    familyName = nameParts[0];
                    givenName = nameParts.slice(1).join(' ');
                } else {
                    familyName = fullName;
                    givenName = '';
                }
            } else if (lastName || firstName) {
                // Use last name and first name separately
                familyName = lastName;
                givenName = firstName;
                // Combine names with proper spacing
                if (lastName && firstName) {
                    name = lastName + ' ' + firstName;
                } else {
                    name = (lastName || firstName);
                }
            }
            
            // Get other fields
            const org = document.getElementById('vcard-org').value.trim();
            let tel = document.getElementById('vcard-tel').value.trim();
            const useCountryCode = document.getElementById('vcard-use-country-code').checked;
            const telCountry = document.getElementById('vcard-tel-country').value;
            const email = document.getElementById('vcard-email').value.trim();
            const url = document.getElementById('vcard-url').value.trim();
            const address = document.getElementById('vcard-address').value.trim();

            // Validate required fields
            if (!name) {
                showNotification(t('message.error.name'));
                return null;
            }
            if (!tel) {
                showNotification(t('message.error.tel'));
                return null;
            }

            // iOS-compatible vCard format with CRLF line endings
            content = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
            
            // Add formatted name
            content += formatVCardField('FN', name);
            
            // Add structured name (N field)
            const hasNonASCII = containsNonASCII(name);
            const nValue = `${escapeVCard(familyName)};${escapeVCard(givenName)};;;`;
            content += formatVCardNameField(nValue, hasNonASCII);
            
            if (org) content += formatVCardField('ORG', org);
            if (tel) {
                // Add country code if checkbox is enabled and country is selected
                const formattedTel = (useCountryCode && telCountry) ? `${telCountry}${tel}` : tel;
                content += `TEL;TYPE=CELL:${formattedTel}\r\n`;
            }
            if (email) content += `EMAIL;TYPE=INTERNET:${email}\r\n`;
            if (url) content += `URL:${url}\r\n`;
            if (address) {
                // For Korean addresses, use the full address as street address
                // ADR field has structured format, so we handle it specially
                const adrValue = `;;${escapeVCard(address)};;;;`;
                if (containsNonASCII(address)) {
                    const encoded = encodeQuotedPrintable(adrValue);
                    content += `ADR;TYPE=HOME;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encoded}\r\n`;
                } else {
                    content += `ADR;TYPE=HOME:${adrValue}\r\n`;
                }
            }
            content += 'END:VCARD';
            break;

        case 'email':
            const emailTo = document.getElementById('email-to').value.trim();
            const subject = document.getElementById('email-subject').value.trim();
            const body = document.getElementById('email-body').value.trim();

            if (!emailTo) {
                showNotification(t('message.error.email'));
                return null;
            }

            content = `mailto:${emailTo}`;
            const params = [];
            if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
            if (body) params.push(`body=${encodeURIComponent(body)}`);
            if (params.length > 0) {
                content += '?' + params.join('&');
            }
            break;

        case 'tel':
            const telNumber = document.getElementById('tel-number').value.trim();
            const useTelCountryCode = document.getElementById('tel-use-country-code').checked;
            const telCountryCode = document.getElementById('tel-country').value;
            
            if (!telNumber) {
                showNotification(t('message.error.tel'));
                return null;
            }

            // Add country code if checkbox is enabled and country is selected
            const formattedTelNumber = (useTelCountryCode && telCountryCode) ? `${telCountryCode}${telNumber}` : telNumber;
            content = `tel:${formattedTelNumber}`;
            break;

        case 'wifi':
            const ssid = document.getElementById('wifi-ssid').value.trim();
            const password = document.getElementById('wifi-password').value.trim();
            const encryption = document.getElementById('wifi-encryption').value;
            const hidden = document.getElementById('wifi-hidden').checked;

            if (ssid) {
                // Escape special characters for Wi-Fi QR code
                const escapedSsid = escapeWiFi(ssid);
                const escapedPassword = escapeWiFi(password);
                
                // iOS-compatible Wi-Fi format
                content = `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};${hidden ? 'H:true;' : ''};`;
            }
            break;
    }

    return content;
}

// Get QR code options
function getQROptions() {
    const dotsColor = document.getElementById('dots-color').value;
    const backgroundColor = document.getElementById('background-color').value;
    const dotsType = document.getElementById('dots-type').value;
    const cornerSquareType = document.getElementById('corner-square-type').value;
    const cornerDotType = document.getElementById('corner-dot-type').value;

    const options = {
        width: 300,
        height: 300,
        type: "canvas",
        data: "",
        margin: 10,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q"
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: logoScale,
            margin: 5
        },
        dotsOptions: {
            color: dotsColor,
            type: dotsType
        },
        backgroundOptions: {
            color: backgroundColor
        },
        cornersSquareOptions: {
            color: dotsColor,
            type: cornerSquareType
        },
        cornersDotOptions: {
            color: dotsColor,
            type: cornerDotType
        }
    };

    // Add logo if available
    if (logoImage) {
        options.image = logoImage;
    }

    return options;
}

// Create initial QR code
function createInitialQRCode() {
    const container = document.getElementById('qr-code-container');
    container.innerHTML = '<div class="empty-state"><div class="icon">📱</div><p>' + t('message.empty') + '</p></div>';
    setPreviewEmptyState(true);
    updatePreviewStatus('message.empty', true);
    updatePreviewZoomLabel();
    evaluateScanQuality();
}

function persistGenerationHistory() {
    try {
        localStorage.setItem(GENERATION_HISTORY_KEY, JSON.stringify(generationHistory));
    } catch (error) {
        // Ignore storage write errors
    }
}

function restoreGenerationHistory() {
    try {
        const raw = localStorage.getItem(GENERATION_HISTORY_KEY);
        if (!raw) {
            generationHistory = [];
            return;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            generationHistory = [];
            return;
        }

        generationHistory = parsed
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({ ...item, favorite: Boolean(item.favorite) }))
            .slice(0, MAX_HISTORY_ITEMS);
    } catch (error) {
        generationHistory = [];
    }
}

function formatRelativeTime(timestamp) {
    const diffMs = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return t('history.time.now');
    if (diffMs < hour) return t('history.time.min').replace('{n}', String(Math.max(1, Math.floor(diffMs / minute))));
    if (diffMs < day) return t('history.time.hour').replace('{n}', String(Math.max(1, Math.floor(diffMs / hour))));
    return t('history.time.day').replace('{n}', String(Math.max(1, Math.floor(diffMs / day))));
}

function getCurrentFormSnapshot() {
    const fields = document.querySelectorAll('.input-field');
    const formValues = {};

    fields.forEach((field) => {
        if (!field.id || field.type === 'file') {
            return;
        }
        formValues[field.id] = field.value;
    });

    ['vcard-use-country-code', 'tel-use-country-code', 'wifi-hidden'].forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            formValues[id] = checkbox.checked;
        }
    });

    return {
        type: currentType,
        formValues
    };
}

function applyFormSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        return;
    }

    if (snapshot.type && QR_TYPES.includes(snapshot.type)) {
        switchQRType(snapshot.type);
    }

    if (snapshot.formValues && typeof snapshot.formValues === 'object') {
        Object.entries(snapshot.formValues).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (!el) {
                return;
            }
            if (el.type === 'checkbox') {
                el.checked = Boolean(value);
            } else if (typeof value === 'string') {
                el.value = value;
            }
        });
    }

    const vcardUseCountry = document.getElementById('vcard-use-country-code');
    const vcardCountryGroup = document.getElementById('vcard-country-group');
    if (vcardUseCountry && vcardCountryGroup) {
        vcardCountryGroup.style.display = vcardUseCountry.checked ? 'block' : 'none';
    }

    const telUseCountry = document.getElementById('tel-use-country-code');
    const telCountryGroup = document.getElementById('tel-country-group');
    if (telUseCountry && telCountryGroup) {
        telCountryGroup.style.display = telUseCountry.checked ? 'block' : 'none';
    }
}

function addGenerationHistoryItem(content) {
    const trimmed = content.replace(/\s+/g, ' ').trim();
    const entry = {
        id: Date.now(),
        type: currentType,
        preview: trimmed.slice(0, 68),
        fullContent: content,
        timestamp: Date.now(),
        favorite: false,
        tag: currentType === 'wifi' ? 'wifi' : (currentType === 'vcard' ? 'business' : 'general'),
        snapshot: getCurrentFormSnapshot()
    };

    generationHistory = [entry, ...generationHistory]
        .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.timestamp - a.timestamp)
        .slice(0, MAX_HISTORY_ITEMS);
    persistGenerationHistory();
    renderGenerationHistory();
}

function renderGenerationHistory() {
    const list = document.getElementById('recent-history-list');
    if (!list) {
        return;
    }

    list.innerHTML = '';
    if (!generationHistory.length) {
        const li = document.createElement('li');
        li.className = 'history-empty';
        li.textContent = t('history.empty');
        list.appendChild(li);
        return;
    }

    generationHistory.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const top = document.createElement('div');
        top.className = 'history-item-top';

        const type = document.createElement('span');
        type.className = 'history-type';
        type.textContent = t(`type.${item.type}`);

        const time = document.createElement('span');
        time.className = 'history-time';
        time.textContent = formatRelativeTime(item.timestamp);

        top.appendChild(type);
        top.appendChild(time);

        const preview = document.createElement('p');
        preview.className = 'history-content';
        preview.textContent = item.preview;

        const actions = document.createElement('div');
        actions.className = 'history-actions';

        const tagSelect = document.createElement('select');
        tagSelect.className = 'history-tag-select';
        ['general', 'business', 'event', 'wifi'].forEach((tag) => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = t(`history.tag.${tag}`);
            tagSelect.appendChild(option);
        });
        tagSelect.value = item.tag || 'general';
        tagSelect.addEventListener('change', () => {
            generationHistory = generationHistory.map((entry) => {
                if (entry.id !== item.id) {
                    return entry;
                }
                return { ...entry, tag: tagSelect.value };
            });
            persistGenerationHistory();
        });

        const reuse = document.createElement('button');
        reuse.type = 'button';
        reuse.className = 'history-reuse-btn history-action-btn';
        reuse.textContent = t('history.reuse');
        reuse.addEventListener('click', () => {
            applyFormSnapshot(item.snapshot);
            saveDraftInputs();
            generateQRCode({ silent: true, focusDownload: false, recordHistory: false });
            showNotification(t('history.reused'), 'success');
        });

        const favorite = document.createElement('button');
        favorite.type = 'button';
        favorite.className = `history-fav-btn ${item.favorite ? 'is-active' : ''}`;
        favorite.textContent = item.favorite ? t('history.unfavorite') : t('history.favorite');
        favorite.addEventListener('click', () => {
            generationHistory = generationHistory.map((entry) => {
                if (entry.id !== item.id) {
                    return entry;
                }
                return { ...entry, favorite: !entry.favorite };
            }).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.timestamp - a.timestamp);

            persistGenerationHistory();
            renderGenerationHistory();
        });

        const downloadPng = document.createElement('button');
        downloadPng.type = 'button';
        downloadPng.className = 'history-action-btn';
        downloadPng.textContent = t('history.download.png');
        downloadPng.addEventListener('click', () => {
            applyFormSnapshot(item.snapshot);
            saveDraftInputs();
            generateQRCode({
                silent: true,
                focusDownload: false,
                recordHistory: false,
                onSuccess: () => downloadQR('png')
            });
        });

        const downloadSvg = document.createElement('button');
        downloadSvg.type = 'button';
        downloadSvg.className = 'history-action-btn';
        downloadSvg.textContent = t('history.download.svg');
        downloadSvg.addEventListener('click', () => {
            applyFormSnapshot(item.snapshot);
            saveDraftInputs();
            generateQRCode({
                silent: true,
                focusDownload: false,
                recordHistory: false,
                onSuccess: () => downloadQR('svg')
            });
        });

        const pin1 = document.createElement('button');
        pin1.type = 'button';
        pin1.className = 'history-action-btn';
        pin1.textContent = t('history.pin.1.short');
        pin1.addEventListener('click', () => {
            assignPin(0, item.id);
            showNotification(t('history.pin.saved'), 'success');
        });

        const pin2 = document.createElement('button');
        pin2.type = 'button';
        pin2.className = 'history-action-btn';
        pin2.textContent = t('history.pin.2.short');
        pin2.addEventListener('click', () => {
            assignPin(1, item.id);
            showNotification(t('history.pin.saved'), 'success');
        });

        actions.appendChild(tagSelect);
        actions.appendChild(reuse);
        actions.appendChild(favorite);
        actions.appendChild(pin1);
        actions.appendChild(pin2);
        actions.appendChild(downloadPng);
        actions.appendChild(downloadSvg);

        li.appendChild(top);
        li.appendChild(preview);
        li.appendChild(actions);
        list.appendChild(li);
    });

    renderHistoryPins();
}

function saveDraftInputs() {
    const fields = document.querySelectorAll('.input-field');
    const draft = {};

    fields.forEach((field) => {
        if (!field.id) {
            return;
        }

        if (field.type === 'file') {
            return;
        }

        draft[field.id] = field.value;
    });

    const checkboxIds = ['vcard-use-country-code', 'tel-use-country-code', 'wifi-hidden'];
    checkboxIds.forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            draft[id] = checkbox.checked;
        }
    });

    try {
        localStorage.setItem(DRAFT_INPUTS_KEY, JSON.stringify(draft));
    } catch (error) {
        // Ignore storage write errors
    }
}

function restoreDraftInputs() {
    try {
        const raw = localStorage.getItem(DRAFT_INPUTS_KEY);
        if (!raw) {
            return;
        }

        const draft = JSON.parse(raw);
        if (!draft || typeof draft !== 'object') {
            return;
        }

        Object.entries(draft).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            if (element.type === 'checkbox') {
                element.checked = Boolean(value);
                return;
            }

            if (typeof value === 'string') {
                element.value = value;
            }
        });

        const vcardUseCountry = document.getElementById('vcard-use-country-code');
        const vcardCountryGroup = document.getElementById('vcard-country-group');
        if (vcardUseCountry && vcardCountryGroup) {
            vcardCountryGroup.style.display = vcardUseCountry.checked ? 'block' : 'none';
        }

        const telUseCountry = document.getElementById('tel-use-country-code');
        const telCountryGroup = document.getElementById('tel-country-group');
        if (telUseCountry && telCountryGroup) {
            telCountryGroup.style.display = telUseCountry.checked ? 'block' : 'none';
        }
    } catch (error) {
        // Ignore malformed storage data
    }
}

// Show notification message
function showNotification(message, type = 'error') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate QR code
function generateQRCode(options = {}) {
    const silent = Boolean(options.silent);
    const focusDownload = options.focusDownload !== false;
    const countConversion = options.countConversion !== false && !silent;
    const recordHistory = options.recordHistory !== false;
    const onSuccess = typeof options.onSuccess === 'function' ? options.onSuccess : null;

    if (isGenerating) {
        return;
    }

    if (!validateCurrentInput()) {
        if (!silent) {
            showNotification(t('message.error.fixFields'));
        }
        return;
    }

    const content = getQRContent();

    if (content === null) {
        return;
    }

    if (!content) {
        updatePreviewStatus('message.error.empty', true);
        if (!silent) {
            showNotification(t('message.error.empty'));
        }
        return;
    }

    lastGeneratedContent = content;

    setGeneratingState(true);
    window.requestAnimationFrame(() => {
        try {
            const options = getQROptions();
            options.data = content;

            const container = document.getElementById('qr-code-container');
            container.innerHTML = '';

            // Create new QR code
            qrCode = new QRCodeStyling(options);
            qrCode.append(container);
            applyPreviewZoom();
            setPreviewEmptyState(false);

            // Enable download buttons
            const downloadPngButton = document.getElementById('download-png');
            const downloadSvgButton = document.getElementById('download-svg');
            downloadPngButton.disabled = false;
            downloadSvgButton.disabled = false;
            const mobilePng = document.getElementById('mobile-download-png');
            const mobileSvg = document.getElementById('mobile-download-svg');
            if (mobilePng) mobilePng.disabled = false;
            if (mobileSvg) mobileSvg.disabled = false;
            if (focusDownload) {
                downloadPngButton.focus({ preventScroll: true });
            }

            updatePreviewStatus('message.success.generated', false);
            if (recordHistory) {
                addGenerationHistoryItem(content);
            }
            if (countConversion && ctaPendingConversion) {
                trackCtaMetric('conversions');
                ctaPendingConversion = false;
            }
            evaluateScanQuality();
            if (!silent) {
                showNotification(t('message.success.generated'), 'success');
            }
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            updatePreviewStatus('message.error.network', true);
            if (!silent) {
                showNotification(t('message.error.network'));
            }
        } finally {
            setGeneratingState(false);
        }
    });
}

async function shareCurrentQr() {
    const shareContent = lastGeneratedContent || getQRContent();
    if (!shareContent) {
        showNotification(t('share.no_content'));
        return;
    }

    const payload = {
        title: t('share.title'),
        text: t('share.text')
    };

    if (shareContent.startsWith('http://') || shareContent.startsWith('https://')) {
        payload.url = shareContent;
    } else {
        payload.text = `${t('share.text')}\n${shareContent}`;
    }

    try {
        if (navigator.share) {
            await navigator.share(payload);
            showNotification(t('share.success'), 'success');
            return;
        }

        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareContent);
            showNotification(t('share.copied'), 'success');
            return;
        }
    } catch (error) {
        showNotification(t('share.failed'));
        return;
    }

    showNotification(t('share.failed'));
}

// Download QR code
function downloadQR(format) {
    if (!qrCode) {
        showNotification(t('message.error.empty'));
        return;
    }

    const filename = `qrcode-${currentType}-${Date.now()}`;
    
    if (format === 'png') {
        qrCode.download({
            name: filename,
            extension: 'png'
        });
    } else if (format === 'svg') {
        qrCode.download({
            name: filename,
            extension: 'svg'
        });
    }
}

// Utility function to check if string contains non-ASCII characters
function containsNonASCII(str) {
    return /[^\x00-\x7F]/.test(str);
}

// Utility function to encode string in QUOTED-PRINTABLE format for vCard
function encodeQuotedPrintable(str) {
    // Encode string to UTF-8 bytes and then to QUOTED-PRINTABLE
    const encoded = [];
    const utf8Encoder = new TextEncoder();
    const bytes = utf8Encoder.encode(str);
    const EQUALS_CHAR_CODE = '='.charCodeAt(0);
    
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        // Characters that must be encoded: control chars, =, and non-ASCII
        // Per RFC 2047, we encode all non-printable ASCII and non-ASCII bytes
        if (byte < 32 || byte > 126 || byte === EQUALS_CHAR_CODE) {
            encoded.push('=' + byte.toString(16).toUpperCase().padStart(2, '0'));
        } else {
            encoded.push(String.fromCharCode(byte));
        }
    }
    
    return encoded.join('');
}

// Utility function to escape and encode vCard field values
function escapeVCard(str) {
    // First escape special vCard characters
    let escaped = str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    return escaped;
}

// Utility function to format vCard field with proper encoding
function formatVCardField(fieldName, value, escapeValue = true) {
    if (!value) return '';
    
    // Escape the value if needed
    const processedValue = escapeValue ? escapeVCard(value) : value;
    
    // Check if the value contains non-ASCII characters (Korean, etc.)
    if (containsNonASCII(processedValue)) {
        // Use QUOTED-PRINTABLE encoding with UTF-8 charset for non-ASCII content
        const encoded = encodeQuotedPrintable(processedValue);
        return `${fieldName};CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encoded}\r\n`;
    } else {
        // Use plain format for ASCII-only content
        return `${fieldName}:${processedValue}\r\n`;
    }
}

// Utility function to format vCard N field with proper encoding
function formatVCardNameField(nValue, hasNonASCII) {
    if (hasNonASCII) {
        const encoded = encodeQuotedPrintable(nValue);
        return `N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encoded}\r\n`;
    } else {
        return `N:${nValue}\r\n`;
    }
}

// Utility function to escape special characters in Wi-Fi QR code
function escapeWiFi(str) {
    // Escape special characters: backslash, semicolon, comma, colon, double quote
    return str.replace(/\\/g, '\\\\')
              .replace(/;/g, '\\;')
              .replace(/,/g, '\\,')
              .replace(/:/g, '\\:')
              .replace(/"/g, '\\"');
}
