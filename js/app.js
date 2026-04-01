const state = {
  currentPage: 'home',
  progress: JSON.parse(localStorage.getItem('bsl_progress') || '{}'),
  theme: localStorage.getItem('bsl_theme') || 'dark'
};

const chapters = [
  {id:'ch1', title:'What is Bioinformatics?', icon:'book-open', part:'Foundations', tags:['Biology','Data','History'], desc:'The central dogma, why computation matters, and the landscape of modern genomics.'},
  {id:'ch2', title:'Setting Up Your Environment', icon:'settings', part:'Foundations', tags:['Linux','Conda','WSL'], desc:'WSL, Conda environments, project structure, and documentation with Markdown.'},
  {id:'ch3', title:'Unix Fundamentals', icon:'terminal', part:'Foundations', tags:['Shell','Pipes','grep','awk'], desc:'Navigation, file ops, pipes, redirection, grep, awk, sed — the bioinformatics backbone.'},
  {id:'ch4', title:'Advanced Shell & Scripting', icon:'file-code-2', part:'Foundations', tags:['Bash','Loops','xargs','Make'], desc:'Bash scripts, loops, find/xargs, parallelization, and Makefiles for pipelines.'},
  {id:'ch5', title:'Version Control with Git', icon:'git-branch', part:'Foundations', tags:['Git','GitHub','Branches'], desc:'Repos, commits, branches, merging, .gitignore, and collaborating via GitHub.'},
  {id:'ch6', title:'Python for Bioinformatics', icon:'code-2', part:'Programming', tags:['Biopython','Parsing','Automation'], desc:'Parsing FASTA/FASTQ, Biopython, BLAST, sequence manipulation, and automation.'},
  {id:'ch7', title:'R & Bioconductor', icon:'bar-chart-3', part:'Programming', tags:['ggplot2','dplyr','DESeq2'], desc:'Data wrangling with dplyr, visualization with ggplot2, and Bioconductor packages.'},
  {id:'ch8', title:'Biological Databases', icon:'database', part:'Data & Formats', tags:['NCBI','UniProt','Ensembl'], desc:'NCBI, Ensembl, UniProt, UCSC — how to find, download, and verify biological data.'},
  {id:'ch9', title:'Sequence Formats & QC', icon:'flask-conical', part:'Data & Formats', tags:['FASTA','FASTQ','FastQC'], desc:'FASTA, FASTQ, Phred scores, FastQC, trimming with fastp and Trimmomatic.'},
  {id:'ch10', title:'Sequence Alignment', icon:'crosshair', part:'Data & Formats', tags:['BLAST','BWA','SAM/BAM'], desc:'BLAST, BWA, SAM/BAM format, CIGAR strings, flags, and samtools.'},
  {id:'ch11', title:'Genomic Ranges & BEDTools', icon:'ruler', part:'Data & Formats', tags:['BED','Intervals','Overlaps'], desc:'Coordinate systems, BED format, BEDTools operations, and GenomicRanges in R.'},
  {id:'ch12', title:'RNA-Seq Analysis', icon:'dna', part:'Analysis', tags:['DESeq2','edgeR','Pathways'], desc:'Full RNA-Seq pipeline: QC → alignment → counting → DE → visualization → pathways.'},
  {id:'ch13', title:'Variant Calling', icon:'microscope', part:'Analysis', tags:['GATK','VCF','SNPs'], desc:'GATK best practices, VCF format, genotypes, filtering, and annotation with SnpEff.'},
  {id:'ch14', title:'Reproducibility & Pipelines', icon:'package', part:'Analysis', tags:['Snakemake','Docker','SQLite'], desc:'Snakemake, Nextflow, Docker/Singularity, SQLite, and the reproducibility checklist.'},
];

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  setupNav();
  setupThemeToggle();
  setupMenuBtn();
  navigate('home');
  updateProgress();
  lucide.createIcons();
});

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = state.theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
  lucide.createIcons();
}

function setupThemeToggle() {
  document.getElementById('themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('bsl_theme', state.theme);
    applyTheme();
  });
}

function setupMenuBtn() {
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

function setupNav() {
  document.querySelectorAll('#sidebarNav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.dataset.page);
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll('#sidebarNav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
    if (a.dataset.page && state.progress[a.dataset.page]) {
      if (!a.querySelector('.badge')) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = '✓';
        a.appendChild(b);
      }
    }
  });
  const bc = document.getElementById('breadcrumb');
  if (page === 'home') bc.innerHTML = 'Home';
  else {
    const ch = chapters.find(c => c.id === page);
    bc.innerHTML = ch
      ? `<a href="#" onclick="navigate('home');return false">Home</a> / <span>${ch.title}</span>`
      : `<a href="#" onclick="navigate('home');return false">Home</a> / <span>${page.charAt(0).toUpperCase()+page.slice(1)}</span>`;
  }
  loadPage(page);
  window.scrollTo(0, 0);
}

async function loadPage(page) {
  const el = document.getElementById('content');
  if (page === 'home') { renderHome(el); return; }
  if (page === 'resources') { renderResources(el); return; }
  if (page === 'glossary') { renderGlossary(el); return; }
  if (page === 'cheatsheets') { renderCheatSheets(el); return; }
  try {
    const resp = await fetch(`chapters/${page}.html`);
    if (!resp.ok) throw new Error();
    el.innerHTML = await resp.text();
    initChapterPage(page);
    lucide.createIcons();
  } catch {
    el.innerHTML = `<div class="module-page"><div class="module-header"><h1>Coming Soon</h1><p>This chapter is being written. Check back soon!</p></div></div>`;
  }
}

function renderHome(el) {
  const partColors = {'Foundations':'var(--accent)','Programming':'var(--purple)','Data & Formats':'var(--green)','Analysis':'var(--orange)'};
  let cards = chapters.map(ch => {
    const pct = state.progress[ch.id] || 0;
    return `<div class="module-card" data-part="${ch.part}" onclick="navigate('${ch.id}')">
      <div class="icon"><i data-lucide="${ch.icon}"></i></div>
      <h3>${ch.title}</h3>
      <p class="card-desc">${ch.desc}</p>
      <div style="margin-top:auto;">${ch.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="progress-mini"><div class="progress-mini-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="hero">
      <div style="margin-bottom:1.5rem;"><i data-lucide="dna" style="width:56px;height:56px;color:var(--accent);"></i></div>
      <h1>Welcome to <span class="brand-bio">BioSkills</span> <span class="brand-rest">Lab</span></h1>
      <p>Learn bioinformatics from scratch through interactive lessons, a built-in Linux terminal simulator, and hands-on quizzes on real genomic data.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem;">
        <button class="hero-btn" onclick="navigate('ch1')"><i data-lucide="play" style="width:18px;height:18px;"></i> Start Learning</button>
        <button class="hero-btn" onclick="navigate('resources')" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);"><i data-lucide="library" style="width:18px;height:18px;"></i> Resources</button>
      </div>
    </div>

    <!-- STATS BAR -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-bottom:2rem;">
      <div style="text-align:center;padding:1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
        <div style="font-size:1.8rem;font-weight:800;color:var(--accent);">14</div>
        <div style="font-size:.8rem;color:var(--text-muted);">Chapters</div>
      </div>
      <div style="text-align:center;padding:1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
        <div style="font-size:1.8rem;font-weight:800;color:var(--purple);">150+</div>
        <div style="font-size:.8rem;color:var(--text-muted);">Quiz Questions</div>
      </div>
      <div style="text-align:center;padding:1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
        <div style="font-size:1.8rem;font-weight:800;color:var(--green);">3</div>
        <div style="font-size:.8rem;color:var(--text-muted);">Interactive Terminals</div>
      </div>
      <div style="text-align:center;padding:1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
        <div style="font-size:1.8rem;font-weight:800;color:var(--orange);">Free</div>
        <div style="font-size:.8rem;color:var(--text-muted);">To Start</div>
      </div>
    </div>

    <!-- TRY IT LIVE -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:1.5rem;margin-bottom:2rem;">
      <h3 style="margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="terminal" style="width:20px;height:20px;color:var(--green);"></i> Try It Live — Interactive Terminal</h3>
      <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:1rem;">Practice real bioinformatics commands right in your browser. Type <code>help</code> to start, or try <code>grep -c ">" sequences.fasta</code></p>
      <div class="terminal">
        <div class="terminal-bar"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div><span class="title">biolab — bash</span></div>
        <div class="terminal-body">
          <div class="line output">Welcome! Files: sequences.fasta, reads.fastq, genes.bed, counts.tsv</div>
          <div class="line output">────────────────────────────────────────────────</div>
          <div class="terminal-input-line"><span class="prompt">user@biolab:~$</span><input type="text" class="terminal-input"></div>
        </div>
      </div>
    </div>

    <h2 style="margin-bottom:1rem;font-size:1.2rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="layers" style="width:20px;height:20px;color:var(--accent);"></i> Course Chapters</h2>
    <div class="modules-grid">${cards}</div>
    <h2 style="margin:1.5rem 0 1rem;font-size:1.2rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="bookmark" style="width:20px;height:20px;color:var(--accent);"></i> Quick Access</h2>
    <div class="modules-grid">
      <div class="module-card" onclick="navigate('resources')"><div class="icon"><i data-lucide="library"></i></div><h3>Resource Library</h3><p class="card-desc">Curated books, online courses, databases, tools, and communities.</p></div>
      <div class="module-card" onclick="navigate('glossary')"><div class="icon"><i data-lucide="scroll-text"></i></div><h3>Glossary</h3><p class="card-desc">50+ searchable bioinformatics terms with clear definitions.</p></div>
      <div class="module-card" onclick="navigate('cheatsheets')"><div class="icon"><i data-lucide="clipboard-list"></i></div><h3>Cheat Sheets</h3><p class="card-desc">Quick references for Unix, samtools, R, Python, and file formats.</p></div>
    </div>

    <!-- EMAIL CAPTURE -->
    <div style="margin-top:2rem;padding:2rem;background:linear-gradient(135deg,rgba(56,189,248,.06),rgba(167,139,250,.06));border:1px solid var(--border);border-radius:12px;text-align:center;">
      <h3 style="margin-bottom:.5rem;display:flex;align-items:center;justify-content:center;gap:.5rem;"><i data-lucide="mail" style="width:22px;height:22px;color:var(--accent);"></i> Stay Updated</h3>
      <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1rem;">Get notified when we add new chapters, datasets, and advanced projects.</p>
      <div style="display:flex;gap:.5rem;max-width:450px;margin:0 auto;flex-wrap:wrap;justify-content:center;">
        <input type="email" id="emailCapture" placeholder="your@email.com" style="flex:1;min-width:200px;padding:.65rem 1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;">
        <button onclick="captureEmail()" style="padding:.65rem 1.25rem;background:var(--accent);color:#0f172a;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;">Subscribe</button>
      </div>
      <div id="emailMsg" style="margin-top:.5rem;font-size:.8rem;"></div>
      <p style="color:var(--text-muted);font-size:.7rem;margin-top:.5rem;">No spam. Unsubscribe anytime.</p>
    </div>

    <!-- SOCIAL PROOF / WHAT YOU'LL LEARN -->
    <div style="margin-top:2rem;padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="target" style="width:20px;height:20px;color:var(--green);"></i> By the End of This Course, You Will</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem;">
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Navigate Linux and process files with grep, awk, sed, and pipes</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Parse FASTA/FASTQ files and automate tasks with Python &amp; Biopython</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Visualize data and run DE analysis with R, ggplot2, and DESeq2</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Align reads with BWA/STAR and manipulate BAM files with samtools</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Call variants with GATK and annotate VCF files</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Build reproducible pipelines with Snakemake, Git, and Docker</div>
      </div>
    </div>

    <!-- LEARNING ROADMAP -->
    <div style="margin-top:2rem;padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="map" style="width:20px;height:20px;color:var(--accent);"></i> Learning Roadmap</h3>
      <div style="position:relative;padding-left:2rem;">
        <div style="position:absolute;left:.55rem;top:0;bottom:0;width:2px;background:var(--border);"></div>
        <div style="margin-bottom:1.25rem;position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--accent);"></div><div style="font-weight:700;font-size:.9rem;color:var(--accent);">Phase 1: Foundations</div><div style="font-size:.8rem;color:var(--text-muted);">Unix command line → Shell scripting → Git version control → Project setup</div></div>
        <div style="margin-bottom:1.25rem;position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--purple);"></div><div style="font-weight:700;font-size:.9rem;color:var(--purple);">Phase 2: Programming</div><div style="font-size:.8rem;color:var(--text-muted);">Python + Biopython → R + ggplot2 + Bioconductor</div></div>
        <div style="margin-bottom:1.25rem;position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--green);"></div><div style="font-weight:700;font-size:.9rem;color:var(--green);">Phase 3: Data &amp; Formats</div><div style="font-size:.8rem;color:var(--text-muted);">FASTA/FASTQ → Quality control → Alignment (SAM/BAM) → Genomic ranges (BED)</div></div>
        <div style="position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--orange);"></div><div style="font-weight:700;font-size:.9rem;color:var(--orange);">Phase 4: Real Analysis</div><div style="font-size:.8rem;color:var(--text-muted);">RNA-Seq differential expression → Variant calling → Reproducible pipelines</div></div>
      </div>
    </div>

    <!-- COMMON BEGINNER MISTAKES -->
    <div style="margin-top:2rem;padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="alert-triangle" style="width:20px;height:20px;color:var(--orange);"></i> Common Beginner Mistakes We Help You Avoid</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem;">
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Confusing FASTA and FASTQ formats</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Using the wrong reference genome build (hg19 vs hg38)</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Mixing up 0-based (BED) and 1-based (VCF/GFF) coordinates</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Using raw p-values instead of adjusted p-values (FDR)</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Feeding normalized counts to DESeq2 (it needs raw counts)</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Modifying raw data files instead of treating them as read-only</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Confusing samtools -f and -F flags (include vs exclude)</div>
        <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Running RNA-Seq alignment with BWA instead of a splice-aware aligner</div>
      </div>
    </div>

    <!-- BUILT BY -->
    <div style="margin-top:2rem;padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;flex-shrink:0;">AB</div>
      <div style="flex:1;min-width:200px;">
        <h3 style="font-size:1rem;margin-bottom:.25rem;">Built by Aadil Bhat</h3>
        <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:.5rem;">Bioinformatics developer and educator. Passionate about making genomics accessible to everyone.</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
          <a href="https://github.com/AadilRashid" target="_blank" style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;"><i data-lucide="github" style="width:14px;height:14px;"></i> GitHub</a>
          <a href="https://linkedin.com/in/" target="_blank" style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;"><i data-lucide="linkedin" style="width:14px;height:14px;"></i> LinkedIn</a>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function initChapterPage(chId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
  document.querySelectorAll('.terminal').forEach(t => initTerminal(t));
  document.querySelectorAll('.quiz-container').forEach(q => initQuiz(q, chId));
  const forum = document.getElementById('forum');
  if (forum) initForum(forum, chId);
  const completeBtn = document.getElementById('markComplete');
  if (completeBtn) {
    if (state.progress[chId]) { completeBtn.textContent = '✓ Completed'; completeBtn.style.opacity = '.7'; }
    completeBtn.addEventListener('click', () => {
      state.progress[chId] = 100;
      localStorage.setItem('bsl_progress', JSON.stringify(state.progress));
      completeBtn.textContent = '✓ Completed';
      completeBtn.style.opacity = '.7';
      updateProgress();
    });
  }
}

function updateProgress() {
  const done = chapters.filter(c => state.progress[c.id]).length;
  const pct = Math.round((done / chapters.length) * 100);
  document.getElementById('progressText').textContent = pct + '%';
  document.getElementById('progressBar').style.width = pct + '%';
}

function renderResources(el) {
  el.innerHTML = `<div class="module-page"><div class="module-header"><h1><i data-lucide="library" style="width:28px;height:28px;display:inline;vertical-align:middle;margin-right:.5rem;"></i> Resource Library</h1></div>
  <div class="lesson">
  <h2>Books</h2>
  <ul>
    <li><strong>Bioinformatics Data Skills</strong> — Vince Buffalo (O'Reilly) — The practical skills bible</li>
    <li><strong>Biological Sequence Analysis</strong> — Durbin et al. — HMMs, alignments, probabilistic models</li>
    <li><strong>Bioinformatics and Functional Genomics</strong> — Pevsner — Comprehensive textbook</li>
    <li><strong>R for Data Science</strong> — Wickham &amp; Grolemund — Essential R skills</li>
    <li><strong>Python for Biologists</strong> — Martin Jones — Gentle Python intro for biologists</li>
    <li><strong>The Biostar Handbook</strong> — Istvan Albert — Practical genomics guide</li>
    <li><strong>An Introduction to Statistical Learning (ISLR)</strong> — James et al. — ML foundations</li>
    <li><strong>Computational Biology: A Hypertextbook</strong> — Kelley &amp; Didulo — Modern intro</li>
  </ul>
  <h2>Online Courses</h2>
  <ul>
    <li><a href="https://www.coursera.org/specializations/genomic-data-science" target="_blank">Genomic Data Science Specialization</a> — Johns Hopkins / Coursera</li>
    <li><a href="https://rosalind.info" target="_blank">Rosalind</a> — Learn bioinformatics through problem solving</li>
    <li><a href="https://sandbox.bio" target="_blank">sandbox.bio</a> — Interactive bioinformatics tutorials in browser</li>
    <li><a href="https://www.edx.org/learn/bioinformatics" target="_blank">edX Bioinformatics courses</a></li>
    <li><a href="https://training.galaxyproject.org" target="_blank">Galaxy Training Network</a> — Free tutorials</li>
    <li><a href="https://www.bioinformatics.org/wiki/Main_Page" target="_blank">Bioinformatics.org</a> — Community wiki</li>
  </ul>
  <h2>Key Databases</h2>
  <ul>
    <li><a href="https://www.ncbi.nlm.nih.gov/" target="_blank">NCBI</a> — GenBank, PubMed, SRA, GEO</li>
    <li><a href="https://www.uniprot.org/" target="_blank">UniProt</a> — Protein sequences &amp; annotation</li>
    <li><a href="https://www.ensembl.org/" target="_blank">Ensembl</a> — Genome browser &amp; annotation</li>
    <li><a href="https://genome.ucsc.edu/" target="_blank">UCSC Genome Browser</a></li>
    <li><a href="https://www.ebi.ac.uk/" target="_blank">EMBL-EBI</a> — European bioinformatics hub</li>
    <li><a href="https://www.rcsb.org/" target="_blank">PDB</a> — Protein 3D structures</li>
  </ul>
  <h2>Essential Tools</h2>
  <ul>
    <li><strong>samtools</strong> — SAM/BAM manipulation</li>
    <li><strong>BEDTools</strong> — Genomic interval operations</li>
    <li><strong>BLAST+</strong> — Sequence similarity search</li>
    <li><strong>BWA / Bowtie2</strong> — Short read alignment</li>
    <li><strong>GATK</strong> — Variant calling</li>
    <li><strong>FastQC / MultiQC</strong> — Quality control</li>
    <li><strong>Trimmomatic / fastp</strong> — Read trimming</li>
    <li><strong>DESeq2 / edgeR</strong> — Differential expression</li>
    <li><strong>Snakemake / Nextflow</strong> — Workflow managers</li>
    <li><strong>IGV</strong> — Integrative Genomics Viewer</li>
  </ul>
  <h2>Communities</h2>
  <ul>
    <li><a href="https://www.biostars.org/" target="_blank">Biostars</a> — Q&amp;A forum</li>
    <li><a href="https://www.seqanswers.com/" target="_blank">SEQanswers</a> — Sequencing community</li>
    <li><a href="https://www.reddit.com/r/bioinformatics/" target="_blank">r/bioinformatics</a> — Reddit community</li>
  </ul>
  </div></div>`;
  lucide.createIcons();
}

function renderGlossary(el) {
  const terms = [
    ['Alignment','Arranging sequences to identify regions of similarity, indicating functional, structural, or evolutionary relationships.'],
    ['Annotation','Adding biological information (gene names, functions) to a genome sequence.'],
    ['BAM','Binary version of SAM format. Compressed, indexed, efficient for storage and random access.'],
    ['Base Quality (Phred Score)','A score Q = -10 log₁₀(P) where P is the probability of an incorrect base call. Q30 = 99.9% accuracy.'],
    ['BED','Tab-delimited format for genomic intervals: chrom, start, end (0-based, half-open).'],
    ['Bioconductor','R-based open-source project for genomic data analysis with 2000+ packages.'],
    ['BLAST','Basic Local Alignment Search Tool — finds regions of similarity between sequences.'],
    ['Bowtie2','Fast short-read aligner for aligning sequencing reads to a reference genome.'],
    ['BWA','Burrows-Wheeler Aligner — maps low-divergent sequences against a large reference genome.'],
    ['CIGAR String','Compact representation of how a read aligns to a reference (e.g., 50M2I48M).'],
    ['Conda','Package and environment manager widely used in bioinformatics.'],
    ['Contig','A contiguous sequence assembled from overlapping reads.'],
    ['Coverage/Depth','Average number of reads covering each base in a genome.'],
    ['DESeq2','R/Bioconductor package for differential gene expression analysis from RNA-Seq count data.'],
    ['Differential Expression','Statistical identification of genes with significantly different expression levels between conditions.'],
    ['DNA','Deoxyribonucleic acid — the molecule carrying genetic instructions.'],
    ['FASTA','Text format for nucleotide/protein sequences. Header line starts with >, followed by sequence.'],
    ['FASTQ','Extension of FASTA that includes quality scores for each base. Standard for sequencing output.'],
    ['FastQC','Quality control tool for high-throughput sequencing data.'],
    ['GATK','Genome Analysis Toolkit — industry-standard variant calling pipeline.'],
    ['GFF/GTF','General Feature Format — tab-delimited format for describing genes and other features.'],
    ['Genome','The complete set of DNA in an organism, including all genes and non-coding sequences.'],
    ['GenomicRanges','Bioconductor package for representing and manipulating genomic intervals.'],
    ['GRCh38/hg38','Current human reference genome assembly.'],
    ['Homology','Similarity due to shared ancestry between sequences or structures.'],
    ['IGV','Integrative Genomics Viewer — visualization tool for genomic data.'],
    ['Indel','Insertion or deletion mutation in a DNA sequence.'],
    ['k-mer','A subsequence of length k from a biological sequence.'],
    ['Mapping Quality (MAPQ)','Confidence that a read is mapped to the correct position. MAPQ = -10 log₁₀(P).'],
    ['NCBI','National Center for Biotechnology Information — major US bioinformatics resource.'],
    ['Next-Generation Sequencing (NGS)','High-throughput sequencing technologies (Illumina, PacBio, Nanopore).'],
    ['Ortholog','Genes in different species that evolved from a common ancestor by speciation.'],
    ['Paired-End Reads','Sequencing both ends of a DNA fragment, providing better alignment and structural info.'],
    ['Paralog','Genes related by duplication within a genome.'],
    ['PCR','Polymerase Chain Reaction — method to amplify specific DNA segments.'],
    ['Pipeline','A series of computational steps chained together to process data.'],
    ['Read','A short DNA sequence produced by a sequencing machine.'],
    ['Reference Genome','A representative example of a species genome used as a standard for alignment.'],
    ['RNA','Ribonucleic acid — molecule involved in coding, decoding, regulation of gene expression.'],
    ['RNA-Seq','Sequencing of RNA to measure gene expression levels across the transcriptome.'],
    ['SAM','Sequence Alignment/Map format — tab-delimited text format for storing read alignments.'],
    ['Scaffold','Ordered and oriented contigs with gaps of estimated size.'],
    ['SNP','Single Nucleotide Polymorphism — a variation at a single position in DNA.'],
    ['Transcriptome','The complete set of RNA transcripts produced by the genome at a given time.'],
    ['Trimming','Removing low-quality bases or adapter sequences from sequencing reads.'],
    ['UniProt','Comprehensive protein sequence and functional information database.'],
    ['VCF','Variant Call Format — standard for storing gene sequence variations.'],
    ['Variant','A difference between a sample sequence and the reference genome.'],
  ];
  const rows = terms.map(([t,d]) => `<tr><td><strong>${t}</strong></td><td>${d}</td></tr>`).join('');
  el.innerHTML = `<div class="module-page"><div class="module-header"><h1><i data-lucide="scroll-text" style="width:28px;height:28px;display:inline;vertical-align:middle;margin-right:.5rem;"></i> Glossary</h1></div>
  <input type="text" id="glossarySearch" placeholder="Search terms..." style="width:100%;padding:.75rem 1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;margin-bottom:1rem;">
  <table style="width:100%;border-collapse:collapse;" id="glossaryTable">
  <thead><tr><th style="text-align:left;padding:.75rem;border-bottom:2px solid var(--border);width:200px;">Term</th><th style="text-align:left;padding:.75rem;border-bottom:2px solid var(--border);">Definition</th></tr></thead>
  <tbody>${rows}</tbody></table></div>`;
  document.getElementById('glossarySearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#glossaryTable tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  lucide.createIcons();
}

function renderCheatSheets(el) {
  el.innerHTML = `<div class="module-page"><div class="module-header"><h1><i data-lucide="clipboard-list" style="width:28px;height:28px;display:inline;vertical-align:middle;margin-right:.5rem;"></i> Cheat Sheets</h1></div>
  <div class="lesson">
  <h2>Unix/Bash Essentials</h2>
  <pre><code># Navigation
pwd                    # Print working directory
ls -lah                # List files (long, all, human-readable)
cd /path/to/dir        # Change directory
mkdir -p dir/subdir    # Create nested directories

# File Operations
cp src dest            # Copy file
mv src dest            # Move/rename
rm -r dir              # Remove directory recursively
cat file.txt           # Print file contents
head -n 20 file.txt    # First 20 lines
tail -n 20 file.txt    # Last 20 lines
wc -l file.txt         # Count lines

# Pipes &amp; Redirection
cmd > out.txt          # Redirect stdout to file
cmd 2> err.txt         # Redirect stderr
cmd1 | cmd2            # Pipe stdout to next command
cmd >> out.txt         # Append to file

# Text Processing
grep "pattern" file    # Search for pattern
grep -c ">" seqs.fa    # Count FASTA sequences
awk '{print $1}' file  # Print first column
sed 's/old/new/g' file # Find and replace
sort -k2,2n file       # Sort by column 2 numerically
uniq -c                # Count unique lines
cut -f1,3 file.tsv     # Extract columns 1 and 3

# Bioinformatics One-Liners
grep -c "^>" seqs.fasta                          # Count sequences
awk '/^>/{if(s)print length(s);s="";next}{s=s$0}END{print length(s)}' seqs.fa  # Seq lengths
cat file.fastq | awk 'NR%4==2{sum+=length($0);c++}END{print sum/c}'  # Avg read length
samtools view -c -F 4 aligned.bam                # Count mapped reads
bedtools intersect -a peaks.bed -b genes.bed     # Find overlapping regions</code></pre>

  <h2>samtools Quick Reference</h2>
  <pre><code>samtools view -bS in.sam > out.bam     # SAM to BAM
samtools sort in.bam -o sorted.bam     # Sort BAM
samtools index sorted.bam              # Index BAM
samtools flagstat sorted.bam           # Alignment stats
samtools view -c -F 4 sorted.bam      # Count mapped reads
samtools view -c -f 4 sorted.bam      # Count unmapped reads
samtools depth sorted.bam              # Per-base depth
samtools idxstats sorted.bam           # Per-chromosome counts
samtools view -b -q 30 sorted.bam     # Filter by MAPQ ≥ 30</code></pre>

  <h2>R Essentials</h2>
  <pre><code># Data I/O
df &lt;- read.csv("data.csv")
df &lt;- read.delim("data.tsv")
write.csv(df, "out.csv", row.names=FALSE)

# dplyr verbs
library(dplyr)
df %&gt;% filter(pvalue &lt; 0.05)
df %&gt;% select(gene, log2FC, pvalue)
df %&gt;% mutate(sig = pvalue &lt; 0.05)
df %&gt;% group_by(condition) %&gt;% summarise(mean_expr = mean(expression))
df %&gt;% arrange(desc(log2FC))

# ggplot2
library(ggplot2)
ggplot(df, aes(x=log2FC, y=-log10(pvalue))) + geom_point()   # Volcano plot
ggplot(df, aes(x=condition, y=expression)) + geom_boxplot()   # Box plot

# DESeq2 minimal workflow
library(DESeq2)
dds &lt;- DESeqDataSetFromMatrix(countData=counts, colData=coldata, design=~condition)
dds &lt;- DESeq(dds)
res &lt;- results(dds)
res_sig &lt;- subset(res, padj &lt; 0.05)</code></pre>

  <h2>Python / Biopython</h2>
  <pre><code># Biopython basics
from Bio import SeqIO

# Parse FASTA
for record in SeqIO.parse("seqs.fasta", "fasta"):
    print(record.id, len(record.seq))

# Parse FASTQ
for record in SeqIO.parse("reads.fastq", "fastq"):
    quals = record.letter_annotations["phred_quality"]
    print(record.id, sum(quals)/len(quals))

# BLAST from Python
from Bio.Blast import NCBIWWW, NCBIXML
result = NCBIWWW.qblast("blastn", "nt", sequence)
records = NCBIXML.parse(result)</code></pre>

  <h2>File Format Quick Reference</h2>
  <pre><code># FASTA
>sequence_id description
ATCGATCGATCG...

# FASTQ (4 lines per read)
@read_id
ATCGATCGATCG
+
IIIIIIIIIHII

# BED (0-based, tab-separated)
chr1    1000    2000    gene_name    score    strand

# SAM (tab-separated, header lines start with @)
@HD  VN:1.6  SO:coordinate
read1  0  chr1  100  60  50M  *  0  0  ATCG...  IIII...

# VCF
#CHROM  POS  ID  REF  ALT  QUAL  FILTER  INFO
chr1    12345  .  A    G    99    PASS    DP=30</code></pre>
  </div></div>`;
  lucide.createIcons();
}


// Email capture (stores locally — replace with real email service later)
function captureEmail() {
  const input = document.getElementById('emailCapture');
  const msg = document.getElementById('emailMsg');
  if (!input || !msg) return;
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    msg.innerHTML = '<span style="color:var(--red)">Please enter a valid email.</span>';
    return;
  }
  const emails = JSON.parse(localStorage.getItem('bsl_emails') || '[]');
  if (emails.includes(email)) {
    msg.innerHTML = '<span style="color:var(--orange)">You\'re already subscribed!</span>';
    return;
  }
  emails.push(email);
  localStorage.setItem('bsl_emails', JSON.stringify(emails));
  msg.innerHTML = '<span style="color:var(--green)">✓ Subscribed! We\'ll keep you posted.</span>';
  input.value = '';
}
window.captureEmail = captureEmail;

// Re-init terminals after home page renders
const origNavigate = navigate;
const _patchedNav = navigate;
document.addEventListener('click', () => {
  setTimeout(() => {
    document.querySelectorAll('#content .terminal').forEach(t => {
      if (!t.dataset.init) {
        initTerminal(t);
        t.dataset.init = 'true';
      }
    });
  }, 100);
});
