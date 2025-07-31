-- Add tracking for daily prediction limits
CREATE TABLE public.daily_generation_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, generation_date)
);

-- Enable RLS
ALTER TABLE public.daily_generation_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own limits" 
ON public.daily_generation_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own limits" 
ON public.daily_generation_limits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own limits" 
ON public.daily_generation_limits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamp updates
CREATE TRIGGER update_daily_generation_limits_updated_at
BEFORE UPDATE ON public.daily_generation_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();