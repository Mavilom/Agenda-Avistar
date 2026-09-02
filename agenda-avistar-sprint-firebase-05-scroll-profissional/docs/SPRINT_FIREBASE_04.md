# Sprint Firebase 04 — Ordem de Serviço completa

## Base preservada
Esta sprint evolui diretamente a Sprint Firebase 03, mantendo Firebase Authentication, Firestore, Hosting, Clientes, Veículos, Equipamentos e o vínculo Cliente → Veículo → Equipamento na Demanda/OS.

## Entregas
- Número de O.S. gerado automaticamente na criação da demanda.
- Exibição do número da O.S. no formulário e nos cards de demanda.
- Dados de Cliente, Veículo, Rastreador e Conectividade reaproveitados do cadastro mestre.
- Campos de técnico, data do serviço, tipo de O.S., valor, plataforma, status e observações preservados.
- Botão de Ordem de Serviço em cada demanda.
- Visualização profissional da O.S. em formato A4.
- Impressão e opção “Salvar como PDF” pelo navegador.
- Espaços de assinatura para Técnico e Cliente.
- Número da O.S. incluído na exportação CSV de relatórios.

## Numeração
Formato atual: `OS-AAAA-MMDDHHMMSS`.
Exemplo: `OS-2026-0901014530`.
O formato usa data/hora para evitar colisão sem exigir uma nova coleção de contador no Firestore.

## Regras do Firestore
Não há nova coleção nesta sprint. As regras da Sprint Firebase 02/03 continuam compatíveis.

## Teste recomendado
1. Copiar o `.env` da versão funcional.
2. Executar `npm install`.
3. Executar `npm run dev`.
4. Criar uma nova demanda.
5. Conferir se o número da O.S. foi gerado depois de salvar.
6. Abrir o botão de O.S. no card.
7. Usar “Imprimir / Salvar PDF”.
8. Editar e reabrir a demanda para confirmar persistência no Firestore.
