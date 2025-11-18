-- Make email nullable in profiles table to support anonymous users
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Update handle_new_user function to handle anonymous users properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Populate clinical_trials table with sample data
INSERT INTO public.clinical_trials (title, location, description, summary, phase, status, tags, latitude, longitude)
VALUES
  ('Novel Immunotherapy for Lung Cancer', 'Stanford, CA', 'Phase III clinical trial investigating a new immunotherapy approach for non-small cell lung cancer patients who have not responded to traditional treatments.', 'Breakthrough immunotherapy showing 60% response rate in early phases.', 'Phase III', 'Recruiting', ARRAY['Cancer', 'Immunotherapy', 'Lung Cancer'], 37.4419, -122.1430),
  ('AI-Assisted Cardiac Surgery Trial', 'Rochester, MN', 'Revolutionary study combining artificial intelligence with minimally invasive cardiac procedures to improve surgical outcomes and reduce recovery time.', 'Pioneering AI integration in cardiac surgery with 40% faster recovery.', 'Phase II', 'Recruiting', ARRAY['Cardiology', 'AI', 'Surgery'], 44.0225, -92.4660),
  ('Early Detection Alzheimer Study', 'Baltimore, MD', 'Longitudinal study focusing on early biomarkers for Alzheimer disease detection using advanced neuroimaging and blood tests.', 'Revolutionary early detection method identifying risk 5 years before symptoms.', 'Phase II', 'Active', ARRAY['Neurology', 'Alzheimer', 'Prevention'], 39.2970, -76.5930),
  ('Pediatric Diabetes Management', 'Boston, MA', 'Innovative trial testing a new continuous glucose monitoring system integrated with automated insulin delivery for children with Type 1 diabetes.', 'Next-gen glucose monitoring reducing complications by 55%.', 'Phase III', 'Recruiting', ARRAY['Pediatrics', 'Diabetes', 'Technology'], 42.3370, -71.1061),
  ('Gene Therapy for Rare Disorders', 'New York, NY', 'Groundbreaking gene therapy trial for patients with rare genetic disorders, focusing on CRISPR-based interventions.', 'First successful CRISPR therapy showing permanent correction of genetic defects.', 'Phase I', 'Enrolling', ARRAY['Genetics', 'Rare Diseases', 'CRISPR'], 40.7580, -73.9540)
ON CONFLICT DO NOTHING;

-- Populate publications table with sample data
INSERT INTO public.publications (title, authors, year, abstract, summary, tags)
VALUES
  ('Machine Learning in Cancer Diagnosis', ARRAY['Dr. Sarah Chen', 'Dr. James Wilson'], 2024, 'This comprehensive study explores the application of deep learning algorithms in early cancer detection, achieving 95% accuracy in identifying malignant tumors from medical imaging.', 'Revolutionary ML approach achieving 95% accuracy in early cancer detection.', ARRAY['AI', 'Cancer', 'Diagnostics']),
  ('Novel Approaches to Heart Disease Prevention', ARRAY['Prof. James Wilson', 'Dr. Maria Rodriguez'], 2024, 'A meta-analysis of preventive cardiology strategies, highlighting the effectiveness of personalized lifestyle interventions and genetic risk assessment in reducing cardiovascular events.', 'Personalized prevention strategies reducing heart disease risk by 60%.', ARRAY['Cardiology', 'Prevention', 'Lifestyle']),
  ('Breakthrough in Alzheimer Treatment', ARRAY['Dr. Maria Rodriguez', 'Dr. Ahmed Hassan'], 2023, 'Clinical trial results demonstrating significant cognitive improvement in early-stage Alzheimer patients using a novel combination therapy targeting multiple disease pathways.', 'Combination therapy showing first significant reversal of cognitive decline.', ARRAY['Neurology', 'Alzheimer', 'Treatment']),
  ('Pediatric Vaccine Development', ARRAY['Prof. Emily Thompson', 'Dr. Lisa Anderson'], 2023, 'Development and testing of next-generation vaccines for common childhood diseases, with improved safety profiles and longer-lasting immunity.', 'Next-gen vaccines providing lifetime immunity with single dose.', ARRAY['Pediatrics', 'Vaccines', 'Immunology']),
  ('Mental Health in the Digital Age', ARRAY['Dr. Lisa Anderson', 'Dr. Raj Patel'], 2024, 'Analysis of mental health trends and the effectiveness of digital therapeutics in treating anxiety and depression in adolescents and young adults.', 'Digital therapeutics showing equal efficacy to traditional therapy with better access.', ARRAY['Psychiatry', 'Digital Health', 'Youth'])
ON CONFLICT DO NOTHING;