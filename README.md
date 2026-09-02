# Agenda Avistar — Sprint Firebase 04

Evolução da base Firebase já validada, agora com Ordem de Serviço completa e impressão/PDF.

## Instalação
1. Copie o `.env` da versão que já está funcionando.
2. Execute:
   npm install
   npm run dev

## Recursos principais
- Firebase Authentication e Firestore.
- Demandas, calendário, relatórios e usuários.
- Clientes, Veículos e Equipamentos.
- Vínculo Cliente → Veículo → Equipamento.
- Número automático de O.S.
- Visualização A4 da Ordem de Serviço.
- Impressão / Salvar como PDF pelo navegador.

Consulte `docs/SPRINT_FIREBASE_04.md`.


## Correção Técnico V3
- Corrigido conflito entre o estado `query` da busca e a função `query()` do Firestore.
- A função Firestore agora é importada como `firestoreQuery`.
- Corrige o erro `query is not a function` ao entrar com perfil Técnico.


## Sprint Firebase 05
Execução da O.S. pelo Técnico com checklist, fotos antes/depois, assinaturas digitais, histórico e conclusão controlada. Consulte `docs/SPRINT_FIREBASE_05.md`.

## Correção visual Sprint 05
- Corrigido JSX do `TaskList` que exibia `canToggle?` e `:` na interface.
- Corrigido grid dos cards de demanda para evitar sobreposição e estouro horizontal.
- Ações dos cards agora quebram linha de forma segura em telas menores.
- Toolbar, filtros, KPIs e cabeçalho ficaram responsivos.
- Nenhuma regra do Firestore ou lógica de dados foi alterada nesta correção.


## Sprint 05.1
Lista de O.S. com barra de rolagem vertical interna profissional no desktop.
