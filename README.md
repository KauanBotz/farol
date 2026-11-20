# Farol

**Sua cidade, vista por quem vive nela.** O Farol é um protótipo de inovação cidadã (CitizenTech) criado para a Global Solution FIAP 2026. A proposta é reunir relatos de problemas urbanos num mapa para ajudar moradores a planejar trajetos e gestores a escolher onde iniciar uma vistoria.

## Como funciona

1. No **mapa**, o cidadão consulta ocorrências por categoria e abre a ficha para ver detalhes ou confirmar um problema que também observou.
2. Em **Registrar**, escolhe uma categoria, adiciona uma foto opcional, marca o local e confere os dados. São sete categorias: buraco, iluminação, semáforo, calçada, ciclovia, lixo e sinalização.
3. Em **Rota**, compara tempo, distância e risco estimado. A leitura muda com o período do dia. O índice usa trechos fictícios e não garante segurança.
4. No **Painel**, o gestor consulta indicadores e um ranking de trechos críticos. O encaminhamento é demonstrativo.

## Páginas

| Página | O que mostra |
| --- | --- |
| [Apresentação](sobre.html) | Propósito, públicos, demonstração do fluxo e FAQ |
| [Mapa](index.html) | Marcadores, filtros, busca local e risco demonstrativo do bairro |
| [Registro](registrar.html) | Formulário em quatro passos e análise de IA simulada |
| [Detalhe](detalhe.html?id=o1) | Foto ilustrativa, descrição, localização e confirmação |
| [Rota](rota.html) | Comparação entre a opção mais rápida e a de menor risco estimado |
| [Alertas](alertas.html) | Lista por categoria, raio e período noturno |
| [Painel](painel.html) | Indicadores, ranking e simulação de encaminhamento |
| [Conta](login.html) e [Download](download.html) | Telas demonstrativas de acesso e distribuição |

## Rodar localmente

Na raiz do repositório, com Python 3 instalado:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Abra [http://127.0.0.1:8765/sobre.html](http://127.0.0.1:8765/sobre.html) para a apresentação ou [http://127.0.0.1:8765/](http://127.0.0.1:8765/) para o mapa. O site usa HTML, CSS e JavaScript e não tem etapa de build. A base cartográfica, fontes e alguns recursos visuais precisam de internet.

Para publicar na Vercel, importe o repositório como site estático, com preset **Other** e sem comando de build. Use a raiz do repositório. A apresentação fica em `/sobre.html` e o sistema começa em `/`.

## Estrutura

- `css/` contém os estilos e a identidade visual. O sistema usa Montserrat e os títulos da apresentação usam Fraunces.
- `js/data.js` reúne as ocorrências, pontuações de risco e rotas de exemplo.
- `js/map.js` integra Leaflet, OpenStreetMap e o roteamento de demonstração do OSRM.
- `js/registro.js` implementa o formulário. `js/app.js` cuida dos dados locais, da formatação e das mensagens.
- `assets/` contém a marca, imagens ilustrativas e dependências da apresentação. Os avisos de terceiros estão em [vendor](assets/vendor/README.md) e [ícones](assets/icons/SOURCES.md).

## Limites do protótipo

- **Dados locais.** Registros e confirmações ficam no armazenamento do navegador. O login é demonstrativo. Use dados e imagens de teste.
- **IA simulada.** O resultado vem de uma tabela por categoria. A evolução proposta é usar foto e descrição para sugerir uma categoria e encaminhar casos de baixa confiança para revisão.
- **Rotas de demonstração.** O OSRM usa perfil de carro e coordenadas de exemplo. Quando o serviço falha, a tela mantém traçados aproximados. A pontuação de risco usa dados fictícios.
- **Gestão simulada.** O painel não envia solicitações à prefeitura. Num piloto, o impacto poderia ser medido pelo tempo até o encaminhamento e pela proporção de relatos com retorno.

Dados cartográficos © [colaboradores do OpenStreetMap](https://www.openstreetmap.org/copyright). O mapa usa o serviço de tiles para visualização interativa. Consulte a [política de uso](https://operations.osmfoundation.org/policies/tiles/) antes de ampliar o tráfego.
