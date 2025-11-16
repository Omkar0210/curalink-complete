import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserType } from "@/lib/types";
import { ArrowRight, User, Microscope, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingProps {
  onComplete: (userType: UserType) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<"select" | "details">("select");
  const [userType, setUserType] = useState<UserType | null>(null);
  const { toast } = useToast();
  
  // Patient form data
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    country: "",
    city: "",
    condition: "",
    symptoms: "",
    medicalFile: null as File | null,
    additionalNotes: "",
  });

  // Researcher form data
  const [researcherData, setResearcherData] = useState({
    name: "",
    email: "",
    institution: "",
    fieldOfResearch: "",
    yearsOfExperience: "",
    orcid: "",
    researchGate: "",
    linkedin: "",
    bio: "",
    profilePicture: null as File | null,
  });

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setStep("details");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) return;

    // Validate required fields
    if (userType === "patient") {
      if (!patientData.name || !patientData.email || !patientData.age || 
          !patientData.gender || !patientData.country || !patientData.city || 
          !patientData.condition || !patientData.symptoms) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      // Save patient data to localStorage
      localStorage.setItem("curalink_patient_data", JSON.stringify(patientData));
    } else {
      if (!researcherData.name || !researcherData.email || 
          !researcherData.institution || !researcherData.fieldOfResearch || 
          !researcherData.yearsOfExperience) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      // Save researcher data to localStorage
      localStorage.setItem("curalink_researcher_data", JSON.stringify(researcherData));
    }

    toast({
      title: "Welcome to CuraLink!",
      description: "Your profile has been created successfully",
    });
    
    onComplete(userType);
  };

  const handleSkipOptional = () => {
    if (userType) {
      onComplete(userType);
    }
  };

  if (step === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Welcome to CuraLink</h1>
            <p className="text-xl text-muted-foreground">
              Connect with experts, discover trials, and advance medical research
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="p-8 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary"
              onClick={() => handleUserTypeSelect("patient")}
            >
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <User className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">I'm a Patient</h2>
                  <p className="text-muted-foreground">
                    Find experts, clinical trials, and connect with others who understand
                    your journey
                  </p>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  Continue as Patient
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card
              className="p-8 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary"
              onClick={() => handleUserTypeSelect("researcher")}
            >
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Microscope className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">I'm a Researcher</h2>
                  <p className="text-muted-foreground">
                    Discover collaborators, stay updated on latest research, and manage
                    trials
                  </p>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  Continue as Researcher
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Patient Form
  if (step === "details" && userType === "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Patient Information</h2>
              <p className="text-muted-foreground">
                Help us personalize your experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Required Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={patientData.age}
                      onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                      placeholder="30"
                      min="0"
                      max="120"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={patientData.gender}
                      onValueChange={(value) => setPatientData({ ...patientData, gender: value })}
                      required
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={patientData.country}
                      onChange={(e) => setPatientData({ ...patientData, country: e.target.value })}
                      placeholder="United States"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={patientData.city}
                      onChange={(e) => setPatientData({ ...patientData, city: e.target.value })}
                      placeholder="New York"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Primary Condition *</Label>
                  <Select
                    value={patientData.condition}
                    onValueChange={(value) => setPatientData({ ...patientData, condition: value })}
                    required
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select your primary condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cancer">Cancer</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="heart-disease">Heart Disease</SelectItem>
                      <SelectItem value="respiratory">Respiratory Issues</SelectItem>
                      <SelectItem value="neurological">Neurological Disorders</SelectItem>
                      <SelectItem value="autoimmune">Autoimmune Diseases</SelectItem>
                      <SelectItem value="mental-health">Mental Health</SelectItem>
                      <SelectItem value="rare-disease">Rare Disease</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Description / Symptoms *</Label>
                  <Textarea
                    id="symptoms"
                    value={patientData.symptoms}
                    onChange={(e) => setPatientData({ ...patientData, symptoms: e.target.value })}
                    placeholder="Please describe your symptoms or condition in detail..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Optional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="medicalFile">Upload Medical File (PDF or Image)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="medicalFile"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setPatientData({ ...patientData, medicalFile: e.target.files?.[0] || null })}
                      className="cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload medical records, test results, or relevant documents</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={patientData.additionalNotes}
                    onChange={(e) => setPatientData({ ...patientData, additionalNotes: e.target.value })}
                    placeholder="Any additional information you'd like to share..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  // Researcher Form
  if (step === "details" && userType === "researcher") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Researcher Information</h2>
              <p className="text-muted-foreground">
                Set up your research profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Required Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={researcherData.name}
                      onChange={(e) => setResearcherData({ ...researcherData, name: e.target.value })}
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={researcherData.email}
                      onChange={(e) => setResearcherData({ ...researcherData, email: e.target.value })}
                      placeholder="jane@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution / Organization *</Label>
                  <Input
                    id="institution"
                    value={researcherData.institution}
                    onChange={(e) => setResearcherData({ ...researcherData, institution: e.target.value })}
                    placeholder="Harvard Medical School"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field">Field of Research *</Label>
                    <Select
                      value={researcherData.fieldOfResearch}
                      onValueChange={(value) => setResearcherData({ ...researcherData, fieldOfResearch: value })}
                      required
                    >
                      <SelectTrigger id="field">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="immunology">Immunology</SelectItem>
                        <SelectItem value="genetics">Genetics</SelectItem>
                        <SelectItem value="pharmacology">Pharmacology</SelectItem>
                        <SelectItem value="epidemiology">Epidemiology</SelectItem>
                        <SelectItem value="bioengineering">Bioengineering</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={researcherData.yearsOfExperience}
                      onChange={(e) => setResearcherData({ ...researcherData, yearsOfExperience: e.target.value })}
                      placeholder="5"
                      min="0"
                      max="70"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Optional Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orcid">ORCID ID</Label>
                    <Input
                      id="orcid"
                      value={researcherData.orcid}
                      onChange={(e) => setResearcherData({ ...researcherData, orcid: e.target.value })}
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="researchGate">ResearchGate URL</Label>
                    <Input
                      id="researchGate"
                      value={researcherData.researchGate}
                      onChange={(e) => setResearcherData({ ...researcherData, researchGate: e.target.value })}
                      placeholder="https://researchgate.net/profile/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={researcherData.linkedin}
                    onChange={(e) => setResearcherData({ ...researcherData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    value={researcherData.bio}
                    onChange={(e) => setResearcherData({ ...researcherData, bio: e.target.value })}
                    placeholder="Tell us about your research interests and background..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Upload Profile Picture</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setResearcherData({ ...researcherData, profilePicture: e.target.files?.[0] || null })}
                      className="cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleSkipOptional} className="flex-1">
                  Skip Optional Fields
                </Button>
                <Button type="submit" className="flex-1">
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
