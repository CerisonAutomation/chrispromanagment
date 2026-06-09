-- Remove public read access to coupons; expose a safe validation RPC instead
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;

-- Validation function: returns minimal info needed to apply a coupon, only if valid
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text)
RETURNS TABLE (code text, discount_type text, discount_value numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.discount_type, c.discount_value
  FROM public.coupons c
  WHERE c.active = true
    AND lower(c.code) = lower(_code)
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.max_uses IS NULL OR c.usage_count < c.max_uses)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO anon, authenticated;