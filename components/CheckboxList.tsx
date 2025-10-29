"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, FileText, ListTodo } from "lucide-react";
import { cn } from "@/lib/cn"; // jeśli nie masz, zrób util z clsx+tailwind-merge

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  description?: string;
  // ikonę podaj jako komponent (np. FileText)
  icon?: IconType;
};

type Props = {
  storageKey?: string; // domyślnie "day-organizer-tomorrow"
  initial?: ChecklistItem[];
  className?: string;
};

function tomorrowKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `day-organizer-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CheckboxList({ storageKey, initial, className }: Props) {
  const key = useMemo(() => storageKey ?? tomorrowKey(), [storageKey]);
  const [items, setItems] = useState<ChecklistItem[]>(
    () =>
      initial ?? [
        { id: "1", title: "2× 90' Deep Work", done: false, icon: ListTodo },
        { id: "2", title: "Warm-up: countOccurrences()", done: false, icon: FileText },
      ]
  );
  const [newText, setNewText] = useState("");

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // persist
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, key]);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const setDesc = (id: string, description: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, description } : i)));

  const add = () => {
    const t = newText.trim();
    if (!t) return;
    setItems((prev) => [...prev, { id: String(Date.now()), title: t, done: false }]);
    setNewText("");
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input dodawania */}
      <div className="flex gap-2">
        <input
          className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                     dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Dodaj zadanie…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          className="h-10 shrink-0 rounded-[var(--radius,1rem)] border border-gray-300 px-4 text-sm
                     bg-white hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          onClick={add}
        >
          Dodaj
        </button>
      </div>

      {/* Lista */}
      <ul className="divide-y divide-gray-100 dark:divide-neutral-800 rounded-[var(--radius,1rem)] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {items.map((it) => (
          <ChecklistRow
            key={it.id}
            item={it}
            onToggle={() => toggle(it.id)}
            onChangeDesc={(v) => setDesc(it.id, v)}
            onRemove={() => remove(it.id)}
          />
        ))}
      </ul>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {doneCount}/{items.length} zrobione
      </div>
    </div>
  );
}

function ChecklistRow({
  item,
  onToggle,
  onChangeDesc,
  onRemove,
}: {
  item: ChecklistItem;
  onToggle: () => void;
  onChangeDesc: (v: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(Boolean(item.description && item.description.length));

  const Icon = item.icon;

  return (
    <li className="group">
      {/* Wiersz główny */}
      <div className="flex items-center gap-3 p-3">
        {/* Ikona po lewej (opcjonalna) */}
        {Icon ? <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" /> : <span className="h-5 w-5" />}

        {/* Custom checkbox: kwadrat 8px radius */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.done}
            onChange={onToggle}
            className="peer sr-only"
            aria-label={item.title}
          />
          <span
            className={cn(
              "grid h-5 w-5 place-items-center rounded-[8px] border transition-colors",
              "border-gray-300 bg-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500",
              "dark:border-neutral-700 dark:bg-neutral-900",
              item.done && "border-primary-500 bg-primary-500"
            )}
          >
            <Check
              className={cn(
                "h-4 w-4 text-white transition-opacity",
                item.done ? "opacity-100" : "opacity-0"
              )}
            />
          </span>
          <span className={cn("text-sm", item.done && "line-through text-gray-400")}>
            {item.title}
          </span>
        </label>

        {/* Expand/collapse opis */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="ml-auto inline-flex items-center rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
          title={open ? "Ukryj opis" : "Dodaj / pokaż opis"}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Usuń */}
        <button
          onClick={onRemove}
          className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          title="Usuń"
        >
          ×
        </button>
      </div>

      {/* Zagnieżdżenie: opis (edytowalny) */}
      {open && (
        <div className="px-3 pb-3 pl-[3.25rem]">
          <textarea
            className="w-full min-h-[72px] resize-y rounded-xl border border-gray-300 bg-white p-3 text-sm leading-5
                       placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                       dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Dodaj opis, checklistę kroków, linki…"
            value={item.description ?? ""}
            onChange={(e) => onChangeDesc(e.target.value)}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Opis zapisuje się automatycznie (localStorage).
          </div>
        </div>
      )}
    </li>
  );
}
