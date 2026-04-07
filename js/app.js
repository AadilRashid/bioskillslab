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
  {id:'project1', title:'Project: Mystery Microbe', icon:'flask-conical', part:'Projects', tags:['BLAST','QC','Species ID'], desc:'Identify an unknown bacterial species from raw sequencing data using BLAST.'},
  {id:'project2', title:'Project: RNA-Seq Analysis', icon:'dna', part:'Projects', tags:['STAR','DESeq2','Volcano'], desc:'Full RNA-Seq pipeline on real published data — find dexamethasone-responsive genes.'},
  {id:'project3', title:'Project: Variant Calling', icon:'microscope', part:'Projects', tags:['GATK','VCF','Clinical'], desc:'GATK best practices on NA12878 — call, filter, annotate, and validate variants.'},
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
  if (page === 'stat-resources') { renderStatResources(el); return; }
  if (page === 'stat-glossary') { renderStatGlossary(el); return; }
  if (page === 'glossary') { renderGlossary(el); return; }
  if (page === 'cheatsheets') { renderCheatSheets(el); return; }
  try {
    let chapterPath = `chapters/${page}.html`;
    if (page.startsWith('stat')) chapterPath = `chapters/stats/${page}.html`;
    const resp = await fetch(chapterPath);
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
      <div class="hero-deco"><canvas id="helixCanvas" width="200" height="60"></canvas></div>
      <h1>Welcome to <span class="brand-bio">BioSkills</span> <span class="brand-rest">Lab</span></h1>
      <p>Learn bioinformatics from scratch through interactive lessons, a built-in Linux terminal simulator, and hands-on quizzes on real genomic data.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem;">
        <button class="hero-btn" onclick="navigate('ch1')"><i data-lucide="play" style="width:18px;height:18px;"></i> Start Learning</button>
        <button class="hero-btn" onclick="navigate('resources')" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);"><i data-lucide="library" style="width:18px;height:18px;"></i> Resources</button>
      </div>
    </div>

    <!-- STATS BAR -->
    <div style="display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;margin-bottom:2rem;padding:1rem 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:.5rem;"><span style="font-size:1.5rem;font-weight:800;color:var(--accent);">14</span><span style="font-size:.8rem;color:var(--text-muted);">Chapters</span></div>
      <div style="width:1px;background:var(--border);"></div>
      <div style="display:flex;align-items:center;gap:.5rem;"><span style="font-size:1.5rem;font-weight:800;color:var(--purple);">150+</span><span style="font-size:.8rem;color:var(--text-muted);">Quizzes</span></div>
      <div style="width:1px;background:var(--border);"></div>
      <div style="display:flex;align-items:center;gap:.5rem;"><span style="font-size:1.5rem;font-weight:800;color:var(--green);">3</span><span style="font-size:.8rem;color:var(--text-muted);">Projects</span></div>
      <div style="width:1px;background:var(--border);"></div>
      <div style="display:flex;align-items:center;gap:.5rem;"><span style="font-size:1.5rem;font-weight:800;color:var(--orange);">Free</span><span style="font-size:.8rem;color:var(--text-muted);">Forever</span></div>
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

    <h2 style="margin-bottom:1rem;font-size:1.2rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="layers" style="width:20px;height:20px;color:var(--accent);"></i> Courses</h2>
    <div class="modules-grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));margin-bottom:2rem;">
      <div class="module-card" data-part="Foundations" onclick="document.getElementById('courseSelector').value='bioinfo';document.getElementById('courseSelector').dispatchEvent(new Event('change'));navigate('ch1');" style="border-left:3px solid var(--accent);">
        <div class="icon"><i data-lucide="dna"></i></div>
        <h3>Bioinformatics Data Skills</h3>
        <p class="card-desc">Unix, Python, R, file formats, alignment, RNA-Seq, variant calling, reproducible pipelines.</p>
        <div style="margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap;">
          <span class="tag">14 Chapters</span><span class="tag">3 Projects</span><span class="tag">150+ Quizzes</span>
        </div>
      </div>
      <div class="module-card" data-part="Programming" onclick="document.getElementById('courseSelector').value='stats';document.getElementById('courseSelector').dispatchEvent(new Event('change'));navigate('stat1');" style="border-left:3px solid var(--purple);">
        <div class="icon"><i data-lucide="bar-chart-3"></i></div>
        <h3>Statistics for Biology</h3>
        <p class="card-desc">Distributions, confidence intervals, p-values, regression, PCA, experimental design. No heavy math.</p>
        <div style="margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap;">
          <span class="tag">15 Chapters</span><span class="tag">1 Project</span><span class="tag">Complete</span>
        </div>
      </div>
      <div class="module-card" style="border-left:3px solid var(--green);opacity:.6;cursor:default;" onmouseover="" onclick="">
        <div class="icon"><i data-lucide="cpu"></i></div>
        <h3>AI/ML for Genomics</h3>
        <p class="card-desc">Classification, clustering, neural networks, single-cell analysis, protein structure prediction.</p>
        <div style="margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap;">
          <span class="tag">Coming Soon</span>
        </div>
      </div>
    </div>

    <div class="section-toggle" onclick="toggleSection('bio-chapters')">
      <h2 style="margin:0;font-size:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="layers" style="width:16px;height:16px;color:var(--accent);"></i> Bioinformatics Chapters</h2>
      <i data-lucide="chevron-down" class="toggle-icon open" style="width:16px;height:16px;color:var(--text-muted);"></i>
    </div>
    <div class="section-body" id="bio-chapters" style="max-height:9999px;opacity:1;">
      <div class="modules-grid" style="padding-top:.75rem;">${cards}</div>
    </div>
    <div class="section-toggle" onclick="toggleSection('quick-access')">
      <h2 style="margin:0;font-size:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="bookmark" style="width:16px;height:16px;color:var(--accent);"></i> Quick Access</h2>
      <i data-lucide="chevron-down" class="toggle-icon" style="width:16px;height:16px;color:var(--text-muted);"></i>
    </div>
    <div class="section-body collapsed" id="quick-access" style="max-height:0;">
      <div class="modules-grid" style="padding-top:.75rem;">
        <div class="module-card" onclick="navigate('resources')"><div class="icon"><i data-lucide="library"></i></div><h3>Resource Library</h3><p class="card-desc">Curated books, courses, databases, tools.</p></div>
        <div class="module-card" onclick="navigate('glossary')"><div class="icon"><i data-lucide="scroll-text"></i></div><h3>Glossary</h3><p class="card-desc">50+ searchable bioinformatics terms.</p></div>
        <div class="module-card" onclick="navigate('cheatsheets')"><div class="icon"><i data-lucide="clipboard-list"></i></div><h3>Cheat Sheets</h3><p class="card-desc">Unix, samtools, R, Python quick refs.</p></div>
      </div>
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

    <div class="section-toggle" onclick="toggleSection('learning-outcomes')" style="margin-top:2rem;">
      <h2 style="margin:0;font-size:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="target" style="width:16px;height:16px;color:var(--green);"></i> What You Will Learn</h2>
      <i data-lucide="chevron-down" class="toggle-icon" style="width:16px;height:16px;color:var(--text-muted);"></i>
    </div>
    <div class="section-body collapsed" id="learning-outcomes" style="max-height:0;">
      <div style="padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;margin-top:.5rem;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem;">
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Navigate Linux and process files with grep, awk, sed, and pipes</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Parse FASTA/FASTQ files and automate tasks with Python and Biopython</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Visualize data and run DE analysis with R, ggplot2, and DESeq2</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Align reads with BWA/STAR and manipulate BAM files with samtools</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Call variants with GATK and annotate VCF files</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="check-circle" style="width:18px;height:18px;color:var(--green);flex-shrink:0;margin-top:2px;"></i> Build reproducible pipelines with Snakemake, Git, and Docker</div>
        </div>
      </div>
    </div>

    <div class="section-toggle" onclick="toggleSection('roadmap')" style="margin-top:2rem;">
      <h2 style="margin:0;font-size:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="map" style="width:16px;height:16px;color:var(--accent);"></i> Learning Roadmap</h2>
      <i data-lucide="chevron-down" class="toggle-icon" style="width:16px;height:16px;color:var(--text-muted);"></i>
    </div>
    <div class="section-body collapsed" id="roadmap" style="max-height:0;">
      <div style="padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;margin-top:.5rem;">
        <div style="position:relative;padding-left:2rem;">
          <div style="position:absolute;left:.55rem;top:0;bottom:0;width:2px;background:var(--border);"></div>
          <div style="margin-bottom:1.25rem;position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--accent);"></div><div style="font-weight:700;font-size:.9rem;color:var(--accent);">Phase 1: Foundations</div><div style="font-size:.8rem;color:var(--text-muted);">Unix, Shell scripting, Git, Project setup</div></div>
          <div style="margin-bottom:1.25rem;position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--purple);"></div><div style="font-weight:700;font-size:.9rem;color:var(--purple);">Phase 2: Programming</div><div style="font-size:.8rem;color:var(--text-muted);">Python + Biopython, R + ggplot2 + Bioconductor</div></div>
          <div style="margin-bottom:1.25rem;position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--green);"></div><div style="font-weight:700;font-size:.9rem;color:var(--green);">Phase 3: Data and Formats</div><div style="font-size:.8rem;color:var(--text-muted);">FASTA/FASTQ, QC, Alignment (SAM/BAM), Genomic ranges</div></div>
          <div style="position:relative;"><div style="position:absolute;left:-1.65rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:var(--orange);"></div><div style="font-weight:700;font-size:.9rem;color:var(--orange);">Phase 4: Real Analysis</div><div style="font-size:.8rem;color:var(--text-muted);">RNA-Seq, Variant calling, Reproducible pipelines</div></div>
        </div>
      </div>
    </div>

    <div class="section-toggle" onclick="toggleSection('mistakes')" style="margin-top:2rem;">
      <h2 style="margin:0;font-size:1rem;display:flex;align-items:center;gap:.5rem;"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--orange);"></i> Common Beginner Mistakes</h2>
      <i data-lucide="chevron-down" class="toggle-icon" style="width:16px;height:16px;color:var(--text-muted);"></i>
    </div>
    <div class="section-body collapsed" id="mistakes" style="max-height:0;">
      <div style="padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;margin-top:.5rem;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem;">
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Confusing FASTA and FASTQ formats</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Using the wrong reference genome build (hg19 vs hg38)</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Mixing up 0-based (BED) and 1-based (VCF/GFF) coordinates</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Using raw p-values instead of adjusted p-values (FDR)</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Feeding normalized counts to DESeq2 (it needs raw counts)</div>
          <div style="display:flex;gap:.5rem;align-items:start;font-size:.85rem;"><i data-lucide="x-circle" style="width:18px;height:18px;color:var(--red);flex-shrink:0;margin-top:2px;"></i> Modifying raw data files instead of treating them as read-only</div>
        </div>
      </div>
    </div>

    <!-- BUILT BY -->
    <div style="margin-top:2rem;padding:1.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;flex-shrink:0;">AB</div>
      <div style="flex:1;min-width:200px;">
        <h3 style="font-size:1rem;margin-bottom:.25rem;">Built by Aadil Bhat</h3>
        <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:.5rem;">Bioinformatics developer and educator. Passionate about making genomics accessible to everyone.</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;"><a href="mailto:contact@bioskillslab.dev" style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;"><i data-lucide="mail" style="width:14px;height:14px;"></i> contact@bioskillslab.dev</a><a href="https://razorpay.me/@bioskillslab" target="_blank" style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;color:var(--orange);"><i data-lucide="coffee" style="width:14px;height:14px;"></i> Support this project</a></div>
      </div>
    </div>
  `;
  lucide.createIcons();
  // Init homepage terminal
  document.querySelectorAll('#content .terminal').forEach(t => {
    if (!t.dataset.init) { initTerminal(t); t.dataset.init = 'true'; }
  });
  setTimeout(initHelixCanvas, 50);
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
    <li><strong>Bioinformatics and Functional Genomics</strong> — Pevsner — Full-scope textbook</li>
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
    ['UniProt','Protein sequence and functional information database.'],
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


// Email capture via Formspree
function captureEmail() {
  const input = document.getElementById('emailCapture');
  const msg = document.getElementById('emailMsg');
  if (!input || !msg) return;
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    msg.innerHTML = '<span style="color:var(--red)">Please enter a valid email.</span>';
    return;
  }
  msg.innerHTML = '<span style="color:var(--text-muted)">Subscribing...</span>';
  fetch('https://formspree.io/f/xyzdobbo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  }).then(r => {
    if (r.ok) {
      msg.innerHTML = '<span style="color:var(--green)">✓ Subscribed! We\'ll keep you posted.</span>';
      input.value = '';
    } else {
      msg.innerHTML = '<span style="color:var(--red)">Something went wrong. Try again.</span>';
    }
  }).catch(() => {
    msg.innerHTML = '<span style="color:var(--red)">Network error. Try again.</span>';
  });
}
window.captureEmail = captureEmail;

// Re-init terminals and helix after home page renders
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
    initHelixCanvas();
  }, 100);
});

function initHelixCanvas() {
  const c = document.getElementById('helixCanvas');
  if (!c || c.dataset.init) return;
  c.dataset.init = 'true';
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height, mid = H / 2, amp = 18;
  let t = 0;
  const colors = ['#38bdf8','#4ade80','#a78bfa'];
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const pts1 = [], pts2 = [];
    for (let x = 0; x < W; x += 2) {
      pts1.push({x, y: mid + Math.sin(x * 0.04 + t) * amp});
      pts2.push({x, y: mid + Math.sin(x * 0.04 + t + Math.PI) * amp});
    }
    // Strand 1
    ctx.beginPath(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.6;
    pts1.forEach((p,i) => i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.stroke();
    // Strand 2
    ctx.beginPath(); ctx.strokeStyle = '#4ade80';
    pts2.forEach((p,i) => i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.stroke();
    // Rungs
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < pts1.length; i += 12) {
      ctx.beginPath(); ctx.strokeStyle = colors[(i/12|0) % 3]; ctx.lineWidth = 1.2;
      ctx.moveTo(pts1[i].x, pts1[i].y); ctx.lineTo(pts2[i].x, pts2[i].y); ctx.stroke();
    }
    // Glowing dots
    ctx.globalAlpha = 1;
    for (let i = 0; i < pts1.length; i += 24) {
      const glow = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.1);
      ctx.fillStyle = colors[(i/24|0) % 3]; ctx.globalAlpha = glow;
      ctx.beginPath(); ctx.arc(pts1[i].x, pts1[i].y, 2.5 + glow, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(pts2[i].x, pts2[i].y, 2 + glow*.8, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    t += 0.02;
    requestAnimationFrame(draw);
  }
  draw();
}


// Course switcher
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('courseSelector');
  if (sel) {
    sel.addEventListener('change', () => {
      const course = sel.value;
      document.getElementById('nav-bioinfo').style.display = course === 'bioinfo' ? '' : 'none';
      document.getElementById('nav-stats').style.display = course === 'stats' ? '' : 'none';
      document.getElementById('nav-aiml').style.display = course === 'aiml' ? '' : 'none';
      navigate('home');
    });
  }
});

// Collapsible homepage sections
window.toggleSection = function(id) {
  const body = document.getElementById(id);
  const toggle = body.previousElementSibling;
  if (!body) return;
  const isCollapsed = body.classList.contains('collapsed');
  if (isCollapsed) {
    body.classList.remove('collapsed');
    body.style.maxHeight = body.scrollHeight + 'px';
    body.style.opacity = '1';
    toggle.classList.add('open');
  } else {
    body.style.maxHeight = '0';
    body.style.opacity = '0';
    toggle.classList.remove('open');
    setTimeout(() => body.classList.add('collapsed'), 400);
  }
};

function renderStatResources(el) {
  el.innerHTML = `<div class="module-page"><div class="module-header"><h1><i data-lucide="library" style="width:28px;height:28px;display:inline;vertical-align:middle;margin-right:.5rem;"></i> Statistics Resources</h1></div>
  <div class="lesson">
  <h2>Books</h2>
  <ul>
    <li><strong>Intuitive Biostatistics</strong> — Harvey Motulsky — The best non-mathematical stats book for biologists. Covers everything from p-values to regression with real biological examples.</li>
    <li><strong>An Introduction to Statistical Learning (ISLR)</strong> — James, Witten, Hastie, Tibshirani — Free PDF at statlearning.com. The gold standard for applied ML/stats in R.</li>
    <li><strong>Modern Statistics for Modern Biology</strong> — Holmes &amp; Huber — Free online at huber.embl.de/msmb. Written by Bioconductor developers, covers genomics-specific methods.</li>
    <li><strong>Statistics for Biologists</strong> — Nature Methods collection — Free articles covering key statistical concepts for biologists.</li>
    <li><strong>The Elements of Statistical Learning</strong> — Hastie, Tibshirani, Friedman — Advanced. Free PDF at web.stanford.edu/~hastie/ElemStatLearn/</li>
  </ul>
  <h2>Online Courses</h2>
  <ul>
    <li><a href="https://www.coursera.org/learn/statistical-inference" target="_blank">Statistical Inference</a> — Johns Hopkins / Coursera</li>
    <li><a href="https://www.edx.org/course/statistics-and-r" target="_blank">Statistics and R</a> — HarvardX / edX — Free</li>
    <li><a href="https://www.statlearning.com/" target="_blank">ISLR Course</a> — Free videos from the book authors</li>
    <li><a href="https://seeing-theory.brown.edu/" target="_blank">Seeing Theory</a> — Beautiful visual introduction to probability and statistics</li>
  </ul>
  <h2>Key Papers to Read</h2>
  <ul>
    <li>Nuzzo (2014) — "Statistical errors" — Nature. The best short read on p-value misuse.</li>
    <li>Ioannidis (2005) — "Why most published research findings are false" — PLoS Medicine</li>
    <li>Benjamini &amp; Hochberg (1995) — The original FDR paper</li>
    <li>Love, Huber &amp; Anders (2014) — The DESeq2 paper — explains the negative binomial model</li>
  </ul>
  <h2>R Packages for Statistics</h2>
  <ul>
    <li><strong>stats</strong> — Base R. t.test, aov, lm, glm, cor.test</li>
    <li><strong>ggplot2</strong> — Visualization</li>
    <li><strong>dplyr</strong> — Data manipulation</li>
    <li><strong>broom</strong> — Tidy model outputs</li>
    <li><strong>pROC</strong> — ROC curves and AUC</li>
    <li><strong>randomForest</strong> — Random forest classification</li>
    <li><strong>caret</strong> — Unified ML framework with cross-validation</li>
    <li><strong>RNASeqPower</strong> — Power analysis for RNA-Seq</li>
  </ul>
  </div></div>`;
  lucide.createIcons();
}

function renderStatGlossary(el) {
  const terms = [
    ['Alpha (α)','The significance threshold. The probability of a false positive you are willing to accept. Usually 0.05.'],
    ['ANOVA','Analysis of Variance. Tests whether means differ across 3+ groups by comparing between-group to within-group variance.'],
    ['AUC','Area Under the ROC Curve. Measures classifier performance. 0.5 = random, 1.0 = perfect.'],
    ['Bayesian statistics','Statistical framework that combines prior beliefs with observed data to update probabilities.'],
    ['Benjamini-Hochberg','The standard FDR correction method. Controls the expected proportion of false discoveries among significant results.'],
    ['Beta (β)','The probability of a false negative (missing a real effect). Power = 1 - β.'],
    ['Bonferroni correction','Divide α by the number of tests. Controls family-wise error rate. Conservative.'],
    ['Coefficient of variation (CV)','SD / mean. Measures relative variability. Used in RNA-Seq power calculations.'],
    ['Confidence interval (CI)','A range of plausible values for a parameter. A 95% CI means 95% of such intervals would contain the true value.'],
    ['Confounder','A variable associated with both the predictor and outcome that can bias results if not accounted for.'],
    ['Cross-validation','Splitting data into training and test sets to get honest performance estimates. Prevents overfitting.'],
    ['Effect size','A measure of the magnitude of an effect, independent of sample size. Examples: log2FC, Cohen\'s d, odds ratio.'],
    ['False Discovery Rate (FDR)','The expected proportion of false positives among significant results. Controlled by Benjamini-Hochberg.'],
    ['False negative','Missing a real effect. Type II error. Rate = β.'],
    ['False positive','Claiming an effect exists when it doesn\'t. Type I error. Rate = α.'],
    ['F-statistic','The ratio of between-group to within-group variance in ANOVA.'],
    ['Gaussian distribution','The bell curve. Symmetric, defined by mean and SD. Many statistical tests assume this.'],
    ['GLM','Generalized Linear Model. Extends linear regression to non-Gaussian outcomes (binary, counts, etc.).'],
    ['HARKing','Hypothesizing After Results are Known. Presenting data-driven hypotheses as if pre-specified.'],
    ['Logistic regression','GLM for binary outcomes. Predicts probability of an event. Coefficients are log-odds.'],
    ['Lognormal distribution','Right-skewed distribution. Log-transforming it gives a Gaussian. Common for gene expression.'],
    ['Multiple testing','Running many statistical tests simultaneously. Inflates false positive rate without correction.'],
    ['Negative binomial','Distribution for overdispersed count data. Used by DESeq2 and edgeR for RNA-Seq.'],
    ['Null hypothesis','The default assumption of no effect. Statistical tests ask how surprising the data is under this assumption.'],
    ['Odds ratio','Effect size for binary outcomes. OR > 1 means increased odds, OR < 1 means decreased odds.'],
    ['Overdispersion','When variance exceeds the mean in count data. Violates Poisson assumption. Requires negative binomial.'],
    ['P-value','The probability of observing data this extreme or more extreme if the null hypothesis were true.'],
    ['Paired t-test','Compares two related measurements (same subject before/after). Removes between-subject variability.'],
    ['PCA','Principal Component Analysis. Reduces high-dimensional data to 2-3 dimensions preserving maximum variance.'],
    ['Pearson correlation (r)','Measures linear association between two variables. Ranges from -1 to +1.'],
    ['Poisson distribution','Distribution for counts of rare events. Mean equals variance.'],
    ['Power','Probability of detecting a real effect when it exists. Power = 1 - β. Target: 0.80.'],
    ['Pseudoreplication','Treating multiple measurements from the same biological unit as independent samples.'],
    ['R²','Coefficient of determination. Fraction of variance in y explained by x.'],
    ['Random forest','Ensemble of decision trees. Robust, handles many features, provides feature importance.'],
    ['Regression to the mean','Extreme values tend to be less extreme on remeasurement. Can mimic treatment effects.'],
    ['ROC curve','Receiver Operating Characteristic. Plots sensitivity vs (1-specificity) across all thresholds.'],
    ['Sampling error','Random variation between a sample statistic and the true population parameter. Decreases with larger n.'],
    ['Sensitivity','TP/(TP+FN). Proportion of true cases correctly detected.'],
    ['Spearman correlation (ρ)','Rank-based correlation. Robust to outliers and non-linear monotonic relationships.'],
    ['Specificity','TN/(TN+FP). Proportion of true negatives correctly identified.'],
    ['Standard deviation (SD)','Measures spread of individual values around the mean.'],
    ['Standard error (SE)','Measures precision of the sample mean. SE = SD/√n.'],
    ['t-test','Tests whether two group means differ. Assumes Gaussian data.'],
    ['Type I error','False positive. Claiming an effect exists when it doesn\'t. Rate controlled by α.'],
    ['Type II error','False negative. Missing a real effect. Rate = β. Power = 1 - β.'],
    ['UMAP','Nonlinear dimensionality reduction. Standard for single-cell RNA-Seq visualization.'],
    ['Wilcoxon test','Nonparametric alternative to t-test. Uses ranks instead of raw values.'],
  ];
  const rows = terms.map(([t,d]) => `<tr><td><strong>${t}</strong></td><td>${d}</td></tr>`).join('');
  el.innerHTML = `<div class="module-page"><div class="module-header"><h1><i data-lucide="scroll-text" style="width:28px;height:28px;display:inline;vertical-align:middle;margin-right:.5rem;"></i> Statistics Glossary</h1></div>
  <input type="text" id="glossarySearch" placeholder="Search terms..." style="width:100%;padding:.75rem 1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;margin-bottom:1rem;">
  <table style="width:100%;border-collapse:collapse;" id="glossaryTable">
  <thead><tr><th style="text-align:left;padding:.75rem;border-bottom:2px solid var(--border);width:220px;">Term</th><th style="text-align:left;padding:.75rem;border-bottom:2px solid var(--border);">Definition</th></tr></thead>
  <tbody>${rows}</tbody></table></div>`;
  document.getElementById('glossarySearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#glossaryTable tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  lucide.createIcons();
}
