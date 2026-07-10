import urllib.request, json

url = "http://localhost:8000/api/v1/classificar?ncm=22041000&descricao=Vinho+tinto+fino&cfop=5101"
try:
    r = urllib.request.urlopen(url, timeout=10)
    d = json.loads(r.read())
    print(json.dumps(d, indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(f"ERRO: {e}")
