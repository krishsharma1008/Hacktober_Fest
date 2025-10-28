import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Row = {
  id: string;
  project_id: string;
  judge_id: string;
  criteria: Record<string, number> | null;
  average_score: number | null;
  comment: string | null;
  note: string | null;
  created_at: string;
  overall_average: number | null;
};

export default function AdminFeedbackPanel({
  projectId,
}: {
  projectId: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const overallAverage = useMemo(
    () => rows[0]?.overall_average ?? null,
    [rows]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_project_feedback_admin", {
        p_project_id: projectId,
      });
      if (!error) setRows(data ?? []);
      setLoading(false);
    })();
  }, [projectId]);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Judge Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading…</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Overall average (all judges):
              </div>
              <div className="text-xl font-semibold">
                {overallAverage ?? "—"}
              </div>
              <Badge variant="outline">{rows.length} judge(s)</Badge>
            </div>

            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No judge feedback yet.
              </p>
            ) : (
              <div className="space-y-4">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        Judge: <span className="font-mono">{r.judge_id}</span>
                      </div>
                      <div className="text-sm">
                        Avg:{" "}
                        <span className="font-semibold">
                          {r.average_score ?? "—"}
                        </span>
                      </div>
                    </div>

                    {r.criteria && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(r.criteria).map(([name, val]) => (
                          <Badge key={name} variant="secondary">
                            {name}: {val}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {r.comment && (
                      <div className="mt-3">
                        <div className="text-xs uppercase text-muted-foreground">
                          Comment (public)
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {r.comment}
                        </div>
                      </div>
                    )}

                    {r.note && (
                      <div className="mt-3">
                        <div className="text-xs uppercase text-muted-foreground">
                          Note (private)
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {r.note}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
