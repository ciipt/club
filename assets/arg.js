/* shared page logic */
(function () {
  const C = window.ARGCrypto;
  const ZAL = ['̀','́','̂','̃','̈','̊','̖','̗','̛','̣','̧','̴','̵','̶','̸','͇','͎','͓','͜','͡'];

  function corrupt(text, amt = 0.5) {
    return Array.from(text).map(ch => {
      if (ch === ' ' || Math.random() > amt) return ch;
      let s = ch; const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) s += ZAL[Math.floor(Math.random() * ZAL.length)];
      return s;
    }).join('');
  }

  function glitch(ms = 600) {
    document.body.classList.add('glitching');
    setTimeout(() => document.body.classList.remove('glitching'), ms);
  }

  /* reveals payload html one paragraph at a time */
  function reveal(el, html, delay = 650) {
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const kids = Array.from(tmp.children);
    el.innerHTML = ''; el.hidden = false;
    kids.forEach((k, i) => setTimeout(() => {
      k.classList.add('appear'); el.appendChild(k);
      if (k.classList.contains('g')) { glitch(450); k.dataset.t = k.textContent; }
      k.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, i * delay));
  }

  /* wires a form whose inputs (in order) answer the stage's questions */
  function quiz({ stage, form, out, onFail, onSuccess }) {
    const data = window.ARG_DATA && window.ARG_DATA[stage];
    if (!data) { out.hidden = false; out.textContent = 'data.js missing. (ash, run the build.)'; return; }
    let fails = 0;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const inputs = Array.from(form.querySelectorAll('input'));
      const shares = inputs.map((inp, q) => C.tryAnswer(data, q, inp.value));
      inputs.forEach((inp, q) => {
        inp.classList.toggle('ok', !!shares[q]);
        inp.classList.toggle('bad', !shares[q] && inp.value.trim() !== '');
      });
      if (shares.every(Boolean)) {
        const html = C.decrypt(C.stageKey(shares), data.payload);
        inputs.forEach(i => (i.disabled = true));
        const btn = form.querySelector('button'); if (btn) btn.disabled = true;
        try { localStorage.setItem('arg-' + stage, '1'); } catch (_) {}
        if (onSuccess) onSuccess(html); else reveal(out, html);
      } else {
        fails++;
        glitch(300);
        if (onFail) onFail(fails, shares);
      }
    });
  }

  function cornerWhisper(text, ms = 2600) {
    const w = document.createElement('div');
    w.className = 'whisper'; w.textContent = corrupt(text, 0.25);
    document.body.appendChild(w);
    setTimeout(() => w.remove(), ms);
  }

  function warden() {
    const w = document.createElement('p');
    w.className = 'warden';
    w.innerHTML = 'stumped? text the <b>game warden</b> 🤠<br><span>(it\'s ash. say which page you\'re on. hints cost dignity.)</span>';
    (document.querySelector('.wrap') || document.body).appendChild(w);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', warden); else warden();

  window.ARG = { corrupt, glitch, reveal, quiz, cornerWhisper };

  console.log('%c♡ just ash ♡', 'font-size:28px;color:#ff6fae;font-family:monospace');
  console.log('%cyou opened the console. of course you did. that\'s how you play this game.', 'color:#999');
  console.log('%cbut the answers are hashed. you\'ll have to actually know things.', 'color:#999');
})();
