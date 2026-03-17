"""
OMNIMENS Web Tools — Fetch URLs, Scrape HTML, Search the Web
Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
"""
import sys, json, requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; OMNIMENS/2.0; +https://omnimens.ai)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def fetch_url(url: str, mode: str = "text", timeout: int = 15) -> dict:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        resp.raise_for_status()
        ct = resp.headers.get("content-type", "")

        if mode == "raw" or "json" in ct:
            try:
                return {"success": True, "url": resp.url, "status": resp.status_code,
                        "content_type": ct, "data": resp.json()}
            except:
                return {"success": True, "url": resp.url, "status": resp.status_code,
                        "content_type": ct, "text": resp.text[:10000]}

        soup = BeautifulSoup(resp.content, "lxml")
        for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside"]):
            tag.decompose()

        if mode == "links":
            links = []
            for a in soup.find_all("a", href=True):
                href = urljoin(url, a["href"])
                text = a.get_text(strip=True)
                if href.startswith("http") and text:
                    links.append({"text": text, "url": href})
            return {"success": True, "url": resp.url, "status": resp.status_code,
                    "link_count": len(links), "links": links[:100]}

        if mode == "metadata":
            title = soup.title.string.strip() if soup.title else ""
            desc = ""
            for m in soup.find_all("meta"):
                if m.get("name") in ("description", "og:description") or m.get("property") == "og:description":
                    desc = m.get("content", "")
                    break
            h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
            h2s = [h.get_text(strip=True) for h in soup.find_all("h2")]
            return {"success": True, "url": resp.url, "status": resp.status_code,
                    "title": title, "description": desc, "h1": h1s[:5], "h2": h2s[:10]}

        # default: text
        text = soup.get_text(separator="\n", strip=True)
        lines = [l for l in text.splitlines() if l.strip()]
        clean = "\n".join(lines)
        return {"success": True, "url": resp.url, "status": resp.status_code,
                "content_type": ct, "text": clean[:12000], "char_count": len(clean)}

    except requests.exceptions.Timeout:
        return {"success": False, "error": f"Request timed out after {timeout}s", "url": url}
    except requests.exceptions.HTTPError as e:
        return {"success": False, "error": str(e), "status": e.response.status_code if e.response else None}
    except Exception as e:
        return {"success": False, "error": str(e), "url": url}

def api_request(method: str, url: str, headers: dict = None, body=None,
                params: dict = None, auth: dict = None, timeout: int = 20) -> dict:
    try:
        kwargs = {"headers": {**HEADERS, **(headers or {})}, "timeout": timeout,
                  "params": params or {}}
        if auth:
            from requests.auth import HTTPBasicAuth
            kwargs["auth"] = HTTPBasicAuth(auth.get("user",""), auth.get("pass",""))
        if body is not None:
            if isinstance(body, (dict, list)):
                kwargs["json"] = body
                kwargs["headers"]["Content-Type"] = "application/json"
            else:
                kwargs["data"] = body

        resp = requests.request(method.upper(), url, **kwargs)
        ct = resp.headers.get("content-type", "")
        try:
            data = resp.json()
        except:
            data = None

        return {
            "success": True,
            "status": resp.status_code,
            "ok": resp.ok,
            "url": resp.url,
            "content_type": ct,
            "headers": dict(resp.headers),
            "json": data,
            "text": resp.text[:5000] if data is None else None,
            "elapsed_ms": round(resp.elapsed.total_seconds() * 1000),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "url": url}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    op = data.get("op", "fetch")
    if op == "fetch":
        result = fetch_url(data.get("url",""), data.get("mode","text"), data.get("timeout",15))
    elif op == "api_request":
        result = api_request(data.get("method","GET"), data.get("url",""),
                             data.get("headers"), data.get("body"),
                             data.get("params"), data.get("auth"), data.get("timeout",20))
    else:
        result = {"success": False, "error": f"Unknown op: {op}"}
    print(json.dumps(result))
