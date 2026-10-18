// =====================================================
//  תפריט נגישות (תקנה 35) + הודעת עוגיות
// =====================================================
(function(){
  var KEY = "hc-a11y", CKEY = "hc-consent";
  function load(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e){ return null; } }
  function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }

  var state = Object.assign({ fs:0, color:"", links:false, font:false, spacing:false, noanim:false, cursor:false }, load(KEY) || {});
  var html = document.documentElement;

  function apply(){
    var cls = html.className.split(/\s+/).filter(function(c){ return c && c.indexOf("a11y-") !== 0; });
    if (state.fs) cls.push("a11y-fs-" + state.fs);
    if (state.color) cls.push("a11y-" + state.color);
    ["links","font","spacing","noanim","cursor"].forEach(function(k){ if (state[k]) cls.push("a11y-" + k); });
    html.className = cls.join(" ");
    save(KEY, state);
    sync();
  }

  // ---------- Widget ----------
  var root = document.createElement("div");
  root.className = "a11y-root";
  root.innerHTML =
    '<button type="button" class="a11y-btn" id="a11yBtn" aria-expanded="false" aria-controls="a11yPanel" aria-label="תפריט נגישות (Alt+A)">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 8.5c-2 .6-4.4 1-7 1s-5-.4-7-1l-.5 1.9c1.9.6 3.9.9 5.8 1.1V14l-2 7.2 1.9.5L12 15h0l1.8 6.7 1.9-.5-2-7.2v-2.5c1.9-.2 3.9-.5 5.8-1.1z"/></svg>' +
    '</button>' +
    '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-modal="false" aria-labelledby="a11yTitle" hidden>' +
      '<div class="a11y-head"><h2 id="a11yTitle">תפריט נגישות</h2><button type="button" class="a11y-close" aria-label="סגירת תפריט הנגישות">×</button></div>' +
      '<p class="a11y-label" id="fsLbl">גודל טקסט</p>' +
      '<div class="a11y-size" role="group" aria-labelledby="fsLbl">' +
        '<button type="button" data-fs="0">רגיל</button><button type="button" data-fs="1">גדול</button><button type="button" data-fs="2">גדול מאוד</button><button type="button" data-fs="3">ענק</button>' +
      '</div>' +
      '<p class="a11y-label" id="colLbl">צבעים</p>' +
      '<div class="a11y-grid" role="group" aria-labelledby="colLbl">' +
        '<button type="button" data-color="hc">ניגודיות גבוהה</button>' +
        '<button type="button" data-color="invert">היפוך צבעים</button>' +
        '<button type="button" data-color="gray">גווני אפור</button>' +
        '<button type="button" data-toggle="links">הדגשת קישורים</button>' +
      '</div>' +
      '<p class="a11y-label" id="moreLbl">קריאה ותנועה</p>' +
      '<div class="a11y-grid" role="group" aria-labelledby="moreLbl">' +
        '<button type="button" data-toggle="font">גופן קריא</button>' +
        '<button type="button" data-toggle="spacing">ריווח שורות</button>' +
        '<button type="button" data-toggle="noanim">עצירת אנימציות</button>' +
        '<button type="button" data-toggle="cursor">סמן עכבר גדול</button>' +
      '</div>' +
      '<div class="a11y-foot"><a href="#accessibility">הצהרת נגישות</a><button type="button" class="a11y-reset">איפוס הגדרות</button></div>' +
    '</div>';

  function sync(){
    if (!root.isConnected) return;
    root.querySelectorAll("[data-fs]").forEach(function(b){ b.setAttribute("aria-pressed", String(+b.dataset.fs === +state.fs)); });
    root.querySelectorAll("[data-color]").forEach(function(b){ b.setAttribute("aria-pressed", String(state.color === b.dataset.color)); });
    root.querySelectorAll("[data-toggle]").forEach(function(b){ b.setAttribute("aria-pressed", String(!!state[b.dataset.toggle])); });
  }

  var btn, panel;
  function open(){ panel.hidden = false; btn.setAttribute("aria-expanded","true"); panel.querySelector(".a11y-close").focus(); }
  function close(returnFocus){ panel.hidden = true; btn.setAttribute("aria-expanded","false"); if (returnFocus) btn.focus(); }
  function toggle(){ panel.hidden ? open() : close(true); }

  function initWidget(){
    document.body.appendChild(root);
    btn = root.querySelector("#a11yBtn"); panel = root.querySelector("#a11yPanel");
    btn.addEventListener("click", toggle);
    root.querySelector(".a11y-close").addEventListener("click", function(){ close(true); });
    root.querySelectorAll("[data-fs]").forEach(function(b){ b.addEventListener("click", function(){ state.fs = +b.dataset.fs; apply(); }); });
    root.querySelectorAll("[data-color]").forEach(function(b){ b.addEventListener("click", function(){ state.color = state.color === b.dataset.color ? "" : b.dataset.color; apply(); }); });
    root.querySelectorAll("[data-toggle]").forEach(function(b){ b.addEventListener("click", function(){ var k = b.dataset.toggle; state[k] = !state[k]; apply(); }); });
    root.querySelector(".a11y-reset").addEventListener("click", function(){ state = { fs:0, color:"", links:false, font:false, spacing:false, noanim:false, cursor:false }; apply(); });
    root.querySelector(".a11y-foot a").addEventListener("click", function(){ close(false); });
    panel.addEventListener("keydown", function(e){ if (e.key === "Escape"){ e.preventDefault(); close(true); } });
    document.addEventListener("keydown", function(e){
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyA"){ e.preventDefault(); toggle(); }
    });
    sync();
  }

  // ---------- Links that open in a new window ----------
  function markNewWindow(scope){
    (scope || document).querySelectorAll('a[target="_blank"]:not([data-nw])').forEach(function(a){
      a.setAttribute("data-nw","1");
      var s = document.createElement("span"); s.className = "sr-only"; s.textContent = " (נפתח בחלון חדש)";
      a.appendChild(s);
      if (a.hasAttribute("aria-label")) a.setAttribute("aria-label", a.getAttribute("aria-label") + " (נפתח בחלון חדש)");
    });
  }

  // ---------- Skip link ----------
  function initSkip(){
    var s = document.querySelector(".skip-link");
    if (!s) return;
    s.addEventListener("click", function(e){
      e.preventDefault();
      var m = document.getElementById("app");
      m.setAttribute("tabindex","-1"); m.focus(); m.scrollIntoView();
    });
  }

  // ---------- Cookie notice ----------
  function initCookies(){
    window.hcConsent = load(CKEY);
    if (window.hcConsent) return;
    showCookieBar();
  }
  function showCookieBar(){
    if (document.querySelector(".cookie-bar")) return;
    var bar = document.createElement("div");
    bar.className = "cookie-bar"; bar.setAttribute("role","region"); bar.setAttribute("aria-label","הודעה על שימוש בעוגיות");
    bar.innerHTML = '<div class="cb-in"><p>האתר משתמש רק בעוגיות ובאחסון מקומי הכרחיים לתפקוד שלו, למשל לשמירת הגדרות הנגישות. איננו משתמשים בעוגיות פרסום או מעקב. לפרטים: <a href="#privacy">מדיניות פרטיות ועוגיות</a>.</p>' +
      '<div class="cb-actions"><button type="button" class="cb-ok">אישור</button><button type="button" class="cb-no">דחיית עוגיות לא הכרחיות</button></div></div>';
    document.body.appendChild(bar);
    function fit(){ html.style.setProperty("--cb-h", bar.offsetHeight + "px"); }
    html.classList.add("has-cb"); fit(); window.addEventListener("resize", fit);
    function choose(v){
      window.hcConsent = { choice: v, at: new Date().toISOString() };
      save(CKEY, window.hcConsent);
      bar.remove(); html.classList.remove("has-cb"); window.removeEventListener("resize", fit);
      var live = document.getElementById("liveRegion");
      if (live) live.textContent = v === "all" ? "העדפת העוגיות נשמרה: אישור." : "העדפת העוגיות נשמרה: רק עוגיות הכרחיות.";
    }
    bar.querySelector(".cb-ok").addEventListener("click", function(){ choose("all"); });
    bar.querySelector(".cb-no").addEventListener("click", function(){ choose("essential"); });
  }
  window.hcShowCookieBar = function(){
    try { localStorage.removeItem(CKEY); } catch(e){}
    showCookieBar();
    var b = document.querySelector(".cookie-bar .cb-ok"); if (b) b.focus();
  };

  function init(){
    initWidget(); initSkip(); initCookies(); markNewWindow();
    new MutationObserver(function(){ markNewWindow(); }).observe(document.body, { childList:true, subtree:true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  apply();
})();
