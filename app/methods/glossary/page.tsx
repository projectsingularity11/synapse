import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { readTextArtifact } from "@/lib/data";
export const metadata = { title: "Glossary" };
export default function Glossary() {
  const content = readTextArtifact("glossary.md") ?? "";
  const terms = content.split("\n").flatMap((line) => {
    const m = line.match(/^- \*\*(.+?):\*\* (.+)$/);
    return m ? [{ term: m[1], definition: m[2] }] : [];
  });
  return (
    <>
      <PageHeader index="A WORKING VOCABULARY" title="The terms used in this study.">
        The distinctions that matter when reading a quantum memory
        experiment—and a model’s predictions about it.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <Link href="/methods">Return to methods →</Link>
          <a href="/data/glossary.md" download>
            Canonical glossary ↓
          </a>
          <Link href="/sources#S03">Official simulation source S03 →</Link>
        </div>
        <dl className="glossary-list">
          {terms.map((t) => (
            <div key={t.term} id={t.term.toLowerCase().replaceAll(" ", "-")}>
              <dt>{t.term}</dt>
              <dd>{t.definition}</dd>
            </div>
          ))}
        </dl>
        <p className="caption">
          Definitions are the project’s working vocabulary, grounded in its
          protocol and official Stim/PyMatching documentation. They do not claim
          that detector bits expose complete unknown quantum states.
        </p>
      </div>
    </>
  );
}
