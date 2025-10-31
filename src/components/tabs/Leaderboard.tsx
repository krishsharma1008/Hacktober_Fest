// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useNavigate, Link } from "react-router-dom";

// export default function Leaderboard() {
//   const navigate = useNavigate();

//   const {
//     data: rows = [],
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["public-leaderboard"],
//     queryFn: async () => {
//       const { data, error } = await supabase.rpc("get_leaderboard_public");
//       if (error) throw error;
//       return (data ?? []) as Array<{
//         project_id: string;
//         project_name: string;
//         team_name: string;
//         project_avg: number | null;
//       }>;
//     },
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-6 w-6 animate-spin" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Card className="max-w-md w-full">
//           <CardHeader>
//             <CardTitle>Failed to load leaderboard</CardTitle>
//           </CardHeader>
//           <CardContent className="text-sm text-red-500">
//             {(error as Error)?.message || "Unknown error"}
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen container mx-auto px-4 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold">Leaderboard</h1>
//         <Button variant="outline" onClick={() => navigate(-1)}>
//           ← Back
//         </Button>
//       </div>

//       <Card>
//         {/* <CardHeader>
//           <CardTitle>Final Standings</CardTitle>
//         </CardHeader> */}
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[60px] text-right">#</TableHead>
//                 <TableHead>Project</TableHead>
//                 <TableHead>Team</TableHead>
//                 <TableHead className="text-right">Avg Score</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {rows.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={4}
//                     className="text-center text-muted-foreground"
//                   >
//                     No scores yet.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 rows.map((r, idx) => (
//                   <TableRow key={r.project_id}>
//                     <TableCell className="text-right">{idx + 1}</TableCell>
//                     <TableCell className="font-medium">
//                       <Link
//                         to={`/projects/${r.project_id}`}
//                         className="hover:underline"
//                       >
//                         {r.project_name}
//                       </Link>
//                     </TableCell>
//                     <TableCell>{r.team_name}</TableCell>
//                     <TableCell className="text-right">
//                       {r.project_avg !== null ? r.project_avg.toFixed(2) : "—"}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import { useEffect, useMemo, useRef } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useNavigate, Link } from "react-router-dom";
// import { AnimatePresence, motion } from "framer-motion";

// export default function Leaderboard() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   // Fetch leaderboard (server sorts by DESC already)
//   const {
//     data: rows = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["public-leaderboard"],
//     queryFn: async () => {
//       const { data, error } = await supabase.rpc("get_leaderboard_public");
//       if (error) throw error;
//       return (data ?? []) as Array<{
//         project_id: string;
//         project_name: string;
//         team_name: string;
//         project_avg: number | null;
//       }>;
//     },
//     // small staleTime to avoid hammering; realtime will trigger refetch anyway
//     staleTime: 5_000,
//   });

//   // --- Realtime updates: refetch when judge_feedback changes
//   useEffect(() => {
//     const channel = supabase
//       .channel("leaderboard-realtime")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "judge_feedback" },
//         () => {
//           // light debounce to batch rapid inserts/updates
//           refetch();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [refetch]);

//   // --- Rank change indicator (compare previous order by project_id)
//   const prevRankRef = useRef<Record<string, number>>({});
//   const rankDeltas = useMemo(() => {
//     const currentRanks: Record<string, number> = {};
//     rows.forEach((r, idx) => (currentRanks[r.project_id] = idx));
//     const deltas: Record<string, number> = {};
//     const prev = prevRankRef.current;
//     for (const r of rows) {
//       const prevRank = prev[r.project_id];
//       const nowRank = currentRanks[r.project_id];
//       deltas[r.project_id] =
//         typeof prevRank === "number" ? prevRank - nowRank : 0; // +ve means moved up
//     }
//     // update ref for next render
//     prevRankRef.current = currentRanks;
//     return deltas;
//   }, [rows]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-6 w-6 animate-spin" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Card className="max-w-md w-full">
//           <CardHeader>
//             <CardTitle>Failed to load leaderboard</CardTitle>
//           </CardHeader>
//           <CardContent className="text-sm text-red-500">
//             {(error as Error)?.message || "Unknown error"}
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen container mx-auto px-4 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold">Leaderboard</h1>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => refetch()}>
//             Refresh
//           </Button>
//           <Button variant="outline" onClick={() => navigate(-1)}>
//             ← Back
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Projects by Average Score (live)</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[60px] text-right">#</TableHead>
//                 <TableHead>Project</TableHead>
//                 <TableHead>Team</TableHead>
//                 <TableHead className="text-right">Avg Score</TableHead>
//               </TableRow>
//             </TableHeader>

//             {/* Animate row reordering */}
//             <TableBody asChild>
//               <motion.tbody layout>
//                 <AnimatePresence initial={false}>
//                   {rows.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={4}
//                         className="text-center text-muted-foreground"
//                       >
//                         No scores yet.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     rows.map((r, idx) => {
//                       const delta = rankDeltas[r.project_id] || 0;
//                       const movedUp = delta > 0;
//                       const movedDown = delta < 0;

//                       return (
//                         <motion.tr
//                           key={r.project_id}
//                           layout
//                           initial={{ opacity: 0, y: 8 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -8 }}
//                           transition={{
//                             type: "spring",
//                             stiffness: 300,
//                             damping: 24,
//                           }}
//                           className="border-b"
//                         >
//                           <TableCell className="text-right tabular-nums">
//                             {idx + 1}
//                             <span
//                               className={
//                                 "ml-2 text-xs font-medium " +
//                                 (movedUp
//                                   ? "text-green-600"
//                                   : movedDown
//                                   ? "text-red-600"
//                                   : "text-muted-foreground")
//                               }
//                               title={
//                                 movedUp
//                                   ? `↑ moved up ${delta}`
//                                   : movedDown
//                                   ? `↓ moved down ${Math.abs(delta)}`
//                                   : "—"
//                               }
//                             >
//                               {movedUp
//                                 ? `↑${delta}`
//                                 : movedDown
//                                 ? `↓${Math.abs(delta)}`
//                                 : "—"}
//                             </span>
//                           </TableCell>

//                           <TableCell className="font-medium">
//                             <Link
//                               to={`/projects/${r.project_id}`}
//                               className="hover:underline"
//                             >
//                               {r.project_name}
//                             </Link>
//                           </TableCell>

//                           <TableCell>{r.team_name}</TableCell>

//                           <TableCell className="text-right">
//                             <div className="flex flex-col items-end">
//                               <div className="tabular-nums">
//                                 {r.project_avg !== null
//                                   ? r.project_avg.toFixed(2)
//                                   : "—"}
//                               </div>
//                               {r.project_avg !== null && (
//                                 <div className="mt-1 h-1.5 w-28 rounded-full bg-muted overflow-hidden">
//                                   <motion.div
//                                     key={r.project_id + String(r.project_avg)}
//                                     initial={{ width: 0 }}
//                                     animate={{
//                                       width: `${(r.project_avg / 10) * 100}%`,
//                                     }}
//                                     transition={{
//                                       type: "tween",
//                                       duration: 0.4,
//                                     }}
//                                     className="h-full bg-primary"
//                                   />
//                                 </div>
//                               )}
//                             </div>
//                           </TableCell>
//                         </motion.tr>
//                       );
//                     })
//                   )}
//                 </AnimatePresence>
//               </motion.tbody>
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard() {
  const navigate = useNavigate();

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard_public");
      if (error) throw error;
      return (data ?? []) as Array<{
        project_id: string;
        project_name: string;
        team_name: string;
        project_avg: number | null;
      }>;
    },
  });

  // realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "judge_feedback" },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const prevRankRef = useRef<Record<string, number>>({});
  const rankDeltas = useMemo(() => {
    const currentRanks: Record<string, number> = {};
    rows.forEach((r, idx) => (currentRanks[r.project_id] = idx));
    const deltas: Record<string, number> = {};
    const prev = prevRankRef.current;
    for (const r of rows) {
      const prevRank = prev[r.project_id];
      const nowRank = currentRanks[r.project_id];
      deltas[r.project_id] =
        typeof prevRank === "number" ? prevRank - nowRank : 0;
    }
    prevRankRef.current = currentRanks;
    return deltas;
  }, [rows]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Failed to load leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-500">
            {(error as Error)?.message || "Unknown error"}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🥇 medal colors
  const medalColor = (rank: number) =>
    rank === 1
      ? "text-yellow-400"
      : rank === 2
      ? "text-gray-300"
      : rank === 3
      ? "text-amber-600"
      : "";

  return (
    <div className="min-h-screen container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard 🏆</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Projects by Average Score (Live Updates)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-muted">
                <TableHead className="w-[70px] text-center">Rank</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Avg Score</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody asChild>
              <motion.tbody layout>
                <AnimatePresence initial={false}>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No scores yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => {
                      const delta = rankDeltas[r.project_id] || 0;
                      const movedUp = delta > 0;
                      const movedDown = delta < 0;

                      return (
                        <motion.tr
                          key={r.project_id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          className={`border-b border-muted hover:bg-muted/30 transition-colors`}
                        >
                          <TableCell className="text-center font-semibold">
                            {idx + 1 <= 3 ? (
                              <div className="flex justify-center items-center gap-1">
                                <Medal
                                  className={`h-5 w-5 ${medalColor(idx + 1)}`}
                                  strokeWidth={2}
                                />
                                <span className="text-sm">{idx + 1}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                {idx + 1}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="font-medium max-w-[300px] truncate">
                            <Link
                              to={`/projects/${r.project_id}`}
                              className="hover:underline"
                            >
                              {r.project_name}
                            </Link>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {r.team_name}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <div className="tabular-nums font-medium">
                                {r.project_avg !== null
                                  ? r.project_avg.toFixed(2)
                                  : "—"}
                              </div>

                              {r.project_avg !== null && (
                                <div className="mt-1 h-1.5 w-28 rounded-full bg-muted overflow-hidden">
                                  <motion.div
                                    key={r.project_id + String(r.project_avg)}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(r.project_avg / 10) * 100}%`,
                                    }}
                                    transition={{
                                      type: "tween",
                                      duration: 0.4,
                                    }}
                                    className="h-full bg-primary"
                                  />
                                </div>
                              )}
                            </div>
                            {movedUp && (
                              <span className="text-xs text-green-600">
                                ↑ moved up {delta}
                              </span>
                            )}
                            {movedDown && (
                              <span className="text-xs text-red-600">
                                ↓ moved down {Math.abs(delta)}
                              </span>
                            )}
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </motion.tbody>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
