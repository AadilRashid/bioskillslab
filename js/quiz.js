const FREE_QUIZ_LIMIT = 999;

function isUnlocked() {
  return true;
}

function unlockPremium(key) {
  const k = key.toUpperCase().trim();
  const validKeys = new Set([
    'BIOSKILLS2024','EARLYBIRD','LAUNCH50',
    'BSL-R8C8JYU5','BSL-IB6SHM5F','BSL-UDVI1Z1N','BSL-D2P6DMCR','BSL-930ZCQFW',
    'BSL-EM36TQAY','BSL-4HOXS9WO','BSL-TGI7XVTK','BSL-5L62NNDI','BSL-D13VMEBE',
    'BSL-H80L33WS','BSL-9Y9OLTX2','BSL-JK3OA7FQ','BSL-HZ4ZLZQ4','BSL-YSHZB0BK',
    'BSL-1HWZF5BN','BSL-JSU0O985','BSL-CGQ7SVB6','BSL-GIMIQ7T1','BSL-XUWH2CBI',
    'BSL-MSKSEUPS','BSL-CE3023PQ','BSL-O1YFGENX','BSL-VIZ6HYVE','BSL-61HI7MSX',
    'BSL-6PIC6RZO','BSL-HHMBDW0L','BSL-1KTU600K','BSL-IATGGD62','BSL-HFYX9AFS',
    'BSL-38MF47X0','BSL-FQYGZQ0C','BSL-C5GSQ7QM','BSL-5N7DVTDT','BSL-3TWVD2CP',
    'BSL-JJAAD87G','BSL-IFTOX5NB','BSL-I3WID292','BSL-SU5NYMM9','BSL-YO31ICAU',
    'BSL-LUKLVT1R','BSL-H6PTEMV7','BSL-YXR3NRCQ','BSL-T2RO5HZN','BSL-CEQO2DD1',
    'BSL-U0ATFWRD','BSL-OQVPI1HD','BSL-02JWONPJ','BSL-79ESHANU','BSL-IPTPL838'
  ]);
  if (validKeys.has(k)) {
    localStorage.setItem('bsl_premium', 'true');
    localStorage.setItem('bsl_key', k);
    return true;
  }
  return false;
}

function initQuiz(container, chId) {
  const allQuestions = container.querySelectorAll('.quiz-question');
  const scoreEl = container.querySelector('.quiz-score');
  const premium = isUnlocked();
  let score = 0;
  let answered = 0;
  let activeCount = 0;

  allQuestions.forEach((q, idx) => {
    const isPremium = q.classList.contains('premium');

    // Gate premium questions
    if (isPremium && !premium) {
      q.style.position = 'relative';
      q.style.overflow = 'hidden';
      q.style.maxHeight = '120px';
      q.innerHTML = `
        <div style="filter:blur(3px);pointer-events:none;">${q.innerHTML}</div>
        <div style="position:absolute;inset:0;background:linear-gradient(transparent 20%,var(--bg-card) 80%);display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;background:var(--bg-card);padding:1rem 1.5rem;border-radius:12px;border:1px solid var(--border);">
            <div style="font-size:1.2rem;margin-bottom:.5rem;">🔒</div>
            <div style="font-size:.85rem;font-weight:600;margin-bottom:.25rem;">Premium Question</div>
            <div style="font-size:.75rem;color:var(--text-muted);">Unlock all quizzes below</div>
          </div>
        </div>`;
      q.style.maxHeight = '140px';
      return;
    }

    activeCount++;
    const type = q.dataset.type || 'choice';

    if (type === 'choice') {
      const options = q.querySelectorAll('.quiz-option');
      const correct = q.dataset.answer;
      const explanation = q.querySelector('.quiz-explanation');

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          if (opt.classList.contains('disabled')) return;
          options.forEach(o => o.classList.add('disabled'));
          answered++;
          if (opt.dataset.value === correct) {
            opt.classList.add('correct');
            score++;
            if (explanation) {
              explanation.classList.add('show', 'correct-exp');
              explanation.textContent = '✓ Correct! ' + (explanation.dataset.text || '');
            }
          } else {
            opt.classList.add('wrong');
            options.forEach(o => { if (o.dataset.value === correct) o.classList.add('correct'); });
            if (explanation) {
              explanation.classList.add('show', 'wrong-exp');
              explanation.textContent = '✗ ' + (explanation.dataset.text || '');
            }
          }
          if (answered === activeCount) showScore();
        });
      });
    }

    if (type === 'terminal') {
      const termInput = q.querySelector('.quiz-terminal-input');
      const checkBtn = q.querySelector('.quiz-check');
      const expected = q.dataset.answer;
      const explanation = q.querySelector('.quiz-explanation');
      const resultEl = q.querySelector('.quiz-terminal-result');

      checkBtn.addEventListener('click', () => {
        const userCmd = termInput.value.trim();
        answered++;
        const normalize = s => s.replace(/\s+/g, ' ').replace(/['"]/g, '').trim();
        const answers = expected.split('||').map(normalize);
        if (answers.includes(normalize(userCmd))) {
          score++;
          resultEl.innerHTML = '<span style="color:var(--green)">✓ Correct!</span>';
          termInput.style.borderColor = 'var(--green)';
          if (explanation) { explanation.classList.add('show', 'correct-exp'); explanation.textContent = '✓ ' + (explanation.dataset.text || ''); }
        } else {
          resultEl.innerHTML = `<span style="color:var(--red)">✗ Expected: <code>${expected.split('||')[0]}</code></span>`;
          termInput.style.borderColor = 'var(--red)';
          if (explanation) { explanation.classList.add('show', 'wrong-exp'); explanation.textContent = '✗ ' + (explanation.dataset.text || ''); }
        }
        checkBtn.disabled = true;
        termInput.disabled = true;
        if (answered === activeCount) showScore();
      });
      termInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !checkBtn.disabled) checkBtn.click(); });
    }

    if (type === 'fillin') {
      const fillInput = q.querySelector('.quiz-fill-input');
      const checkBtn = q.querySelector('.quiz-check');
      const expected = q.dataset.answer;
      const explanation = q.querySelector('.quiz-explanation');

      checkBtn.addEventListener('click', () => {
        answered++;
        const userAns = fillInput.value.trim().toLowerCase();
        const answers = expected.toLowerCase().split('||');
        if (answers.includes(userAns)) {
          score++;
          fillInput.style.borderColor = 'var(--green)';
          if (explanation) { explanation.classList.add('show', 'correct-exp'); explanation.textContent = '✓ ' + (explanation.dataset.text || ''); }
        } else {
          fillInput.style.borderColor = 'var(--red)';
          if (explanation) { explanation.classList.add('show', 'wrong-exp'); explanation.textContent = '✗ Answer: ' + expected.split('||')[0] + '. ' + (explanation.dataset.text || ''); }
        }
        checkBtn.disabled = true;
        fillInput.disabled = true;
        if (answered === activeCount) showScore();
      });
      fillInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !checkBtn.disabled) checkBtn.click(); });
    }
  });

  // Insert unlock CTA after free questions if not premium
  if (!premium) {
    const cta = document.createElement('div');
    cta.className = 'unlock-cta';
    cta.innerHTML = `
      <div style="text-align:center;padding:2rem;background:linear-gradient(135deg,rgba(56,189,248,.08),rgba(167,139,250,.08));border:1px solid var(--border);border-radius:12px;margin:1.5rem 0;">
        <div style="font-size:2rem;margin-bottom:.75rem;">🔓</div>
        <h3 style="margin-bottom:.5rem;">Unlock All Quiz Questions</h3>
        <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1rem;">Get 10+ additional hands-on questions per chapter, covering real bioinformatics scenarios.</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;align-items:center;">
          <a href="https://rzp.io/rzp/Vv4GNpZ" target="_blank" class="hero-btn" style="font-size:.85rem;padding:.6rem 1.5rem;text-decoration:none;">
            Unlock All Quizzes — $25
          </a>
          <span style="color:var(--text-muted);font-size:.8rem;">or</span>
          <div style="display:flex;gap:.5rem;align-items:center;">
            <input type="text" id="licenseKey" placeholder="Enter license key" style="padding:.5rem .75rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.8rem;width:160px;">
            <button onclick="handleUnlock()" style="padding:.5rem 1rem;background:var(--accent);color:#0f172a;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:.8rem;">Activate</button>
          </div>
        </div>
        <div id="unlockMsg" style="margin-top:.5rem;font-size:.8rem;"></div>
      </div>`;

    // Insert after the last free question
    const freeQuestions = container.querySelectorAll('.quiz-question:not(.premium)');
    const premiumQuestions = container.querySelectorAll('.quiz-question.premium');
    if (premiumQuestions.length > 0) {
      premiumQuestions[0].parentNode.insertBefore(cta, premiumQuestions[0]);
    } else {
      container.appendChild(cta);
    }
  }

  function showScore() {
    if (!scoreEl) return;
    const pct = Math.round((score / activeCount) * 100);
    scoreEl.style.display = 'block';
    scoreEl.innerHTML = `
      <div class="score-num">${score}/${activeCount}</div>
      <h3>${pct >= 80 ? '🎉 Excellent!' : pct >= 50 ? '👍 Good effort!' : '📖 Keep studying!'}</h3>
      <p>You scored ${pct}%${!premium ? ' (free questions only)' : ''}</p>
      <button class="quiz-reset" onclick="location.reload()">Retry Quiz</button>`;
  }
}

// Global unlock handler
window.handleUnlock = function () {
  const input = document.getElementById('licenseKey');
  const msg = document.getElementById('unlockMsg');
  if (!input || !msg) return;
  if (unlockPremium(input.value)) {
    msg.innerHTML = '<span style="color:var(--green)">✓ Unlocked! Refreshing...</span>';
    setTimeout(() => location.reload(), 1000);
  } else {
    msg.innerHTML = '<span style="color:var(--red)">✗ Invalid key. Purchase access or check your key.</span>';
  }
};
