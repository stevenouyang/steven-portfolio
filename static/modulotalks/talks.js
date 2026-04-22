/**
 * ModuloTalks — UI + transport (POST init / send, GET poll). No server pipeline.
 */
(function () {
    "use strict";

    var LS_KEY = "modulotalks_ls_v1";
    var POLL_MIN_S = 5;
    var POLL_MAX_S = 60;
    var POLL_ERR_RETRY_MS = 5000;

    var state = {
        config: {},
        seen: Object.create(null),
        warned: Object.create(null),
        sinceMs: 0,
        pollTimeoutId: null,
        pollIntervalSec: POLL_MIN_S,
        mediaQuery: null,
        pendingSelfText: null,
        chatBootstrapped: false,
        bootstrapPromise: null,
        unreadCount: 0,
        composerFocused: false,
        markReadNextPoll: false,
        pendingActionKey: null,
        messageLog: [],
        satisfactionSubmitted: false,
        satisfactionPromptOpen: false,
        freshBusy: false,
        msgAnimIndex: 0,
        closeTimerId: null,
        closeBackdrop: null,
        closeBackdropEnd: null,
        themeObserver: null,
    };

    function root() {
        return document.getElementById("mt-root");
    }

    function clearCloseAnimation() {
        if (state.closeTimerId != null) {
            clearTimeout(state.closeTimerId);
            state.closeTimerId = null;
        }
        if (state.closeBackdrop && state.closeBackdropEnd) {
            state.closeBackdrop.removeEventListener("transitionend", state.closeBackdropEnd);
            state.closeBackdrop = null;
            state.closeBackdropEnd = null;
        }
    }

    function getCookie(name) {
        var m = document.cookie.match(new RegExp("(^|;)\\s*" + name + "=([^;]+)"));
        return m ? decodeURIComponent(m[2]) : "";
    }

    function getCSRFToken() {
        var token = getCookie("csrftoken");
        if (token) return token;
        var r = root();
        if (r) {
            var inp = r.querySelector('input[name="csrfmiddlewaretoken"]');
            if (inp) return inp.value;
        }
        var inp2 = document.querySelector('input[name="csrfmiddlewaretoken"]');
        return inp2 ? inp2.value : "";
    }

    function parseConfig() {
        var r = root();
        if (!r) return null;
        try {
            return JSON.parse(r.getAttribute("data-mt-config") || "{}");
        } catch (e) {
            console.warn("[mt] config JSON parse failed", e);
            return {};
        }
    }

    function getChatContext() {
        var c = state.config.chat_context;
        var base = c && typeof c === "object" ? c : {};
        try {
            var el = document.documentElement;
            var dark = !!(el && el.classList && el.classList.contains("dark"));
            /* Lets backend / LLM know real host appearance (Tailwind class strategy). */
            return Object.assign({}, base, { host_ui_theme: dark ? "dark" : "light" });
        } catch (e1) {
            return Object.assign({}, base);
        }
    }

    function contextQueryParam() {
        try {
            return encodeURIComponent(JSON.stringify(getChatContext()));
        } catch (e) {
            return encodeURIComponent("{}");
        }
    }

    function mergeLocalStorage() {
        if (!state.config.debug_widget_settings) return;
        try {
            var o = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
            if (!o || typeof o !== "object") return;
            var lock = {
                endpoint_init: 1,
                endpoint_send: 1,
                endpoint_poll: 1,
                profile_submit_url: 1,
                chat_context: 1,
                transport_mode: 1,
            };
            for (var k in o) {
                if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
                if (lock[k]) continue;
                state.config[k] = o[k];
            }
        } catch (e) { /* ignore */ }
    }

    function persistLocal() {
        if (!state.config.debug_widget_settings) return;
        var keys = [
            "theme", "theme_preset", "size", "launcher_type", "bottom_margin", "bottom_margin_breakpoint_max",
            "chat_name", "floating_button_label", "user_avatar_url", "replier_avatar_url",
            "overlay_backdrop", "primary_color", "primary_on_color", "enable_dark_light",
        ];
        var o = {};
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var v = state.config[k];
            if (v === undefined) continue;
            o[k] = v;
        }
        try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
    }

    function dbg() {
        if (!state.config.transport_debug) return;
        var a = ["[mt]"].concat([].slice.call(arguments));
        console.log.apply(console, a);
    }

    function warnOnce(key, message) {
        if (state.warned[key]) return;
        state.warned[key] = true;
        console.warn("[mt] " + message);
    }

    function applyPrimaryCssVars() {
        var r = root(); if (!r) return;
        var onc = (state.config.primary_on_color || state.config.accent_icon_color || "#ffffff");
        onc = (onc != null ? String(onc).trim() : "") || "#ffffff";
        r.style.setProperty("--mt-on-accent", onc);
        var pc = state.config.primary_color || state.config.primay_color;
        pc = pc != null ? String(pc).trim() : "";
        if (pc) r.style.setProperty("--mt-accent", pc);
        else r.style.removeProperty("--mt-accent");
    }

    function applyOverlayBackdrop() {
        var r = root(); if (!r) return;
        var mode = _safeText(state.config.overlay_backdrop || "dim_50").toLowerCase();
        if (["dim", "dim_50", "dim_blur_50", "blur_50", "none"].indexOf(mode) < 0) mode = "dim_50";
        state.config.overlay_backdrop = mode;
        r.classList.remove("mt-overlay-dim", "mt-overlay-dim-50", "mt-overlay-dim-blur-50", "mt-overlay-blur-50", "mt-overlay-none");
        if (mode === "dim") r.classList.add("mt-overlay-dim");
        else if (mode === "dim_blur_50") r.classList.add("mt-overlay-dim-blur-50");
        else if (mode === "blur_50") r.classList.add("mt-overlay-blur-50");
        else if (mode === "none") r.classList.add("mt-overlay-none");
        else r.classList.add("mt-overlay-dim-50");
    }

    function readFormIntoConfig() {
        var g = function (id) { var el = document.getElementById(id); return el ? el.value : ""; };
        state.config.chat_name = (g("mt-set-chat-name") || "").trim() || state.config.chat_name || "Chat";
        state.config.floating_button_label = g("mt-set-floating-label");
        state.config.theme = g("mt-set-theme") || state.config.theme;
        state.config.theme_preset = g("mt-set-theme-preset") || state.config.theme_preset || "classic";
        state.config.size = g("mt-set-size") || state.config.size;
        state.config.launcher_type = g("mt-set-launcher") || state.config.launcher_type;
        state.config.bottom_margin = (g("mt-set-bottom-margin") || "").trim() || state.config.bottom_margin;
        var bp = parseInt(g("mt-set-bp"), 10);
        state.config.bottom_margin_breakpoint_max = isNaN(bp) ? state.config.bottom_margin_breakpoint_max : bp;
        state.config.user_avatar_url = g("mt-set-user-av").trim();
        state.config.replier_avatar_url = g("mt-set-replier-av").trim();
        var ov = (g("mt-set-overlay") || state.config.overlay_backdrop || "dim_50").toLowerCase();
        if (["dim", "dim_50", "dim_blur_50", "blur_50", "none"].indexOf(ov) < 0) ov = "dim_50";
        state.config.overlay_backdrop = ov;
        state.config.primary_color = (g("mt-set-primary-color") || "").trim();
        var pon = (g("mt-set-primary-on-color") || "").trim();
        state.config.primary_on_color = pon || "#ffffff";
    }

    function refreshBackendSnippet() {
        var ta = document.getElementById("mt-backend-snippet"); if (!ta) return;
        var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
        var bp = parseInt(g("mt-set-bp"), 10);
        var s = function (v) { return (v == null || v === "undefined") ? "" : String(v); };
        var o = {
            chat_name: g("mt-set-chat-name") || "Chat",
            floating_button_label: g("mt-set-floating-label"),
            theme: g("mt-set-theme") || "system",
            theme_preset: g("mt-set-theme-preset") || "classic",
            size: g("mt-set-size") || "three_quarter",
            launcher_type: g("mt-set-launcher") || "floating",
            bottom_margin: g("mt-set-bottom-margin") || s(state.config.bottom_margin),
            bottom_margin_breakpoint_max: isNaN(bp) ? 640 : bp,
            user_avatar_url: g("mt-set-user-av"),
            replier_avatar_url: g("mt-set-replier-av"),
            overlay_backdrop: (function () {
                var v = (g("mt-set-overlay") || "dim_50").toLowerCase();
                return ["dim", "dim_50", "dim_blur_50", "blur_50", "none"].indexOf(v) >= 0 ? v : "dim_50";
            })(),
            primary_color: (g("mt-set-primary-color") || "").trim(),
            primary_on_color: ((g("mt-set-primary-on-color") || "").trim() || "#ffffff"),
        };
        var parts = [];
        for (var k in o) {
            if (Object.prototype.hasOwnProperty.call(o, k))
                parts.push('    "' + k + '": ' + JSON.stringify(o[k]));
        }
        ta.value = "# Display settings only — endpoints are set per-page via {% inject_chat %}\n"
            + "MODULOTALKS = {\n" + parts.join(",\n") + "\n}\n";
    }

    function applyFloatingFab() {
        var r = root(); if (!r) return;
        var fab = r.querySelector(".mt-launcher--floating"); if (!fab) return;
        var text = (state.config.floating_button_label || "").trim();
        fab.classList.toggle("mt-fab--icon-only", !text);
        fab.classList.toggle("mt-fab--text", !!text);
        var lbl = fab.querySelector(".mt-launcher__label");
        if (lbl) lbl.textContent = text;
        fab.setAttribute("aria-label", text || state.config.chat_name || "Chat");
    }

    function applyBottomOffset() {
        var r = root(); if (!r) return;
        var bp = parseInt(state.config.bottom_margin_breakpoint_max, 10) || 640;
        var mobile = window.innerWidth <= bp;
        r.style.setProperty("--mt-launch-offset", mobile ? (state.config.bottom_margin || "1.25rem") : "1.25rem");
    }

    function applyTheme() {
        var r = root(); if (!r) return;
        var t = state.config.theme || "system";
        var hostMode = "";
        if (state.config.enable_dark_light) {
            var de = document.documentElement;
            var body = document.body;
            var isDark = function (el) {
                if (!el) return false;
                var c = el.classList;
                return c && (c.contains("dark") || c.contains("theme-dark") || c.contains("dark-mode"));
            };
            if (isDark(de) || isDark(body)) hostMode = "dark";
            else {
                var dt = (de && (de.getAttribute("data-theme") || de.getAttribute("data-bs-theme") || de.dataset.theme)) || "";
                var bt = (body && (body.getAttribute("data-theme") || body.getAttribute("data-bs-theme") || body.dataset.theme)) || "";
                var raw = _safeText(dt || bt).toLowerCase();
                if (raw === "dark") hostMode = "dark";
                else if (raw === "light") hostMode = "light";
            }
        }
        r.classList.remove("mt-theme-light", "mt-theme-dark");
        /* Explicit light/dark from config (e.g. modulotalks.theme event) wins over host sync */
        if (t === "light") r.classList.add("mt-theme-light");
        else if (t === "dark") r.classList.add("mt-theme-dark");
        else if (hostMode) r.classList.add(hostMode === "dark" ? "mt-theme-dark" : "mt-theme-light");
        else {
            var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            r.classList.add(dark ? "mt-theme-dark" : "mt-theme-light");
        }
    }

    function applyThemePreset() {
        var r = root(); if (!r) return;
        var p = _safeText(state.config.theme_preset || "classic").toLowerCase();
        if (["classic", "glassy", "neo_noir", "warm_paper", "aurora_glow", "minimal_frame", "bubblegum", "liquid_glass", "terminal_green", "brutalist_card", "cyber_grid", "sunset_frost", "monochrome_ink", "retro_arcade", "ocean_depth", "carton", "soft_pastel"].indexOf(p) < 0) p = "classic";
        state.config.theme_preset = p;
        r.classList.remove(
            "mt-preset-classic",
            "mt-preset-glassy",
            "mt-preset-neo-noir",
            "mt-preset-warm-paper",
            "mt-preset-aurora-glow",
            "mt-preset-minimal-frame",
            "mt-preset-bubblegum",
            "mt-preset-liquid-glass",
            "mt-preset-terminal-green",
            "mt-preset-brutalist-card",
            "mt-preset-cyber-grid",
            "mt-preset-sunset-frost",
            "mt-preset-monochrome-ink",
            "mt-preset-retro-arcade",
            "mt-preset-ocean-depth",
            "mt-preset-carton",
            "mt-preset-soft-pastel"
        );
        if (p === "glassy") r.classList.add("mt-preset-glassy");
        else if (p === "neo_noir") r.classList.add("mt-preset-neo-noir");
        else if (p === "warm_paper") r.classList.add("mt-preset-warm-paper");
        else if (p === "aurora_glow") r.classList.add("mt-preset-aurora-glow");
        else if (p === "minimal_frame") r.classList.add("mt-preset-minimal-frame");
        else if (p === "bubblegum") r.classList.add("mt-preset-bubblegum");
        else if (p === "liquid_glass") r.classList.add("mt-preset-liquid-glass");
        else if (p === "terminal_green") r.classList.add("mt-preset-terminal-green");
        else if (p === "brutalist_card") r.classList.add("mt-preset-brutalist-card");
        else if (p === "cyber_grid") r.classList.add("mt-preset-cyber-grid");
        else if (p === "sunset_frost") r.classList.add("mt-preset-sunset-frost");
        else if (p === "monochrome_ink") r.classList.add("mt-preset-monochrome-ink");
        else if (p === "retro_arcade") r.classList.add("mt-preset-retro-arcade");
        else if (p === "ocean_depth") r.classList.add("mt-preset-ocean-depth");
        else if (p === "carton") r.classList.add("mt-preset-carton");
        else if (p === "soft_pastel") r.classList.add("mt-preset-soft-pastel");
        else r.classList.add("mt-preset-classic");
    }

    function bindSystemTheme() {
        if (state.themeObserver) {
            state.themeObserver.disconnect();
            state.themeObserver = null;
        }
        if (state.mediaQuery && state.mediaQuery.removeEventListener)
            state.mediaQuery.removeEventListener("change", applyTheme);
        state.mediaQuery = null;
        if (state.config.enable_dark_light) {
            if (window.MutationObserver) {
                state.themeObserver = new MutationObserver(function () { applyTheme(); });
                var opts = { attributes: true, attributeFilter: ["class", "data-theme", "data-bs-theme"] };
                if (document.documentElement) state.themeObserver.observe(document.documentElement, opts);
                if (document.body) state.themeObserver.observe(document.body, opts);
            }
            return;
        }
        if ((state.config.theme || "system") !== "system") return;
        state.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (state.mediaQuery && state.mediaQuery.addEventListener)
            state.mediaQuery.addEventListener("change", applyTheme);
    }

    function applyLauncherType() {
        var r = root(); if (!r) return;
        var lt = state.config.launcher_type || "floating";
        var fab = r.querySelector(".mt-launcher--floating");
        var bar = r.querySelector(".mt-launcher--chat-bar");
        if (fab) fab.hidden = lt !== "floating";
        if (bar) bar.hidden = lt !== "chat_bar";
        r.classList.toggle("mt-root--uses-bar", lt === "chat_bar");
        var label = bar && bar.querySelector(".mt-chat-bar__label");
        if (label) label.textContent = state.config.chat_name || "Chat";
        applyFloatingFab();
    }

    function applySize() {
        var r = root(); if (!r) return;
        r.classList.toggle("mt-size-full", (state.config.size || "three_quarter") === "fullscreen");
    }

    function applyDisableChat() {
        var r = root(); if (!r) return;
        var dis = state.config.unauthenticated_mode === "disable_chat";
        r.classList.toggle("mt-disabled", dis);
        var ta = document.getElementById("mt-input");
        var comp = document.getElementById("mt-composer");
        if (ta) ta.disabled = dis;
        if (comp) comp.classList.toggle("mt-composer--disabled", dis);
        if (dis) stopAdaptivePoll();
    }

    function applyAll() {
        applyOverlayBackdrop();
        applyBottomOffset();
        applyTheme();
        applyThemePreset();
        applyPrimaryCssVars();
        bindSystemTheme();
        applyLauncherType();
        applySize();
        applyDisableChat();
        renderHeaderActions();
        var ta = document.getElementById("mt-input");
        if (ta) ta.placeholder = state.config.placeholder || "";
    }

    function getSatisfactionChoices() {
        var arr = Array.isArray(state.config.satisfaction_choices) ? state.config.satisfaction_choices : [];
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            var item = _toObject(arr[i]);
            var id = _safeText(item.id).trim();
            if (!id) continue;
            out.push({
                id: id,
                label: _safeText(item.label || id),
                emoji: _safeText(item.emoji || ""),
            });
        }
        if (!out.length) {
            out = [
                { id: "happy", label: "Satisfied", emoji: "😄" },
                { id: "neutral", label: "Neutral", emoji: "😐" },
                { id: "unhappy", label: "Poor", emoji: "🙁" },
            ];
        }
        return out;
    }

    function renderHeaderActions() {
        var endBtn = document.getElementById("mt-end-chat-btn");
        var freshBtn = document.getElementById("mt-start-fresh-btn");
        if (endBtn) {
            endBtn.hidden = !state.config.end_chat_enabled;
            endBtn.textContent = _safeText(state.config.end_chat_label || "End chat");
        }
        if (freshBtn) {
            freshBtn.hidden = !state.config.start_fresh_enabled;
            freshBtn.textContent = _safeText(state.config.start_fresh_label || "Start fresh");
        }
    }

    function ratingPromptMessage() {
        return {
            type: "rating",
            content: {
                title: _safeText(state.config.satisfaction_title || "How was your chat experience?"),
                subtitle: _safeText(state.config.satisfaction_subtitle || ""),
                choices: getSatisfactionChoices(),
            },
        };
    }

    function messagesEl() { return document.getElementById("mt-messages"); }

    function scrollToBottom() {
        var box = messagesEl();
        if (box) box.scrollTop = box.scrollHeight;
    }

    function msgKey(m) {
        if (m && m.id) return String(m.id);
        var contentKey = "";
        try {
            contentKey = JSON.stringify(m && m.content ? m.content : {});
        } catch (e) {
            contentKey = "";
        }
        return (m.timestamp_ms || 0) + "|" + (m.sender_name || "") + "|" + (m.type || "text") + "|" + (m.message || "").slice(0, 120) + "|" + contentKey.slice(0, 120);
    }

    function clearRenderedMessages() {
        var box = messagesEl();
        if (!box) return;
        var typing = document.getElementById("mt-typing");
        var ch = [].slice.call(box.children);
        for (var i = 0; i < ch.length; i++) {
            if (ch[i] !== typing) box.removeChild(ch[i]);
        }
    }

    function _safeText(v) {
        return v == null ? "" : String(v);
    }

    function _toObject(v) {
        return v && typeof v === "object" ? v : {};
    }

    function normalizeMessage(m) {
        var obj = _toObject(m);
        var type = _safeText(obj.type || "text").toLowerCase();
        var content = _toObject(obj.content);
        var meta = _toObject(obj.meta);
        var text = _safeText(obj.message);
        if (type === "text") {
            if (!text) text = _safeText(content.text);
            content = { text: text };
        }
        return {
            id: obj.id || "",
            sender_name: _safeText(obj.sender_name),
            message: text,
            timestamp_ms: Number(obj.timestamp_ms || 0),
            is_self: !!obj.is_self,
            type: type,
            content: content,
            meta: meta,
        };
    }

    function _buildAvatar(isSelf, senderName) {
        var av = document.createElement("div");
        av.className = "mt-msg__avatar";
        var raw = isSelf ? (state.config.user_avatar_url || "") : (state.config.replier_avatar_url || "");
        raw = (raw && String(raw).trim()) || "";
        if (raw === "undefined" || raw === "null") raw = "";
        var okUrl = raw && /^(https?:|\/|data:)/i.test(raw);
        if (!okUrl) {
            av.classList.add("mt-msg__avatar--placeholder");
            av.textContent = (isSelf ? "Y" : (senderName || "?").charAt(0)).toUpperCase();
        } else {
            var img = document.createElement("img");
            img.alt = "";
            img.src = raw;
            av.appendChild(img);
        }
        return av;
    }

    function _appendTextBubble(col, text) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble";
        var inner = document.createElement("div");
        inner.className = "mt-msg__text";
        inner.textContent = _safeText(text);
        bubble.appendChild(inner);
        col.appendChild(bubble);
    }

    function _appendMetaBadge(col, meta) {
        var m = _toObject(meta);
        var source = _safeText(m.fallback_source || "");
        if (!source) return;
        var chip = document.createElement("div");
        chip.className = "mt-meta-chip";
        chip.textContent = "fallback: " + source;
        col.appendChild(chip);
    }

    function _appendOptions(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble";
        if (content.text) {
            var txt = document.createElement("div");
            txt.className = "mt-msg__text";
            txt.textContent = _safeText(content.text);
            bubble.appendChild(txt);
        }
        var row = document.createElement("div");
        row.className = "mt-rich-options";
        var buttons = Array.isArray(content.buttons) ? content.buttons : [];
        for (var i = 0; i < buttons.length; i++) {
            var btnData = _toObject(buttons[i]);
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mt-rich-option-btn";
            btn.textContent = _safeText(btnData.label || btnData.action_id || "Action");
            btn.setAttribute("data-mt-action-id", _safeText(btnData.action_id || ""));
            btn.setAttribute("data-mt-action-value", _safeText(btnData.value || ""));
            btn.setAttribute("data-mt-action-source", "options");
            btn.setAttribute("data-mt-action-label", btn.textContent);
            btn.setAttribute("data-mt-action-payload", JSON.stringify(_toObject(btnData.payload)));
            row.appendChild(btn);
        }
        bubble.appendChild(row);
        col.appendChild(bubble);
    }

    function _appendCardList(col, content, kind) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        if (content.title) {
            var title = document.createElement("div");
            title.className = "mt-rich-title";
            title.textContent = _safeText(content.title);
            bubble.appendChild(title);
        }
        var items = Array.isArray(content.items) ? content.items : [];
        for (var i = 0; i < items.length; i++) {
            var it = _toObject(items[i]);
            var card = document.createElement("div");
            card.className = "mt-rich-card";
            if (it.image_url) {
                var img = document.createElement("img");
                img.className = "mt-rich-card__image";
                img.src = _safeText(it.image_url);
                img.alt = "";
                card.appendChild(img);
            }
            var body = document.createElement("div");
            body.className = "mt-rich-card__body";
            var h = document.createElement("div");
            h.className = "mt-rich-card__title";
            h.textContent = _safeText(it.title || it.id || "Item");
            body.appendChild(h);
            if (it.description) {
                var d = document.createElement("div");
                d.className = "mt-rich-card__desc";
                d.textContent = _safeText(it.description);
                body.appendChild(d);
            }
            var actions = document.createElement("div");
            actions.className = "mt-rich-card__actions";
            if (it.link_url) {
                var a = document.createElement("a");
                a.href = _safeText(it.link_url);
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.className = "mt-rich-link";
                a.textContent = _safeText(it.cta_label || "Open link");
                a.setAttribute("data-mt-action-id", _safeText(it.action_id || "link_open"));
                a.setAttribute("data-mt-action-value", _safeText(it.value || it.id || ""));
                a.setAttribute("data-mt-action-source", kind + "_link");
                a.setAttribute("data-mt-action-label", a.textContent);
                a.setAttribute("data-mt-link-url", _safeText(it.link_url));
                a.setAttribute("data-mt-action-payload", JSON.stringify(_toObject(it.payload)));
                actions.appendChild(a);
            }
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mt-rich-option-btn";
            btn.textContent = _safeText(it.cta_label || "Select");
            btn.setAttribute("data-mt-action-id", _safeText(it.action_id || (kind === "campaign_list" ? "campaign_open" : "product_open")));
            btn.setAttribute("data-mt-action-value", _safeText(it.value || it.id || ""));
            btn.setAttribute("data-mt-action-source", kind + "_button");
            btn.setAttribute("data-mt-action-label", btn.textContent);
            btn.setAttribute("data-mt-action-payload", JSON.stringify(_toObject(it.payload)));
            actions.appendChild(btn);
            body.appendChild(actions);
            card.appendChild(body);
            bubble.appendChild(card);
        }
        col.appendChild(bubble);
    }

    function _appendLinkCard(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        var card = document.createElement("div");
        card.className = "mt-rich-card";
        if (content.image_url) {
            var img = document.createElement("img");
            img.className = "mt-rich-card__image";
            img.src = _safeText(content.image_url);
            img.alt = "";
            card.appendChild(img);
        }
        var body = document.createElement("div");
        body.className = "mt-rich-card__body";
        var title = document.createElement("div");
        title.className = "mt-rich-card__title";
        title.textContent = _safeText(content.title || "Link");
        body.appendChild(title);
        if (content.description) {
            var desc = document.createElement("div");
            desc.className = "mt-rich-card__desc";
            desc.textContent = _safeText(content.description);
            body.appendChild(desc);
        }
        if (content.link_url) {
            var a = document.createElement("a");
            a.href = _safeText(content.link_url);
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "mt-rich-link";
            a.textContent = "Open link";
            a.setAttribute("data-mt-action-id", _safeText(content.action_id || "link_open"));
            a.setAttribute("data-mt-action-value", _safeText(content.link_url || ""));
            a.setAttribute("data-mt-action-source", "link_card");
            a.setAttribute("data-mt-action-label", "Open link");
            a.setAttribute("data-mt-link-url", _safeText(content.link_url));
            a.setAttribute("data-mt-action-payload", JSON.stringify({ link_url: _safeText(content.link_url) }));
            body.appendChild(a);
        }
        card.appendChild(body);
        bubble.appendChild(card);
        col.appendChild(bubble);
    }

    function _appendImageMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        var imgUrl = _safeText(content.url || content.image_url);
        if (imgUrl) {
            var img = document.createElement("img");
            img.className = "mt-rich-card__image";
            img.src = imgUrl;
            img.alt = _safeText(content.alt || content.caption || "");
            bubble.appendChild(img);
        }
        if (content.caption) {
            var cap = document.createElement("div");
            cap.className = "mt-rich-card__desc";
            cap.textContent = _safeText(content.caption);
            bubble.appendChild(cap);
        }
        col.appendChild(bubble);
    }

    function _fmtSize(bytes) {
        var n = Number(bytes || 0);
        if (!n || n < 0 || isNaN(n)) return "";
        if (n < 1024) return n + " B";
        if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
        if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + " MB";
        return (n / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }

    function _appendFileMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        var wrap = document.createElement("div");
        wrap.className = "mt-rich-card";
        var body = document.createElement("div");
        body.className = "mt-rich-card__body";
        var title = document.createElement("div");
        title.className = "mt-rich-card__title";
        title.textContent = _safeText(content.file_name || "Attachment");
        body.appendChild(title);
        var meta = [];
        if (content.mime_type) meta.push(_safeText(content.mime_type));
        var size = _fmtSize(content.size_bytes);
        if (size) meta.push(size);
        if (meta.length) {
            var desc = document.createElement("div");
            desc.className = "mt-rich-card__desc";
            desc.textContent = meta.join(" • ");
            body.appendChild(desc);
        }
        if (content.file_url) {
            var a = document.createElement("a");
            a.href = _safeText(content.file_url);
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "mt-rich-link";
            a.textContent = "Download file";
            body.appendChild(a);
        }
        wrap.appendChild(body);
        bubble.appendChild(wrap);
        col.appendChild(bubble);
    }

    function _appendTableMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        if (content.title) {
            var title = document.createElement("div");
            title.className = "mt-rich-title";
            title.textContent = _safeText(content.title);
            bubble.appendChild(title);
        }
        var columns = Array.isArray(content.columns) ? content.columns : [];
        var rows = Array.isArray(content.rows) ? content.rows : [];
        var tableWrap = document.createElement("div");
        tableWrap.style.overflowX = "auto";
        var table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        if (columns.length) {
            var thead = document.createElement("thead");
            var trh = document.createElement("tr");
            for (var ci = 0; ci < columns.length; ci++) {
                var th = document.createElement("th");
                th.textContent = _safeText(columns[ci]);
                th.style.textAlign = "left";
                th.style.fontWeight = "600";
                th.style.fontSize = "12px";
                th.style.padding = "6px";
                trh.appendChild(th);
            }
            thead.appendChild(trh);
            table.appendChild(thead);
        }
        var tbody = document.createElement("tbody");
        for (var ri = 0; ri < rows.length; ri++) {
            var row = Array.isArray(rows[ri]) ? rows[ri] : [];
            var tr = document.createElement("tr");
            for (var cj = 0; cj < row.length; cj++) {
                var td = document.createElement("td");
                td.textContent = _safeText(row[cj]);
                td.style.padding = "6px";
                td.style.fontSize = "12px";
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        bubble.appendChild(tableWrap);
        col.appendChild(bubble);
    }

    function _appendTimelineMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        if (content.title) {
            var title = document.createElement("div");
            title.className = "mt-rich-title";
            title.textContent = _safeText(content.title);
            bubble.appendChild(title);
        }
        var items = Array.isArray(content.items) ? content.items : [];
        for (var i = 0; i < items.length; i++) {
            var it = _toObject(items[i]);
            var line = document.createElement("div");
            line.style.display = "flex";
            line.style.gap = "8px";
            line.style.margin = "6px 0";
            var tm = document.createElement("div");
            tm.style.fontSize = "12px";
            tm.style.opacity = ".7";
            tm.style.minWidth = "42px";
            tm.textContent = _safeText(it.time || "");
            var lb = document.createElement("div");
            lb.style.fontSize = "13px";
            lb.textContent = _safeText(it.label || "");
            line.appendChild(tm);
            line.appendChild(lb);
            bubble.appendChild(line);
        }
        col.appendChild(bubble);
    }

    function _appendChartMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        if (content.title) {
            var title = document.createElement("div");
            title.className = "mt-rich-title";
            title.textContent = _safeText(content.title);
            bubble.appendChild(title);
        }
        var labels = Array.isArray(content.labels) ? content.labels : [];
        var values = Array.isArray(content.values) ? content.values : [];
        var max = 0;
        for (var i = 0; i < values.length; i++) {
            var v = Number(values[i] || 0);
            if (!isNaN(v) && v > max) max = v;
        }
        if (!max) max = 1;
        for (var j = 0; j < Math.max(labels.length, values.length); j++) {
            var row = document.createElement("div");
            row.style.display = "grid";
            row.style.gridTemplateColumns = "80px 1fr auto";
            row.style.alignItems = "center";
            row.style.gap = "8px";
            row.style.margin = "6px 0";
            var l = document.createElement("div");
            l.style.fontSize = "12px";
            l.textContent = _safeText(labels[j] || ("Item " + (j + 1)));
            var barWrap = document.createElement("div");
            barWrap.style.height = "8px";
            barWrap.style.borderRadius = "999px";
            barWrap.style.background = "rgba(127,127,127,.25)";
            var bar = document.createElement("div");
            var raw = Number(values[j] || 0);
            var val = isNaN(raw) ? 0 : raw;
            var pct = Math.max(0, Math.min(100, (Math.abs(val) / max) * 100));
            bar.style.height = "100%";
            bar.style.width = pct + "%";
            bar.style.borderRadius = "999px";
            bar.style.background = "var(--mt-accent)";
            barWrap.appendChild(bar);
            var n = document.createElement("div");
            n.style.fontSize = "12px";
            n.textContent = String(val);
            row.appendChild(l);
            row.appendChild(barWrap);
            row.appendChild(n);
            bubble.appendChild(row);
        }
        col.appendChild(bubble);
    }

    function _appendFormMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        if (content.title) {
            var title = document.createElement("div");
            title.className = "mt-rich-title";
            title.textContent = _safeText(content.title);
            bubble.appendChild(title);
        }
        var formId = _safeText(content.form_id || "form_" + Date.now());
        var fields = Array.isArray(content.fields) ? content.fields : [];
        var container = document.createElement("div");
        container.className = "mt-rich-form";
        container.setAttribute("data-mt-form-id", formId);
        for (var i = 0; i < fields.length; i++) {
            var f = _toObject(fields[i]);
            var kind = _safeText(f.kind || "text").toLowerCase();
            var name = _safeText(f.name || ("field_" + i));
            var label = document.createElement("label");
            label.className = "mt-rich-form__field";
            var cap = document.createElement("div");
            cap.className = "mt-rich-form__label";
            cap.textContent = _safeText(f.label || name);
            label.appendChild(cap);
            var input;
            if (kind === "textarea") {
                input = document.createElement("textarea");
                input.rows = 2;
                input.className = "mt-rich-form__control mt-rich-form__control--textarea";
            } else if (kind === "select") {
                input = document.createElement("select");
                input.className = "mt-rich-form__control mt-rich-form__control--select";
                var opts = Array.isArray(f.options) ? f.options : [];
                for (var oi = 0; oi < opts.length; oi++) {
                    var ov = _toObject(opts[oi]);
                    var opt = document.createElement("option");
                    opt.value = _safeText(ov.value || ov.id || "");
                    opt.textContent = _safeText(ov.label || ov.value || ("Option " + (oi + 1)));
                    input.appendChild(opt);
                }
            } else {
                input = document.createElement("input");
                input.type = ["number", "date", "email", "tel", "url", "checkbox"].indexOf(kind) >= 0 ? kind : "text";
                input.className = "mt-rich-form__control";
                if (input.type === "checkbox") input.classList.add("mt-rich-form__control--checkbox");
            }
            input.setAttribute("data-mt-form-field", name);
            if (f.required) input.setAttribute("data-mt-form-required", "1");
            if (f.placeholder && input.placeholder !== undefined) input.placeholder = _safeText(f.placeholder);
            if (f.default != null) {
                if (input.type === "checkbox") input.checked = !!f.default;
                else input.value = _safeText(f.default);
            }
            label.appendChild(input);
            var hint = _safeText(f.help_text || "");
            if (hint) {
                var hintEl = document.createElement("div");
                hintEl.className = "mt-rich-form__hint";
                hintEl.textContent = hint;
                label.appendChild(hintEl);
            }
            container.appendChild(label);
        }
        var submit = document.createElement("button");
        submit.type = "button";
        submit.className = "mt-rich-form__submit";
        submit.textContent = _safeText(content.submit_label || "Submit");
        submit.setAttribute("data-mt-form-submit", "1");
        submit.setAttribute("data-mt-form-id", formId);
        submit.setAttribute("data-mt-submit-action-id", _safeText(content.submit_action_id || "form_submit"));
        container.appendChild(submit);
        bubble.appendChild(container);
        col.appendChild(bubble);
    }

    function _appendRatingMessage(col, content) {
        var bubble = document.createElement("div");
        bubble.className = "mt-msg__bubble mt-msg__bubble--rich";
        var card = document.createElement("div");
        card.className = "mt-rating-card";
        if (content.title) {
            var title = document.createElement("div");
            title.className = "mt-satisfaction__title";
            title.textContent = _safeText(content.title);
            card.appendChild(title);
        }
        if (content.subtitle) {
            var subtitle = document.createElement("div");
            subtitle.className = "mt-satisfaction__subtitle";
            subtitle.textContent = _safeText(content.subtitle);
            card.appendChild(subtitle);
        }
        var row = document.createElement("div");
        row.className = "mt-satisfaction__options";
        var choices = Array.isArray(content.choices) ? content.choices : [];
        for (var i = 0; i < choices.length; i++) {
            var c = _toObject(choices[i]);
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mt-satisfaction__choice";
            btn.setAttribute("data-mt-rating-id", _safeText(c.id));
            btn.setAttribute("data-mt-rating-label", _safeText(c.label || c.id));
            var emoji = document.createElement("span");
            emoji.className = "mt-satisfaction__emoji";
            emoji.textContent = _safeText(c.emoji || "");
            var label = document.createElement("span");
            label.className = "mt-satisfaction__label";
            label.textContent = _safeText(c.label || c.id);
            btn.appendChild(emoji);
            btn.appendChild(label);
            row.appendChild(btn);
        }
        card.appendChild(row);
        bubble.appendChild(card);
        col.appendChild(bubble);
    }

    function appendMessage(message) {
        var m = normalizeMessage(message);
        var isSelf = !!m.is_self;
        var senderName = m.sender_name || "";
        var box = messagesEl();
        if (!box) { dbg("appendBubble: #mt-messages not found, skip"); return; }
        var typing = document.getElementById("mt-typing");
        var wrap = document.createElement("div");
        wrap.className = "mt-msg mt-msg--" + (isSelf ? "user" : "other") + " mt-msg--type-" + m.type;
        wrap.classList.add("mt-msg--enter");
        wrap.style.setProperty("--mt-enter-delay", String(Math.min(state.msgAnimIndex, 5) * 26) + "ms");
        state.msgAnimIndex += 1;

        var av = _buildAvatar(isSelf, senderName);

        var col = document.createElement("div");
        col.className = "mt-msg__col";
        if (!isSelf && senderName) {
            var who = document.createElement("div");
            who.className = "mt-msg__sender";
            who.textContent = senderName;
            col.appendChild(who);
        }
        if (m.type === "options") _appendOptions(col, m.content);
        else if (m.type === "product_list") _appendCardList(col, m.content, "product_list");
        else if (m.type === "campaign_list") _appendCardList(col, m.content, "campaign_list");
        else if (m.type === "link_card") _appendLinkCard(col, m.content);
        else if (m.type === "image") _appendImageMessage(col, m.content);
        else if (m.type === "file") _appendFileMessage(col, m.content);
        else if (m.type === "form") _appendFormMessage(col, m.content);
        else if (m.type === "table") _appendTableMessage(col, m.content);
        else if (m.type === "timeline") _appendTimelineMessage(col, m.content);
        else if (m.type === "chart") _appendChartMessage(col, m.content);
        else if (m.type === "rating") _appendRatingMessage(col, m.content);
        else if (m.type === "action") _appendTextBubble(col, m.content.label || m.message || ("Action: " + _safeText(m.content.action_id)));
        else _appendTextBubble(col, m.message || m.content.text || "");
        if (!isSelf) _appendMetaBadge(col, m.meta);
        if (isSelf) { wrap.appendChild(col); wrap.appendChild(av); }
        else { wrap.appendChild(av); wrap.appendChild(col); }
        if (typing && typing.parentNode === box) box.insertBefore(wrap, typing);
        else box.appendChild(wrap);
        scrollToBottom();
    }

    function triggerRatingCelebration(node) {
        if (!node) return;
        node.classList.add("mt-satisfaction__choice--selected");
        var emojiNode = node.querySelector(".mt-satisfaction__emoji");
        var burstEmoji = emojiNode ? (emojiNode.textContent || "✨") : "✨";
        for (var i = 0; i < 7; i++) {
            var part = document.createElement("span");
            part.className = "mt-rating-burst";
            part.textContent = burstEmoji;
            part.style.setProperty("--mt-burst-x", String((Math.random() * 2 - 1) * 48) + "px");
            part.style.setProperty("--mt-burst-y", String(-18 - Math.random() * 34) + "px");
            part.style.setProperty("--mt-burst-delay", String(i * 25) + "ms");
            node.appendChild(part);
            setTimeout((function (el) {
                return function () {
                    if (el && el.parentNode) el.parentNode.removeChild(el);
                };
            })(part), 780);
        }
    }

    function advanceSince(ms) {
        if (ms && ms > state.sinceMs) {
            state.sinceMs = ms;
            dbg("sinceMs →", ms);
        }
    }

    function ingestPollMessage(m) {
        var norm = normalizeMessage(m);
        var k = msgKey(norm);
        if (state.seen[k]) return false;
        state.seen[k] = true;
        state.messageLog.push(norm);
        advanceSince(norm.timestamp_ms);
        if (
            norm.is_self &&
            state.pendingSelfText != null &&
            norm.type === "text" &&
            (norm.message || "") === state.pendingSelfText
        ) {
            state.pendingSelfText = null;
            dbg("poll: skipped own echo (already shown optimistically)");
            /* No new UI for user — do not reset adaptive poll to fast interval. */
            return false;
        }
        appendMessage(norm);
        return true;
    }

    function ingestMessageList(arr) {
        if (!arr || !arr.length) return;
        for (var i = 0; i < arr.length; i++) ingestPollMessage(arr[i]);
    }

    function maxTimestampMs(arr) {
        var m = 0;
        if (!arr) return m;
        for (var i = 0; i < arr.length; i++) {
            var t = arr[i].timestamp_ms || 0;
            if (t > m) m = t;
        }
        return m;
    }

    function applyUnreadFromPayload(j) {
        if (j && typeof j.unread_count === "number" && !isNaN(j.unread_count)) {
            state.unreadCount = j.unread_count;
        }
        /* Always refresh FAB / bar / header (e.g. after init hydration). */
        updateBadges();
    }

    function applyDisabledFromPayload(j) {
        if (j && j.disabled) {
            state.config.unauthenticated_mode = "disable_chat";
            applyDisableChat();
        }
    }

    function updateBadges() {
        var r = root();
        if (!r) return;
        var n = state.unreadCount || 0;
        var open = r.classList.contains("mt-open");
        var fabSlot = document.getElementById("mt-badge-fab-slot");
        var fabB = document.getElementById("mt-badge-fab");
        var barB = document.getElementById("mt-badge-bar");
        var barSlot = document.getElementById("mt-badge-bar-slot");
        var headB = document.getElementById("mt-badge-header");

        var showLauncher = n > 0 && !open;
        var countStr = n > 0 ? String(n) : "";

        if (fabB) {
            fabB.textContent = countStr;
            fabB.removeAttribute("hidden");
        }
        if (fabSlot) {
            fabSlot.hidden = !showLauncher;
            fabSlot.setAttribute("aria-hidden", showLauncher ? "false" : "true");
        }
        if (barB) {
            barB.textContent = countStr;
            barB.removeAttribute("hidden");
            barB.setAttribute("aria-hidden", showLauncher ? "false" : "true");
        }
        if (barSlot) {
            barSlot.hidden = !showLauncher;
            barSlot.setAttribute("aria-hidden", showLauncher ? "false" : "true");
        }

        /* Header: oval bubble with number after title; slot keeps width when open + count 0 */
        var showHeaderCount = open && n > 0 && !state.composerFocused;
        if (headB) {
            if (showHeaderCount) {
                headB.textContent = countStr;
                headB.classList.remove("mt-badge--inactive");
                headB.setAttribute("aria-hidden", "false");
            } else {
                headB.textContent = "";
                headB.classList.add("mt-badge--inactive");
                headB.setAttribute("aria-hidden", "true");
            }
        }
    }

    function showTyping() {
        var el = document.getElementById("mt-typing");
        var box = messagesEl();
        if (!el || !box) return;
        el.hidden = false;
        box.appendChild(el);
        scrollToBottom();
    }

    function hideTyping() {
        var el = document.getElementById("mt-typing");
        if (el) el.hidden = true;
    }

    function isStrictMode() {
        return (state.config.transport_mode || "flexible") === "strict";
    }

    function stopAdaptivePoll() {
        if (state.pollTimeoutId) {
            clearTimeout(state.pollTimeoutId);
            state.pollTimeoutId = null;
        }
    }

    function scheduleNextPoll(delayMs) {
        stopAdaptivePoll();
        state.pollTimeoutId = setTimeout(runPollTick, delayMs);
    }

    function runPollTick() {
        state.pollTimeoutId = null;
        if (!state.chatBootstrapped || state.config.unauthenticated_mode === "disable_chat") return;
        pollOnce({ readFlag: state.markReadNextPoll })
            .then(function (res) {
                if (!state.chatBootstrapped) return;
                if (res && res.error) {
                    scheduleNextPoll(POLL_ERR_RETRY_MS);
                    return;
                }
                if (res && res.changed) state.pollIntervalSec = POLL_MIN_S;
                else if (res && res.ok) state.pollIntervalSec = Math.min(state.pollIntervalSec + 1, POLL_MAX_S);
                scheduleNextPoll(state.pollIntervalSec * 1000);
            });
    }

    function startAdaptivePoll() {
        if (!state.config.endpoint_poll) { dbg("poll: no endpoint_poll"); return; }
        stopAdaptivePoll();
        state.pollIntervalSec = POLL_MIN_S;
        scheduleNextPoll(0);
    }

    function pollOnce(opts) {
        opts = opts || {};
        var url = state.config.endpoint_poll;
        if (!url) return Promise.resolve(null);
        var wantRead = !!(opts.readFlag || state.markReadNextPoll);
        var readPart = wantRead ? "&read=1" : "";
        if (wantRead) state.markReadNextPoll = false;
        var snapUnread = state.unreadCount;
        var u = url + (url.indexOf("?") >= 0 ? "&" : "?")
            + "since=" + encodeURIComponent(String(state.sinceMs))
            + "&context=" + contextQueryParam()
            + readPart;
        return fetch(u, { credentials: "same-origin" })
            .then(function (r) {
                return r.text().then(function (text) {
                    if (!r.ok) {
                        console.warn("[mt] poll HTTP " + r.status, u, text.slice(0, 300));
                        return { _error: true };
                    }
                    try { return JSON.parse(text); }
                    catch (e) { console.warn("[mt] poll JSON fail", u, text.slice(0, 300)); return { _error: true }; }
                });
            })
            .then(function (j) {
                if (!j || j._error) return { error: true };
                applyDisabledFromPayload(j);
                var arr = j.messages || [];
                var rawU = j.unread_count;
                var unreadChanged = typeof rawU === "number" && !isNaN(rawU) && rawU !== snapUnread;
                var applied = 0;
                for (var pi = 0; pi < arr.length; pi++) {
                    if (ingestPollMessage(arr[pi])) applied++;
                }
                applyUnreadFromPayload(j);
                processServerEvents(j.events);
                /* Only duplicates in `arr` → no backoff reset (server may repeat same window). */
                var changed = applied > 0 || unreadChanged;
                dbg("poll got", arr.length, "msg(s)", applied, "applied unread=", state.unreadCount, "changed=", changed);
                return { ok: true, changed: changed };
            })
            .catch(function (e) {
                console.warn("[mt] poll error", u, e);
                return { error: true };
            });
    }

    function postJson(url, body) {
        var csrf = getCSRFToken();
        dbg("POST", url, "csrf=" + (csrf ? csrf.slice(0, 8) + "…" : "MISSING"));
        return fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
            body: JSON.stringify(body),
        }).then(function (r) {
            return r.text().then(function (text) {
                if (!r.ok) {
                    console.warn("[mt] POST " + r.status, url, text.slice(0, 300));
                    return { status: "error", _httpStatus: r.status };
                }
                try { var jo = JSON.parse(text); dbg("POST ok", url, jo); return jo; }
                catch (e) { console.warn("[mt] POST response not JSON", url, text.slice(0, 300)); return {}; }
            });
        });
    }

    function getReactorRuntime() {
        if (window.ModuloReactor && typeof window.ModuloReactor.processEvents === "function") {
            return window.ModuloReactor;
        }
        if (window.FrontBoil && typeof window.FrontBoil.processEvents === "function") {
            return window.FrontBoil;
        }
        return null;
    }

    function dispatchEventsToReactor(events) {
        var runtime = getReactorRuntime();
        if (!runtime) {
            warnOnce("reactor-runtime-missing", "reactor runtime not found; events skipped");
            return;
        }
        runtime.processEvents(events);
    }

    function _safeThemeMode(raw) {
        var mode = _safeText(raw || "system").toLowerCase();
        if (mode !== "light" && mode !== "dark" && mode !== "system") mode = "system";
        return mode;
    }

    function setThemeRuntime(mode, opts) {
        opts = opts || {};
        state.config.theme = _safeThemeMode(mode);
        applyTheme();
        bindSystemTheme();
        if (opts.persist && state.config.debug_widget_settings) persistLocal();
        var title = document.getElementById("mt-header-title");
        if (title) title.textContent = state.config.chat_name || "Chat";
        dbg("theme runtime set", state.config.theme);
    }

    function patchConfigRuntime(patch, opts) {
        opts = opts || {};
        var p = _toObject(patch);
        var changed = false;
        for (var k in p) {
            if (!Object.prototype.hasOwnProperty.call(p, k)) continue;
            state.config[k] = p[k];
            changed = true;
        }
        if (!changed) return;
        if (typeof p.theme !== "undefined") state.config.theme = _safeThemeMode(p.theme);
        applyAll();
        var title = document.getElementById("mt-header-title");
        if (title) title.textContent = state.config.chat_name || "Chat";
        if (opts.persist && state.config.debug_widget_settings) persistLocal();
        dbg("config runtime patch applied", p);
    }

    function consumeModuloTalksEvents(events) {
        var passthrough = [];
        var arr = Array.isArray(events) ? events : [];
        for (var i = 0; i < arr.length; i++) {
            var ev = _toObject(arr[i]);
            var t = _safeText(ev.type).toLowerCase();
            var data = _toObject(ev.data);
            if (t === "modulotalks.theme" || t === "modulotalks.set_theme") {
                /* Django EventCollector merges payload into the event dict (theme on top level), not only ev.data */
                var themeMode = data.theme || data.mode || ev.theme || ev.mode || "system";
                setThemeRuntime(themeMode, { persist: !!(data.persist || ev.persist) });
                continue;
            }
            if (t === "modulotalks.config.patch") {
                patchConfigRuntime(data.patch || data, { persist: !!data.persist });
                continue;
            }
            passthrough.push(arr[i]);
        }
        return passthrough;
    }

    function exposePublicApi() {
        window.ModuloTalks = window.ModuloTalks || {};
        window.ModuloTalks.setTheme = function (theme, opts) {
            setThemeRuntime(theme, _toObject(opts));
        };
        window.ModuloTalks.patchConfig = function (patch, opts) {
            patchConfigRuntime(_toObject(patch), _toObject(opts));
        };
        window.ModuloTalks.getConfig = function () {
            try { return JSON.parse(JSON.stringify(state.config || {})); }
            catch (e) { return _toObject(state.config); }
        };
    }

    function processServerEvents(events) {
        if (!Array.isArray(events) || !events.length) return;
        var reactorEvents = consumeModuloTalksEvents(events);
        if (!reactorEvents.length) return;
        // V3 internal hard mode: always forward to reactor, for init/send/poll.
        dispatchEventsToReactor(reactorEvents);
    }

    function ensureBootstrap() {
        if (state.chatBootstrapped) return Promise.resolve();
        if (state.bootstrapPromise) return state.bootstrapPromise;

        var initUrl = state.config.endpoint_init;
        if (!initUrl) {
            state.sinceMs = 0;
            state.seen = Object.create(null);
            state.msgAnimIndex = 0;
            clearRenderedMessages();
            state.chatBootstrapped = true;
            startAdaptivePoll();
            return Promise.resolve();
        }

        state.bootstrapPromise = postJson(initUrl, {
            session_id: state.config.session_id || "",
            context: getChatContext(),
        })
            .then(function (j) {
                applyDisabledFromPayload(j);
                state.seen = Object.create(null);
                state.messageLog = [];
                state.msgAnimIndex = 0;
                clearRenderedMessages();
                ingestMessageList(j.messages || []);
                var mx = maxTimestampMs(j.messages || []);
                state.sinceMs = mx || state.sinceMs;
                applyUnreadFromPayload(j);
                processServerEvents(j.events);
                state.chatBootstrapped = true;
                startAdaptivePoll();
            })
            .catch(function (e) {
                console.warn("[mt] init error", e);
                state.seen = Object.create(null);
                state.messageLog = [];
                state.msgAnimIndex = 0;
                clearRenderedMessages();
                state.sinceMs = 0;
                state.chatBootstrapped = true;
                startAdaptivePoll();
            })
            .finally(function () {
                state.bootstrapPromise = null;
            });
        return state.bootstrapPromise;
    }

    function sendText(text) {
        var url = state.config.endpoint_send;
        if (!url || state.config.unauthenticated_mode === "disable_chat") {
            state.pendingSelfText = null;
            console.warn("[mt] send skip: endpoint_send=" + (url || "(empty)") + " mode=" + state.config.unauthenticated_mode);
            return;
        }
        var strict = isStrictMode();
        if (strict) showTyping();
        postJson(url, {
            session_id: state.config.session_id || "",
            message: text,
            input: {
                type: "text",
                text: text
            },
            context: getChatContext(),
        })
            .then(function (j) {
                if (strict) hideTyping();
                if (j.status !== "ok") {
                    state.pendingSelfText = null;
                    console.warn("[mt] send fail", j);
                    return;
                }
                if (j.messages && j.messages.length) ingestMessageList(j.messages);
                if (typeof j.unread_count === "number" && !isNaN(j.unread_count)) {
                    state.unreadCount = j.unread_count;
                }
                processServerEvents(j.events);
                updateBadges();
            })
            .catch(function (e) {
                if (strict) hideTyping();
                state.pendingSelfText = null;
                console.warn("[mt] send error", e);
            });
    }

    function sendAction(actionData) {
        var url = state.config.endpoint_send;
        if (!url || state.config.unauthenticated_mode === "disable_chat") return;
        var data = _toObject(actionData);
        if (!data.action_id) return;
        postJson(url, {
            session_id: state.config.session_id || "",
            input: {
                type: "action",
                action_id: _safeText(data.action_id),
                value: data.value,
                payload: _toObject(data.payload),
                source: _safeText(data.source || "widget"),
                label: _safeText(data.label || ""),
                link_url: _safeText(data.link_url || ""),
            },
            context: getChatContext(),
        })
            .then(function (j) {
                if (j.status !== "ok") {
                    console.warn("[mt] action send fail", j);
                    return;
                }
                if (j.messages && j.messages.length) ingestMessageList(j.messages);
                processServerEvents(j.events);
            })
            .catch(function (e) {
                console.warn("[mt] action send error", e);
            });
    }

    function getArchivePayload() {
        var includeMessages = !!state.config.start_fresh_archive_include_messages;
        return {
            session_id: state.config.session_id || "",
            chat_context: getChatContext(),
            timestamp_ms: Date.now(),
            messages: includeMessages ? state.messageLog.slice() : [],
        };
    }

    function submitSatisfaction(choiceId, choiceLabel) {
        var url = _safeText(state.config.satisfaction_submit_endpoint || "").trim();
        var payload = {
            session_id: state.config.session_id || "",
            score: _safeText(choiceId),
            label: _safeText(choiceLabel),
            chat_context: state.config.satisfaction_include_context ? getChatContext() : {},
            timestamp_ms: Date.now(),
        };
        if (!url) {
            state.satisfactionSubmitted = true;
            appendMessage({
                is_self: false,
                sender_name: state.config.chat_name || "Support",
                type: "text",
                content: { text: _safeText(state.config.satisfaction_thank_you_text || "Thanks for your feedback.") }
            });
            setTimeout(function () { window.mtToggle(false); }, 820);
            return Promise.resolve();
        }
        return postJson(url, payload)
            .then(function (j) {
                if (j && j.status === "error") throw new Error("satisfaction submit failed");
                state.satisfactionSubmitted = true;
                appendMessage({
                    is_self: false,
                    sender_name: state.config.chat_name || "Support",
                    type: "text",
                    content: { text: _safeText(state.config.satisfaction_thank_you_text || "Thanks for your feedback.") }
                });
                setTimeout(function () { window.mtToggle(false); }, 820);
            })
            .catch(function () {
                appendMessage({
                    is_self: false,
                    sender_name: state.config.chat_name || "Support",
                    type: "text",
                    content: { text: "Failed to send feedback. Try again." }
                });
            });
    }

    function archiveThenReset() {
        if (state.freshBusy) return;
        state.freshBusy = true;
        var archiveUrl = _safeText(state.config.start_fresh_archive_endpoint || "").trim();
        var resetUrl = _safeText(state.config.start_fresh_reset_endpoint || "").trim();
        var archivePromise = Promise.resolve();
        if (archiveUrl) archivePromise = postJson(archiveUrl, getArchivePayload());
        archivePromise
            .then(function (archiveRes) {
                if (archiveRes && archiveRes.status === "error") throw new Error("archive failed");
                if (!resetUrl) {
                    state.seen = Object.create(null);
                    state.sinceMs = 0;
                    state.messageLog = [];
                    state.msgAnimIndex = 0;
                    clearRenderedMessages();
                    state.chatBootstrapped = false;
                    return ensureBootstrap();
                }
                return postJson(resetUrl, {
                    session_id: state.config.session_id || "",
                    context: getChatContext(),
                }).then(function (j) {
                    if (j && j.status === "error") throw new Error("reset failed");
                    state.seen = Object.create(null);
                    state.sinceMs = 0;
                    state.messageLog = [];
                    state.msgAnimIndex = 0;
                    clearRenderedMessages();
                    ingestMessageList((j && j.messages) || []);
                    var mx = maxTimestampMs((j && j.messages) || []);
                    state.sinceMs = mx || 0;
                    applyUnreadFromPayload(j || {});
                    processServerEvents((j && j.events) || []);
                    state.chatBootstrapped = true;
                    startAdaptivePoll();
                });
            })
            .catch(function () {
                appendMessage({
                    is_self: false,
                    sender_name: state.config.chat_name || "Support",
                    type: "text",
                    content: { text: "Failed to start fresh. Try again." }
                });
            })
            .finally(function () {
                state.freshBusy = false;
            });
    }

    window.mtToggle = function (open) {
        var r = root(); if (!r) return;
        var isOpen = r.classList.contains("mt-open");
        var next = open === undefined ? !isOpen : !!open;
        clearCloseAnimation();
        if (!next && isOpen) {
            r.classList.add("mt-closing");
            var bd = r.querySelector(".mt-backdrop");
            var finished = false;
            var finishClose = function () {
                if (finished) return;
                finished = true;
                clearCloseAnimation();
                r.classList.remove("mt-open", "mt-closing");
                updateBadges();
            };
            var onBackdropEnd = function (e) {
                if (!bd || e.target !== bd) return;
                if (e.propertyName !== "opacity") return;
                finishClose();
            };
            if (bd) {
                state.closeBackdrop = bd;
                state.closeBackdropEnd = onBackdropEnd;
                bd.addEventListener("transitionend", onBackdropEnd);
            }
            state.closeTimerId = setTimeout(finishClose, 220);
        } else {
            r.classList.remove("mt-closing");
            r.classList.toggle("mt-open", next);
        }
        var fab = r.querySelector(".mt-launcher--floating");
        var bar = r.querySelector(".mt-launcher--chat-bar");
        if (fab) fab.setAttribute("aria-expanded", String(next));
        if (bar) bar.setAttribute("aria-expanded", String(next));
        if (next) {
            ensureBootstrap().then(function () { scrollToBottom(); });
        }
        if (next || !isOpen) updateBadges();
        if (next) scrollToBottom();
    };

    window.mtOpenSatisfaction = function () {
        if (!state.config.satisfaction_enabled) {
            window.mtToggle(false);
            return;
        }
        if (state.satisfactionPromptOpen || state.satisfactionSubmitted) return;
        appendMessage({
            is_self: false,
            sender_name: state.config.chat_name || "Support",
            type: "rating",
            content: ratingPromptMessage().content,
        });
        state.satisfactionPromptOpen = true;
    };

    window.mtStartFresh = function () {
        archiveThenReset();
    };

    window.mtSend = function () {
        if (state.config.unauthenticated_mode === "disable_chat") return;
        var ta = document.getElementById("mt-input");
        if (!ta || ta.disabled) return;
        var text = (ta.value || "").trim();
        if (!text) return;
        ta.value = "";
        window.mtAutoResize(ta);
        state.pendingSelfText = text;
        appendMessage({ is_self: true, sender_name: "You", message: text, type: "text", content: { text: text } });
        sendText(text);
    };

    window.mtHandleRichAction = function (evt, el) {
        var node = el || (evt && evt.target ? evt.target : null);
        if (!node) return;
        var actionId = node.getAttribute("data-mt-action-id") || "";
        if (!actionId) return;
        var payloadRaw = node.getAttribute("data-mt-action-payload") || "{}";
        var payload = {};
        try { payload = JSON.parse(payloadRaw); } catch (e) { payload = {}; }
        sendAction({
            action_id: actionId,
            value: node.getAttribute("data-mt-action-value") || "",
            source: node.getAttribute("data-mt-action-source") || "widget",
            label: node.getAttribute("data-mt-action-label") || "",
            link_url: node.getAttribute("data-mt-link-url") || "",
            payload: payload,
        });
    };

    window.mtKeydown = function (evt) {
        if (evt.key !== "Enter" || evt.shiftKey) return;
        evt.preventDefault();
        window.mtSend();
    };

    window.mtAutoResize = function (textarea) {
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = Math.max(44, Math.min(textarea.scrollHeight, 140)) + "px";
    };

    window.mtToggleSettings = function () {
        var r = root(); if (!r) return;
        var sp = document.getElementById("mt-settings-panel"); if (!sp) return;
        var wasOpen = r.classList.contains("mt-settings-open");
        r.classList.toggle("mt-settings-open", !wasOpen);
        if (!wasOpen) {
            syncSettingsForm();
            refreshBackendSnippet();
            sp.setAttribute("aria-hidden", "false");
            sp.removeAttribute("hidden");
        } else {
            sp.setAttribute("aria-hidden", "true");
        }
    };

    window.mtApplyPreview = function () {
        if (!document.getElementById("mt-settings-panel")) return;
        readFormIntoConfig();
        applyAll();
        var ht = document.getElementById("mt-header-title");
        if (ht) ht.textContent = state.config.chat_name || "Chat";
        applyFloatingFab();
        var r = root();
        var barLbl = r && r.querySelector(".mt-chat-bar__label");
        if (barLbl) barLbl.textContent = state.config.chat_name || "Chat";
        refreshBackendSnippet();
    };

    window.mtCopyBackendSnippet = function () {
        refreshBackendSnippet();
        var ta = document.getElementById("mt-backend-snippet"); if (!ta) return;
        ta.focus(); ta.select();
        try { document.execCommand("copy"); }
        catch (e1) { if (navigator.clipboard) navigator.clipboard.writeText(ta.value).catch(function () {}); }
    };

    window.mtSaveSettings = function () {
        if (!document.getElementById("mt-settings-panel")) return;
        var r = root(); if (!r) return;
        readFormIntoConfig();
        persistLocal();
        applyAll();
        syncSettingsForm();
        var ht = document.getElementById("mt-header-title");
        if (ht) ht.textContent = state.config.chat_name || "Chat";
        applyFloatingFab();
        var barLbl = r.querySelector(".mt-chat-bar__label");
        if (barLbl) barLbl.textContent = state.config.chat_name || "Chat";
        refreshBackendSnippet();
        r.classList.remove("mt-settings-open");
        var sp = document.getElementById("mt-settings-panel");
        if (sp) sp.setAttribute("aria-hidden", "true");
    };

    function syncSettingsForm() {
        var setv = function (id, v) { var el = document.getElementById(id); if (el) el.value = v != null ? String(v) : ""; };
        setv("mt-set-chat-name", state.config.chat_name);
        setv("mt-set-floating-label", state.config.floating_button_label);
        setv("mt-set-theme", state.config.theme);
        setv("mt-set-theme-preset", state.config.theme_preset || "classic");
        setv("mt-set-size", state.config.size);
        setv("mt-set-launcher", state.config.launcher_type);
        setv("mt-set-bottom-margin", state.config.bottom_margin);
        setv("mt-set-bp", state.config.bottom_margin_breakpoint_max);
        setv("mt-set-user-av", state.config.user_avatar_url);
        setv("mt-set-replier-av", state.config.replier_avatar_url);
        setv("mt-set-overlay", state.config.overlay_backdrop || "dim_50");
        setv("mt-set-primary-color", state.config.primary_color || "");
        setv("mt-set-primary-on-color", state.config.primary_on_color || state.config.accent_icon_color || "#ffffff");
    }

    window.mtSaveProfile = function () {
        var url = state.config.profile_submit_url; if (!url) return;
        var body = {};
        var n = document.getElementById("mt-prof-name");
        var e = document.getElementById("mt-prof-email");
        var p = document.getElementById("mt-prof-phone");
        if (n) body.name = n.value || "";
        if (e) body.email = e.value || "";
        if (p) body.phone = p.value || "";
        postJson(url, body).then(function (j) { if (j.status === "ok") window.mtToggle(false); }).catch(function () {});
    };

    function onComposerFocus() {
        state.composerFocused = true;
        var r = root();
        if (r && r.classList.contains("mt-open")) {
            state.markReadNextPoll = true;
            pollOnce({ readFlag: true }).then(function () { updateBadges(); });
        }
        updateBadges();
    }

    function onComposerBlur() {
        state.composerFocused = false;
        updateBadges();
    }

    function wireComposer() {
        var ta = document.getElementById("mt-input");
        if (!ta) return;
        ta.addEventListener("focus", onComposerFocus);
        ta.addEventListener("blur", onComposerBlur);
    }

    function wireRichActions() {
        var box = messagesEl();
        if (!box) return;
        box.addEventListener("click", function (evt) {
            var target = evt.target;
            if (!target) return;
            var submitNode = target.closest("[data-mt-form-submit]");
            if (submitNode) {
                var formId = submitNode.getAttribute("data-mt-form-id") || "";
                var actionId = submitNode.getAttribute("data-mt-submit-action-id") || "form_submit";
                var scope = box.querySelector('[data-mt-form-id="' + formId + '"]');
                if (!scope) return;
                var fields = scope.querySelectorAll("[data-mt-form-field]");
                var payload = {};
                for (var fi = 0; fi < fields.length; fi++) {
                    var fld = fields[fi];
                    var name = fld.getAttribute("data-mt-form-field") || "";
                    if (!name) continue;
                    var val = fld.type === "checkbox" ? !!fld.checked : (fld.value || "");
                    if (fld.getAttribute("data-mt-form-required") === "1" && !String(val).trim()) {
                        fld.focus();
                        return;
                    }
                    payload[name] = val;
                }
                sendAction({
                    action_id: actionId,
                    source: "form_submit",
                    label: "Submit form",
                    payload: {
                        form_id: formId,
                        values: payload
                    }
                });
                return;
            }
            var node = target.closest("[data-mt-action-id]");
            if (!node) return;
            window.mtHandleRichAction(evt, node);
        });
    }

    function wireSatisfactionActions() {
        var box = messagesEl();
        if (!box) return;
        box.addEventListener("click", function (evt) {
            var target = evt.target;
            if (!target) return;
            var node = target.closest("[data-mt-rating-id]");
            if (!node) return;
            if (state.satisfactionSubmitted) return;
            var id = node.getAttribute("data-mt-rating-id") || "";
            var label = node.getAttribute("data-mt-rating-label") || id;
            var nodes = box.querySelectorAll("[data-mt-rating-id]");
            for (var i = 0; i < nodes.length; i++) nodes[i].disabled = true;
            triggerRatingCelebration(node);
            submitSatisfaction(id, label);
        });
    }

    function init() {
        var base = parseConfig();
        if (!base) { console.warn("[mt] no #mt-root found, abort"); return; }
        state.config = base;
        if (!state.config.overlay_backdrop) state.config.overlay_backdrop = "dim_50";
        if (isNaN(state.config.bottom_margin_breakpoint_max)) state.config.bottom_margin_breakpoint_max = 640;
        if (state.config.debug_widget_settings) mergeLocalStorage();
        var pc0 = state.config.primary_color || state.config.primay_color;
        state.config.primary_color = pc0 != null ? String(pc0).trim() : "";
        var po0 = state.config.primary_on_color || state.config.accent_icon_color;
        state.config.primary_on_color = (po0 != null ? String(po0).trim() : "") || "#ffffff";
        try {
            if (window.location.search.indexOf("mt_debug=1") >= 0) state.config.transport_debug = true;
        } catch (e) { /* ignore */ }

        state.sinceMs = 0;
        state.unreadCount = 0;
        state.msgAnimIndex = 0;
        state.warned = Object.create(null);
        state.satisfactionPromptOpen = false;
        state.satisfactionSubmitted = false;
        applyAll();

        dbg("boot", {
            init: state.config.endpoint_init,
            send: state.config.endpoint_send,
            poll: state.config.endpoint_poll,
            mode: state.config.transport_mode,
            eventRuntime: "reactor-only",
            csrf: getCSRFToken() ? "present" : "MISSING",
        });

        if (state.config.debug_widget_settings) syncSettingsForm();
        window.addEventListener("resize", applyBottomOffset);
        var title = document.getElementById("mt-header-title");
        if (title) title.textContent = state.config.chat_name || "Chat";
        wireComposer();
        wireRichActions();
        wireSatisfactionActions();
        exposePublicApi();
        updateBadges();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
