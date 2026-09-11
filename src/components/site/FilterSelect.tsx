"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FilterSelect({
  value,
  onChange,
  options,
  label,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={`inline-flex items-center justify-between gap-2 rounded-[12px] border border-line bg-[#fffefa] px-[15px] text-[11px] text-[#657058] outline-none transition-colors hover:border-[#abb59b] focus-visible:outline-[3px] focus-visible:outline-[#a4b98b] ${className}`}
        style={{ height: 57 }}
      >
        <span className="truncate">{current?.label ?? "Select"}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-[#808d6e]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onSelect={() => onChange(o.value)}
            className="text-[12px]"
          >
            <span className="flex-1">{o.label}</span>
            {o.value === value && <CheckIcon className="size-4 text-[#5f7943]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
