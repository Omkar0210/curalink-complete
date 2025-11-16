import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRecommendations } from "@/lib/supabase-api";
import { Expert, ClinicalTrial, Publication } from "@/lib/api";
import { UserType } from "@/lib/types";
import {
  TrendingUp,
  Users,
  FileText,
  Beaker,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardProps {
  userType: UserType;
  userId: string;
}

export default function Dashboard({ userType, userId }: DashboardProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userType]);

  const loadRecommendations = async () => {
    try {
      const data = await getRecommendations(userType);
      const allRecs = [
        ...data.experts,
        ...data.trials,
        ...data.publications
      ];
      setRecommendations(allRecs);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = userType === "patient"
    ? [
        { label: "Experts Following", value: "3", icon: Users },
        { label: "Trials Watching", value: "2", icon: Beaker },
        { label: "Saved Articles", value: "8", icon: FileText },
      ]
    : [
        { label: "Collaborators", value: "12", icon: Users },
        { label: "Active Trials", value: "4", icon: Beaker },
        { label: "Publications", value: "24", icon: FileText },
      ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          Welcome back!
        </h1>
        <p className="text-xl text-muted-foreground">
          {userType === "patient"
            ? "Here's what's new in your health journey"
            : "Here's your research overview"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">AI Insight</h3>
            <p className="text-muted-foreground">
              {userType === "patient"
                ? "Based on your profile, we found 3 new clinical trials that might be relevant to you. Dr. Sarah Chen at Memorial Sloan Kettering has published new research on immunotherapy approaches."
                : "Your recent publication has been cited 12 times this month. We identified 5 potential collaborators working on similar research topics. Consider reaching out to expand your network."}
            </p>
            <Button size="sm">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Button variant="ghost" asChild>
            <Link to="/experts">View All</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto p-6 flex-col gap-2" asChild>
            <Link to="/experts">
              <Users className="h-6 w-6" />
              <span>Find Experts</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-6 flex-col gap-2" asChild>
            <Link to="/trials">
              <Beaker className="h-6 w-6" />
              <span>Browse Trials</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-6 flex-col gap-2" asChild>
            <Link to="/publications">
              <FileText className="h-6 w-6" />
              <span>Read Research</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-6 flex-col gap-2" asChild>
            <Link to="/forums">
              <TrendingUp className="h-6 w-6" />
              <span>Join Discussion</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RecommendationItem {
  type: 'expert' | 'trial' | 'publication';
  id: string;
  reason: string;
  [key: string]: any;
}

function RecommendationCard({ recommendation }: { recommendation: RecommendationItem }) {
  const { type, item, reason } = recommendation;

  const getNavigationPath = () => {
    switch (type) {
      case "expert":
        return "/experts";
      case "trial":
        return "/trials";
      case "publication":
        return "/publications";
      default:
        return "/dashboard";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <Badge variant="secondary" className="capitalize">
          {type}
        </Badge>

        {type === "expert" && (
          <>
            <div className="flex items-center gap-3">
              <img
                src={(item as Expert).photo}
                alt={(item as Expert).name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{(item as Expert).name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {(item as Expert).specialization}
                </p>
              </div>
            </div>
          </>
        )}

        {type === "trial" && (
          <>
            <h3 className="font-semibold line-clamp-2">{(item as ClinicalTrial).title}</h3>
            <div className="flex gap-2">
              <Badge variant="outline">{(item as ClinicalTrial).phase}</Badge>
              <Badge variant="outline">{(item as ClinicalTrial).status}</Badge>
            </div>
          </>
        )}

        {type === "publication" && (
          <>
            <h3 className="font-semibold line-clamp-2">{(item as Publication).title}</h3>
            <p className="text-sm text-muted-foreground">
              {(item as Publication).authors.slice(0, 2).join(", ")}
              {(item as Publication).authors.length > 2 && " et al."}
            </p>
          </>
        )}

        <p className="text-sm text-muted-foreground">{reason}</p>

        <Button className="w-full" size="sm" asChild>
          <Link to={getNavigationPath()}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
