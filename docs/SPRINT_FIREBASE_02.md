# Agenda Avistar - Sprint Firebase 02

## Objetivo
Evoluir a versão já publicada no Firebase sem introduzir Docker/PostgreSQL no frontend operacional.

## Novos módulos
- Clientes: cadastro, edição, busca, status, contatos e observações.
- Veículos: cadastro por placa e vínculo com cliente.
- Equipamentos: IMEI/ID, serial, marca, modelo, firmware, ICCID, linha, operadora, garantia e vínculo com veículo.

## Firestore
Novas coleções:
- `clientes`
- `veiculos`
- `equipamentos`

Permissões:
- Usuários ativos podem consultar cadastros mestres.
- Administrador e Supervisor podem criar/editar.
- Somente Administrador pode excluir.

## Ajuste importante de atribuição
As regras de demandas passam a permitir que o Supervisor atualize `technicianUid` e `installerEmail`, mantendo a permissão do técnico coerente com o técnico exibido na demanda.

## Publicação
1. `npm install`
2. `npm run build`
3. `firebase deploy --only firestore:rules`
4. `firebase deploy --only hosting`

Antes de publicar em produção, valide os três cadastros em um projeto Firebase de teste ou confirme que há backup das demandas atuais.
