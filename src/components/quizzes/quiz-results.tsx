import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuestionWithOptions } from "@/lib/data/quizzes";
import type { Tables } from "@/types";

interface Props {
  quiz: Tables<"quizzes">;
  attempt: Tables<"quiz_attempts">;
  entries: QuestionWithOptions[];
}

function normalizeAnswers(raw: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = [v];
    else if (Array.isArray(v)) {
      out[k] = v.filter((x): x is string => typeof x === "string");
    }
  }
  return out;
}

export function QuizResults({ quiz, attempt, entries }: Props) {
  const answers = normalizeAnswers(attempt.answers_json);

  const totalPoints = entries.reduce(
    (sum, e) => sum + Number(e.question.points),
    0,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attempt.passed === true && (
            <Alert variant="success">You passed.</Alert>
          )}
          {attempt.passed === false && (
            <Alert variant="error">You did not pass.</Alert>
          )}

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <Stat
              label="Score"
              value={`${attempt.score ?? 0} / ${totalPoints}`}
            />
            <Stat
              label="Percent"
              value={`${attempt.score_percent ?? 0}%`}
            />
            {quiz.pass_percent != null && (
              <Stat label="Pass mark" value={`${quiz.pass_percent}%`} />
            )}
          </dl>
        </CardContent>
      </Card>

      {quiz.show_results_immediately && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Question breakdown
          </h2>
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <QuestionBreakdown
                key={entry.question.id}
                entry={entry}
                index={index}
                selectedOptionIds={answers[entry.question.id] ?? []}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function QuestionBreakdown({
  entry,
  index,
  selectedOptionIds,
}: {
  entry: QuestionWithOptions;
  index: number;
  selectedOptionIds: string[];
}) {
  const { question, options } = entry;
  const selectedSet = new Set(selectedOptionIds);
  const correctSet = new Set(
    options.filter((o) => o.is_correct).map((o) => o.id),
  );
  const isMulti = question.question_type === "multi_select";
  const wasCorrect = isMulti
    ? selectedSet.size === correctSet.size &&
      [...selectedSet].every((id) => correctSet.has(id)) &&
      correctSet.size > 0
    : selectedOptionIds.length === 1 && correctSet.has(selectedOptionIds[0]);

  return (
    <li className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Question {index + 1}
      </p>
      <p className="mt-1 font-medium">{question.question_text}</p>

      <ul className="mt-3 space-y-1.5">
        {options.map((option) => {
          const isSelected = selectedSet.has(option.id);
          const isCorrect = option.is_correct;
          const tone = isCorrect
            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
            : isSelected
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
              : "border-black/10 dark:border-white/10";
          return (
            <li
              key={option.id}
              className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${tone}`}
            >
              <span>{option.option_text}</span>
              <span className="text-xs">
                {isCorrect && "Correct answer"}
                {!isCorrect && isSelected && "Your answer"}
              </span>
            </li>
          );
        })}
      </ul>

      {!wasCorrect && question.explanation && (
        <p className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {question.explanation}
        </p>
      )}
    </li>
  );
}
