import urllib.request, json, time, sys

time.sleep(2)

url = "http://localhost:8000/api/v1/classificar?ncm=22041000&descricao=Vinho+tinto+fino&cfop=5101"
try:
    r = urllib.request.urlopen(url, timeout=10)
    d = json.loads(r.read())
    c = d["classificacao"]
    print(f"OK! cClassTrib: {c['cclass_trib']} | {c['cclasstrib_descricao']}")
    print(f"IBS: {c['aliquota_ibms']}% | CBS: {c['aliquota_cbs']}% | IS: {c['aliquota_is']}%")
    print(f"Confianca: {c['confianca']}% - {c['nivel_confianca']}")
    print(f"Regime: {c['regime_especifico']}")
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)
