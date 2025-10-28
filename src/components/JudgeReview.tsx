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

type CriteriaKey = "Criteria 1" | "Criteria 2" | "Criteria 3" | "Criteria 4";
type CriteriaObj = Partial<Record<CriteriaKey, number>>;

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
    "Criteria 1": undefined,
    "Criteria 2": undefined,
    "Criteria 3": undefined,
    "Criteria 4": undefined,
  });
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");

  // For update
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  // Public comments list
  const [publicComments, setPublicComments] = useState<PublicComment[]>([]);

  const average = useMemo(() => {
    const vals = (Object.values(criteria) as Array<number | undefined>).filter(
      (v): v is number => typeof v === "number" && !isNaN(v)
    );
    if (!vals.length) return null;
    return (
      Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
    );
  }, [criteria]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Current judge
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes?.user?.id ?? null;
        setJudgeId(uid);

        // Load my existing feedback (so I can edit)
        if (uid) {
          const { data: my, error: myErr } = await supabase
            .from("judge_feedback")
            .select("*")
            .eq("project_id", projectId)
            .eq("judge_id", uid)
            .maybeSingle();

          if (myErr) throw myErr;

          if (my) {
            setFeedbackId(my.id);
            // criteria JSON → fields
            const c = my.criteria || {};
            setCriteria({
              "Criteria 1": isFinite(Number(c["Criteria 1"]))
                ? Number(c["Criteria 1"])
                : undefined,
              "Criteria 2": isFinite(Number(c["Criteria 2"]))
                ? Number(c["Criteria 2"])
                : undefined,
              "Criteria 3": isFinite(Number(c["Criteria 3"]))
                ? Number(c["Criteria 3"])
                : undefined,
              "Criteria 4": isFinite(Number(c["Criteria 4"]))
                ? Number(c["Criteria 4"])
                : undefined,
            });
            setComment(my.comment ?? "");
            setNote(my.note ?? "");
          }
        }

        // Load public comments for this project
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
  }, [projectId]);

  const setScore = (key: CriteriaKey, raw: string) => {
    const v = raw === "" ? undefined : Math.max(0, Math.min(10, Number(raw)));
    setCriteria((prev) => ({
      ...prev,
      [key]: isFinite(Number(v)) ? Number(v) : undefined,
    }));
  };

  const validate = () => {
    for (const k of [
      "Criteria 1",
      "Criteria 2",
      "Criteria 3",
      "Criteria 4",
    ] as CriteriaKey[]) {
      const v = criteria[k];
      if (typeof v !== "number" || isNaN(v))
        return "Please score all criteria (0–10).";
      if (v < 0 || v > 10) return "Scores must be between 0 and 10.";
    }
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (!projectId) return;

    setSaving(true);
    try {
      const cleanCriteria: Record<string, number> = {
        "Criteria 1": Number(criteria["Criteria 1"]),
        "Criteria 2": Number(criteria["Criteria 2"]),
        "Criteria 3": Number(criteria["Criteria 3"]),
        "Criteria 4": Number(criteria["Criteria 4"]),
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

  if (loading) {
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
      <Card>
        <CardHeader>
          <CardTitle>Judge Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                "Criteria 1",
                "Criteria 2",
                "Criteria 3",
                "Criteria 4",
              ] as CriteriaKey[]
            ).map((k) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <Label className="text-sm font-medium text-muted-foreground">
                  {k}
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  className="w-16 h-8 text-center text-sm"
                  value={
                    typeof criteria[k] === "number" && !isNaN(criteria[k]!)
                      ? String(criteria[k])
                      : ""
                  }
                  onChange={(e) => setScore(k, e.target.value)}
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

      {/* Public comments panel */}
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
