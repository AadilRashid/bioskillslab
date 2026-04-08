const EXAM_QUESTIONS = [
  {q:'In the central dogma, what is the process of converting DNA to RNA called?', opts:['Translation','Replication','Transcription','Reverse transcription'], ans:'c'},
  {q:'A Phred quality score of Q30 means the base call has what accuracy?', opts:['90%','99%','99.9%','99.99%'], ans:'c'},
  {q:"What is the reverse complement of the DNA sequence 5'-ATCG-3'?", opts:["5'-CGAT-3'","5'-TAGC-3'","5'-GCTA-3'","5'-UAGC-3'"], ans:'a'},
  {q:'In a typical bioinformatics workflow, what step comes immediately AFTER alignment?', opts:['Quality control with FastQC','Downloading data from NCBI','Trimming adapters','Sorting and indexing the BAM file'], ans:'d'},
  {q:'Why use STAR instead of BWA for RNA-Seq alignment?', opts:['STAR is faster','BWA does not work with FASTQ files','STAR is splice-aware — it can align reads across exon-exon junctions spanning introns','BWA only works with protein sequences'], ans:'c'},
  {q:'In DESeq2, what does padj < 0.05 mean?', opts:['The raw p-value is less than 0.05','The fold change is greater than 0.05','The gene is expressed in 5% of samples','The Benjamini-Hochberg adjusted p-value (FDR) is less than 0.05'], ans:'d'},
  {q:'What does grep -v "^#" file.vcf do?', opts:['Shows only lines starting with #','Counts lines starting with #','Shows all lines that do NOT start with #','Deletes lines starting with #'], ans:'c'},
  {q:'What type of counts does DESeq2 require as input?', opts:['Raw, unnormalized integer counts','FPKM values','TPM values','Log2-transformed counts'], ans:'a'},
  {q:'Why should raw data files be treated as read-only in bioinformatics?', opts:['To ensure reproducibility — you can always re-run analysis from the original data','Because they are too large to edit','Because Linux does not allow file editing','To save disk space'], ans:'a'},
  {q:"What does awk 'NR%4==2' reads.fastq extract from a FASTQ file?", opts:['The header lines (@read_id)','The sequence lines (ATCG...)','The quality score lines','The + separator lines'], ans:'b'},
  {q:'What does PCA of RNA-Seq samples tell you?', opts:['Which genes are differentially expressed','The sequencing depth of each sample','The GC content of each sample','Whether samples cluster by condition (and reveals batch effects or outliers)'], ans:'d'},
  {q:'In FastQC, high sequence duplication in RNA-Seq data is:', opts:['Often expected — highly expressed genes produce many identical reads','Always a sign of contamination','Caused by sequencing errors','A reason to discard the data'], ans:'a'},
  {q:'What is the minimum recommended number of biological replicates per condition for RNA-Seq?', opts:['1','2','3 (ideally more)','10'], ans:'c'},
  {q:'What does the Trimmomatic step SLIDINGWINDOW:4:20 do?', opts:['Removes the first 4 bases if quality is below 20','Scans with a 4-base window and cuts when average quality drops below Q20','Keeps only reads longer than 20 bases','Removes every 4th base with quality below 20'], ans:'b'},
  {q:'What is the advantage of Salmon over STAR + featureCounts?', opts:['Better accuracy','It produces BAM files','It is 10-100x faster because it skips full alignment (pseudo-alignment)','It does not need a reference'], ans:'c'},
  {q:'A CIGAR string of "50M2I48M" means:', opts:['50 matches, 2 insertions in the read relative to reference, 48 matches','50 mismatches, 2 insertions, 48 matches','50 matches, 2 deletions, 48 matches','The read is 100 bp with 2 errors'], ans:'a'},
  {q:'Which GATK step marks duplicate reads before variant calling?', opts:['HaplotypeCaller','BaseRecalibrator','MarkDuplicates (Picard)','ApplyBQSR'], ans:'d'},
  {q:'In a VCF file, what does the FILTER field value "PASS" indicate?', opts:['The variant failed all filters','The variant passed all applied filters','The variant has not been filtered','The variant is a known SNP'], ans:'b'},
  {q:'What is the purpose of Base Quality Score Recalibration (BQSR) in GATK?', opts:['To remove PCR duplicates','To correct systematic errors in base quality scores using known variant sites','To align reads to the reference','To call variants from BAM files'], ans:'b'},
  {q:'In BEDTools, what does bedtools intersect -a peaks.bed -b genes.bed -v output?', opts:['Peaks that overlap with genes','Genes that overlap with peaks','Peaks that do NOT overlap with any gene','All intervals from both files'], ans:'c'},
  {q:'What coordinate system does BED format use?', opts:['1-based, closed intervals','0-based, half-open intervals','1-based, half-open intervals','0-based, closed intervals'], ans:'b'},
  {q:'In Snakemake, what is a "rule"?', opts:['A Python function','A unit of work that defines input, output, and the shell command to produce output from input','A configuration file','A conda environment'], ans:'b'},
  {q:'What does the samtools flagstat command report?', opts:['The reference genome statistics','Alignment statistics including mapped reads, duplicates, and paired-end info','The variant call statistics','The quality score distribution'], ans:'b'},
  {q:'Which normalization method is appropriate for comparing gene expression BETWEEN samples?', opts:['Raw counts','RPKM','TPM','All of the above are equally appropriate'], ans:'c'},
  {q:'In Git, what does git commit -m "message" do?', opts:['Uploads changes to GitHub','Saves a snapshot of staged changes to the local repository history','Merges two branches','Reverts to the previous commit'], ans:'b'},
  {q:'What is the purpose of a conda environment.yml file?', opts:['To store sequencing data','To document and reproduce the exact software environment including all package versions','To configure the genome aligner','To store analysis results'], ans:'a'},
  {q:'In R, what does the %>% operator (pipe) do?', opts:['Multiplies two numbers','Passes the left-hand side as the first argument to the right-hand function','Creates a new column','Filters rows'], ans:'c'},
  {q:'What does the ENCODE blacklist represent in genomics?', opts:['Genes with no known function','Genomic regions with anomalously high signal in sequencing experiments that should be excluded from analysis','Variants associated with disease','Low-quality sequencing reads'], ans:'b'},
  {q:'In DESeq2, what is the purpose of the variance stabilizing transformation (VST)?', opts:['To normalize for sequencing depth','To transform count data so variance is approximately constant across the mean — needed for PCA and heatmaps','To identify differentially expressed genes','To remove batch effects'], ans:'b'},
  {q:'A researcher runs GATK HaplotypeCaller and gets a VCF with 50,000 variants. After filtering with VQSR, 8,000 remain. What is the most likely explanation?', opts:['VQSR removed real variants','Most of the 50,000 were false positives — raw variant calls always require filtering','The reference genome was wrong','The sample had too few reads'], ans:'b'},
];

let examTimer = null;
let examSeconds = 45 * 60;
let examAnswers = {};

window.startExam = function() {
  document.getElementById('examIntro').style.display = 'none';
  document.getElementById('examQuestions').style.display = 'block';
  renderExamQuestions();
  startTimer();
};

function renderExamQuestions() {
  const container = document.getElementById('examQList');
  container.innerHTML = EXAM_QUESTIONS.map((q, i) => `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:1.5rem;margin-bottom:1rem;">
      <p style="font-weight:600;margin-bottom:1rem;"><span style="color:var(--accent);">${i+1}.</span> ${q.q}</p>
      ${['a','b','c','d'].map((opt, j) => `
        <label style="display:flex;align-items:center;gap:.75rem;padding:.6rem .75rem;border-radius:8px;cursor:pointer;margin-bottom:.4rem;border:1px solid transparent;">
          <input type="radio" name="eq${i+1}" value="${opt}" onchange="examAnswers[${i+1}]='${opt}';updateExamProgress();" style="accent-color:var(--accent);">
          <span style="font-size:.9rem;">${q.opts[j]}</span>
        </label>
      `).join('')}
    </div>
  `).join('');
}

window.updateExamProgress = function() {
  const answered = Object.keys(examAnswers).length;
  const el = document.getElementById('examProgress');
  if (el) el.textContent = `${answered} of 30 answered`;
};

function startTimer() {
  examSeconds = 45 * 60;
  examTimer = setInterval(() => {
    examSeconds--;
    const m = Math.floor(examSeconds / 60);
    const s = examSeconds % 60;
    const el = document.getElementById('examTimer');
    if (el) {
      el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
      if (examSeconds <= 300) el.style.color = 'var(--red)';
    }
    if (examSeconds <= 0) { clearInterval(examTimer); window.submitExam(); }
  }, 1000);
}

window.submitExam = function() {
  clearInterval(examTimer);
  const unanswered = 30 - Object.keys(examAnswers).length;
  if (unanswered > 0 && examSeconds > 0) {
    if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
      startTimer(); return;
    }
  }
  document.getElementById('examQuestions').style.display = 'none';
  document.getElementById('examResult').style.display = 'block';
  document.getElementById('examResult').innerHTML = '<p style="color:var(--text-muted);">Grading...</p>';

  fetch('/api/submit_exam.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({answers: examAnswers, course: 'bioinfo'})
  })
  .then(r => r.json())
  .then(res => {
    if (res.error) { document.getElementById('examResult').innerHTML = `<p style="color:var(--red);">${res.error}</p>`; return; }
    if (res.passed) {
      document.getElementById('examResult').innerHTML = `
        <div style="background:linear-gradient(135deg,rgba(74,222,128,.1),rgba(56,189,248,.1));border:1px solid var(--green);border-radius:16px;padding:2.5rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">🎉</div>
          <h2 style="color:var(--green);margin-bottom:.5rem;">Congratulations!</h2>
          <p style="font-size:1.1rem;margin-bottom:.5rem;">You passed with <strong>${res.score}%</strong></p>
          <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1.5rem;">Your certificate has been issued.</p>
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:1.5rem;">
            <p style="font-size:.8rem;color:var(--text-muted);margin-bottom:.25rem;">Certificate ID</p>
            <p style="font-family:monospace;font-size:1.1rem;font-weight:700;color:var(--accent);">${res.cert_code}</p>
          </div>
          <button onclick="navigate('cert-${res.cert_code}')" style="margin-top:1rem;padding:.75rem 2rem;background:var(--accent);color:#0f172a;border:none;border-radius:8px;font-weight:700;cursor:pointer;">View Certificate</button>
        </div>`;
    } else {
      document.getElementById('examResult').innerHTML = `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:2.5rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">📚</div>
          <h2 style="margin-bottom:.5rem;">Not quite there yet</h2>
          <p style="font-size:1.1rem;margin-bottom:.5rem;">You scored <strong style="color:var(--orange);">${res.score}%</strong> (${res.correct}/${res.total} correct)</p>
          <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1.5rem;">You need 80% to pass. Review the chapters and try again.</p>
          <p style="font-size:.9rem;">To request a reexam, email <a href="mailto:contact@bioskillslab.dev" style="color:var(--accent);">contact@bioskillslab.dev</a></p>
        </div>`;
    }
  })
  .catch(() => {
    document.getElementById('examResult').innerHTML = '<p style="color:var(--red);">Network error. Please contact contact@bioskillslab.dev</p>';
  });
};
