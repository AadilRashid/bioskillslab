// Simulated filesystem
const FS = {
  '/home/user': {type:'dir', children:['project','reads.fastq','sequences.fasta','genes.bed','counts.tsv']},
  '/home/user/project': {type:'dir', children:['data','results','scripts','README.md']},
  '/home/user/project/data': {type:'dir', children:['sample1.fastq','sample2.fastq','reference.fa']},
  '/home/user/project/results': {type:'dir', children:[]},
  '/home/user/project/scripts': {type:'dir', children:['pipeline.sh','analyze.R']},
  '/home/user/project/README.md': {type:'file', content:'# My Bioinformatics Project\nAnalysis of RNA-Seq data from two conditions.\n'},
  '/home/user/project/scripts/pipeline.sh': {type:'file', content:'#!/bin/bash\nfastqc data/*.fastq\nbwa mem ref.fa reads.fq > aligned.sam\nsamtools sort aligned.sam -o sorted.bam\n'},
  '/home/user/project/scripts/analyze.R': {type:'file', content:'library(DESeq2)\ndds <- DESeqDataSetFromMatrix(counts, coldata, ~condition)\ndds <- DESeq(dds)\nres <- results(dds)\n'},
  '/home/user/sequences.fasta': {type:'file', content:'>seq1 Homo sapiens BRCA1\nATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGT\nGTCCCATCTGTAAGTGGAGAAAGCTTCTGTGAATGATATTCCTGTGCTTTTCAACTGGAGATTATTATCA\n>seq2 Mus musculus TP53\nATGACTGCCATGGAGGAGTCACAGTCGGATATCAGCCTCGAGCTCCCTCTGAGCCAGGAGACATTTTCAG\nGCTTATGGAAACTACTTCCTGAAAACAACGTTCTGTCCCCCTTGCCGTCTGGGCTTCTTGAGTTCCGAGA\n>seq3 Drosophila melanogaster Notch\nATGCAAAATGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGC\n>seq4 Arabidopsis thaliana LEAFY\nATGGATCCTGAAGGTTTCACGAGCTCGGGTCCGGGCTCTGGGTCGGGGTCGGGGTCGGGGTCGGGGTCG\nGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGGTCGGGG\n>seq5 E. coli lacZ\nATGACCATGATTACGCCAAGCTTTCCCTGTAGCGGCGCATTAAGCGCGGCGGGTGTGGTGGTTACGCGCA\nGCGTGACCGCTACACTTGCCAGCGCCCTAGCGCCCGCTCCTTTCGCTTTCTTCCCTTCCTTTCTCGCCAC\n'},
  '/home/user/reads.fastq': {type:'file', content:'@read1 length=50\nATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n@read2 length=50\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n@read3 length=45\nAAAATTTTCCCCGGGGAAAATTTTCCCCGGGGAAAATTTTCCCCG\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n@read4 length=50\nTTTTAAAACCCCGGGGTTTTAAAACCCCGGGGTTTTAAAACCCCGGGGTTTT\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n@read5 length=48\nATATATATATATATATATATATATATATATATATATATATATATATATAT\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n'},
  '/home/user/genes.bed': {type:'file', content:'chr1\t1000\t2000\tBRCA1\t960\t+\nchr1\t3000\t5000\tTP53\t850\t-\nchr2\t1500\t3500\tEGFR\t920\t+\nchr2\t5000\t7000\tMYC\t780\t+\nchr3\t100\t900\tNOTCH1\t890\t-\nchr3\t2000\t4000\tKRAS\t910\t+\n'},
  '/home/user/counts.tsv': {type:'file', content:'gene\tcontrol_1\tcontrol_2\ttreatment_1\ttreatment_2\nBRCA1\t250\t280\t890\t920\nTP53\t1200\t1150\t1180\t1210\nEGFR\t450\t480\t1200\t1350\nMYC\t800\t750\t320\t290\nNOTCH1\t600\t620\t610\t590\nKRAS\t150\t170\t780\t820\n'},
  '/home/user/project/data/sample1.fastq': {type:'file', content:'@s1_read1\nATCGATCG\n+\nIIIIIIII\n@s1_read2\nGCTAGCTA\n+\nIIIIIIII\n'},
  '/home/user/project/data/sample2.fastq': {type:'file', content:'@s2_read1\nTTTTAAAA\n+\nIIIIIIII\n@s2_read2\nCCCCGGGG\n+\nIIIIIIII\n'},
  '/home/user/project/data/reference.fa': {type:'file', content:'>chr1\nATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG\n>chr2\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT\n'},
};

function initTerminal(container) {
  let cwd = '/home/user';
  const body = container.querySelector('.terminal-body');
  const input = container.querySelector('.terminal-input');
  const history = [];
  let histIdx = -1;

  function addLine(text, cls='output') {
    const div = document.createElement('div');
    div.className = 'line ' + cls;
    div.textContent = text;
    body.insertBefore(div, body.lastElementChild);
    body.scrollTop = body.scrollHeight;
  }

  function resolve(path) {
    if (!path) return cwd;
    if (path === '~') return '/home/user';
    if (path.startsWith('~/')) return '/home/user/' + path.slice(2);
    if (path.startsWith('/')) return path;
    let parts = cwd.split('/').filter(Boolean);
    path.split('/').forEach(p => {
      if (p === '..') parts.pop();
      else if (p !== '.') parts.push(p);
    });
    return '/' + parts.join('/');
  }

  function exec(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;
    history.unshift(cmd);
    histIdx = -1;
    addLine('user@biolab:' + cwd.replace('/home/user','~') + '$ ' + cmd, 'prompt');

    const parts = cmd.split(/\s+/);
    const c = parts[0];
    const args = parts.slice(1);

    // Handle pipes simply
    if (cmd.includes('|')) return execPipe(cmd);

    switch(c) {
      case 'pwd': addLine(cwd); break;
      case 'ls': cmdLs(args); break;
      case 'cd': cmdCd(args); break;
      case 'cat': cmdCat(args); break;
      case 'head': cmdHead(args); break;
      case 'tail': cmdTail(args); break;
      case 'wc': cmdWc(args); break;
      case 'grep': cmdGrep(args); break;
      case 'awk': cmdAwk(cmd); break;
      case 'cut': cmdCut(args); break;
      case 'sort': cmdSort(args); break;
      case 'uniq': cmdUniq(args); break;
      case 'echo': addLine(args.join(' ')); break;
      case 'clear': body.querySelectorAll('.line').forEach(l => l.remove()); break;
      case 'help': cmdHelp(); break;
      case 'man': addLine('Try: help'); break;
      case 'mkdir': addLine('mkdir: directory created (simulated)'); break;
      case 'touch': addLine('touch: file created (simulated)'); break;
      case 'whoami': addLine('user'); break;
      case 'date': addLine(new Date().toString()); break;
      case 'seq': cmdSeq(args); break;
      default: addLine(`${c}: command not found. Type 'help' for available commands.`, 'error');
    }
  }

  function getFileContent(path) {
    const p = resolve(path);
    const f = FS[p];
    if (!f) return null;
    if (f.type === 'dir') return null;
    return f.content;
  }

  function cmdLs(args) {
    let target = cwd;
    let flags = '';
    args.forEach(a => { if(a.startsWith('-')) flags+=a; else target=resolve(a); });
    const d = FS[target];
    if (!d || d.type !== 'dir') { addLine('ls: cannot access: No such directory','error'); return; }
    if (flags.includes('l')) {
      d.children.forEach(c => {
        const full = target + '/' + c;
        const item = FS[full];
        const type = item && item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = item && item.content ? item.content.length : 4096;
        addLine(`${type}  user user  ${String(size).padStart(6)}  ${c}`);
      });
    } else {
      addLine(d.children.join('  '));
    }
  }

  function cmdCd(args) {
    const target = resolve(args[0] || '~');
    const d = FS[target];
    if (d && d.type === 'dir') cwd = target;
    else addLine('cd: no such directory: ' + args[0], 'error');
    // Update prompt
    const promptEl = body.querySelector('.terminal-input-line .prompt');
    if (promptEl) promptEl.textContent = 'user@biolab:' + cwd.replace('/home/user','~') + '$';
  }

  function cmdCat(args) {
    args.forEach(a => {
      const content = getFileContent(a);
      if (content === null) addLine(`cat: ${a}: No such file`, 'error');
      else content.split('\n').forEach(l => addLine(l));
    });
  }

  function cmdHead(args) {
    let n = 10;
    let files = [];
    for (let i=0; i<args.length; i++) {
      if (args[i]==='-n' && args[i+1]) { n=parseInt(args[++i]); }
      else files.push(args[i]);
    }
    files.forEach(f => {
      const content = getFileContent(f);
      if (!content) { addLine(`head: ${f}: No such file`,'error'); return; }
      content.split('\n').slice(0,n).forEach(l => addLine(l));
    });
  }

  function cmdTail(args) {
    let n = 10;
    let files = [];
    for (let i=0; i<args.length; i++) {
      if (args[i]==='-n' && args[i+1]) { n=parseInt(args[++i]); }
      else files.push(args[i]);
    }
    files.forEach(f => {
      const content = getFileContent(f);
      if (!content) { addLine(`tail: ${f}: No such file`,'error'); return; }
      const lines = content.split('\n').filter(l=>l);
      lines.slice(-n).forEach(l => addLine(l));
    });
  }

  function cmdWc(args) {
    let flags = '';
    let files = [];
    args.forEach(a => { if(a.startsWith('-')) flags+=a; else files.push(a); });
    files.forEach(f => {
      const content = getFileContent(f);
      if (!content) { addLine(`wc: ${f}: No such file`,'error'); return; }
      const lines = content.split('\n');
      const words = content.split(/\s+/).filter(w=>w).length;
      const chars = content.length;
      if (flags.includes('l')) addLine(`${lines.length-1} ${f}`);
      else if (flags.includes('w')) addLine(`${words} ${f}`);
      else if (flags.includes('c')) addLine(`${chars} ${f}`);
      else addLine(`${lines.length-1} ${words} ${chars} ${f}`);
    });
  }

  function cmdGrep(args) {
    let flags = '';
    let pattern = '';
    let files = [];
    args.forEach(a => {
      if (a.startsWith('-')) flags += a;
      else if (!pattern) pattern = a.replace(/['"]/g,'');
      else files.push(a);
    });
    if (!pattern) { addLine('Usage: grep [flags] pattern file','error'); return; }
    files.forEach(f => {
      const content = getFileContent(f);
      if (!content) { addLine(`grep: ${f}: No such file`,'error'); return; }
      const lines = content.split('\n');
      const matches = lines.filter(l => {
        const src = flags.includes('i') ? l.toLowerCase() : l;
        const pat = flags.includes('i') ? pattern.toLowerCase() : pattern;
        return flags.includes('v') ? !src.includes(pat) : src.includes(pat);
      });
      if (flags.includes('c')) addLine(String(matches.length));
      else matches.forEach(l => addLine(l));
    });
  }

  function cmdAwk(cmd) {
    // Simple awk support for common bioinformatics patterns
    const m = cmd.match(/awk\s+'([^']+)'\s+(\S+)/);
    if (!m) { addLine('awk: use single quotes around program','error'); return; }
    const prog = m[1];
    const file = m[2];
    const content = getFileContent(file);
    if (!content) { addLine(`awk: ${file}: No such file`,'error'); return; }
    const lines = content.split('\n').filter(l=>l);

    // Pattern: NR%4==2 (FASTQ sequences)
    if (prog.includes('NR%4==2')) {
      const seqLines = lines.filter((_,i) => i%4===1);
      if (prog.includes('length')) {
        let sum=0, c=0;
        seqLines.forEach(s => { sum+=s.length; c++; });
        if (prog.includes('sum') || prog.includes('/')) addLine(String(sum/c));
        else seqLines.forEach(s => addLine(String(s.length)));
      } else {
        seqLines.forEach(s => addLine(s));
      }
      return;
    }
    // Pattern: /^>/ for FASTA headers
    if (prog.includes('/^>/')) {
      if (prog.includes('length(seq)')) {
        // Sequence length calculator
        let seq = '', results = [];
        lines.forEach(l => {
          if (l.startsWith('>')) { if(seq) results.push(seq.length); seq=''; }
          else seq += l;
        });
        if (seq) results.push(seq.length);
        results.forEach(r => addLine(String(r)));
        return;
      }
      lines.filter(l => l.startsWith('>')).forEach(l => addLine(l));
      return;
    }
    // Pattern: print $N
    const pm = prog.match(/\{print \$(\d+)\}/);
    if (pm) {
      const col = parseInt(pm[1]) - 1;
      lines.forEach(l => {
        const fields = l.split(/\s+/);
        if (fields[col] !== undefined) addLine(fields[col]);
      });
      return;
    }
    // Pattern: -F'\t' {print $N}
    if (prog.includes('print')) {
      const fMatch = cmd.match(/-F'([^']+)'/);
      const sep = fMatch ? fMatch[1] : /\s+/;
      lines.forEach(l => {
        const fields = l.split(sep);
        addLine(fields.join('\t'));
      });
      return;
    }
    addLine('awk: simplified simulator — try common patterns like {print $1}','error');
  }

  function cmdCut(args) {
    let delim = '\t', fields = [], files = [];
    for (let i=0; i<args.length; i++) {
      if (args[i]==='-d' && args[i+1]) delim=args[++i].replace(/'/g,'');
      else if (args[i]==='-f' && args[i+1]) fields=args[++i].split(',').map(Number);
      else if (args[i].startsWith('-f')) fields=args[i].slice(2).split(',').map(Number);
      else files.push(args[i]);
    }
    files.forEach(f => {
      const content = getFileContent(f);
      if (!content) { addLine(`cut: ${f}: No such file`,'error'); return; }
      content.split('\n').filter(l=>l).forEach(l => {
        const cols = l.split(delim);
        addLine(fields.map(n => cols[n-1]||'').join('\t'));
      });
    });
  }

  function cmdSort(args) {
    let files = [], flags = '';
    args.forEach(a => { if(a.startsWith('-')) flags+=a; else files.push(a); });
    files.forEach(f => {
      const content = getFileContent(f);
      if (!content) { addLine(`sort: ${f}: No such file`,'error'); return; }
      let lines = content.split('\n').filter(l=>l);
      if (flags.includes('n')) lines.sort((a,b) => parseFloat(a)-parseFloat(b));
      else if (flags.includes('r')) lines.sort().reverse();
      else lines.sort();
      lines.forEach(l => addLine(l));
    });
  }

  function cmdUniq(args) {
    let flags = '', input = [];
    args.forEach(a => { if(a.startsWith('-')) flags+=a; else {
      const c = getFileContent(a);
      if(c) input = c.split('\n').filter(l=>l);
    }});
    if (flags.includes('c')) {
      const counts = {};
      input.forEach(l => counts[l] = (counts[l]||0)+1);
      Object.entries(counts).forEach(([k,v]) => addLine(`${String(v).padStart(6)} ${k}`));
    } else {
      [...new Set(input)].forEach(l => addLine(l));
    }
  }

  function cmdSeq(args) {
    const start = parseInt(args[0]) || 1;
    const end = parseInt(args[1]) || parseInt(args[0]) || 10;
    for (let i = (args.length>1?start:1); i <= end && i < 1000; i++) addLine(String(i));
  }

  function execPipe(cmd) {
    // Simple pipe: run first command, feed output to second
    const parts = cmd.split('|').map(s => s.trim());
    // Execute first part and capture
    let firstOutput = '';
    const origAdd = addLine;
    const captured = [];
    // Temporarily capture output
    const tmpAdd = (text, cls) => { if(cls!=='prompt') captured.push(text); };

    // Hacky but works for demo: run first command, capture, feed to second
    // For now just handle common patterns
    if (cmd.includes('grep') && cmd.includes('wc')) {
      // grep pattern file | wc -l
      const grepPart = parts[0];
      const gArgs = grepPart.split(/\s+/).slice(1);
      let pattern = '', files = [], flags = '';
      gArgs.forEach(a => {
        if(a.startsWith('-')) flags+=a;
        else if(!pattern) pattern=a.replace(/['"]/g,'');
        else files.push(a);
      });
      files.forEach(f => {
        const content = getFileContent(f);
        if (!content) return;
        const matches = content.split('\n').filter(l => l.includes(pattern));
        addLine(String(matches.length));
      });
      return;
    }
    if (cmd.includes('sort') && cmd.includes('uniq')) {
      const sortPart = parts[0].split(/\s+/);
      const file = sortPart[sortPart.length-1];
      const content = getFileContent(file);
      if (content) {
        const lines = content.split('\n').filter(l=>l).sort();
        const unique = [...new Set(lines)];
        if (cmd.includes('-c')) {
          const counts = {};
          lines.forEach(l => counts[l]=(counts[l]||0)+1);
          Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => addLine(`${String(v).padStart(6)} ${k}`));
        } else {
          unique.forEach(l => addLine(l));
        }
      }
      return;
    }
    addLine('Pipe simulation supports: grep|wc, sort|uniq patterns. Try individual commands.', 'error');
  }

  function cmdHelp() {
    const cmds = [
      'pwd          - Print working directory',
      'ls [-l]      - List directory contents',
      'cd <dir>     - Change directory',
      'cat <file>   - Display file contents',
      'head [-n N]  - Show first N lines',
      'tail [-n N]  - Show last N lines',
      'wc [-l/-w/-c]- Count lines/words/chars',
      'grep [-c/-i/-v] <pattern> <file>',
      'awk          - Text processing (common patterns)',
      'cut -f1,2    - Extract columns',
      'sort [-n/-r] - Sort lines',
      'uniq [-c]    - Unique lines',
      'echo <text>  - Print text',
      'clear        - Clear terminal',
      '',
      'Sample files: sequences.fasta, reads.fastq,',
      '  genes.bed, counts.tsv, project/',
    ];
    cmds.forEach(c => addLine(c));
  }

  // Input handling
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      exec(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length-1) { histIdx++; input.value = history[histIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      else { histIdx=-1; input.value=''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for filenames
      const val = input.value;
      const lastWord = val.split(/\s+/).pop();
      const dir = FS[cwd];
      if (dir && dir.children) {
        const match = dir.children.find(c => c.startsWith(lastWord));
        if (match) input.value = val.slice(0, val.length - lastWord.length) + match;
      }
    }
  });

  // Focus terminal on click
  container.addEventListener('click', () => input.focus());
}
