class AuditoriaFiscal:

    NCM_EXERCITO = ["9301", "9302", "9303", "9304", "9305", "9306", "9307"]

    def auditar_item(self, item: dict) -> dict:
        problemas = []
        alertas = []
        sugestoes = []

        ncm = item.get("ncm", "")
        cfop = item.get("cfop", "")
        cst_ibms = item.get("cst_ibms", "")
        cclass_trib = item.get("cclass_trib", "")
        descricao = item.get("descricao", "")
        confianca = item.get("confianca", 0)

        if not ncm or ncm == "":
            problemas.append("NCM não informado")

        if confianca < 70:
            alertas.append(f"Baixa confiança na classificação ({confianca:.1f}%) - necessita revisão")

        if cclass_trib == "01.99.99":
            problemas.append("Classificação tributária pendente (cClassTrib = 01.99.99)")

        if self._verificar_ncm_incompativel(ncm, descricao):
            alertas.append(f"NCM {ncm} possivelmente incompatível com a descrição do produto")

        if cfop and cst_ibms:
            cfop_prefixo = cfop[:1]
            if cfop_prefixo == "3" and cst_ibms in ["91"]:
                alertas.append("CFOP de entrada com CST de exportação - possível inconsistência")

            if cfop_prefixo == "7" and cst_ibms in ["03", "02"]:
                alertas.append("Operação de devolução com CST de imunidade/alíquota zero - verificar")

        if item.get("monofasico") == "Sim" and item.get("aliquota_zero") == "Sim":
            alertas.append("Produto marcado como monofásico e alíquota zero - verificar classificação")

        if item.get("aliquota_is", 0) > 0 and cclass_trib not in ["01.17.01", "01.17.02", "01.17.03", "01.17.04", "01.17.05", "01.17.06"]:
            alertas.append("Imposto Seletivo aplicado sem cClassTrib correspondente")

        if item.get("reducao_base", 0) > 0 and cclass_trib in ["01.25.01", "01.25.02"]:
            alertas.append("Redução de base aplicada em produto de regime geral - verificar")

        if item.get("cashback") == "Sim" and cclass_trib not in ["01.14.01", "01.14.02", "01.14.03"]:
            alertas.append("Cashback pode não ser aplicável para este produto")

        if "medicament" in descricao.lower() and ncm[:4] not in ["3001", "3002", "3003", "3004", "3005", "3006"]:
            alertas.append("Descrição sugere medicamento mas NCM não é da seção farmacêutica")

        if ncm[:4] in self.NCM_EXERCITO and cclass_trib not in ["01.17.01"]:
            alertas.append("NCM de armas/munições sem classificação de Imposto Seletivo")

        if item.get("imunidade") == "Sim" and item.get("aliquota_is", 0) > 0:
            problemas.append("Produto imune não pode ter Imposto Seletivo")

        if item.get("confianca", 0) < 85:
            sugestoes.append("Revisar classificação tributária do produto")
            sugestoes.append("Consultar tabela oficial cClassTrib para confirmação")

        if item.get("cest") and item.get("cest") != "":
            sugestoes.append("Utilizar CEST como referência complementar para classificação")

        if item.get("aliquota_ibms", 0) > 0 or item.get("aliquota_cbs", 0) > 0:
            if item.get("aliquota_is", 0) > 0:
                sugestoes.append("Verificar possibilidade de crédito do Imposto Seletivo")

        tem_credito_perdido = False
        if item.get("aliquota_ibms", 0) > 0 and item.get("aliquota_cbs", 0) > 0:
            if cfop[:1] in ["1", "2", "3"] and item.get("imunidade") != "Sim":
                sugestoes.append("Possibilidade de crédito IBS/CBS na aquisição")
                tem_credito_perdido = True

        tem_economia = False
        if cclass_trib in ["01.14.01", "01.14.02", "01.14.03", "01.02.01", "01.02.02"]:
            sugestoes.append("Produto com benefício fiscal - economia tributária identificada")
            tem_economia = True

        return {
            "problemas": problemas,
            "alertas": alertas,
            "sugestoes": sugestoes,
            "ncm_incompativel": len([p for p in alertas if "NCM" in p]) > 0,
            "cclass_trib_incorreto": cclass_trib == "01.99.99",
            "tributacao_errada": len(problemas) > 0,
            "reducao_incorreta": len([p for p in alertas if "redução" in p.lower()]) > 0,
            "cfop_incompativel": len([p for p in alertas if "CFOP" in p]) > 0,
            "cst_incompativel": len([p for p in alertas if "CST" in p]) > 0,
            "regime_incorreto": len([p for p in alertas if "regime" in p.lower()]) > 0,
            "credito_perdido": tem_credito_perdido,
            "economia_tributaria": tem_economia,
            "inconsistencias_fiscais": len(problemas) + len(alertas),
        }

    def _verificar_ncm_incompativel(self, ncm: str, descricao: str) -> bool:
        if not ncm or not descricao:
            return False
        desc_lower = descricao.lower()

        map_ncm_descricao = {
            "2204": ["vinho", "vinícola"],
            "2203": ["cerveja", "chope"],
            "2208": ["destilado", "cachaça", "uísque", "vodka", "gin"],
            "2401": ["cigarro", "tabaco", "charuto"],
            "1001": ["trigo"],
            "1005": ["milho"],
            "1006": ["arroz"],
            "1201": ["soja"],
            "1701": ["açúcar", "cana"],
            "0901": ["café"],
            "0201": ["carne bovina", "carne de boi"],
            "0207": ["carne de ave", "frango"],
            "0301": ["peixe"],
            "0401": ["leite"],
            "0405": ["manteiga"],
            "0406": ["queijo"],
            "6101": ["roupa", "camisa", "camiseta"],
            "6401": ["sapato", "calçado", "tênis"],
            "9401": ["sofá", "cadeira", "mesa", "móvel"],
            "8471": ["computador", "notebook", "servidor"],
            "8517": ["celular", "smartphone", "telefone"],
            "8418": ["geladeira", "refrigerador", "freezer"],
            "8450": ["máquina de lavar", "lava-roupa"],
            "8703": ["carro", "automóvel", "veículo"],
            "2710": ["gasolina", "diesel", "combustível"],
            "3004": ["medicamento", "remédio"],
            "3304": ["cosmético", "maquiagem", "perfume"],
            "9503": ["brinquedo", "jogo"],
        }

        for ncm_prefix, palavras in map_ncm_descricao.items():
            if ncm[:4] == ncm_prefix:
                if not any(p in desc_lower for p in palavras):
                    return False
                return True

        return False


auditoria = AuditoriaFiscal()
