-- Habilita a extensão pg_cron se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove o job antigo se existir (para atualizar o agendamento)
SELECT cron.unschedule('delete-abandoned-checkouts');

-- Cria um agendamento para rodar todo dia às 03:00 AM (horário do servidor/UTC)
-- Deleta pedidos com status 'checkout' que tenham mais de 15 minutos de criação
SELECT cron.schedule(
  'delete-abandoned-checkouts',
  '0 3 * * *', -- Roda todo dia às 03:00
  $$DELETE FROM orders WHERE status = 'checkout' AND created_at < NOW() - INTERVAL '15 minutes'$$
);
