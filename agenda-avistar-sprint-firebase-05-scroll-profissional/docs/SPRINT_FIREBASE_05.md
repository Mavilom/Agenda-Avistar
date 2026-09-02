# Sprint Firebase 05 - Execução da Ordem de Serviço

## Objetivo
Dar ao perfil Técnico uma área de execução da O.S. sem liberar menus administrativos.

## Implementações
- Botão `Executar O.S.` apenas para o Técnico nas O.S. atribuídas a ele.
- Técnico continua vendo somente O.S. ativas/abertas.
- Registro automático do início do atendimento.
- Checklist técnico de GPS, alimentação, ignição, comunicação e bloqueio/saída.
- Campo específico de relatório/observações do técnico.
- Upload de fotos `Antes do serviço` e `Depois do serviço` no Firebase Storage.
- Assinatura manuscrita do técnico e do cliente em canvas.
- Assinaturas e evidências vinculadas à própria demanda/O.S. no Firestore.
- Conclusão exige checklist completo e as duas assinaturas.
- Ao concluir, a O.S. recebe `status=Concluída` e `completedAt` e deixa de aparecer na lista do Técnico.
- Histórico registra salvamento de andamento e conclusão.
- Impressão/PDF da O.S. passa a incluir relatório técnico, checklist, fotos e assinaturas.

## Segurança
A regra do Firestore do Técnico foi ampliada somente para os campos de execução.
As regras do Firebase Storage permitem upload de imagens de até 8 MB por usuário autenticado e ativo, dentro da pasta vinculada ao UID.

## Deploy necessário
Como há novas regras de Firestore e Storage, publicar:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
npm run build
firebase deploy --only hosting
```
