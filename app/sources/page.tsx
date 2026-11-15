import { PageHeader } from "@/components/PageHeader";
import { readArtifact, type Source } from "@/lib/data";
export const metadata = { title: "Sources & claim provenance" };
export default function Sources() {
  const sources = readArtifact<Source[]>("sources/sources.json") ?? [];
  const claims =
    readArtifact<
      {
        id: string;
        claim: string;
        sourceIds: string[];
        category: string;
        status: string;
        site: string;
      }[]
    >("claims/claims.json") ?? [];
  return (
    <>
      <PageHeader index="THE READING ROOM / 05" title="Sources and exact claims.">
        Primary research, official software documentation, and a claim ledger.
        Published achievements and this project’s measurements belong to
        separate records.
      </PageHeader>
      <div className="page-body">
        <div className="notice">
          Access and verification status are recorded per source. A
          bibliographic record alone is not evidence that the full paper was
          read. This small study does not reproduce AlphaQubit or inherit its
          published results.
        </div>
        <div className="data-links">
          <a href="/data/claims.csv" download>
            Download claim ledger ↓
          </a>
          <a href="/data/literature-review.md">Full literature review ↓</a>
          <a href="/data/sources.json" download>
            Source records ↓
          </a>
        </div>
        <ol className="source-list">
          {sources.map((s) => (
            <li id={s.id} key={s.id}>
              <span className="source-id">
                {s.id} / {s.type}
              </span>
              <h2>
                <a href={s.url}>{s.title} →</a>
              </h2>
              <p>
                {Array.isArray(s.authors) ? s.authors.join(", ") : s.authors} ·{" "}
                {s.date ?? "Date not specified"}
              </p>
              <p>{s.relevance}</p>
              <p>
                <strong>Verification:</strong>{" "}
                {typeof s.verification === "string"
                  ? s.verification
                  : JSON.stringify(s.verification)}
              </p>
              <p>
                Access record: {s.accessDate}. Quantitative cross-paper
                comparisons are not made without matched experimental context.
              </p>
            </li>
          ))}
        </ol>
        <section id="claims" className="figure-section">
          <span className="eyebrow">CLAIM LEDGER / EXACT WORDING</span>
          <h2>Check each claim.</h2>
          <p className="muted">
            Each record links to its evidence and public context. Pending paper
            verification is a limitation, not a published finding adopted by
            this project.
          </p>
          <div
            className="table-scroll"
            role="region"
            aria-label="Claim provenance table"
            tabIndex={0}
          >
            <table>
              <caption>Canonical claim IDs from the repository ledger</caption>
              <thead>
                <tr>
                  <th>ID / category</th>
                  <th>Exact claim</th>
                  <th>Evidence</th>
                  <th>Status / context</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} id={c.id}>
                    <th>
                      {c.id}
                      <br />
                      <span className="caption">{c.category}</span>
                    </th>
                    <td>{c.claim}</td>
                    <td>
                      {c.sourceIds.map((id) => (
                        <a key={id} href={`#${id}`} className="claim-source">
                          {id}{" "}
                        </a>
                      ))}
                    </td>
                    <td>
                      {c.status}
                      <br />
                      <a href={c.site}>View public context →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {sources.length === 0 && (
          <p className="empty">
            Source audit pending. No unverified citation details are filled in.
          </p>
        )}
      </div>
    </>
  );
}
