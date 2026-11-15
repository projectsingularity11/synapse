import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-body">
      <p className="eyebrow">404 / NO SIGNAL HERE</p>
      <h1>Trace not found.</h1>
      <p>This address does not identify a page in the study.</p>
      <Link href="/" className="button">
        Return to the instrument →
      </Link>
    </div>
  );
}
