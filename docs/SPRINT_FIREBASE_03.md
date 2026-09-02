# Sprint Firebase 03 — Integração Cliente → Veículo → Equipamento → Demanda/OS

## Objetivo
Integrar os cadastros mestres criados na Sprint Firebase 02 ao formulário de Nova Demanda/OS, reduzindo digitação repetida e evitando divergências de placa, IMEI, ICCID e cliente.

## Implementado
- Seleção de cliente diretamente da coleção `clientes`.
- Ao selecionar o cliente, a Demanda grava `clienteId` e mantém `company` para compatibilidade com relatórios existentes.
- Lista de veículos filtrada somente pelos veículos do cliente selecionado.
- Preenchimento automático de placa, marca e modelo a partir do cadastro do veículo.
- Gravação de `veiculoId` na Demanda.
- Lista de equipamentos filtrada pelo veículo selecionado.
- Quando existe somente um equipamento vinculado ao veículo, ele é selecionado automaticamente.
- Preenchimento automático de IMEI/ID, marca, modelo, ICCID e número da linha.
- Gravação de `equipamentoId` na Demanda.
- Compatibilidade com demandas antigas: o formulário tenta resolver automaticamente cliente, veículo e equipamento pelos nomes/placa/IMEI já gravados.
- Nenhuma alteração na estrutura visual principal da Agenda Avistar.

## Regras do Firestore
Esta sprint não exige novas regras além das regras da Sprint Firebase 02 já publicadas. Os novos campos ficam dentro do documento `demandas`.

## Testes recomendados
1. Crie um cliente.
2. Crie dois veículos vinculados a esse cliente.
3. Vincule um equipamento a um dos veículos.
4. Abra **Nova demanda**.
5. Selecione o cliente e confirme que aparecem somente os veículos dele.
6. Selecione o veículo e confirme placa/marca/modelo preenchidos automaticamente.
7. Selecione o equipamento e confirme IMEI/ICCID/linha preenchidos automaticamente.
8. Salve a demanda.
9. Atualize a página e reabra a demanda para confirmar persistência.
10. Confira Calendário e Relatórios para garantir compatibilidade.

## Próxima etapa sugerida
Sprint Firebase 04: transformar a Demanda em uma Ordem de Serviço mais completa, com status de atendimento, técnico cadastrado, checklist, fotos/anexos e geração de PDF.
