export type LegalListItem = {
  text: string;
  subItems?: string[];
};

export type LegalBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: LegalListItem[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocumentContent = {
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
};
