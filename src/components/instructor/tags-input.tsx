"use client";

import { useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  defaultTags?: string[];
  inputId?: string;
}

export function TagsInput({ defaultTags = [], inputId = "tags-input" }: Props) {
  const [tags, setTags] = useState<string[]>(() =>
    [...new Set(defaultTags.map((t) => t.trim()).filter(Boolean))],
  );
  const [draft, setDraft] = useState("");

  function add() {
    const next = draft.trim().replace(/,+$/, "");
    if (!next) return;
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setDraft("");
  }

  function remove(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      // Backspace on empty input removes the last chip — common pattern.
      event.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      {/* One hidden input per tag — server reads via formData.getAll("tag") */}
      {tags.map((tag) => (
        <input key={tag} type="hidden" name="tag" value={tag} />
      ))}

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                className="text-zinc-500 hover:text-red-600 dark:text-zinc-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a tag and press Enter"
          className="flex-1"
        />
        <Button
          type="button"
          onClick={add}
          variant="secondary"
          size="md"
          disabled={draft.trim().length === 0}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
