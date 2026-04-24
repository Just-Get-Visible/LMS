"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createPostAction,
  type PostActionState,
} from "@/lib/actions/discussions";

const initialState: PostActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Posting..." : label}
    </Button>
  );
}

interface Props {
  threadId: string;
  parentPostId?: string | null;
  isLocked?: boolean;
  placeholder?: string;
}

export function PostComposer({
  threadId,
  parentPostId,
  isLocked,
  placeholder,
}: Props) {
  const [state, action] = useActionState(createPostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  if (isLocked) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        This thread is locked. New replies are disabled.
      </p>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="thread_id" value={threadId} />
      {parentPostId && (
        <input type="hidden" name="parent_post_id" value={parentPostId} />
      )}

      {state.status === "error" && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <Textarea
        name="body"
        required
        rows={parentPostId ? 2 : 4}
        placeholder={placeholder ?? (parentPostId ? "Write a reply..." : "Start the conversation...")}
      />
      <div className="flex justify-end">
        <SubmitButton label={parentPostId ? "Reply" : "Post"} />
      </div>
    </form>
  );
}
