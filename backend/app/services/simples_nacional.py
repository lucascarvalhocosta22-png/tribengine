import json, os, time, urllib.request, threading

CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "fornecedores_simples.json")
_lock = threading.Lock()
_cache = None
_last_request = 0


def _load_cache():
    global _cache
    if _cache is not None:
        return
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, encoding="utf-8") as f:
                _cache = json.load(f)
        except Exception:
            _cache = {}
    else:
        _cache = {}


def _save_cache():
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(_cache, f, ensure_ascii=False, indent=2)


def consultar_cnpj(cnpj: str) -> dict:
    global _last_request
    cnpj_clean = "".join(c for c in cnpj if c.isdigit())
    with _lock:
        _load_cache()
        if cnpj_clean in _cache:
            return _cache[cnpj_clean]
    now = time.time()
    if now - _last_request < 0.35:
        time.sleep(0.35 - (now - _last_request))
    try:
        url = f"https://www.receitaws.com.br/v1/cnpj/{cnpj_clean}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        if data.get("status") == "ERROR":
            raise ValueError(data.get("message", "Erro na consulta"))
        result = {
            "cnpj": cnpj_clean,
            "razao_social": data.get("nome", ""),
            "fantasia": data.get("fantasia", ""),
            "situacao": data.get("situacao", ""),
            "simples_nacional": data.get("simples", {}).get("optante", False) if isinstance(data.get("simples"), dict) else False,
            "simei": data.get("simei", {}).get("optante", False) if isinstance(data.get("simei"), dict) else False,
            "ultima_consulta": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        with _lock:
            _cache[cnpj_clean] = result
            _save_cache()
        _last_request = time.time()
        return result
    except Exception as e:
        with _lock:
            _cache[cnpj_clean] = {"cnpj": cnpj_clean, "erro": str(e), "simples_nacional": False}
            _save_cache()
        _last_request = time.time()
        return _cache[cnpj_clean]


def is_simples_nacional(cnpj: str) -> bool:
    data = consultar_cnpj(cnpj)
    return data.get("simples_nacional", False)


def listar_fornecedores() -> list:
    _load_cache()
    return list(_cache.values()) if _cache else []
