# 💕 Darling Portfolio - Next.js com Stripe

Portfólio profissional integrado com dados reais da Stripe, inspirado no Marc Lou.

## 🚀 Deploy na Vercel

### 1. Fazer deploy do projeto:
```bash
npm install -g vercel
vercel --prod
```

### 2. Configurar variáveis de ambiente na Vercel:
1. Acesse o dashboard: https://vercel.com/dashboard
2. Entre no seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_live_SUA_NOVA_CHAVE_STRIPE`
   - **Environments**: Production, Preview, Development

### 3. Redeploy após configurar:
```bash
vercel --prod
```

## ✨ Funcionalidades

- **Gráfico real da Stripe** no card da Darling
- **API segura** com cache de 30 minutos
- **Fallback automático** com dados de exemplo
- **Design responsivo** e profissional
- **Auto-refresh** dos dados

## 🔐 Segurança

- Chave Stripe protegida em variáveis de ambiente
- Cache inteligente para reduzir calls à API
- Error handling robusto
- CORS configurado

## 📊 Dados mostrados

- Receita mensal dos últimos 6 meses
- Receita atual (€XXX/mo)
- Gráfico interativo com tooltips
- Total de transações e clientes

## 🎯 Após o deploy

Acesse sua URL da Vercel e veja os dados reais da Darling funcionando!

## 🛠️ Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000