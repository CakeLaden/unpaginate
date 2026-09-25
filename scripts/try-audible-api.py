import json, urllib.request, ssl
from pathlib import Path

data = json.load(open("/Users/kyleclayton/Documents/Projects/unpaginate/auth.json"))
cookies = []
for c in data.get("cookies", []):
    domain = c.get("domain", "")
    if "audible" in domain or domain.endswith("amazon.com") or domain.endswith(".amazon.com"):
        cookies.append(f"{c['name']}={c['value']}")
cookie_header = "; ".join(cookies)

urls = [
    "https://api.audible.com/1.0/wishlist?num_results=20&page=0&response_groups=product_desc,contributors,media,price,product_attrs,category_ladders,series",
    "https://api.audible.com/1.0/library?num_results=20&page=0&response_groups=product_desc,contributors,media,product_attrs,category_ladders,series",
    "https://www.audible.com/library/wishlist?pageSize=20",
]

ctx = ssl.create_default_context()
for url in urls:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json, text/html, */*",
            "Cookie": cookie_header,
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            body = r.read(400)
            print("OK", r.status, r.geturl()[:120], "len", r.headers.get("Content-Length"), "ctype", r.headers.get("Content-Type"), "body0", body[:80])
    except Exception as e:
        print("ERR", url[:80], type(e).__name__, e)
