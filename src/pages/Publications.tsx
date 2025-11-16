import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Publication, getPublications } from "@/lib/api";
import { Search, Bookmark, ExternalLink, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Publications({ userId }: { userId: string }) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    filterPublications();
  }, [searchQuery, publications]);

  const loadPublications = async () => {
    try {
      const data = await getPublications();
      setPublications(data);
      setFilteredPublications(data);
    } catch (error) {
      console.error("Error loading publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPublications = () => {
    if (!searchQuery.trim()) {
      setFilteredPublications(publications);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = publications.filter(
      (pub) =>
        pub.title.toLowerCase().includes(query) ||
        pub.abstract.toLowerCase().includes(query) ||
        pub.authors.some((author) => author.toLowerCase().includes(query)) ||
        pub.tags.some((tag) => tag.toLowerCase().includes(query))
    );
    setFilteredPublications(filtered);
  };

  const toggleSave = (pubId: string) => {
    setPublications((prev) =>
      prev.map((pub) =>
        pub.id === pubId ? { ...pub, isSaved: !pub.isSaved } : pub
      )
    );

    const pub = publications.find((p) => p.id === pubId);
    const isNowSaved = !pub?.isSaved;

    toast({
      title: isNowSaved ? "Publication Saved" : "Publication Removed",
      description: isNowSaved
        ? "Added to your reading list"
        : "Removed from your reading list",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading publications...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Publications</h1>
        <p className="text-xl text-muted-foreground">
          Explore the latest research and scientific publications
        </p>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by title, authors, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPublications.length} of {publications.length} publications
      </div>

      {/* Publications List */}
      <div className="space-y-6">
        {filteredPublications.map((pub) => (
          <Card key={pub.id} className="p-6 hover:shadow-lg transition-all">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-semibold">{pub.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{pub.authors.join(", ")}</span>
                      <span>•</span>
                      <span>{pub.year}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSave(pub.id)}
                >
                  <Bookmark
                    className={`h-5 w-5 ${pub.isSaved ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              {/* Simple Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Simple Summary:</p>
                <p className="text-sm">{pub.summary}</p>
              </div>

              {/* Technical Abstract */}
              <div>
                <p className="text-sm font-medium mb-2">Technical Abstract:</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pub.abstract}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {pub.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  Read Full Paper
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline">Cite</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
