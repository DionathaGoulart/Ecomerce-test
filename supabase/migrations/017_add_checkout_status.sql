-- Adiciona o status 'checkout' à constraint de status da tabela orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('checkout', 'pending', 'paid', 'production', 'shipped', 'cancelled'));
