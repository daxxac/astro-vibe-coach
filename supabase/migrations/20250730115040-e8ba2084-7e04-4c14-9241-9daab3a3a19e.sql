-- Create personas table
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  gender TEXT NOT NULL,
  family_status TEXT NOT NULL,
  has_children BOOLEAN NOT NULL DEFAULT false,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictions table
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  general TEXT NOT NULL,
  love TEXT NOT NULL,
  career TEXT NOT NULL,
  health TEXT NOT NULL,
  advice TEXT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for personas
CREATE POLICY "Users can view their own personas" 
ON public.personas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personas" 
ON public.personas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas" 
ON public.personas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas" 
ON public.personas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for predictions
CREATE POLICY "Users can view predictions for their personas" 
ON public.predictions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.personas 
  WHERE personas.id = predictions.persona_id 
  AND personas.user_id = auth.uid()
));

CREATE POLICY "Users can create predictions for their personas" 
ON public.predictions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.personas 
  WHERE personas.id = predictions.persona_id 
  AND personas.user_id = auth.uid()
));

CREATE POLICY "Users can update predictions for their personas" 
ON public.predictions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.personas 
  WHERE personas.id = predictions.persona_id 
  AND personas.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON public.personas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_personas_user_id ON public.personas(user_id);
CREATE INDEX idx_predictions_persona_id ON public.predictions(persona_id);
CREATE INDEX idx_predictions_date ON public.predictions(prediction_date);