/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Search, Users, Plus, User } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { supabase } from "@/integrations/supabase/client";
// import { CreateTeamModal } from "@/components/CreateTeamModal";

// const filters = ["All", "Engineers", "Designers", "PM/BA", "AI/Data"];

// export const ParticipantsTab = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

//   const { data: profiles = [], isLoading } = useQuery({
//     queryKey: ["profiles"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       return data;
//     },
//   });

//   const filteredParticipants = profiles.filter((p) => {
//     const fullName = p.full_name || "";
//     const email = p.email || "";
//     const teamName = p.team_name || "";

//     const matchesSearch =
//       fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       teamName.toLowerCase().includes(searchQuery.toLowerCase());

//     return matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold mb-4">Participants</h1>
//           <p className="text-lg text-muted-foreground">
//             Connect with fellow innovators and form your dream team
//           </p>
//         </div>

//         {/* Search & Filters */}
//         <div className="mb-8 space-y-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
//             <Input
//               placeholder="Search by name, role, or skills..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {filters.map((filter) => (
//               <Button
//                 key={filter}
//                 variant={activeFilter === filter ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setActiveFilter(filter)}
//               >
//                 {filter}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Participant Grid */}
//         {isLoading ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">Loading participants...</p>
//           </div>
//         ) : filteredParticipants.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">No participants found.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {filteredParticipants.map((participant) => (
//               <Card
//                 key={participant.id}
//                 className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02]"
//               >
//                 <CardContent className="p-6">
//                   <div className="flex items-start gap-4 mb-4">
//                     <div className="text-4xl">
//                       <User className="w-12 h-12" />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-lg">
//                         {participant.full_name || "Anonymous"}
//                       </h3>
//                       <p className="text-sm text-muted-foreground">
//                         {participant.email}
//                       </p>
//                     </div>
//                   </div>

//                   {participant.team_name ? (
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <Users className="w-4 h-4" />
//                       <span>Team: {participant.team_name}</span>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No team yet</p>
//                   )}

//                   {participant.linkedin && (
//                     <a
//                       href={participant.linkedin}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-primary hover:underline block mt-2"
//                     >
//                       LinkedIn Profile
//                     </a>
//                   )}
//                   {participant.github && (
//                     <a
//                       href={participant.github}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-primary hover:underline block mt-1"
//                     >
//                       GitHub Profile
//                     </a>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Create Team CTA */}
//         <Card className="shadow-medium bg-gradient-primary text-primary-foreground">
//           <CardContent className="p-8 text-center">
//             <h2 className="text-2xl font-bold mb-4">Don't have a team yet?</h2>
//             <p className="mb-6 text-primary-foreground/90">
//               Create your own team and start inviting talented participants!
//             </p>
//             <Button
//               size="lg"
//               className="bg-accent hover:bg-accent/90 text-accent-foreground"
//               onClick={() => setShowCreateTeamModal(true)}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Create Team
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Create Team Modal */}
//       <CreateTeamModal
//         open={showCreateTeamModal}
//         onOpenChange={setShowCreateTeamModal}
//         onSuccess={() => {
//           // Refresh the profiles data to show updated team information
//           window.location.reload();
//         }}
//       />
//     </div>
//   );
// };

/* multiple teams */
// import React from "react";
// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Search, Users, Plus, User } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { supabase } from "@/integrations/supabase/client";
// import { CreateTeamModal } from "@/components/CreateTeamModal";

// // const filters = ["All", "Engineers", "Designers", "PM/BA", "AI/Data"];
// type ParticipantsTabProps = {
//   renderActions?: (participant: any) => React.ReactNode;
//   hideHeader?: boolean;
// };

// export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
//   renderActions,
//   hideHeader = false,
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

//   const { data, isLoading } = useQuery({
//     queryKey: ["participants-with-teams-multi"],
//     queryFn: async () => {
//       // 1) profiles
//       const { data: profiles, error: pErr } = await supabase
//         .from("profiles")
//         .select("id, full_name, email, linkedin, github, created_at")
//         .order("created_at", { ascending: false });
//       if (pErr) throw pErr;

//       if (!profiles?.length) {
//         return {
//           profiles: [],
//           teamNamesByUser: {} as Record<string, string[]>,
//         };
//       }

//       const ids = profiles.map((p) => p.id);

//       // 2) memberships + team names (may be multiple per user)
//       const { data: memberships, error: mErr } = await supabase
//         .from("team_members")
//         .select("user_id, joined_at, teams:team_id ( name )")
//         .in("user_id", ids);
//       if (mErr) throw mErr;

//       // 3) build userId -> string[] (unique names, sorted by joined_at)
//       const teamNamesByUser: Record<string, string[]> = {};
//       (memberships ?? [])
//         .sort(
//           (a: any, b: any) =>
//             new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
//         )
//         .forEach((m: any) => {
//           const uid = m.user_id;
//           const tname = m?.teams?.name;
//           if (!tname) return;
//           if (!teamNamesByUser[uid]) teamNamesByUser[uid] = [];
//           if (!teamNamesByUser[uid].includes(tname))
//             teamNamesByUser[uid].push(tname);
//         });

//       return { profiles, teamNamesByUser };
//     },
//   });

//   const profiles = data?.profiles ?? [];
//   const teamNamesByUser = data?.teamNamesByUser ?? {};

//   const filteredParticipants = profiles.filter((p) => {
//     const fullName = p.full_name || "";
//     const email = p.email || "";
//     const teamNames = teamNamesByUser[p.id] || [];

//     const q = searchQuery.toLowerCase();
//     const matchesSearch =
//       fullName.toLowerCase().includes(q) ||
//       email.toLowerCase().includes(q) ||
//       teamNames.some((t) => t.toLowerCase().includes(q));

//     // TODO: apply your role/skills filter when available
//     return matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <div className="max-w-6xl mx-auto">
//         {!hideHeader && (
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold mb-4">Participants</h1>
//             <p className="text-lg text-muted-foreground">
//               Connect with fellow innovators and form your dream team
//             </p>
//           </div>
//         )}
//         {/* Search & Filters */}
//         <div className="mb-8 space-y-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
//             <Input
//               placeholder="Search by name, email, or team..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           {/*
//           <div className="flex flex-wrap gap-2">
//             {filters.map((filter) => (
//               <Button
//                 key={filter}
//                 variant={activeFilter === filter ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setActiveFilter(filter)}
//               >
//                 {filter}
//               </Button>
//             ))}
//           </div> */}
//         </div>

//         {/* Participant Grid */}
//         {isLoading ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">Loading participants...</p>
//           </div>
//         ) : filteredParticipants.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">No participants found.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {filteredParticipants.map((participant) => {
//               const teamNames = teamNamesByUser[participant.id] || [];
//               return (
//                 <Card
//                   key={participant.id}
//                   className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02]"
//                 >
//                   <CardContent className="p-6">
//                     <div className="flex items-start gap-4 mb-4">
//                       <div className="text-4xl">
//                         <User className="w-12 h-12" />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-lg">
//                           {participant.full_name || "Anonymous"}
//                         </h3>
//                         <p className="text-sm text-muted-foreground">
//                           {participant.email}
//                         </p>
//                       </div>
//                     </div>

//                     {teamNames.length > 0 ? (
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
//                         <Users className="w-4 h-4" />
//                         <span>Teams:</span>
//                         {teamNames.map((t) => (
//                           <Badge key={t} variant="outline" className="text-xs">
//                             {t}
//                           </Badge>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-muted-foreground">
//                         No team yet
//                       </p>
//                     )}

//                     {participant.linkedin && (
//                       <a
//                         href={participant.linkedin}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-sm text-primary hover:underline block mt-2"
//                       >
//                         LinkedIn Profile
//                       </a>
//                     )}
//                     {participant.github && (
//                       <a
//                         href={participant.github}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-sm text-primary hover:underline block mt-1"
//                       >
//                         GitHub Profile
//                       </a>
//                     )}
//                     {renderActions && (
//                       <div className="mt-4">{renderActions(participant)}</div>
//                     )}
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}

//         {/* Create Team CTA */}
//         <Card className="shadow-medium bg-gradient-primary text-primary-foreground">
//           <CardContent className="p-8 text-center">
//             <h2 className="text-2xl font-bold mb-4">Don't have a team yet?</h2>
//             <p className="mb-6 text-primary-foreground/90">
//               Create your own team and start inviting talented participants!
//             </p>
//             <Button
//               size="lg"
//               className="bg-accent hover:bg-accent/90 text-accent-foreground"
//               onClick={() => setShowCreateTeamModal(true)}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Create Team
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Create Team Modal */}
//       <CreateTeamModal
//         open={showCreateTeamModal}
//         onOpenChange={setShowCreateTeamModal}
//         onSuccess={() => {
//           window.location.reload();
//         }}
//       />
//     </div>
//   );
// };

/* multiple teams */
import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CreateTeamModal } from "@/components/CreateTeamModal";

type ParticipantsTabProps = {
  renderActions?: (participant: any) => React.ReactNode;
  hideHeader?: boolean;
};

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  renderActions,
  hideHeader = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["participants-with-teams-multi"],
    queryFn: async () => {
      // 1) get profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, linkedin, github, created_at")
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;

      if (!profiles?.length) {
        return {
          profiles: [],
          teamNamesByUser: {} as Record<string, string[]>,
        };
      }

      const ids = profiles.map((p: any) => p.id);

      // 2) get roles for those users
      // note: requires SELECT on public.user_roles for your client role
      let rolesByUser: Record<string, string[]> = {};
      try {
        const { data: rolesRows, error: rErr } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", ids);

        if (rErr) {
          // If RLS blocks it, degrade gracefully: treat as no special roles
          console.warn(
            "user_roles query failed; falling back to show all",
            rErr
          );
          rolesByUser = {};
        } else {
          rolesByUser = (rolesRows ?? []).reduce((acc: any, row: any) => {
            const key = row.user_id;
            const role = String(row.role || "").toLowerCase();
            if (!acc[key]) acc[key] = [];
            if (role) acc[key].push(role);
            return acc;
          }, {});
        }
      } catch (e) {
        console.warn("user_roles fetch exception; showing all participants", e);
        rolesByUser = {};
      }

      // 3) filter out admins & judges
      const participantProfiles = profiles.filter((p: any) => {
        const roles = rolesByUser[p.id] || [];
        if (roles.length === 0) return true; // no row => treat as normal user
        return !roles.some((r) => r === "admin" || r === "judge");
      });

      if (!participantProfiles.length) {
        return {
          profiles: [],
          teamNamesByUser: {} as Record<string, string[]>,
        };
      }

      const keptIds = participantProfiles.map((p: any) => p.id);

      // 4) memberships + team names for remaining users
      const { data: memberships, error: mErr } = await supabase
        .from("team_members")
        .select("user_id, joined_at, teams:team_id ( name )")
        .in("user_id", keptIds);
      if (mErr) throw mErr;

      const teamNamesByUser: Record<string, string[]> = {};
      (memberships ?? [])
        .sort(
          (a: any, b: any) =>
            new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
        )
        .forEach((m: any) => {
          const tname = m?.teams?.name;
          if (!tname) return;
          if (!teamNamesByUser[m.user_id]) teamNamesByUser[m.user_id] = [];
          if (!teamNamesByUser[m.user_id].includes(tname))
            teamNamesByUser[m.user_id].push(tname);
        });

      return { profiles: participantProfiles, teamNamesByUser };
    },
  });

  const profiles = data?.profiles ?? [];
  const teamNamesByUser = data?.teamNamesByUser ?? {};

  const filteredParticipants = profiles.filter((p: any) => {
    const fullName = p.full_name || "";
    const email = p.email || "";
    const teamNames = teamNamesByUser[p.id] || [];

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      teamNames.some((t: string) => t.toLowerCase().includes(q));

    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {!hideHeader && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Participants</h1>
            <p className="text-lg text-muted-foreground">
              Connect with fellow innovators and form your dream team
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by name, email, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Participant Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading participants...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No participants found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredParticipants.map((participant: any) => {
              const teamNames: string[] = teamNamesByUser[participant.id] || [];
              return (
                <Card
                  key={participant.id}
                  className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">
                        <User className="w-12 h-12" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {participant.full_name || "Anonymous"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {participant.email}
                        </p>
                      </div>
                    </div>

                    {teamNames.length > 0 ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Users className="w-4 h-4" />
                        <span>Teams:</span>
                        {teamNames.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No team yet
                      </p>
                    )}

                    {participant.linkedin && (
                      <a
                        href={participant.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block mt-2"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                    {participant.github && (
                      <a
                        href={participant.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block mt-1"
                      >
                        GitHub Profile
                      </a>
                    )}

                    {renderActions && (
                      <div className="mt-4">{renderActions(participant)}</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Team CTA */}
        <Card className="shadow-medium bg-gradient-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Don't have a team yet?</h2>
            <p className="mb-6 text-primary-foreground/90">
              Create your own team and start inviting talented participants!
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setShowCreateTeamModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        open={showCreateTeamModal}
        onOpenChange={setShowCreateTeamModal}
        onSuccess={() => {
          // If you want to avoid full reload, you can invalidate the query instead.
          window.location.reload();
        }}
      />
    </div>
  );
};
