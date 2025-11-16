import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClinicalTrial, getTrials } from "@/lib/api";
import { Search, Bookmark, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Trials({ userId }: { userId: string }) {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [filteredTrials, setFilteredTrials] = useState<ClinicalTrial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTrials();
  }, []);

  useEffect(() => {
    filterTrials();
  }, [searchQuery, trials]);

  const loadTrials = async () => {
    try {
      const data = await getTrials();
      setTrials(data);
      setFilteredTrials(data);
    } catch (error) {
      console.error("Error loading trials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTrials = () => {
    if (!searchQuery.trim()) {
      setFilteredTrials(trials);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trials.filter(
      (trial) =>
        trial.title.toLowerCase().includes(query) ||
        trial.description.toLowerCase().includes(query) ||
        trial.phase.toLowerCase().includes(query) ||
        trial.location.toLowerCase().includes(query) ||
        trial.tags.some((tag) => tag.toLowerCase().includes(query))
    );
    setFilteredTrials(filtered);
  };

  const toggleSave = (trialId: string) => {
    setTrials((prev) =>
      prev.map((trial) =>
        trial.id === trialId ? { ...trial, isSaved: !trial.isSaved } : trial
      )
    );

    const trial = trials.find((t) => t.id === trialId);
    const isNowSaved = !trial?.isSaved;

    toast({
      title: isNowSaved ? "Trial Saved" : "Trial Removed",
      description: isNowSaved
        ? "Added to your favourites"
        : "Removed from your favourites",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading trials...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Clinical Trials</h1>
        <p className="text-xl text-muted-foreground">
          Discover ongoing clinical trials and research opportunities
        </p>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search trials by title, phase, location, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTrials.length} of {trials.length} trials
      </div>

      {/* Trials List */}
      <div className="space-y-6">
        {filteredTrials.map((trial) => (
          <Card key={trial.id} className="p-6 hover:shadow-lg transition-all">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default">{trial.phase}</Badge>
                    <Badge
                      variant={trial.status === "Recruiting" ? "default" : "secondary"}
                    >
                      {trial.status}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-semibold">{trial.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSave(trial.id)}
                >
                  <Bookmark
                    className={`h-5 w-5 ${trial.isSaved ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">AI Summary:</p>
                <p className="text-sm">{trial.summary}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium mb-2">Full Description:</p>
                <p className="text-muted-foreground">{trial.description}</p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Location:</span>
                <span>{trial.location}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {trial.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1">Apply to Participate</Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
