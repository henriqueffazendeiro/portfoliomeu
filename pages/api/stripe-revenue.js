// API Route Next.js para buscar dados da Stripe
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Cache em memória simples (para desenvolvimento)
let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export default async function handler(req, res) {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    });
  }

  // Headers CORS e cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  try {
    // Verificar cache
    const now = Date.now();
    if (cache && (now - cacheTime) < CACHE_DURATION) {
      console.log('💕 Darling: Retornando dados do cache');
      return res.status(200).json(cache);
    }

    console.log('💕 Darling: Buscando dados frescos da Stripe...');

    // Período: últimos 12 meses (mesmo mês ano passado até agora)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    // Buscar charges da Stripe
    const charges = await stripe.charges.list({
      created: {
        gte: startTimestamp,
        lte: endTimestamp,
      },
      limit: 100,
    });

    console.log(`💳 Darling: ${charges.data.length} transações encontradas`);

    // Processar dados por mês
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = {};

    // Inicializar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthIndex = date.getMonth();
      
      monthlyData[monthKey] = {
        month: monthNames[monthIndex],
        revenue: 0,
        transactions: 0,
        customers: new Set()
      };
    }

    // Processar cada charge
    let totalRevenue = 0;
    let totalTransactions = 0;
    let allCustomers = new Set();

    charges.data.forEach(charge => {
      if (charge.status === 'succeeded') {
        const chargeDate = new Date(charge.created * 1000);
        const monthKey = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}`;
        const amount = charge.amount / 100; // Converter centavos para euros

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += amount;
          monthlyData[monthKey].transactions++;
          
          // Rastrear cliente único
          const customerId = charge.customer || charge.billing_details?.email || `anon_${charge.id}`;
          monthlyData[monthKey].customers.add(customerId);
          allCustomers.add(customerId);
        }

        totalRevenue += amount;
        totalTransactions++;
      }
    });

    // Converter dados para array
    const monthlyArray = Object.values(monthlyData).map(month => ({
      month: month.month,
      revenue: Math.round(month.revenue),
      transactions: month.transactions,
      customers: month.customers.size
    }));

    // Mês atual
    const currentMonth = monthlyArray[monthlyArray.length - 1];
    const previousMonth = monthlyArray[monthlyArray.length - 2];

    // Calcular crescimento
    const growth = previousMonth && previousMonth.revenue > 0 
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
      : 0;

    // Preparar resposta
    const result = {
      success: true,
      data: {
        monthly_data: monthlyArray,
        current_month_revenue: currentMonth.revenue,
        total_revenue: Math.round(totalRevenue),
        total_transactions: totalTransactions,
        total_customers: allCustomers.size,
        average_ticket: totalTransactions > 0 ? Math.round((totalRevenue / totalTransactions) * 100) / 100 : 0,
        monthly_growth: Math.round(growth * 10) / 10,
        last_updated: new Date().toISOString(),
        currency: 'EUR'
      }
    };

    // Salvar no cache
    cache = result;
    cacheTime = now;

    console.log(`💰 Darling: Total €${result.data.total_revenue} | Atual €${result.data.current_month_revenue}/mês | ${result.data.total_customers} clientes`);
    console.log(`🌍 Vercel Environment: ${process.env.VERCEL_ENV || 'local'}`);

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Darling API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados da Stripe',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
}