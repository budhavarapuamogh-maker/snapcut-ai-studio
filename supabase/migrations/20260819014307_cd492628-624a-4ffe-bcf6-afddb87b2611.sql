CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default key',
  prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  revoked boolean NOT NULL DEFAULT false,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_keys_select_own ON public.api_keys FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY api_keys_insert_own ON public.api_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY api_keys_update_own ON public.api_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY api_keys_delete_own ON public.api_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.payment_status AS ENUM ('created', 'paid', 'failed');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'razorpay',
  order_id text NOT NULL UNIQUE,
  payment_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  credits integer NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_select_own ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY payments_insert_own ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.add_credits(_user_id uuid, _amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_total integer;
BEGIN
  UPDATE public.profiles SET credits = credits + _amount WHERE id = _user_id RETURNING credits INTO new_total;
  RETURN new_total;
END; $$;
REVOKE ALL ON FUNCTION public.add_credits(uuid, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer) TO service_role;