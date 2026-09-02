# Correção do perfil Técnico - Sprint Firebase 04

Correções aplicadas:

- O técnico não consulta mais toda a coleção `demandas`.
- O Firestore passa a receber consultas filtradas por `technicianUid` e `installerEmail`.
- O cadastro/edição de demanda agora seleciona um usuário Técnico ativo e grava `technicianUid`, `installerEmail` e o nome do instalador.
- Supervisor passa a poder ler a lista de usuários para atribuir técnicos.
- O visual da Sprint 04 foi mantido.

## Após substituir a versão
Publique novamente as regras:

```bash
firebase deploy --only firestore:rules
```

Depois reinicie o Vite e teste com um usuário Técnico ativo.
