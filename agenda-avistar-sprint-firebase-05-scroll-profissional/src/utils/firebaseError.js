export function firebaseErrorMessage(err, action='salvar'){
  console.error(`Erro ao ${action} no Firebase:`, err);
  console.error('Código:', err?.code);
  console.error('Mensagem:', err?.message);

  const messages = {
    'permission-denied': 'Acesso negado pelo Firestore. Publique regras que permitam leitura e gravação para usuários autenticados.',
    'unauthenticated': 'Sua sessão expirou. Saia e entre novamente.',
    'unavailable': 'O Firebase está indisponível ou sem conexão. Verifique sua internet.',
    'failed-precondition': 'O Firebase não conseguiu concluir a operação. Feche outras abas do sistema e tente novamente.',
    'not-found': 'O banco ou documento não foi encontrado.',
    'resource-exhausted': 'O limite gratuito do Firebase pode ter sido atingido.',
    'invalid-argument': 'Algum campo possui um valor inválido para o Firestore.',
    'already-exists': 'Esse registro já existe.',
  };

  const normalizedCode=String(err?.code||'').replace('firestore/','');
  return messages[normalizedCode] || `Não foi possível ${action} a demanda. ${err?.code ? `Código: ${err.code}. ` : ''}${err?.message || ''}`.trim();
}
