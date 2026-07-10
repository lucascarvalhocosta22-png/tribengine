import json, os, re
from difflib import SequenceMatcher

NCM_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "ncm_cclass_map.json")


class TribAIEngine:

    CST_INDICES = {
        "00": "Tributacao normal", "01": "Tributacao monofasica",
        "02": "Tributacao com aliquota zero", "03": "Imune", "04": "Isenta",
        "05": "Com suspensao", "06": "Tributacao com reducao de base",
        "07": "Regime especifico", "08": "Regime diferenciado",
        "09": "Regime favorecido", "10": "Tributacao com credito presumido",
        "11": "Tributacao com cashback", "12": "Nanoempreendedor",
        "49": "Outras", "90": "Importacao", "91": "Exportacao",
    }

    CCLASSTRIB_MAP = {
        "000001": {"descricao": "Tributacao integral IBS/CBS", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Regime geral - CST 0 (tributacao integral)"},
        "000003": {"descricao": "Regime automotivo", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Regime automotivo - integral"},
        "01.02.01": {"descricao": "Alimentos preparados / refeicoes", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Alimentos preparados - reducao 40% (Art. 275)"},
        "01.02.02": {"descricao": "Alimentos com reducao", "aliquota_ibms": 6.0, "aliquota_cbs": 6.0, "regime": "Reducao de 60%"},
        "01.03.01": {"descricao": "Insumos agropecuarios", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Imunidade - Insumos rurais"},
        "01.04.01": {"descricao": "Medicamentos e dispositivos medicos", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Reducao especifica saude"},
        "01.08.02": {"descricao": "Bens de informatica", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Regime geral bens"},
        "01.09.01": {"descricao": "Combustiveis", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Monofasico - combustiveis"},
        "01.14.01": {"descricao": "Hoteis e similares", "aliquota_ibms": 6.0, "aliquota_cbs": 6.0, "regime": "Reducao de 40% hospitalidade"},
        "01.14.02": {"descricao": "Restaurantes e bares", "aliquota_ibms": 6.0, "aliquota_cbs": 6.0, "regime": "Reducao de 40% alimentacao"},
        "01.15.02": {"descricao": "Livros e jornais", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Imunidade livros"},
        "01.17.01": {"descricao": "Produtos sujeitos ao Imposto Seletivo", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "aliquota_is": 10.0, "regime": "Imposto Seletivo"},
        "01.17.02": {"descricao": "Bebidas alcoolicas", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "aliquota_is": 15.0, "regime": "Imposto Seletivo - bebidas"},
        "01.17.03": {"descricao": "Cigarros e tabacos", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "aliquota_is": 20.0, "regime": "Imposto Seletivo - tabaco"},
        "01.17.04": {"descricao": "Bebidas acucaradas", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "aliquota_is": 5.0, "regime": "Imposto Seletivo - bebidas acucaradas"},
        "01.17.05": {"descricao": "Veiculos poluentes", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "aliquota_is": 10.0, "regime": "Imposto Seletivo - veiculos"},
        "01.22.01": {"descricao": "Produtor rural", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Produtor rural - credito presumido"},
        "01.23.01": {"descricao": "Nanoempreendedor", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Nanoempreendedor - isencao"},
        "01.24.01": {"descricao": "Simples Nacional", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Simples Nacional - regime favorecido"},
        "01.25.01": {"descricao": "Regime geral IBS/CBS", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Regime geral"},
        "01.25.02": {"descricao": "Regime geral IBS/CBS - servicos", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Regime geral servicos"},
        "200003": {"descricao": "Cesta basica - aliquota zero", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Cesta basica - aliquota zero (Art. 125)"},
        "200014": {"descricao": "Frutas, hortalicas e ovos - aliquota zero", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Produtos horticulas - aliquota zero"},
        "200034": {"descricao": "Alimentos consumo humano - reducao 60%", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Alimentos consumo humano - reducao 60%"},
        "200035": {"descricao": "Produtos higiene e limpeza - reducao 60%", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Produtos higiene - reducao 60%"},
        "200038": {"descricao": "Insumos agropecuarios e aquaticolas", "aliquota_ibms": 7.08, "aliquota_cbs": 3.52, "regime": "Insumos agropecuarios - reducao 60% (Art. 138)"},
        "200047": {"descricao": "Bares e Restaurantes", "aliquota_ibms": 17.7, "aliquota_cbs": 8.8, "regime": "Bares e Restaurantes - reducao 40% (Art. 275)"},
        "01.99.99": {"descricao": "Classificacao pendente", "aliquota_ibms": 0, "aliquota_cbs": 0, "regime": "Pendente"},
    }

    def __init__(self):
        self._ncm_map = self._load_ncm_map()

    def _load_ncm_map(self) -> dict:
        path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "ncm_cclass_map.json")
        if not os.path.exists(path):
            return {}
        try:
            with open(path, encoding="utf-8") as f:
                return json.load(f).get("ncm_to_cclass", {})
        except Exception:
            return {}

    NCM_IS_MAP = {
        "2401": "01.17.03", "2402": "01.17.03", "2403": "01.17.03",
        "2710": "01.17.01", "2711": "01.17.01",
    }

    def _buscar_cclasstrib_por_ncm_tabela(self, ncm_limpo: str) -> str:
        if not ncm_limpo or not self._ncm_map:
            return None
        for length in [4, 6, 8]:
            key = ncm_limpo[:length]
            if key in self.NCM_IS_MAP:
                return None
        for length in [8, 6, 4]:
            key = ncm_limpo[:length]
            if key in self._ncm_map:
                return self._ncm_map[key]["cClassTrib"]
        return None

    def _classificar_por_descricao(self, descricao: str) -> tuple:
        if not descricao:
            return None
        d = descricao.lower()
        pares = [
            (["restaurante", "self service", "self buffet", "buffet", "buffet livre",
              "prato executivo", "prato feito", "prato do dia", "prato comercial",
              "marmita", "quentinha", "combo refeicao", "refeicao completa",
              "almoco executivo"], "200047"),
            (["medicament", "remedio", "farmacia", "vacina", "insumo farmaceutico"], "01.04.01"),
            (["combustivel", "gasolina", "diesel", "etanol", "alcool combustivel"], "01.09.01"),
            (["livro", "jornal", "revista", "periodico"], "01.15.02"),
            (["cigarro", "tabaco", "charuto", "cigarrilha"], "01.17.03"),
            (["cerveja", "chopp", "vinho", "cachaca", "uisque", "vodka", "bebida alcoolica"], "01.25.01"),
            (["refrigerante", "bebida acucarada", "energetico", "isotonic", "suco artificial"], "01.25.01"),
            (["hotel", "hospedagem", "pousada", "motel"], "01.14.01"),
            (["bar", "lanchonete", "pizzaria", "food truck", "delivery", "fast food", "churrascaria"], "01.14.02"),
        ]
        for palavras, cclasstrib in pares:
            for p in palavras:
                if p in d:
                    return cclasstrib, 85.0
        return None

    BEBIDAS_SEM_REDUCAO = {"2201", "2202", "2203", "2204", "2205", "2206", "2207", "2208"}

    def _buscar_cclasstrib_por_ncm(self, ncm: str, descricao: str, cfop: str = "", tipo_declarado: str = "") -> tuple:
        ncm_limpo = re.sub(r'[^0-9]', '', ncm) if ncm else ""
        ncm_4 = ncm_limpo[:4] if ncm_limpo else ""

        if tipo_declarado == "venda":
            if ncm_4 in self.NCM_IS_MAP:
                return self._resolver_ncm_tabela(ncm_limpo)

            if ncm_4 in self.BEBIDAS_SEM_REDUCAO:
                return self._resolver_ncm_tabela(ncm_limpo)

            cfop_4 = (cfop or "0000")[:4]
            if cfop_4 in ("5405", "5403"):
                return "000001", 100.0

            resultado_desc = self._classificar_por_descricao(descricao)
            if resultado_desc:
                return resultado_desc
            return "200047", 100.0

        if ncm_limpo and len(ncm_limpo) >= 4:
            return self._resolver_ncm_tabela(ncm_limpo)

        resultado_desc = self._classificar_por_descricao(descricao)
        if resultado_desc:
            return resultado_desc

        return "01.25.01", 65.0

    def _resolver_ncm_tabela(self, ncm_limpo: str) -> tuple:
        if not ncm_limpo or len(ncm_limpo) < 4:
            return None
        oficial = self._buscar_cclasstrib_por_ncm_tabela(ncm_limpo)
        if oficial:
            user_map = {
                "000001": "000001", "000003": "000001",
                "200003": "200003", "200014": "200014",
                "200034": "200034", "200035": "200034",
                "200038": "200038", "200047": "200047",
            }
            mapped = user_map.get(oficial, "000001")
            return mapped, 100.0
        return None

    def _determinar_cst(self, cclasstrib: str, cfop: str) -> dict:
        result = {"cst_ibms": "00", "cst_cbs": "00", "cst_is": "00"}
        if cclasstrib == "01.02.01":
            result["cst_ibms"] = "06"
            result["cst_cbs"] = "06"
        elif cclasstrib in ["01.02.02", "200034", "200035", "200038"]:
            result["cst_ibms"] = "06"
            result["cst_cbs"] = "06"
        elif cclasstrib in ["01.03.01", "01.15.02"]:
            result["cst_ibms"] = "03"
            result["cst_cbs"] = "03"
        elif cclasstrib in ["200003", "200014"]:
            result["cst_ibms"] = "02"
            result["cst_cbs"] = "02"
        elif cclasstrib in ["01.09.01"]:
            result["cst_ibms"] = "01"
            result["cst_cbs"] = "01"
        elif cclasstrib in ["01.23.01"]:
            result["cst_ibms"] = "12"
            result["cst_cbs"] = "12"
        elif cclasstrib in ["01.24.01"]:
            result["cst_ibms"] = "09"
            result["cst_cbs"] = "09"
        elif cclasstrib.startswith("01.17"):
            result["cst_is"] = "00"
        elif cclasstrib == "01.22.01":
            result["cst_ibms"] = "10"
            result["cst_cbs"] = "10"
        elif cclasstrib == "200047":
            result["cst_ibms"] = "06"
            result["cst_cbs"] = "06"
        return result

    def _calcular_confianca(self, ncm: str, cest: str, descricao: str, cclasstrib: str) -> float:
        score = 50.0
        if ncm and len(ncm) >= 4:
            score += 10.0
        if cest:
            score += 10.0
        if descricao:
            score += 5.0
        if cclasstrib and cclasstrib != "01.99.99":
            score += 15.0
        if cclasstrib in self.CCLASSTRIB_MAP:
            info = self.CCLASSTRIB_MAP[cclasstrib]
            if info["aliquota_ibms"] > 0 or info["aliquota_cbs"] > 0:
                score += 5.0
        return min(score, 100.0)

    def _gerar_artigos(self, cclasstrib: str) -> list:
        base = ["Lei Complementar 214/2025", "Regulamento IBS/CBS"]
        m = {
            "01.02.01": ["Art. 275, LC 214/2025 - Reducao de 40% para alimentos preparados / refeicoes"],
            "01.02.02": ["Art. 10, LC 214/2025 - Reducao de 60% para alimentos"],
            "01.03.01": ["Art. 7, LC 214/2025 - Imunidade insumos rurais"],
            "01.04.01": ["Art. 11, LC 214/2025 - Reducao especifica para medicamentos"],
            "01.09.01": ["Art. 25, LC 214/2025 - Monofasico combustiveis"],
            "01.14.01": ["Art. 10, LC 214/2025 - Reducao de 40% hospitalidade"],
            "01.14.02": ["Art. 10, LC 214/2025 - Reducao de 40% alimentacao fora do lar"],
            "01.15.02": ["Art. 7, LC 214/2025 - Imunidade livros"],
            "01.17.01": ["Art. 15, LC 214/2025 - Imposto Seletivo"],
            "01.17.02": ["Art. 15-A, LC 214/2025 - IS Bebidas alcoolicas"],
            "01.17.03": ["Art. 15-B, LC 214/2025 - IS Cigarros e tabacos"],
            "01.17.04": ["Art. 15-C, LC 214/2025 - IS Bebidas acucaradas"],
            "01.17.05": ["Art. 15-D, LC 214/2025 - IS Veiculos poluentes"],
            "01.22.01": ["Art. 20, LC 214/2025 - Credito presumido produtor rural"],
            "01.23.01": ["Art. 5, LC 214/2025 - Nanoempreendedor"],
            "01.24.01": ["Art. 18, LC 214/2025 - Simples Nacional"],
            "200047": ["Art. 275, LC 214/2025 - Reducao de 40% para bares e restaurantes"],
            "000001": ["Art. 26, LC 214/2025 - Regime geral IBS/CBS - tributacao integral"],
            "200003": ["Art. 125, LC 214/2025 - Cesta basica - aliquota zero"],
            "200014": ["Art. 125, LC 214/2025 - Produtos horticulas - aliquota zero"],
            "200034": ["Art. 125, LC 214/2025 - Alimentos consumo humano - reducao 60%"],
            "200035": ["Art. 125, LC 214/2025 - Produtos higiene - reducao 60%"],
            "200038": ["Art. 138, LC 214/2025 - Insumos agropecuarios - reducao 60%"],
        }
        return base + m.get(cclasstrib, ["Art. 26, LC 214/2025 - Regime geral"])

    def _gerar_fundamentacao(self, cclasstrib: str, cst_ibms: str, confianca: float) -> str:
        info = self.CCLASSTRIB_MAP.get(cclasstrib, {})
        regime = info.get("regime", "Regime geral")
        artigos = self._gerar_artigos(cclasstrib)
        texto = f"Classificacao: {cclasstrib} - {info.get('descricao', '')}\n"
        texto += f"Regime: {regime}\n"
        texto += f"CST IBS: {cst_ibms} - {self.CST_INDICES.get(cst_ibms, '')}\n"
        texto += f"Confianca: {confianca:.1f}%\n"
        texto += "Fundamentacao Legal:\n"
        for a in artigos:
            texto += f"  - {a}\n"
        if cclasstrib == "01.02.01":
            texto += "\nProduto classificado como alimento preparado / refeicao.\nArt. 275 da LC 214/2025 - Reducao de 40% na aliquota.\n"
        if cclasstrib == "200047":
            texto += "\nEstabelecimento classificado como bar ou restaurante.\nArt. 275 da LC 214/2025 - Reducao de 40% na aliquota.\n"
        return texto

    def classificar(self, ncm: str, cest: str = "", cfop: str = "", descricao: str = "",
                    gtin: str = None, codigo_produto: str = None, tipo_declarado: str = "") -> dict:
        ncm_limpo = re.sub(r'[^0-9]', '', ncm) if ncm else ""

        cclasstrib, conf_base = self._buscar_cclasstrib_por_ncm(ncm, descricao, cfop, tipo_declarado)
        info = self.CCLASSTRIB_MAP.get(cclasstrib, {})
        cst = self._determinar_cst(cclasstrib, cfop)
        confianca = conf_base

        if confianca >= 90:
            nivel_confianca = "Alta"
        elif confianca >= 75:
            nivel_confianca = "Media"
        else:
            nivel_confianca = "Necessita Revisao"

        fundamentacao = self._gerar_fundamentacao(cclasstrib, cst["cst_ibms"], confianca)
        artigos = self._gerar_artigos(cclasstrib)

        precisa_revisao = "Nao" if confianca >= 85 else "Sim"

        return {
            "ncm": ncm_limpo,
            "cest": cest or "",
            "cfop": cfop,
            "descricao": descricao,
            "cclass_trib": cclasstrib,
            "cst_ibms": cst["cst_ibms"],
            "cst_cbs": cst["cst_cbs"],
            "cst_is": cst["cst_is"],
            "aliquota_ibms": info.get("aliquota_ibms", 17.7),
            "aliquota_cbs": info.get("aliquota_cbs", 8.8),
            "aliquota_is": info.get("aliquota_is", 0),
            "regime_especifico": info.get("regime", "Regime geral"),
            "regime_diferenciado": "",
            "regime_favorecido": "Sim" if cclasstrib in ["01.24.01"] else "Nao",
            "cesta_basica": "Sim" if cclasstrib in ["200003", "200014"] else "Nao",
            "monofasico": "Sim" if cclasstrib in ["01.09.01"] else "Nao",
            "reducao_base": 60 if cclasstrib in ["200034", "200035", "200038"] else 0,
            "reducao_aliquota": 0,
            "aliquota_zero": "Sim" if cclasstrib in ["200003", "200014"] else "Nao",
            "cashback": "Nao",
            "suspensao": "Nao",
            "imunidade": "Sim" if cst["cst_ibms"] == "03" else "Nao",
            "isencao": "Sim" if cclasstrib == "01.23.01" else "Nao",
            "split_payment": "Nao",
            "confianca": round(confianca, 1),
            "nivel_confianca": nivel_confianca,
            "fundamentacao_legal": fundamentacao,
            "artigos_utilizados": artigos,
            "precisa_revisao": precisa_revisao,
            "cclasstrib_descricao": info.get("descricao", ""),
        }


engine = TribAIEngine()
