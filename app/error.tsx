"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-body">
      <p className="eyebrow">A READING INTERRUPTED</p>
      <h1>The signal did not arrive.</h1>
      <p>
        The page could not load its research record. Try again or return to the
        introduction.
      </p>
      <div className="data-links">
        <button className="control-button" onClick={reset}>
          Try again
        </button>
        <Link href="/">Return home →</Link>
      </div>
    </div>
  );
}
