# Correção Técnico V2

- Compatibilidade com demandas antigas que não possuem prioridade/categoria/título completos.
- Normalização de registros antes de renderizar para o técnico.
- Consulta por UID e, quando disponível, por e-mail.
- Proteções contra campos indefinidos em lista, relatório e modal.
- Error Boundary para evitar tela branca silenciosa.

## Teste
1. Publicar as regras da Sprint 04.
2. Entrar como Admin e atribuir uma demanda ao técnico.
3. Sair e entrar com o usuário técnico.
4. Confirmar que a demanda aparece.
5. Editar apenas status/observações e salvar.
