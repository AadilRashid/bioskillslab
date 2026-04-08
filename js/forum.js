function initForum(container) {
  container.innerHTML = `<div id="giscus-container"></div>`;
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', 'AadilRashid/bioskillslab');
  script.setAttribute('data-repo-id', 'R_kgDOR2wptw');
  script.setAttribute('data-category', 'General');
  script.setAttribute('data-category-id', 'DIC_kwDOR2wpt84C6Vgu');
  script.setAttribute('data-mapping', 'url');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', 'dark_dimmed');
  script.setAttribute('data-lang', 'en');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;
  container.appendChild(script);
}
