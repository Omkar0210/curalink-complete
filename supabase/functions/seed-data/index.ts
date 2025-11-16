import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Sample coordinates for major cities
    const coords = {
      'United States': { lat: 40.7128, lon: -74.0060 },
      'Japan': { lat: 35.6762, lon: 139.6503 },
      'Spain': { lat: 40.4168, lon: -3.7038 },
      'South Korea': { lat: 37.5665, lon: 126.9780 },
      'United Kingdom': { lat: 51.5074, lon: -0.1278 },
      'Saudi Arabia': { lat: 24.7136, lon: 46.6753 },
      'Germany': { lat: 52.5200, lon: 13.4050 },
      'India': { lat: 28.6139, lon: 77.2090 },
      'France': { lat: 48.8566, lon: 2.3522 },
      'Russia': { lat: 55.7558, lon: 37.6173 },
      'Brazil': { lat: -23.5505, lon: -46.6333 },
      'UAE': { lat: 25.2048, lon: 55.2708 },
      'Switzerland': { lat: 47.3769, lon: 8.5417 },
      'China': { lat: 31.2304, lon: 121.4737 },
      'Italy': { lat: 45.4642, lon: 9.1900 },
      'Netherlands': { lat: 52.3702, lon: 4.8952 },
      'South Africa': { lat: -33.9249, lon: 18.4241 },
    };

    // Seed Experts
    const expertsData = [
      { name: "Dr. Sarah Chen", specialization: "Oncology & Immunotherapy", institution: "Memorial Sloan Kettering Cancer Center", country: "United States", tags: ["Cancer Research", "Immunotherapy", "Clinical Trials"], photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400", match_score: 95, ...coords['United States'] },
      { name: "Prof. Michael Anderson", specialization: "Cardiovascular Disease", institution: "Mayo Clinic", country: "United States", tags: ["Cardiology", "Heart Disease", "Prevention"], photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400", match_score: 92, ...coords['United States'] },
      { name: "Dr. Yuki Tanaka", specialization: "Neurodegenerative Diseases", institution: "University of Tokyo", country: "Japan", tags: ["Alzheimer's", "Parkinson's", "Neurology"], photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400", match_score: 90, ...coords['Japan'] },
      { name: "Dr. Maria Rodriguez", specialization: "Rare Genetic Disorders", institution: "Hospital Universitario La Paz", country: "Spain", tags: ["Genetics", "Rare Diseases", "Pediatrics"], photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400", match_score: 88, ...coords['Spain'] },
      { name: "Prof. David Kim", specialization: "Diabetes & Metabolic Disorders", institution: "Seoul National University Hospital", country: "South Korea", tags: ["Diabetes", "Metabolism", "Endocrinology"], photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400", match_score: 87, ...coords['South Korea'] },
    ];

    const { data: existingExperts } = await supabase.from('experts').select('count');
    if (!existingExperts || existingExperts.length === 0) {
      await supabase.from('experts').insert(expertsData.map(e => ({
        ...e,
        latitude: e.lat,
        longitude: e.lon,
      })));
    }

    // Seed Clinical Trials
    const trialsData = [
      { title: "CAR-T Cell Therapy for B-Cell Lymphoma", phase: "Phase III", status: "Recruiting", description: "Investigating the efficacy of CAR-T cell therapy in patients with relapsed or refractory B-cell lymphoma...", location: "New York, NY", summary: "Advanced immunotherapy trial for lymphoma patients", tags: ["Cancer", "Immunotherapy", "CAR-T"], ...coords['United States'] },
      { title: "mRNA Vaccine for Melanoma Prevention", phase: "Phase II", status: "Active", description: "Testing a personalized mRNA vaccine designed to prevent melanoma recurrence in high-risk patients...", location: "Boston, MA", summary: "Personalized vaccine approach for melanoma", tags: ["Cancer", "Vaccine", "Prevention"], ...coords['United States'] },
      { title: "CRISPR Gene Therapy for Sickle Cell Disease", phase: "Phase I", status: "Recruiting", description: "First-in-human trial using CRISPR technology to correct the genetic mutation causing sickle cell disease...", location: "San Francisco, CA", summary: "Revolutionary gene editing for sickle cell", tags: ["Gene Therapy", "CRISPR", "Blood Disorders"], ...coords['United States'] },
    ];

    const { data: existingTrials } = await supabase.from('clinical_trials').select('count');
    if (!existingTrials || existingTrials.length === 0) {
      await supabase.from('clinical_trials').insert(trialsData.map(t => ({
        ...t,
        latitude: t.lat,
        longitude: t.lon,
      })));
    }

    // Seed Publications
    const publicationsData = [
      { title: "Breakthrough in CAR-T Cell Therapy for Solid Tumors", authors: ["Chen, S.", "Martinez, R."], abstract: "This study presents a novel approach to engineering CAR-T cells that can effectively target solid tumors...", summary: "New CAR-T approach shows promise for solid tumors", tags: ["Cancer", "Immunotherapy", "CAR-T"], year: 2024 },
      { title: "AI-Powered Early Detection of Alzheimer's Disease", authors: ["Tanaka, Y.", "Williams, E."], abstract: "We developed a machine learning algorithm that can detect early signs of Alzheimer's disease...", summary: "AI tool achieves 95% accuracy in early Alzheimer's detection", tags: ["AI", "Neurology", "Alzheimer's"], year: 2024 },
      { title: "CRISPR-Based Treatment for Sickle Cell Disease", authors: ["Patel, R.", "Hassan, A."], abstract: "This clinical trial demonstrates the safety and efficacy of CRISPR gene editing...", summary: "CRISPR therapy shows 98% success rate in sickle cell patients", tags: ["Gene Therapy", "CRISPR", "Blood Disorders"], year: 2023 },
    ];

    const { data: existingPubs } = await supabase.from('publications').select('count');
    if (!existingPubs || existingPubs.length === 0) {
      await supabase.from('publications').insert(publicationsData);
    }

    return new Response(JSON.stringify({ success: true, message: 'Data seeded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});