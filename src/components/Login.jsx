import React, { useState } from 'react';
import { LockKeyhole, UserRound } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [creating,setCreating]=useState(false); const [loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setLoading(true);setError('');try{if(creating)await createUserWithEmailAndPassword(auth,email.trim(),password);else await signInWithEmailAndPassword(auth,email.trim(),password);}catch(err){const messages={'auth/invalid-credential':'E-mail ou senha inválidos.','auth/email-already-in-use':'Este e-mail já possui cadastro.','auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.','auth/invalid-email':'Informe um e-mail válido.'};setError(messages[err.code]||'Não foi possível acessar. Verifique a configuração do Firebase.');}finally{setLoading(false)}}
  return <div className="login-page"><div className="login-card">
    <div className="login-brand"><div className="brand-mark">A</div><div><strong>Agenda Avistar</strong><span>GESTÃO DE DEMANDAS</span></div></div>
    <div className="login-copy"><h1>{creating?'Criar primeiro acesso':'Bem-vindo'}</h1><p>Login seguro e dados salvos online no Firebase.</p></div>
    <form onSubmit={submit} className="login-form">
      <label>E-mail<div className="login-input"><UserRound size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus required/></div></label>
      <label>Senha<div className="login-input"><LockKeyhole size={18}/><input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/></div></label>
      {error&&<div className="login-error">{error}</div>}
      <button className="primary login-button" type="submit" disabled={loading}>{loading?'Aguarde...':creating?'Criar conta':'Entrar'}</button>
    </form>
    <button className="link-button" onClick={()=>{setCreating(!creating);setError('')}}>{creating?'Já tenho uma conta':'Criar primeiro usuário'}</button>
  </div></div>
}
