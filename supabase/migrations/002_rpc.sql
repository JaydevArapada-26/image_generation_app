-- ─────────────────────────────────────────────────────────────────────────────
-- 002_rpc.sql — Atomic credit management RPC functions
-- ─────────────────────────────────────────────────────────────────────────────

/**
 * Atomically decrement credits for a user by 1.
 * Returns the new credits value, or raises an exception if credits are 0.
 */
CREATE OR REPLACE FUNCTION public.decrement_credits(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits INT;
BEGIN
  -- Lock the row and get current credits
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_credits IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  IF v_credits <= 0 THEN
    RAISE EXCEPTION 'Insufficient credits for user %', p_user_id;
  END IF;

  -- Decrement
  UPDATE public.profiles
  SET credits = credits - 1
  WHERE id = p_user_id;

  RETURN v_credits - 1;
END;
$$;

/**
 * Add credits to a user (for Stripe webhook / admin use).
 */
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_credits INT;
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;

  IF v_new_credits IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  RETURN v_new_credits;
END;
$$;
