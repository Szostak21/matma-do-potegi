import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import type {
  LegalBlock,
  LegalDocumentContent,
  LegalListItem,
} from "@/lib/legal/types";

type LegalDocumentProps = {
  doc: LegalDocumentContent;
};

function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-medium text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function LegalListItemContent({ item }: { item: LegalListItem }) {
  return (
    <>
      <span>{renderInlineBold(item.text)}</span>
      {item.subItems && item.subItems.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {item.subItems.map((subItem) => (
            <li key={subItem}>{renderInlineBold(subItem)}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.kind === "paragraph") {
    return (
      <p className="text-sm leading-relaxed text-ink/70">
        {renderInlineBold(block.text)}
      </p>
    );
  }

  const ListTag = block.ordered ? "ol" : "ul";
  const listClassName = block.ordered
    ? "list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink/70"
    : "list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/70";

  return (
    <ListTag className={listClassName}>
      {block.items.map((item) => (
        <li key={item.text}>
          <LegalListItemContent item={item} />
        </li>
      ))}
    </ListTag>
  );
}

export function LegalDocument({ doc }: LegalDocumentProps) {
  return (
    <>
      <header>
        <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-xs text-ink/50">
          Ostatnia aktualizacja: {doc.updatedAt}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">{doc.intro}</p>
      </header>

      <div className="mt-8 space-y-6">
        {doc.sections.map((section) => (
          <Card key={section.title}>
            <h2 className="font-serif text-xl text-ink">{section.title}</h2>
            <div className="mt-4 space-y-4">
              {section.blocks.map((block, index) => (
                <LegalBlockView key={`${section.title}-${index}`} block={block} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
