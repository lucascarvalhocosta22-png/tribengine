from datetime import datetime
from app.models.nfe import ItemNFe
from app.models.simulacao import Simulacao, ResultadoSimulacao


class CalculadoraTributaria:

    ALIQUOTA_PADRAO_IBMS = 17.7
    ALIQUOTA_PADRAO_CBS = 8.8
    ALIQUOTA_REFERENCIA = 26.5

    def calcular_item(self, item: dict) -> dict:
        valor_total = float(item.get("valor_total", 0))
        aliquota_ibms = float(item.get("aliquota_ibms", self.ALIQUOTA_PADRAO_IBMS))
        aliquota_cbs = float(item.get("aliquota_cbs", self.ALIQUOTA_PADRAO_CBS))
        aliquota_is = float(item.get("aliquota_is", 0))
        reducao_base = float(item.get("reducao_base", 0))
        aliquota_zero = item.get("aliquota_zero", "Nao")
        imunidade = item.get("imunidade", "Nao")
        isencao = item.get("isencao", "Nao")
        suspensao = item.get("suspensao", "Nao")
        monofasico = item.get("monofasico", "Nao")
        cesta_basica = item.get("cesta_basica", "Nao")

        if aliquota_zero == "Sim" or imunidade == "Sim" or isencao == "Sim":
            base_ibms = 0; base_cbs = 0; base_is = 0
            valor_ibms = 0; valor_cbs = 0; valor_is = 0
        elif monofasico == "Sim":
            base_ibms = 0; base_cbs = 0; base_is = 0
            valor_ibms = 0; valor_cbs = 0; valor_is = 0
        elif suspensao == "Sim":
            base_ibms = valor_total; base_cbs = valor_total; base_is = valor_total
            valor_ibms = 0; valor_cbs = 0; valor_is = 0
        else:
            if reducao_base > 0:
                base_ibms = valor_total * (1 - reducao_base / 100)
                base_cbs = valor_total * (1 - reducao_base / 100)
            else:
                base_ibms = valor_total
                base_cbs = valor_total
            base_is = valor_total
            valor_ibms = base_ibms * (aliquota_ibms / 100)
            valor_cbs = base_cbs * (aliquota_cbs / 100)
            valor_is = base_is * (aliquota_is / 100) if aliquota_is > 0 else 0

        simples_nacional = item.get("simples_nacional", "Nao")
        tipo_declarado = item.get("tipo_declarado", "")
        if simples_nacional == "Sim" and tipo_declarado == "compra":
            valor_ibms = 0; valor_cbs = 0

        return {
            "base_ibms": round(base_ibms, 2),
            "base_cbs": round(base_cbs, 2),
            "base_is": round(base_is, 2),
            "valor_ibms": round(valor_ibms, 2),
            "valor_cbs": round(valor_cbs, 2),
            "valor_is": round(valor_is, 2),
            "carga_total": round(valor_ibms + valor_cbs + valor_is, 2),
            "aliquota_efetiva": round(((valor_ibms + valor_cbs + valor_is) / valor_total * 100) if valor_total > 0 else 0, 2),
        }

    def _is_compra(self, cfop: str, tipo_declarado: str = None) -> bool:
        if tipo_declarado:
            return tipo_declarado == "compra"
        return cfop[:1] in ["1", "2", "3"] if cfop else False

    def _is_venda(self, cfop: str, tipo_declarado: str = None) -> bool:
        if tipo_declarado:
            return tipo_declarado == "venda"
        return cfop[:1] in ["5", "6", "7"] if cfop else False

    def _get_grupo_cfop(self, cfop: str) -> str:
        mapa = {
            "1": "Compras - Mesmo Estado",
            "2": "Compras - Outro Estado",
            "3": "Compras - Exterior",
            "4": "Devoluções",
            "5": "Vendas - Mesmo Estado",
            "6": "Vendas - Outro Estado",
            "7": "Vendas - Exterior",
            "0": "Outros",
        }
        return mapa.get(cfop[:1] if cfop else "", "Outros")

    def simular_mensal(self, itens: list, mes: int, ano: int, regime: str = "geral") -> dict:
        total_compras = 0
        total_vendas = 0
        ibs_debito = 0
        cbs_debito = 0
        is_debito = 0
        ibs_credito = 0
        cbs_credito = 0
        credito_presumido = 0

        tributos_por_ncm = {}
        tributos_por_cfop = {}
        tributos_por_produto = {}
        compras_detalhes = []
        vendas_detalhes = []

        fator_credito = 0.9
        if regime == "restaurante":
            fator_credito = 1.0

        for item in itens:
            resultado = self.calcular_item(item)
            cfop = item.get("cfop", "")
            ncm = item.get("ncm", "")
            descricao = item.get("descricao", "")
            cclass_trib = item.get("cclass_trib", "")
            tipo_declarado = item.get("tipo_declarado")

            if self._is_venda(cfop, tipo_declarado):
                total_vendas += item.get("valor_total", 0)
                fator_reducao = 0.6 if cclass_trib in ["01.02.01", "200047"] else 1.0
                ibs_item = resultado["valor_ibms"] * fator_reducao
                cbs_item = resultado["valor_cbs"] * fator_reducao
                ibs_debito += ibs_item
                cbs_debito += cbs_item
                is_debito += resultado["valor_is"]
                vendas_detalhes.append({
                    "descricao": descricao,
                    "ncm": ncm,
                    "cfop": cfop,
                    "cfop_grupo": self._get_grupo_cfop(cfop),
                    "cclass_trib": cclass_trib,
                    "valor_total": item.get("valor_total", 0),
                    "ibs": ibs_item,
                    "cbs": cbs_item,
                    "is": resultado["valor_is"],
                    "carga": ibs_item + cbs_item + resultado["valor_is"],
                    "fator_reducao": fator_reducao,
                })
            elif self._is_compra(cfop, tipo_declarado):
                total_compras += item.get("valor_total", 0)
                ibs_credito_item = resultado["valor_ibms"] * fator_credito
                cbs_credito_item = resultado["valor_cbs"] * fator_credito
                ibs_credito += ibs_credito_item
                cbs_credito += cbs_credito_item

                if cclass_trib in ["01.22.01"]:
                    credito_presumido += resultado["valor_ibms"] * 0.2

                compras_detalhes.append({
                    "descricao": descricao,
                    "ncm": ncm,
                    "cfop": cfop,
                    "cfop_grupo": self._get_grupo_cfop(cfop),
                    "cclass_trib": cclass_trib,
                    "valor_total": item.get("valor_total", 0),
                    "ibs_credito": ibs_credito_item,
                    "cbs_credito": cbs_credito_item,
                })

            if ncm:
                ncm_group = ncm[:4] if ncm else "0000"
                if ncm_group not in tributos_por_ncm:
                    tributos_por_ncm[ncm_group] = {"ibs": 0, "cbs": 0, "is": 0, "total": 0}
                tributos_por_ncm[ncm_group]["ibs"] += resultado["valor_ibms"]
                tributos_por_ncm[ncm_group]["cbs"] += resultado["valor_cbs"]
                tributos_por_ncm[ncm_group]["is"] += resultado["valor_is"]
                tributos_por_ncm[ncm_group]["total"] += resultado["carga_total"]

            if cfop:
                cfop_group = cfop[:2] if cfop else "00"
                if cfop_group not in tributos_por_cfop:
                    tributos_por_cfop[cfop_group] = {"ibs": 0, "cbs": 0, "is": 0, "total": 0}
                tributos_por_cfop[cfop_group]["ibs"] += resultado["valor_ibms"]
                tributos_por_cfop[cfop_group]["cbs"] += resultado["valor_cbs"]
                tributos_por_cfop[cfop_group]["is"] += resultado["valor_is"]
                tributos_por_cfop[cfop_group]["total"] += resultado["carga_total"]

            if descricao:
                if descricao not in tributos_por_produto:
                    tributos_por_produto[descricao] = {"ibs": 0, "cbs": 0, "is": 0, "total": 0}
                tributos_por_produto[descricao]["ibs"] += resultado["valor_ibms"]
                tributos_por_produto[descricao]["cbs"] += resultado["valor_cbs"]
                tributos_por_produto[descricao]["is"] += resultado["valor_is"]
                tributos_por_produto[descricao]["total"] += resultado["carga_total"]

        total_creditos = ibs_credito + cbs_credito + credito_presumido
        total_debitos = ibs_debito + cbs_debito + is_debito

        saldo_credor = max(0, total_creditos - total_debitos)
        saldo_devedor = max(0, total_debitos - total_creditos)

        carga_tributaria_total = ibs_debito + cbs_debito + is_debito
        receita_total = total_vendas if total_vendas > 0 else 1

        icms_total = sum(
            item.get("valor_total", 0) * (0.0415 if item.get("cfop") == "5102" else 0)
            for item in itens
        )
        pis_cofins_total = sum(
            item.get("valor_total", 0) * (0.0365 if item.get("cfop") == "5102" else 0)
            for item in itens
        )
        total_antigo = round(icms_total + pis_cofins_total, 2)
        comparativo_sistema_antigo = {
            "icms": round(icms_total, 2),
            "pis_cofins": round(pis_cofins_total, 2),
            "total_antigo": total_antigo,
            "total_novo": round(carga_tributaria_total, 2),
            "economia": round(total_antigo - carga_tributaria_total, 2),
            "reducao_percentual": round(((total_antigo - carga_tributaria_total) / max(1, total_antigo) * 100), 2),
        }
        economia_tributaria = comparativo_sistema_antigo["economia"]

        return {
            "mes": mes,
            "ano": ano,
            "regime": regime,
            "total_compras": round(total_compras, 2),
            "total_vendas": round(total_vendas, 2),
            "ibs_debito": round(ibs_debito, 2),
            "cbs_debito": round(cbs_debito, 2),
            "is_debito": round(is_debito, 2),
            "ibs_credito": round(ibs_credito, 2),
            "cbs_credito": round(cbs_credito, 2),
            "credito_presumido": round(credito_presumido, 2),
            "total_creditos": round(total_creditos, 2),
            "total_debitos": round(total_debitos, 2),
            "saldo_credor": round(saldo_credor, 2),
            "saldo_devedor": round(saldo_devedor, 2),
            "saldo_liquido": round(total_creditos - total_debitos, 2),
            "carga_tributaria_total": round(carga_tributaria_total, 2),
            "carga_tributaria_percentual": round((carga_tributaria_total / receita_total * 100), 2) if receita_total > 0 else 0,
            "economia_tributaria": round(economia_tributaria, 2),
            "compras_detalhes": compras_detalhes,
            "vendas_detalhes": vendas_detalhes,
            "tributos_por_ncm": tributos_por_ncm,
            "tributos_por_cfop": tributos_por_cfop,
            "tributos_por_produto": tributos_por_produto,
            "comparativo_sistema_antigo": comparativo_sistema_antigo,
        }


calculadora = CalculadoraTributaria()
