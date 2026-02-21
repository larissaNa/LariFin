import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Mail, Lock, User, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error);
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-primary-glow">
            <DollarSign className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">FinanceAI</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro inteligente</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card gradient-card p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-display font-semibold">
              {isLogin ? 'Entrar na conta' : 'Criar conta'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isLogin ? 'Acesse seu painel financeiro' : 'Comece a organizar suas finanças'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-expense-subtle border border-expense/20 text-expense text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-income-subtle border border-income/20 text-income text-xs">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-glow transition-colors shadow-primary-glow disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
