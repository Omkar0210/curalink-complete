import { supabase } from "@/integrations/supabase/client";

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get user's current location
export async function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        resolve(null);
      }
    );
  });
}

// Experts
export async function getExperts() {
  const userLocation = await getUserLocation();
  const { data, error } = await supabase
    .from('experts')
    .select('*')
    .order('match_score', { ascending: false });

  if (error) throw error;

  // Add distance if user location is available
  if (userLocation && data) {
    return data.map(expert => ({
      ...expert,
      distance: expert.latitude && expert.longitude
        ? calculateDistance(userLocation.lat, userLocation.lon, expert.latitude, expert.longitude)
        : undefined
    })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  return data || [];
}

// Clinical Trials
export async function getTrials() {
  const userLocation = await getUserLocation();
  const { data, error } = await supabase
    .from('clinical_trials')
    .select('*');

  if (error) throw error;

  // Add distance if user location is available
  if (userLocation && data) {
    return data.map(trial => ({
      ...trial,
      distance: trial.latitude && trial.longitude
        ? calculateDistance(userLocation.lat, userLocation.lon, trial.latitude, trial.longitude)
        : undefined
    })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  return data || [];
}

// Publications
export async function getPublications() {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Forums
export async function getForums() {
  const { data, error } = await supabase
    .from('forums')
    .select(`
      *,
      forum_comments(count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(forum => ({
    ...forum,
    replies: forum.forum_comments?.[0]?.count || 0,
    timestamp: new Date(forum.created_at)
  })) || [];
}

// Get Recommendations (mock implementation - can be enhanced with AI later)
export async function getRecommendations(userType: string) {
  if (userType === 'patient') {
    const [experts, trials, publications] = await Promise.all([
      getExperts(),
      getTrials(),
      getPublications()
    ]);

    return {
      experts: experts.slice(0, 3).map(e => ({
        type: 'expert' as const,
        id: e.id,
        ...e,
        reason: `High match score (${e.match_score}%) for your condition`
      })),
      trials: trials.slice(0, 3).map(t => ({
        type: 'trial' as const,
        id: t.id,
        ...t,
        reason: 'Currently recruiting and matches your criteria'
      })),
      publications: publications.slice(0, 2).map(p => ({
        type: 'publication' as const,
        id: p.id,
        ...p,
        reason: 'Latest research in your area of interest'
      }))
    };
  } else {
    const [experts, publications] = await Promise.all([
      getExperts(),
      getPublications()
    ]);

    return {
      experts: experts.slice(0, 3).map(e => ({
        type: 'expert' as const,
        id: e.id,
        ...e,
        reason: 'Potential collaboration opportunity in your field'
      })),
      publications: publications.slice(0, 4).map(p => ({
        type: 'publication' as const,
        id: p.id,
        ...p,
        reason: 'Relevant to your research interests'
      })),
      trials: []
    };
  }
}

// Favourites
export async function getFavourites(userId: string) {
  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function addFavourite(userId: string, itemType: string, itemId: string, category: string) {
  const { error } = await supabase
    .from('favourites')
    .insert({ user_id: userId, item_type: itemType, item_id: itemId, category });

  if (error) throw error;
}

export async function removeFavourite(userId: string, itemId: string) {
  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);

  if (error) throw error;
}

// Follow/Unfollow Expert
export async function followExpert(userId: string, expertId: string) {
  const { error } = await supabase
    .from("user_follows")
    .insert({ user_id: userId, expert_id: expertId });

  if (error) {
    console.error("Error following expert", { userId, expertId, error });
    throw error;
  }
}

export async function unfollowExpert(userId: string, expertId: string) {
  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("user_id", userId)
    .eq("expert_id", expertId);

  if (error) {
    console.error("Error unfollowing expert", { userId, expertId, error });
    throw error;
  }
}

export async function isFollowingExpert(userId: string, expertId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("user_id", userId)
    .eq("expert_id", expertId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking follow status", { userId, expertId, error });
    return false;
  }

  return !!data;
}

// Collaborations
export async function requestCollaboration(requesterId: string, expertId: string, message: string) {
  const { data, error } = await supabase
    .from('collaborations')
    .insert({
      requester_id: requesterId,
      expert_id: expertId,
      message,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCollaborations(userId: string) {
  const { data, error } = await supabase
    .from('collaborations')
    .select(`
      *,
      experts(*)
    `)
    .eq('requester_id', userId);

  if (error) throw error;
  return data || [];
}

// Chat
export async function createChatRoom(collaborationId: string) {
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({ collaboration_id: collaborationId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatRoom(collaborationId: string) {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('collaboration_id', collaborationId)
    .single();

  if (error) throw error;
  return data;
}

export async function sendMessage(roomId: string, senderId: string, content: string) {
  const { error } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content
    });

  if (error) throw error;
}

export async function getMessages(roomId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Researcher Profile
export async function getResearcherProfile(userId: string) {
  const { data, error } = await supabase
    .from('researchers')
    .select('*, profiles(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateResearcherProfile(userId: string, updates: any) {
  const { error } = await supabase
    .from('researchers')
    .upsert({
      id: userId,
      ...updates
    });

  if (error) throw error;
}

export async function updateProfile(userId: string, updates: any) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}