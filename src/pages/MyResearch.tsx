import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  tags: string[];
  summary: string;
  journal?: string;
  doi?: string;
}

export default function MyResearch({ userId }: { userId: string }) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; publication: Publication | null }>({
    open: false,
    publication: null,
  });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    authors: "",
    year: new Date().getFullYear(),
    tags: "",
    summary: "",
    journal: "",
    doi: "",
  });

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = () => {
    const saved = localStorage.getItem("curalink_researcher_publications");
    if (saved) {
      try {
        setPublications(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading publications:", error);
      }
    }
  };

  const savePublications = (pubs: Publication[]) => {
    localStorage.setItem("curalink_researcher_publications", JSON.stringify(pubs));
    setPublications(pubs);
  };

  const handleAdd = () => {
    if (!formData.title || !formData.abstract) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least title and abstract",
        variant: "destructive",
      });
      return;
    }

    const newPublication: Publication = {
      id: Date.now().toString(),
      title: formData.title,
      abstract: formData.abstract,
      authors: formData.authors.split(",").map((a) => a.trim()).filter(Boolean),
      year: formData.year,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      summary: formData.summary || formData.abstract.substring(0, 150) + "...",
      journal: formData.journal,
      doi: formData.doi,
    };

    const updated = [...publications, newPublication];
    savePublications(updated);

    toast({
      title: "Publication Added",
      description: "Your publication has been added successfully",
    });

    setAddDialog(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editDialog.publication || !formData.title || !formData.abstract) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least title and abstract",
        variant: "destructive",
      });
      return;
    }

    const updated = publications.map((pub) =>
      pub.id === editDialog.publication!.id
        ? {
            ...pub,
            title: formData.title,
            abstract: formData.abstract,
            authors: formData.authors.split(",").map((a) => a.trim()).filter(Boolean),
            year: formData.year,
            tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
            summary: formData.summary || formData.abstract.substring(0, 150) + "...",
            journal: formData.journal,
            doi: formData.doi,
          }
        : pub
    );

    savePublications(updated);

    toast({
      title: "Publication Updated",
      description: "Your publication has been updated successfully",
    });

    setEditDialog({ open: false, publication: null });
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = publications.filter((pub) => pub.id !== id);
    savePublications(updated);

    toast({
      title: "Publication Deleted",
      description: "Your publication has been removed",
    });
  };

  const openEditDialog = (pub: Publication) => {
    setFormData({
      title: pub.title,
      abstract: pub.abstract,
      authors: pub.authors.join(", "),
      year: pub.year,
      tags: pub.tags.join(", "),
      summary: pub.summary,
      journal: pub.journal || "",
      doi: pub.doi || "",
    });
    setEditDialog({ open: true, publication: pub });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      abstract: "",
      authors: "",
      year: new Date().getFullYear(),
      tags: "",
      summary: "",
      journal: "",
      doi: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Publications</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Manage your research publications
          </p>
        </div>
        <Button onClick={() => setAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Publication
        </Button>
      </div>

      {publications.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No publications yet</h3>
          <p className="text-muted-foreground mb-6">
            Start adding your research publications to build your profile
          </p>
          <Button onClick={() => setAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Publication
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {publications.map((pub) => (
            <Card key={pub.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold">{pub.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pub.authors.join(", ")} • {pub.year}
                      {pub.journal && ` • ${pub.journal}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(pub)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(pub.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground">{pub.summary}</p>

                {pub.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pub.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {pub.doi && (
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View DOI
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Publication Dialog */}
      <Dialog
        open={addDialog || editDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAddDialog(false);
            setEditDialog({ open: false, publication: null });
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog.publication ? "Edit Publication" : "Add Publication"}
            </DialogTitle>
            <DialogDescription>
              {editDialog.publication
                ? "Update your publication details"
                : "Add a new research publication to your profile"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Publication title"
              />
            </div>

            <div>
              <Label htmlFor="authors">Authors (comma-separated)</Label>
              <Input
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="John Doe, Jane Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })
                  }
                />
              </div>
              <div>
                <Label htmlFor="journal">Journal</Label>
                <Input
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                  placeholder="Journal name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                placeholder="10.1000/xyz123"
              />
            </div>

            <div>
              <Label htmlFor="abstract">Abstract *</Label>
              <Textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                placeholder="Enter the full abstract"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="summary">Summary (optional)</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary (will use abstract if empty)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="cancer, immunotherapy, clinical trial"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialog(false);
                setEditDialog({ open: false, publication: null });
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editDialog.publication ? handleEdit : handleAdd}>
              {editDialog.publication ? "Update" : "Add"} Publication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
