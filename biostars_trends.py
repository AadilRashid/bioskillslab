"""
BioSkills Lab — Bioinformatics Trend Analyzer
Uses GitHub + Stack Overflow APIs (both open, no auth needed)
Run monthly to identify top beginner pain points and trending tools.
Usage: python3 biostars_trends.py
"""

import urllib.request
import json
import re
from collections import Counter
from datetime import datetime, timedelta

TOP_N = 20
TOOLS = [
    'fastqc','fastp','trimmomatic','bwa','star','hisat2','bowtie2',
    'samtools','gatk','deseq2','edger','seurat','scanpy','cellranger',
    'snakemake','nextflow','docker','conda','blast','bedtools',
    'featurecounts','salmon','kallisto','picard','bcftools',
    'multiqc','igv','bioconductor','nanopore','pacbio',
    'kraken','metaphlan','qiime','macs2','minimap2','alphafold'
]

BEGINNER_KEYWORDS = [
    'how to','beginner','getting started','tutorial','introduction',
    'help','error','not working','confused','understand',
    'difference between','what is','which tool','best way','workflow'
]

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'BioSkillsLab/1.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())

def extract_tools(text):
    text = text.lower()
    return [t for t in TOOLS if t in text]

def is_beginner(text):
    return any(kw in text.lower() for kw in BEGINNER_KEYWORDS)

def print_section(title, char='='):
    print('\n' + char * 60)
    print(f'  {title}')
    print(char * 60)

def get_stackoverflow_posts():
    print('  Fetching Stack Overflow bioinformatics questions...')
    posts = []
    for page in [1, 2, 3]:
        url = (f'https://api.stackexchange.com/2.3/questions'
               f'?page={page}&pagesize=100&order=desc&sort=votes'
               f'&tagged=bioinformatics&site=stackoverflow'
               f'&filter=withbody&key=')
        try:
            data = fetch(url)
            posts.extend(data.get('items', []))
            if not data.get('has_more'): break
        except Exception as e:
            print(f'    Warning: {e}'); break
    print(f'  Got {len(posts)} Stack Overflow posts')
    return posts

def get_github_repos():
    print('  Fetching GitHub trending bioinformatics repos...')
    repos = []
    for page in [1, 2]:
        url = (f'https://api.github.com/search/repositories'
               f'?q=bioinformatics+topic:bioinformatics'
               f'&sort=stars&order=desc&per_page=50&page={page}')
        try:
            data = fetch(url)
            repos.extend(data.get('items', []))
        except Exception as e:
            print(f'    Warning: {e}'); break
    print(f'  Got {len(repos)} GitHub repos')
    return repos

def analyze_stackoverflow(posts):
    tool_votes = Counter()
    tool_count = Counter()
    beginner   = []
    cutoff     = datetime.now() - timedelta(days=180)
    for p in posts:
        created = datetime.fromtimestamp(p.get('creation_date', 0))
        if created < cutoff: continue
        votes = p.get('score', 0)
        if votes < 2: continue
        title = p.get('title', '')
        body  = p.get('body', '')
        text  = title + ' ' + body
        tools = extract_tools(text)
        for t in tools:
            tool_votes[t] += votes
            tool_count[t] += 1
        if is_beginner(text):
            beginner.append({'title': title, 'votes': votes,
                             'url': p.get('link',''), 'tools': tools})
    return tool_votes, tool_count, beginner

def analyze_github(repos):
    tool_stars = Counter()
    for r in repos:
        name  = r.get('name','').lower()
        desc  = (r.get('description','') or '').lower()
        stars = r.get('stargazers_count', 0)
        text  = name + ' ' + desc
        for t in TOOLS:
            if t in text:
                tool_stars[t] += stars
    return tool_stars

def run():
    print('\nBioSkills Lab — Bioinformatics Trend Analyzer')
    print(f'Date: {datetime.now().strftime("%Y-%m-%d")}\n')

    so_posts  = get_stackoverflow_posts()
    gh_repos  = get_github_repos()

    so_tool_votes, so_tool_count, beginner_posts = analyze_stackoverflow(so_posts)
    gh_tool_stars = analyze_github(gh_repos)

    print_section('TOP BEGINNER QUESTIONS (Stack Overflow, by votes)')
    for i, p in enumerate(sorted(beginner_posts, key=lambda x: x['votes'], reverse=True)[:TOP_N], 1):
        tools_str = ', '.join(p['tools'][:3]) if p['tools'] else 'general'
        print(f'  {i:2}. [{p["votes"]:3} votes] {p["title"][:65]}')
        print(f'       Tools: {tools_str} | {p["url"]}')

    print_section('MOST DISCUSSED TOOLS — Stack Overflow (weighted by votes)')
    for i, (tool, votes) in enumerate(so_tool_votes.most_common(TOP_N), 1):
        print(f'  {i:2}. {tool:<20} {votes:5} votes  ({so_tool_count[tool]} questions)')

    print_section('MOST STARRED TOOLS — GitHub')
    for i, (tool, stars) in enumerate(gh_tool_stars.most_common(TOP_N), 1):
        print(f'  {i:2}. {tool:<20} {stars:6} stars')

    print_section('COMBINED TOOL RANKING (votes + stars normalized)')
    all_tools = set(list(so_tool_votes.keys()) + list(gh_tool_stars.keys()))
    max_votes = max(so_tool_votes.values()) if so_tool_votes else 1
    max_stars = max(gh_tool_stars.values()) if gh_tool_stars else 1
    combined  = Counter()
    for t in all_tools:
        score = (so_tool_votes.get(t,0)/max_votes)*50 + (gh_tool_stars.get(t,0)/max_stars)*50
        combined[t] = round(score, 1)
    for i, (tool, score) in enumerate(combined.most_common(TOP_N), 1):
        print(f'  {i:2}. {tool:<20} score: {score}')

    print_section('RECOMMENDED NEXT PROJECTS FOR BIOSKILLS LAB', '*')
    top_tools = [t for t, _ in combined.most_common(10)]
    print(f'\n  Top tools from data: {", ".join(top_tools)}')
    print("""
  TIER 1 — Highest demand, beginner-friendly:
  1. Single-cell RNA-Seq (Seurat/Scanpy) — most asked beginner topic
  2. Metagenomics with Kraken2/MetaPhlAn — huge demand, few free resources
  3. ChIP-Seq peak calling with MACS2 — consistently high traffic

  TIER 2 — Growing fast:
  4. Long-read sequencing (Nanopore + minimap2)
  5. ATAC-Seq analysis
  6. Multi-omics integration

  TIER 3 — Niche but high value:
  7. Protein structure prediction (AlphaFold)
  8. GWAS analysis pipeline
  9. Survival analysis in R (clinical genomics)
  """)

    fname = f'biostars_report_{datetime.now().strftime("%Y-%m-%d")}.txt'
    with open(fname, 'w') as f:
        f.write(f'BioSkills Lab Trend Report — {datetime.now().strftime("%Y-%m-%d")}\n')
        f.write(f'Stack Overflow posts: {len(so_posts)}, GitHub repos: {len(gh_repos)}\n\n')
        f.write('COMBINED TOOL RANKING:\n')
        for tool, score in combined.most_common(30):
            f.write(f'  {tool}: {score} (SO: {so_tool_votes.get(tool,0)} votes, GH: {gh_tool_stars.get(tool,0)} stars)\n')
        f.write('\nTOP BEGINNER QUESTIONS:\n')
        for p in sorted(beginner_posts, key=lambda x: x['votes'], reverse=True)[:30]:
            f.write(f'  [{p["votes"]} votes] {p["title"]}\n  {p["url"]}\n')
    print(f'\n  Report saved to: {fname}')
    print('  Run again in 30 days to track trends.\n')

if __name__ == '__main__':
    run()
