"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

export type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink/10 rounded-3xl bg-white/70 shadow-soft ring-1 ring-ink/5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `accordion-panel-${index}`;
        const triggerId = `accordion-trigger-${index}`;

        return (
          <div key={item.question}>
            <button
              type="button"
              id={triggerId}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="font-medium text-ink">{item.question}</span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-ink/50 transition-transform duration-300 ease-in-out",
                  isOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "px-6 pb-5 text-sm leading-relaxed text-ink/70 transition-opacity duration-300 ease-in-out motion-reduce:transition-none",
                    isOpen ? "opacity-100" : "opacity-0",
                  )}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
