import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic API Health
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Body parser for proxy requests
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // YouTube Search API for unblocked client
  async function searchYouTube(query: string) {
    const cleanQ = query.trim();
    if (!cleanQ) return [];
    try {
      const upstreamRes = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );
      const text = await upstreamRes.text();
      let jsonStr = "";
      const startIdx = text.indexOf("ytInitialData = ");
      if (startIdx !== -1) {
        const jsonStart = startIdx + "ytInitialData = ".length;
        let endIdx = text.indexOf(";</script>", jsonStart);
        if (endIdx === -1) {
          endIdx = text.indexOf("};", jsonStart);
          if (endIdx !== -1) endIdx += 1;
        }
        if (endIdx !== -1) {
          jsonStr = text.slice(jsonStart, endIdx);
        }
      }

      if (!jsonStr) {
        const match = text.match(/ytInitialData\s*=\s*({[\s\S]+?});\s*<\/script>/);
        if (match) jsonStr = match[1];
      }

      if (!jsonStr) return [];

      const data = JSON.parse(jsonStr);
      const sections =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents || [];
      const videos: Array<{
        id: string;
        title: string;
        channel: string;
        duration?: string;
        views?: string;
        thumbnail?: string;
      }> = [];

      for (const sec of sections) {
        const items = sec.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item.videoRenderer;
          if (v && v.videoId && (v.title?.runs?.[0]?.text || v.title?.simpleText)) {
            const title = v.title?.runs?.[0]?.text || v.title?.simpleText || "YouTube Video";
            videos.push({
              id: v.videoId,
              title,
              channel: v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || "YouTube Creator",
              duration: v.lengthText?.simpleText || "Video",
              views:
                v.viewCountText?.simpleText ||
                v.shortViewCountText?.simpleText ||
                "",
              thumbnail:
                v.thumbnail?.thumbnails?.[v.thumbnail?.thumbnails?.length - 1]?.url ||
                `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
            });
          }
        }
      }
      return videos;
    } catch (err) {
      console.error("YouTube search error:", err);
      return [];
    }
  }

  app.get("/api/youtube/search", async (req, res) => {
    const query = (req.query.q as string) || "trending";
    try {
      const videos = await searchYouTube(query);
      res.json({ success: true, query, count: videos.length, videos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, videos: [] });
    }
  });

  // Proxy Endpoint to unblock websites & bypass X-Frame-Options / CSP
  app.all("/api/proxy", async (req, res) => {
    let rawUrl = (req.query.url as string) || (req.body && (req.body.url as string));
    if (!rawUrl && req.query.q) {
      rawUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(String(req.query.q))}`;
    }

    if (!rawUrl || typeof rawUrl !== "string") {
      return res.status(400).send("Missing or invalid url parameter");
    }

    let targetUrl = rawUrl.trim();
    if (targetUrl.startsWith("//")) {
      targetUrl = "https:" + targetUrl;
    } else if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    // Smart YouTube Video detection & redirection to unblocked player
    if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
      const ytMatch = targetUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i
      );
      if (ytMatch && ytMatch[1]) {
        return res.redirect(`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`);
      }
    }

    // Unwrap DuckDuckGo redirect uddg parameter
    if (targetUrl.includes("uddg=")) {
      try {
        const parsed = new URL(targetUrl);
        const uddgVal = parsed.searchParams.get("uddg");
        if (uddgVal && /^https?:\/\//i.test(uddgVal)) {
          targetUrl = decodeURIComponent(uddgVal);
        }
      } catch {}
    }

    // Unwrap Google /url?q= parameter
    if (targetUrl.includes("/url?") && (targetUrl.includes("q=") || targetUrl.includes("url="))) {
      try {
        const parsed = new URL(targetUrl);
        const qVal = parsed.searchParams.get("q") || parsed.searchParams.get("url");
        if (qVal && /^https?:\/\//i.test(qVal)) {
          targetUrl = decodeURIComponent(qVal);
        }
      } catch {}
    }

    // Unwrap Bing /ck/a?u= parameter
    if (targetUrl.includes("bing.com/ck/a?") && targetUrl.includes("u=")) {
      try {
        const parsed = new URL(targetUrl);
        const uVal = parsed.searchParams.get("u");
        if (uVal) {
          let clean = uVal.startsWith("a1") ? uVal.slice(2) : uVal;
          const decoded = Buffer.from(clean, "base64").toString("utf-8");
          if (/^https?:\/\//i.test(decoded)) {
            targetUrl = decoded;
          }
        }
      } catch {}
    }

    let parsedTarget: URL;
    try {
      parsedTarget = new URL(targetUrl);
    } catch {
      return res.status(400).send("Invalid target URL format");
    }

    try {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 15000);

      const upstreamHeaders: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        Referer: parsedTarget.origin + "/",
      };

      const upstreamRes = await fetch(targetUrl, {
        headers: upstreamHeaders,
        redirect: "follow",
        signal: abortController.signal,
      });

      clearTimeout(timeout);

      const finalUrl = upstreamRes.url || targetUrl;
      const contentType = upstreamRes.headers.get("content-type") || "";

      // Clean security headers so iframe renders freely
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.removeHeader("Content-Security-Policy-Report-Only");
      res.removeHeader("Cross-Origin-Opener-Policy");
      res.removeHeader("Cross-Origin-Embedder-Policy");
      res.removeHeader("Cross-Origin-Resource-Policy");

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("X-Proxy-Final-Url", finalUrl);

      // Handle HTML content
      if (contentType.toLowerCase().includes("text/html")) {
        let html = await upstreamRes.text();

        // Check if response is a JS/Meta redirect stub page (common with DuckDuckGo redirect or trackers)
        const jsRedirectMatch = html.match(/(?:window\.)?(?:parent\.)?location\.replace\s*\(\s*["'](https?:\/\/[^"']+)["']\s*\)/i);
        const metaRefreshMatch = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=(https?:\/\/[^"']+)["']/i);
        const redirectUrl = jsRedirectMatch?.[1] || metaRefreshMatch?.[1];

        if (redirectUrl && html.length < 2500) {
          return res.redirect(`/api/proxy?url=${encodeURIComponent(redirectUrl)}`);
        }

        // Strip inline CSP and frame-options meta tags
        html = html.replace(
          /<meta[^>]+http-equiv=["']?(content-security-policy|x-frame-options)["']?[^>]*>/gi,
          ""
        );

        // Neutralize framebusting scripts
        html = html.replace(
          /if\s*\(\s*(top|window\.top)\s*!==?\s*(self|window\.self)\s*\)[^;]+;/gi,
          "/* neutralized framebuster */"
        );
        html = html.replace(
          /(top|window\.top)\.location(\.href)?\s*=\s*(self|window\.self|location|window\.location)(\.href)?;/gi,
          "/* neutralized framebuster */"
        );

        // Helper to rewrite links to proxy
        const rewriteHref = (rawHref: string): string => {
          if (!rawHref) return rawHref;
          const trimmed = rawHref.trim();
          if (
            trimmed.startsWith("#") ||
            trimmed.startsWith("javascript:") ||
            trimmed.startsWith("mailto:") ||
            trimmed.startsWith("tel:") ||
            trimmed.startsWith("data:")
          ) {
            return rawHref;
          }

          // Unwrap DuckDuckGo uddg in href
          if (trimmed.includes("uddg=")) {
            try {
              const p = new URL(trimmed, finalUrl);
              const uddg = p.searchParams.get("uddg");
              if (uddg && /^https?:\/\//i.test(uddg)) {
                return `/api/proxy?url=${encodeURIComponent(uddg)}`;
              }
            } catch {}
          }

          // Unwrap Google /url?q= in href
          if (trimmed.includes("/url?") && (trimmed.includes("q=") || trimmed.includes("url="))) {
            try {
              const p = new URL(trimmed, finalUrl);
              const q = p.searchParams.get("q") || p.searchParams.get("url");
              if (q && /^https?:\/\//i.test(q)) {
                return `/api/proxy?url=${encodeURIComponent(q)}`;
              }
            } catch {}
          }

          try {
            const resolved = new URL(trimmed, finalUrl).href;
            return `/api/proxy?url=${encodeURIComponent(resolved)}`;
          } catch {
            return rawHref;
          }
        };

        // Server-side rewrite of <a href="...">
        html = html.replace(
          /<a\b([^>]*?)\bhref=(["'])(.*?)\2([^>]*?)>/gi,
          (_match, prefix, quote, hrefVal, suffix) => {
            const newHref = rewriteHref(hrefVal);
            const cleanPrefix = prefix.replace(/\btarget=(["'])?([^\s"'>]+)\1?/gi, "");
            const cleanSuffix = suffix.replace(/\btarget=(["'])?([^\s"'>]+)\1?/gi, "");
            return `<a${cleanPrefix} href=${quote}${newHref}${quote} target="_self"${cleanSuffix}>`;
          }
        );

        // Server-side rewrite of <form action="...">
        html = html.replace(
          /<form\b([^>]*?)\baction=(["'])(.*?)\2([^>]*?)>/gi,
          (_match, prefix, quote, actionVal, suffix) => {
            let resolved = actionVal;
            try {
              resolved = new URL(actionVal, finalUrl).href;
            } catch {}
            const newAction = `/api/proxy?url=${encodeURIComponent(resolved)}`;
            return `<form${prefix} action=${quote}${newAction}${quote} target="_self"${suffix}>`;
          }
        );

        const baseTag = `<base href="${finalUrl}">\n`;
        const interceptorScript = `
<script id="__tralalala_browser_interceptor__">
(function() {
  var currentUrl = ${JSON.stringify(finalUrl)};

  function notifyParent(url, title, fromIframe) {
    try {
      window.parent.postMessage({
        type: 'TRALALALA_NAVIGATE',
        url: url || currentUrl,
        title: title || document.title || 'Page',
        fromIframe: Boolean(fromIframe)
      }, '*');
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      notifyParent(currentUrl, document.title, false);
    });
  } else {
    notifyParent(currentUrl, document.title, false);
  }

  try {
    var titleEl = document.querySelector('title');
    if (titleEl) {
      new MutationObserver(function() {
        notifyParent(currentUrl, document.title, false);
      }).observe(titleEl, { childList: true, characterData: true, subtree: true });
    }
  } catch(e) {}

  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    a.removeAttribute('target');

    var targetUrl = a.href;
    if (targetUrl.indexOf('/api/proxy?url=') !== -1) {
      try {
        var u = new URL(targetUrl, window.location.origin);
        var inner = u.searchParams.get('url');
        if (inner) targetUrl = inner;
      } catch(err) {}
    } else {
      try {
        targetUrl = new URL(href, currentUrl).href;
      } catch(err) {}
    }

    if (targetUrl.indexOf('uddg=') !== -1) {
      try {
        var p = new URL(targetUrl);
        var uVal = p.searchParams.get('uddg');
        if (uVal && /^https?:\/\//i.test(uVal)) targetUrl = decodeURIComponent(uVal);
      } catch(err) {}
    }

    if (targetUrl.indexOf('/url?') !== -1 && (targetUrl.indexOf('q=') !== -1 || targetUrl.indexOf('url=') !== -1)) {
      try {
        var p2 = new URL(targetUrl);
        var qVal = p2.searchParams.get('q') || p2.searchParams.get('url');
        if (qVal && /^https?:\/\//i.test(qVal)) targetUrl = decodeURIComponent(qVal);
      } catch(err) {}
    }

    notifyParent(targetUrl, a.innerText ? a.innerText.trim().slice(0, 40) : document.title, true);
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl);
  }, true);

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form) return;

    var rawAction = form.getAttribute('action') || currentUrl;
    var resolvedAction;
    try {
      if (rawAction.indexOf('/api/proxy?url=') !== -1) {
        var u = new URL(rawAction, window.location.origin);
        resolvedAction = u.searchParams.get('url') || currentUrl;
      } else {
        resolvedAction = new URL(rawAction, currentUrl).href;
      }
    } catch(err) {
      resolvedAction = currentUrl;
    }

    var formData = new FormData(form);
    var params = new URLSearchParams();
    formData.forEach(function(val, key) {
      if (typeof val === 'string') params.append(key, val);
    });

    var delim = resolvedAction.indexOf('?') !== -1 ? '&' : '?';
    var fullTargetUrl = resolvedAction + (params.toString() ? delim + params.toString() : '');

    e.preventDefault();
    e.stopPropagation();

    notifyParent(fullTargetUrl, 'Searching...', true);
    window.location.href = '/api/proxy?url=' + encodeURIComponent(fullTargetUrl);
  }, true);

  window.open = function(url) {
    if (url) {
      var dest = url;
      try {
        dest = new URL(url, currentUrl).href;
      } catch(e) {}
      notifyParent(dest, document.title, true);
      window.location.href = '/api/proxy?url=' + encodeURIComponent(dest);
    }
    return window;
  };
})();
</script>
`;

        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(
            /<head[^>]*>/i,
            (match) => `${match}\n${baseTag}${interceptorScript}`
          );
        } else {
          html = `${baseTag}${interceptorScript}${html}`;
        }

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(upstreamRes.status).send(html);
      }

      // Non-HTML content (images, styles, json, media, etc.)
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      const buffer = Buffer.from(await upstreamRes.arrayBuffer());
      return res.status(upstreamRes.status).send(buffer);
    } catch (err: any) {
      const isTimeout = err.name === "AbortError";
      const errorMsg = isTimeout
        ? "The website took too long to respond (connection timed out)."
        : err.message || "Failed to load the requested website.";

      const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Could Not Connect - Tralalala Browser</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      max-width: 480px;
      margin: 20px;
      padding: 32px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      color: #f43f5e;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 10px;
      font-weight: 700;
      color: #f8fafc;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .url-box {
      font-family: monospace;
      font-size: 12px;
      background: #1e293b;
      padding: 8px 12px;
      border-radius: 8px;
      color: #38bdf8;
      word-break: break-all;
      margin-bottom: 24px;
      text-align: left;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      display: inline-block;
    }
    .btn-primary {
      background: #10b981;
      color: #022c22;
    }
    .btn-primary:hover {
      background: #34d399;
    }
    .btn-secondary {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
    <h1>Unable to load website</h1>
    <p>${errorMsg}</p>
    <div class="url-box">${targetUrl}</div>
    <div class="actions">
      <a href="/api/proxy?url=${encodeURIComponent(targetUrl)}" class="btn btn-primary">Try Again</a>
      <a href="https://duckduckgo.com/html/?q=${encodeURIComponent(targetUrl)}" class="btn btn-secondary">Search on DuckDuckGo</a>
      <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Open in External Window ↗</a>
    </div>
  </div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(fallbackHtml);
    }
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
