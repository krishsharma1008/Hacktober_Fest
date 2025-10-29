/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type CriteriaKey =
  | "Innovation & Creativity"
  | "Relevance to Theme"
  | "Feasibility & Market Viability"
  | "Business Impact"
  | "Presentation & Message Delivery"
  | "Team Diversity";

type CriteriaObj = Partial<Record<CriteriaKey, number>>;

const CRITERIA: { key: CriteriaKey; weight: number }[] = [
  { key: "Innovation & Creativity", weight: 0.25 },
  { key: "Relevance to Theme", weight: 0.2 },
  { key: "Feasibility & Market Viability", weight: 0.2 },
  { key: "Business Impact", weight: 0.15 },
  { key: "Presentation & Message Delivery", weight: 0.15 },
  { key: "Team Diversity", weight: 0.05 },
];

interface PublicComment {
  id: string;
  project_id: string;
  judge_id: string;
  comment: string | null;
  average_score: number | null;
  created_at: string;
}

interface Props {
  projectId: string;
}

export default function JudgeReview({ projectId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [judgeId, setJudgeId] = useState<string | null>(null);

  // Editable fields
  const [criteria, setCriteria] = useState<CriteriaObj>({
    "Innovation & Creativity": undefined,
    "Relevance to Theme": undefined,
    "Feasibility & Market Viability": undefined,
    "Business Impact": undefined,
    "Presentation & Message Delivery": undefined,
    "Team Diversity": undefined,
  });
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");

  // For update
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  // Public comments list
  const [publicComments, setPublicComments] = useState<PublicComment[]>([]);

  // Check roles: admin or judge
  const { data: isAdmin = false, isLoading: isAdminLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (!userId) return false;

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });

  const { data: isJudge = false, isLoading: isJudgeLoading } = useQuery({
    queryKey: ["is-judge"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (!userId) return false;

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "judge",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });

  // Combine roles
  const canScore = !isAdminLoading && !isJudgeLoading && (isAdmin || isJudge);

  const average = useMemo(() => {
    // Only include criteria that have numeric values
    let totalWeight = 0;
    let weightedSum = 0;

    for (const { key, weight } of CRITERIA) {
      const v = criteria[key];
      if (typeof v === "number" && !isNaN(v)) {
        // v is 0..10
        weightedSum += v * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return null;
    // Scale remains 0..10 because weights sum to 1.0
    return Math.round(weightedSum * 100) / 100;
  }, [criteria]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Get current user ID
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes?.user?.id ?? null;
        setJudgeId(uid);

        // 🟢 Load judge feedback only if admin/judge
        if (uid && canScore) {
          const { data: my, error: myErr } = await supabase
            .from("judge_feedback")
            .select("*")
            .eq("project_id", projectId)
            .eq("judge_id", uid)
            .maybeSingle();

          if (myErr) throw myErr;

          if (my) {
            setFeedbackId(my.id);
            const c = my.criteria || {};
            setCriteria({
              "Innovation & Creativity": isFinite(
                Number(c["Innovation & Creativity"])
              )
                ? Number(c["Innovation & Creativity"])
                : undefined,
              "Relevance to Theme": isFinite(Number(c["Relevance to Theme"]))
                ? Number(c["Relevance to Theme"])
                : undefined,
              "Feasibility & Market Viability": isFinite(
                Number(c["Feasibility & Market Viability"])
              )
                ? Number(c["Feasibility & Market Viability"])
                : undefined,
              "Business Impact": isFinite(Number(c["Business Impact"]))
                ? Number(c["Business Impact"])
                : undefined,
              "Presentation & Message Delivery": isFinite(
                Number(c["Presentation & Message Delivery"])
              )
                ? Number(c["Presentation & Message Delivery"])
                : undefined,
              "Team Diversity": isFinite(Number(c["Team Diversity"]))
                ? Number(c["Team Diversity"])
                : undefined,
            });
            setComment(my.comment ?? "");
            setNote(my.note ?? "");
          }
        }

        // 🟡 Always load public comments
        const { data: pub, error: pubErr } = await supabase
          .from("project_feedback_public")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (pubErr) throw pubErr;
        setPublicComments(pub || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load judge review data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, canScore]);

  const setScore = (key: CriteriaKey, raw: string) => {
    const v = raw === "" ? undefined : Math.max(0, Math.min(10, Number(raw)));
    setCriteria((prev) => ({
      ...prev,
      [key]: isFinite(Number(v)) ? Number(v) : undefined,
    }));
  };

  const validate = () => {
    for (const { key } of CRITERIA) {
      const v = criteria[key];
      if (typeof v !== "number" || isNaN(v))
        return "Please score all criteria (0–10).";
      if (v < 0 || v > 10) return "Scores must be between 0 and 10.";
    }
    return null;
  };

  const save = async () => {
    if (!canScore) {
      toast.error("Only judges or admins can submit scores.");
      return;
    }
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (!projectId) return;

    setSaving(true);
    try {
      const cleanCriteria: Record<string, number> = {
        "Innovation & Creativity": Number(criteria["Innovation & Creativity"]),
        "Relevance to Theme": Number(criteria["Relevance to Theme"]),
        "Feasibility & Market Viability": Number(
          criteria["Feasibility & Market Viability"]
        ),
        "Business Impact": Number(criteria["Business Impact"]),
        "Presentation & Message Delivery": Number(
          criteria["Presentation & Message Delivery"]
        ),
        "Team Diversity": Number(criteria["Team Diversity"]),
      };

      const payload: any = {
        project_id: projectId,
        criteria: cleanCriteria,
        comment: comment || null,
        note: note || null,
      };
      if (judgeId) payload.judge_id = judgeId;

      if (feedbackId) {
        const { error } = await supabase
          .from("judge_feedback")
          .update(payload)
          .eq("id", feedbackId);
        if (error) throw error;
        toast.success("Feedback updated.");
      } else {
        const { data, error } = await supabase
          .from("judge_feedback")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setFeedbackId(data.id);
        toast.success("Feedback saved.");
      }

      // Refresh public comments panel (since comment is public)
      const { data: pub, error: pubErr } = await supabase
        .from("project_feedback_public")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (!pubErr) setPublicComments(pub || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save feedback.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || isAdminLoading || isJudgeLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Judge Review</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading…</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Only Admins or Judges see this scoring card */}
      {canScore && (
        <Card>
          <CardHeader>
            <CardTitle>Judge Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Weighted 6 Criteria Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CRITERIA.map(({ key, weight }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <Label className="text-sm font-medium text-muted-foreground">
                    {key}{" "}
                    <span className="text-xs">
                      ({Math.round(weight * 100)}%)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    className="w-16 h-8 text-center text-sm"
                    value={
                      typeof criteria[key] === "number" &&
                      !isNaN(criteria[key]!)
                        ? String(criteria[key])
                        : ""
                    }
                    onChange={(e) =>
                      setScore(key as CriteriaKey, e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            {/* Average */}
            <div className="text-sm text-muted-foreground">
              Average:{" "}
              <span className="font-semibold">
                {average !== null ? `${average} / 10` : "—"}
              </span>
            </div>

            {/* Comment (public) */}
            <div className="grid gap-2">
              <Label>Comment (public)</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share feedback visible to participants & audience"
              />
            </div>

            {/* Note (private) */}
            <div className="grid gap-2">
              <Label>Private Note (judges & admins only)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Personal note, not publicly visible"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {feedbackId ? "Update Feedback" : "Save Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ Public Comments — visible to everyone */}
      <Card>
        <CardHeader>
          <CardTitle>Public Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {publicComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {publicComments.map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="text-sm whitespace-pre-wrap">{c.comment}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Avg: {c.average_score ?? "—"} •{" "}
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
