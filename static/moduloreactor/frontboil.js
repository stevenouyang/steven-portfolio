/**
 * FrontBoil — Event-driven HTMX frontend runtime
 *
 * Responsibilities:
 *  1. Intercept HTMX JSON responses and dispatch events
 *  2. Built-in handlers: dom.update, toast, alert, confirm, choice, redirect, dom.remove
 *  3. Custom event handlers via FrontBoil.on()
 *  4. Next-request message queue (rendered on page load)
 *  5. CSRF token auto-injection
 *  6. Debug logging (toggleable)
 */
(function () {
    "use strict";

    var FrontBoil = {
        debug: false,
        logUnhandled: false,
        hashes: {},
        _handlers: {},

        // ── Init ──────────────────────────────────────────────

        init: function (options) {
            options = options || {};
            this.debug = !!options.debug;
            this.logUnhandled = !!options.logUnhandled;
            this.hashes = options.hashes || {};
            this._bindHtmx();
            this._registerDefaults();
            this._processNextMessages(options.nextMessages || []);
            this._log("init", options);
        },

        // ── Public API ────────────────────────────────────────

        on: function (eventType, handler) {
            if (!this._handlers[eventType]) {
                this._handlers[eventType] = [];
            }
            this._handlers[eventType].push(handler);
        },

        dispatch: function (eventType, data) {
            var fns = this._handlers[eventType] || [];
            this._log("dispatch", { type: eventType, data: data, handlers: fns.length });
            if (this.logUnhandled && fns.length === 0 && !this._isBuiltInEvent(eventType)) {
                console.warn("[FrontBoil:unhandled] No handler for event type:", eventType);
            }
            for (var i = 0; i < fns.length; i++) {
                fns[i](data);
            }
        },

        /**
         * Public API: process server events outside HTMX.
         * Accepts an array of event dicts: [{type: "...", ...}, ...]
         */
        processEvents: function (events) {
            if (!Array.isArray(events) || !events.length) return;
            for (var i = 0; i < events.length; i++) {
                var ev = events[i];
                if (!ev || !ev.type) {
                    this._log("warn", "Ignored invalid event payload");
                    continue;
                }
                this.dispatch(ev.type, ev);
            }
        },

        // ── HTMX Binding ─────────────────────────────────────

        _bindHtmx: function () {
            var self = this;

            document.body.addEventListener("htmx:configRequest", function (evt) {
                var csrfToken = self._getCookie("csrftoken");
                if (csrfToken) {
                    evt.detail.headers["X-CSRFToken"] = csrfToken;
                }
                if (Object.keys(self.hashes).length) {
                    evt.detail.headers["X-Component-Hashes"] = JSON.stringify(self.hashes);
                }
            });

            document.body.addEventListener("htmx:beforeSwap", function (evt) {
                var xhr = evt.detail.xhr;
                if (!xhr) return;
                var ct = xhr.getResponseHeader("Content-Type") || "";
                if (ct.indexOf("application/json") === -1) return;

                evt.detail.shouldSwap = false;

                try {
                    var payload = JSON.parse(xhr.responseText);
                    self._log("response", payload);
                    if (payload.events && payload.events.length) {
                        self.processEvents(payload.events);
                    }
                    if (payload.hashes) {
                        Object.assign(self.hashes, payload.hashes);
                    }
                } catch (e) {
                    self._log("error", "Failed to parse response: " + e.message);
                }
            });
        },

        _processEvents: function (events) {
            this.processEvents(events);
        },

        _processNextMessages: function (messages) {
            if (!messages || !messages.length) return;
            this._log("next-messages", messages);
            this.processEvents(messages);
        },

        // ── Built-in Event Handlers ──────────────────────────

        _registerDefaults: function () {
            var self = this;

            // ── dom.update (cek swap / target) ──
            this.on("dom.update", function (e) {
                var nodes = self._queryDomTargets(e.target, e.many);
                if (!nodes.length) return;
                var swap = e.swap || "outerHTML";
                var i;
                for (i = 0; i < nodes.length; i++) {
                    var target = nodes[i];
                    if (swap === "outerHTML") {
                        target.outerHTML = e.html;
                    } else if (swap === "innerHTML") {
                        target.innerHTML = e.html;
                    } else if (swap === "beforeend") {
                        target.insertAdjacentHTML("beforeend", e.html);
                    } else if (swap === "afterbegin") {
                        target.insertAdjacentHTML("afterbegin", e.html);
                    }
                }
                if (typeof htmx !== "undefined") {
                    htmx.process(document.body);
                }
            });

            // ── dom.remove (langung selector id)──
            this.on("dom.remove", function (e) {
                var nodes = self._queryDomTargets(e.target, e.many);
                var i;
                for (i = 0; i < nodes.length; i++) {
                    nodes[i].remove();
                }
            });

            // ── toast ──
            this.on("toast", function (e) {
                self._mountToast(e);
            });

            // ── alert ──
            this.on("alert", function (e) {
                self._mountAlert(e);
            });

            // ── confirm ──
            this.on("confirm", function (e) {
                self._showModal({
                    title: e.title,
                    message: e.message,
                    actions: [
                        {
                            label: e.cancel_label || "Cancel",
                            style: "secondary",
                            action: function () {
                                self._closeModal();
                                if (e.on_cancel) {
                                    self._postAction(e.on_cancel, e.payload || {});
                                }
                            }
                        },
                        {
                            label: e.confirm_label || "Confirm",
                            style: e.style || "default",
                            action: function () {
                                self._closeModal();
                                self._postAction(e.on_confirm, e.payload || {});
                            }
                        }
                    ]
                });
            });

            // ── choice ──
            this.on("choice", function (e) {
                var actions = [];
                actions.push({
                    label: "Cancel",
                    style: "secondary",
                    action: function () { self._closeModal(); }
                });
                var opts = e.options || [];
                for (var i = 0; i < opts.length; i++) {
                    (function (opt) {
                        actions.push({
                            label: opt.label,
                            style: opt.style || "default",
                            action: function () {
                                self._closeModal();
                                self._postAction(opt.url, opt.payload || {});
                            }
                        });
                    })(opts[i]);
                }
                self._showModal({
                    title: e.title,
                    message: e.message,
                    actions: actions
                });
            });

            // ── redirect ──
            this.on("redirect", function (e) {
                if (e.url) window.location.href = e.url;
            });

            // ── console ──
            this.on("console", function (e) {
                console.log("[FrontBoil:server]", e.message || e);
            });
        },

        // ── Modal ────────────────────────────────────────────

        _getUiTemplate: function (id) {
            var el = document.getElementById(id);
            return (el && el.tagName === "TEMPLATE") ? el : null;
        },

        _mountToast: function (e) {
            var self = this;
            var container = self._ensureEl("mr-toasts");
            var level = e.level || "info";
            var dur = e.duration || 3000;
            var toast;
            var tpl = self._getUiTemplate("mr-ui-tpl-toast");
            if (tpl && tpl.content) {
                var frag = tpl.content.cloneNode(true);
                toast = frag.querySelector("[data-mr-toast-root]") || frag.firstElementChild;
                if (!toast) return;
                toast.classList.add("mr-toast--" + level);
                var msgEl = toast.querySelector("[data-mr-toast-message]");
                if (msgEl) msgEl.textContent = e.message || "";
                toast.onclick = function () { toast.remove(); };
            } else {
                toast = document.createElement("div");
                toast.className = "mr-toast mr-toast--" + level;
                toast.textContent = e.message || "";
                toast.onclick = function () { toast.remove(); };
            }
            container.appendChild(toast);
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, dur);
        },

        _mountAlert: function (e) {
            var container = this._ensureEl("mr-alerts");
            var level = e.level || "info";
            var el;
            var tpl = this._getUiTemplate("mr-ui-tpl-alert");
            if (tpl && tpl.content) {
                var frag = tpl.content.cloneNode(true);
                el = frag.querySelector("[data-mr-alert-root]") || frag.firstElementChild;
                if (!el) return;
                el.classList.add("mr-alert--" + level);
                var msgEl = el.querySelector("[data-mr-alert-message]");
                if (msgEl) msgEl.textContent = e.message || "";
                if (e.dismissible !== false) {
                    el.classList.add("mr-alert--dismissible");
                    el.onclick = function () { el.remove(); };
                }
            } else {
                el = document.createElement("div");
                el.className = "mr-alert mr-alert--" + level;
                if (e.dismissible !== false) {
                    el.className += " mr-alert--dismissible";
                    el.onclick = function () { el.remove(); };
                }
                el.textContent = e.message || "";
            }
            container.appendChild(el);
        },

        _showModal: function (opts) {
            var self = this;
            var overlay = this._ensureEl("mr-modal-overlay");
            overlay.innerHTML = "";
            overlay.onclick = null;

            var modal;
            var tpl = this._getUiTemplate("mr-ui-tpl-modal");
            if (tpl && tpl.content) {
                var frag = tpl.content.cloneNode(true);
                modal = frag.querySelector("[data-mr-modal-root]") || frag.firstElementChild;
                if (!modal) return;
                var titleEl = modal.querySelector("[data-mr-modal-title]");
                if (titleEl) {
                    if (opts.title) {
                        titleEl.textContent = opts.title;
                        titleEl.hidden = false;
                    } else {
                        titleEl.textContent = "";
                        titleEl.hidden = true;
                    }
                }
                var msgEl = modal.querySelector("[data-mr-modal-message]");
                if (msgEl) msgEl.textContent = opts.message || "";
                var actions = modal.querySelector("[data-mr-modal-actions]");
                if (actions) {
                    actions.innerHTML = "";
                    for (var i = 0; i < opts.actions.length; i++) {
                        (function (a) {
                            var btn = document.createElement("button");
                            btn.type = "button";
                            btn.className = "mr-btn mr-btn--" + (a.style || "default");
                            btn.textContent = a.label;
                            btn.onclick = a.action;
                            actions.appendChild(btn);
                        })(opts.actions[i]);
                    }
                }
            } else {
                modal = document.createElement("div");
                modal.className = "mr-modal";
                if (opts.title) {
                    var title = document.createElement("div");
                    title.className = "mr-modal__title";
                    title.textContent = opts.title;
                    modal.appendChild(title);
                }
                var msg = document.createElement("div");
                msg.className = "mr-modal__message";
                msg.textContent = opts.message || "";
                modal.appendChild(msg);
                var actionsLegacy = document.createElement("div");
                actionsLegacy.className = "mr-modal__actions";
                for (var j = 0; j < opts.actions.length; j++) {
                    (function (a) {
                        var btn = document.createElement("button");
                        btn.type = "button";
                        btn.className = "mr-btn mr-btn--" + (a.style || "default");
                        btn.textContent = a.label;
                        btn.onclick = a.action;
                        actionsLegacy.appendChild(btn);
                    })(opts.actions[j]);
                }
                modal.appendChild(actionsLegacy);
            }
            overlay.appendChild(modal);
            overlay.classList.add("mr-active");

            overlay.onclick = function (evt) {
                if (evt.target === overlay) self._closeModal();
            };
        },

        _closeModal: function () {
            var overlay = document.getElementById("mr-modal-overlay");
            if (overlay) overlay.classList.remove("mr-active");
        },

        // ── Utilities ────────────────────────────────────────

        _ensureEl: function (id) {
            var el = document.getElementById(id);
            if (!el) {
                el = document.createElement("div");
                el.id = id;
                document.body.appendChild(el);
            }
            return el;
        },

        /**
         * Resolve selector to one or many elements.
         * many=true uses querySelectorAll; many=false uses querySelector (first match only).
         */
        _queryDomTargets: function (selector, many) {
            if (!selector) return [];
            if (many) {
                return Array.prototype.slice.call(document.querySelectorAll(selector));
            }
            var one = document.querySelector(selector);
            return one ? [one] : [];
        },

        _isBuiltInEvent: function (eventType) {
            var builtins = {
                "dom.update": true,
                "dom.remove": true,
                "toast": true,
                "alert": true,
                "confirm": true,
                "choice": true,
                "redirect": true,
                "console": true
            };
            return !!builtins[eventType];
        },

        _postAction: function (url, payload) {
            // Fire an HTMX-style POST via fetch, then process response events
            var self = this;
            var csrfToken = this._getCookie("csrftoken");
            var body = new FormData();
            if (payload) {
                for (var key in payload) {
                    if (payload.hasOwnProperty(key)) {
                        body.append(key, payload[key]);
                    }
                }
            }
            fetch(url, {
                method: "POST",
                headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
                body: body
            })
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
                if (data.events && data.events.length) {
                    self.processEvents(data.events);
                }
            })
            .catch(function (err) {
                self._log("error", "postAction failed: " + err.message);
            });
        },

        _getCookie: function (name) {
            var match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
            return match ? decodeURIComponent(match[2]) : null;
        },

        _log: function (ctx, data) {
            if (this.debug) {
                console.log("[FrontBoil:" + ctx + "]", data);
            }
        }
    };

    window.FrontBoil = FrontBoil;
    // Stable facade for cross-package integrations (e.g. ModuloTalks).
    if (!window.ModuloReactor) {
        window.ModuloReactor = {};
    }
    window.ModuloReactor.init = function (options) {
        return FrontBoil.init(options);
    };
    window.ModuloReactor.on = function (eventType, handler) {
        return FrontBoil.on(eventType, handler);
    };
    window.ModuloReactor.dispatch = function (eventType, data) {
        return FrontBoil.dispatch(eventType, data);
    };
    window.ModuloReactor.processEvents = function (events) {
        return FrontBoil.processEvents(events);
    };
})();
