(function () {
  "use strict";

  // Prevent duplicate injection
  if (document.getElementById("_diq-btn")) {
    return;
  }

  var script = document.currentScript;

  if (!script) {
    console.error("DocIntelAI Widget: currentScript not found");
    return;
  }

  var docId = script.getAttribute("data-document-id") || "";
  var brand = script.getAttribute("data-theme-color") || "#3b82f6";
  var ssoToken = script.getAttribute("data-sso-token") || "";

  // More reliable than regex replacement
  var base = new URL(".", script.src).href.replace(/\/$/, "");

  var params =
    "documentId=" +
    encodeURIComponent(docId) +
    "&themeColor=" +
    encodeURIComponent(brand);

  if (ssoToken) {
    params += "&sso_token=" + encodeURIComponent(ssoToken);
  }

  var iframeSrc = base + "/widget/chat?" + params;

  /* ──────────────────────────────────────────────
     Styles
  ────────────────────────────────────────────── */

  var style = document.createElement("style");

  style.textContent = [
    "#_diq-btn{",
    "all:unset;",
    "position:fixed;",
    "bottom:24px;",
    "right:24px;",
    "width:56px;",
    "height:56px;",
    "background:" + brand + ";",
    "border-radius:50%;",
    "box-shadow:0 4px 24px rgba(0,0,0,.22);",
    "cursor:pointer;",
    "z-index:2147483646;",
    "display:flex;",
    "align-items:center;",
    "justify-content:center;",
    "transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;",
    "}",
    "#_diq-btn:hover{",
    "transform:scale(1.08);",
    "box-shadow:0 6px 32px rgba(0,0,0,.28);",
    "}",
    "#_diq-btn:active{transform:scale(.94);}",

    "#_diq-btn svg{",
    "transition:opacity .2s,transform .2s;",
    "}",

    "#_diq-btn .ic-chat{",
    "opacity:1;",
    "transform:scale(1);",
    "}",

    "#_diq-btn .ic-close{",
    "opacity:0;",
    "transform:scale(.6);",
    "position:absolute;",
    "}",

    "#_diq-btn.open .ic-chat{",
    "opacity:0;",
    "transform:scale(.6);",
    "}",

    "#_diq-btn.open .ic-close{",
    "opacity:1;",
    "transform:scale(1);",
    "}",

    "#_diq-panel{",
    "position:fixed;",
    "bottom:92px;",
    "right:24px;",
    "width:min(420px, calc(100vw - 32px));",
    "height:min(700px, calc(100vh - 110px));",
    "border-radius:20px;",
    "overflow:hidden;",
    "background:#fff;",
    "box-shadow:0 12px 48px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08);",
    "z-index:2147483645;",
    "opacity:0;",
    "pointer-events:none;",
    "transform:translateY(12px) scale(.97);",
    "transition:opacity .25s,transform .25s cubic-bezier(.34,1.2,.64,1);",
    "}",

    "#_diq-panel.open{",
    "opacity:1;",
    "pointer-events:auto;",
    "transform:translateY(0) scale(1);",
    "}",

    "@media(max-width:440px){",
    "#_diq-btn{",
    "right:16px;",
    "bottom:16px;",
    "}",

    "#_diq-panel{",
    "width:calc(100vw - 16px);",
    "height:calc(100vh - 100px);",
    "right:8px;",
    "bottom:84px;",
    "border-radius:16px;",
    "}",
    "}"
  ].join("");

  document.head.appendChild(style);

  /* ──────────────────────────────────────────────
     Button
  ────────────────────────────────────────────── */

  var btn = document.createElement("button");

  btn.id = "_diq-btn";

  btn.setAttribute("aria-label", "Open chat assistant");
  btn.setAttribute("aria-expanded", "false");

  btn.innerHTML = [
    '<svg class="ic-chat" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "</svg>",

    '<svg class="ic-close" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
    '<line x1="18" y1="6" x2="6" y2="18"/>',
    '<line x1="6" y1="6" x2="18" y2="18"/>',
    "</svg>"
  ].join("");

  /* ──────────────────────────────────────────────
     Iframe (Lazy Loaded)
  ────────────────────────────────────────────── */

  var panel = document.createElement("iframe");

  panel.id = "_diq-panel";
  panel.src = "about:blank";
  panel.allow = "clipboard-write";
  panel.title = "DocIntelAI Chat Assistant";

  var iframeLoaded = false;
  var isOpen = false;

  function openWidget() {
    if (!iframeLoaded) {
      panel.src = iframeSrc;
      iframeLoaded = true;
    }

    isOpen = true;

    btn.classList.add("open");
    panel.classList.add("open");

    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Close chat assistant");
  }

  function closeWidget() {
    isOpen = false;

    btn.classList.remove("open");
    panel.classList.remove("open");

    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open chat assistant");
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  btn.addEventListener("click", toggleWidget);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) {
      closeWidget();
    }
  });

  // Communication from iframe
  window.addEventListener("message", function (event) {
    if (!event.data || typeof event.data !== "object") {
      return;
    }

    switch (event.data.type) {
      case "close-chat":
        closeWidget();
        break;

      case "open-chat":
        openWidget();
        break;

      default:
        break;
    }
  });

  /* ──────────────────────────────────────────────
     Mount
  ────────────────────────────────────────────── */

  function mount() {
    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();