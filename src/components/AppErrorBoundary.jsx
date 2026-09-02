import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){ console.error('Erro de interface:',error,info); }
  render(){
    if(this.state.error){
      return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#f3f6fb',padding:24,fontFamily:'Arial,sans-serif'}}>
        <div style={{maxWidth:620,width:'100%',background:'#fff',border:'1px solid #dbe3ef',borderRadius:18,padding:28,boxShadow:'0 16px 50px rgba(15,23,42,.10)'}}>
          <h1 style={{margin:'0 0 10px',fontSize:25,color:'#0f172a'}}>Não foi possível abrir esta tela</h1>
          <p style={{color:'#64748b',lineHeight:1.55}}>O sistema encontrou um dado antigo ou incompleto. Atualize a página. Se continuar, envie a mensagem abaixo para suporte.</p>
          <pre style={{whiteSpace:'pre-wrap',background:'#f8fafc',padding:14,borderRadius:10,border:'1px solid #e2e8f0',fontSize:12,color:'#b91c1c'}}>{String(this.state.error?.message||this.state.error)}</pre>
          <button onClick={()=>location.reload()} style={{marginTop:12,border:0,borderRadius:10,padding:'11px 16px',background:'#1d6fd8',color:'#fff',fontWeight:700,cursor:'pointer'}}>Recarregar</button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}
