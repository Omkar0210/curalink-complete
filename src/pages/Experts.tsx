import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Bell, Calendar, Heart, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getExperts, followExpert, unfollowExpert, isFollowingExpert, requestCollaboration } from "@/lib/supabase-api";

interface Expert {
  id: string;
  name: string;
  specialization: string;
  institution: string;
  country: string;
  tags: string[];
  photo: string | null;
  match_score: number | null;
  distance?: number;
  isFollowing?: boolean;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Experts({ userId, userType }: { userId: string; userType?: string }) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [filteredResearchers, setFilteredResearchers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [nudgeDialog, setNudgeDialog] = useState<{ open: boolean; expert: Expert | null }>({
    open: false,
    expert: null,
  });
  const [meetingDialog, setMeetingDialog] = useState<{ open: boolean; expert: Expert | null }>({
    open: false,
    expert: null,
  });
  const [profileDialog, setProfileDialog] = useState<{ open: boolean; expert: Expert | null }>({
    open: false,
    expert: null,
  });
  const [collaborationDialog, setCollaborationDialog] = useState<{ open: boolean; expert: Expert | null }>({
    open: false,
    expert: null,
  });
  const [collaborationMessage, setCollaborationMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadExperts();
    if (userType === "researcher") {
      loadResearchers();
    }
  }, [userType]);

  useEffect(() => {
    filterExperts();
    if (userType === "researcher") {
      filterResearchers();
    }
  }, [searchQuery, experts, researchers]);

  const loadExperts = async () => {
    try {
      const data = await getExperts();
      setExperts(data);
      setFilteredExperts(data);
      
      const followingStatus: Record<string, boolean> = {};
      for (const expert of data) {
        followingStatus[expert.id] = await isFollowingExpert(userId, expert.id);
      }
      setFollowingMap(followingStatus);
    } catch (error) {
      console.error("Error loading experts:", error);
      toast({
        title: "Error",
        description: "Failed to load experts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadResearchers = () => {
    // Load all researchers from localStorage (simulated database)
    const allResearchers: any[] = [];
    
    // Get current user's data
    const currentUserData = localStorage.getItem("curalink_researcher_data");
    let currentUserId = "";
    if (currentUserData) {
      try {
        const parsed = JSON.parse(currentUserData);
        currentUserId = parsed.email; // Use email as unique identifier
      } catch (error) {
        console.error("Error parsing current user data:", error);
      }
    }

    // For demo purposes, add some sample researchers
    // In production, this would come from the database
    const sampleResearchers = [
      {
        id: "r1",
        name: "Dr. Emily Chen",
        institution: "Stanford University",
        fieldOfResearch: "Oncology",
        yearsOfExperience: "15",
        bio: "Leading researcher in cancer immunotherapy",
        email: "emily.chen@stanford.edu",
      },
      {
        id: "r2",
        name: "Dr. Michael Rodriguez",
        institution: "MIT",
        fieldOfResearch: "Neuroscience",
        yearsOfExperience: "12",
        bio: "Specializing in neural network analysis",
        email: "m.rodriguez@mit.edu",
      },
      {
        id: "r3",
        name: "Dr. Sarah Williams",
        institution: "Johns Hopkins",
        fieldOfResearch: "Cardiology",
        yearsOfExperience: "18",
        bio: "Cardiovascular disease prevention expert",
        email: "s.williams@jhu.edu",
      },
    ];

    // Filter out current user
    const filteredResearchers = sampleResearchers.filter(r => r.email !== currentUserId);
    
    setResearchers(filteredResearchers);
    setFilteredResearchers(filteredResearchers);
  };

  const filterExperts = () => {
    if (!searchQuery.trim()) {
      setFilteredExperts(experts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = experts.filter(
      (expert) =>
        expert.name.toLowerCase().includes(query) ||
        expert.specialization.toLowerCase().includes(query) ||
        expert.institution.toLowerCase().includes(query) ||
        expert.tags.some((tag) => tag.toLowerCase().includes(query))
    );
    setFilteredExperts(filtered);
  };

  const filterResearchers = () => {
    if (!searchQuery.trim()) {
      setFilteredResearchers(researchers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = researchers.filter(
      (researcher) =>
        researcher.name.toLowerCase().includes(query) ||
        researcher.institution.toLowerCase().includes(query) ||
        researcher.fieldOfResearch.toLowerCase().includes(query)
    );
    setFilteredResearchers(filtered);
  };

  const toggleFollow = async (expertId: string) => {
    const isCurrentlyFollowing = followingMap[expertId];
    
    try {
      if (isCurrentlyFollowing) {
        await unfollowExpert(userId, expertId);
      } else {
        await followExpert(userId, expertId);
      }
      
      setFollowingMap(prev => ({ ...prev, [expertId]: !isCurrentlyFollowing }));
      setExperts((prev) =>
        prev.map((expert) =>
          expert.id === expertId
            ? { ...expert, isFollowing: !isCurrentlyFollowing }
            : expert
        )
      );

      const expert = experts.find((e) => e.id === expertId);
      toast({
        title: isCurrentlyFollowing ? "Unfollowed" : "Following",
        description: isCurrentlyFollowing
          ? `You unfollowed ${expert?.name}`
          : `You are now following ${expert?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleNudge = (expert: Expert) => {
    setNudgeDialog({ open: true, expert });
  };

  const sendNudge = async () => {
    if (!nudgeDialog.expert) return;
    
    try {
      await requestCollaboration(userId, nudgeDialog.expert.id, "Interested in collaboration");
      toast({
        title: "Nudge Sent!",
        description: `We've notified ${nudgeDialog.expert?.name} about your interest in collaboration.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send nudge",
        variant: "destructive",
      });
    }
    setNudgeDialog({ open: false, expert: null });
  };

  const requestMeeting = async () => {
    if (!meetingDialog.expert) return;
    
    try {
      await requestCollaboration(userId, meetingDialog.expert.id, "Meeting request");
      toast({
        title: "Meeting Request Sent!",
        description: `Your meeting request has been sent to ${meetingDialog.expert?.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send meeting request",
        variant: "destructive",
      });
    }
    setMeetingDialog({ open: false, expert: null });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading experts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Expert Directory</h1>
        <p className="text-xl text-muted-foreground">
          Connect with leading medical researchers and specialists
        </p>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialization, institution, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredExperts.length} of {experts.length} experts
      </div>

      {/* Experts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="p-6 hover:shadow-lg transition-all">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <img
                  src={expert.photo}
                  alt={expert.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{expert.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {expert.specialization}
                  </p>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {expert.match_score || 0}% Match
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground line-clamp-2">{expert.institution}</p>
                <p className="text-muted-foreground">{expert.country}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {expert.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setProfileDialog({ open: true, expert })}
                >
                  View Profile
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFollow(expert.id)}
                    className={followingMap[expert.id] ? "bg-primary/10" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 ${followingMap[expert.id] ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNudge(expert)}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMeetingDialog({ open: true, expert })}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Researchers Section (Only visible for researchers) */}
      {userType === "researcher" && (
        <>
          <div className="pt-8 border-t">
            <h2 className="text-3xl font-bold mb-4">Other Researchers</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Connect and collaborate with fellow researchers
            </p>

            <div className="text-sm text-muted-foreground mb-6">
              Showing {filteredResearchers.length} of {researchers.length} researchers
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResearchers.map((researcher) => (
                <Card key={researcher.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{researcher.name}</h3>
                      <p className="text-sm text-muted-foreground">{researcher.institution}</p>
                      <Badge variant="secondary">{researcher.fieldOfResearch}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p><strong>Experience:</strong> {researcher.yearsOfExperience} years</p>
                      {researcher.bio && <p className="mt-2 line-clamp-2">{researcher.bio}</p>}
                    </div>

                    <div className="space-y-2 pt-2">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={async () => {
                          try {
                            await requestCollaboration(userId, researcher.id, "Collaboration request");
                            toast({
                              title: "Collaboration Request Sent!",
                              description: `Your request has been sent to ${researcher.name}`,
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to send collaboration request",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Request Collaboration
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Profile Dialog */}
      <Dialog open={profileDialog.open} onOpenChange={(open) => setProfileDialog({ open, expert: null })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expert Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-4">
              <img
                src={profileDialog.expert?.photo}
                alt={profileDialog.expert?.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profileDialog.expert?.name}</h2>
                <p className="text-muted-foreground">{profileDialog.expert?.specialization}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {profileDialog.expert?.match_score || 0}% Match
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Institution</h3>
                <p className="text-muted-foreground">{profileDialog.expert?.institution}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-muted-foreground">{profileDialog.expert?.country}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {profileDialog.expert?.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">About</h3>
                <p className="text-muted-foreground">
                  {profileDialog.expert?.name} is a leading expert in {profileDialog.expert?.specialization} with extensive research experience at {profileDialog.expert?.institution}.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setProfileDialog({ open: false, expert: null });
                if (profileDialog.expert) {
                  toggleFollow(profileDialog.expert.id);
                }
              }}
            >
              {followingMap[profileDialog.expert?.id || ''] ? "Unfollow" : "Follow"}
            </Button>
            <Button onClick={() => {
              setProfileDialog({ open: false, expert: null });
              if (profileDialog.expert) {
                handleNudge(profileDialog.expert);
              }
            }}>
              Nudge to Join
            </Button>
            <Button onClick={() => {
              setProfileDialog({ open: false, expert: null });
              if (profileDialog.expert) {
                setMeetingDialog({ open: true, expert: profileDialog.expert });
              }
            }}>
              Request Meeting
            </Button>
            {userType === "researcher" && (
              <Button onClick={() => {
                setProfileDialog({ open: false, expert: null });
                if (profileDialog.expert) {
                  setCollaborationDialog({ open: true, expert: profileDialog.expert });
                }
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Request Collaboration
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nudge Dialog */}
      <Dialog open={nudgeDialog.open} onOpenChange={(open) => setNudgeDialog({ open, expert: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nudge to Join</DialogTitle>
            <DialogDescription>
              Send a notification to {nudgeDialog.expert?.name} to encourage collaboration or joining a study.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea placeholder="Add a personal message..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNudgeDialog({ open: false, expert: null })}>
              Cancel
            </Button>
            <Button onClick={sendNudge}>Send Nudge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={meetingDialog.open} onOpenChange={(open) => setMeetingDialog({ open, expert: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Meeting</DialogTitle>
            <DialogDescription>
              Request a meeting with {meetingDialog.expert?.name} to discuss potential collaboration or research.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Meeting Purpose</Label>
              <Textarea placeholder="Describe the purpose of the meeting..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Date/Time</Label>
              <Input type="text" placeholder="e.g., Next week, Tuesday afternoon" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDialog({ open: false, expert: null })}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Meeting Request Sent!",
                description: `Your meeting request has been sent to ${meetingDialog.expert?.name}`,
              });
              setMeetingDialog({ open: false, expert: null });
            }}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collaboration Dialog */}
      <Dialog open={collaborationDialog.open} onOpenChange={(open) => {
        setCollaborationDialog({ open, expert: null });
        setCollaborationMessage("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Collaboration</DialogTitle>
            <DialogDescription>
              Send a collaboration request to {collaborationDialog.expert?.name} to work together on research projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Collaboration Message</Label>
              <Textarea 
                placeholder="Describe your collaboration proposal, research interests, and how you can work together..." 
                rows={6}
                value={collaborationMessage}
                onChange={(e) => setCollaborationMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCollaborationDialog({ open: false, expert: null });
              setCollaborationMessage("");
            }}>
              Cancel
            </Button>
            <Button onClick={async () => {
              try {
                if (!collaborationDialog.expert) return;
                
                await requestCollaboration(
                  userId, 
                  collaborationDialog.expert.id, 
                  collaborationMessage || "Collaboration request"
                );
                
                toast({
                  title: "Collaboration Request Sent!",
                  description: `Your collaboration request has been sent to ${collaborationDialog.expert.name}`,
                });
                setCollaborationDialog({ open: false, expert: null });
                setCollaborationMessage("");
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to send collaboration request",
                  variant: "destructive",
                });
              }
            }}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
