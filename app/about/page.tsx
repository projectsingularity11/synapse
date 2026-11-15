import Link from "next/link";
export const metadata = {
  title: "About me — Assirem Benseddik",
  description:
    "Assirem Benseddik: sophomore, two-time TSA state champion, and an independent researcher interested in mathematics, physics, web development, CAD, and robotics.",
};
export default function About() {
  return (
    <article className="about-page">
      <span className="micro">ABOUT ME / ASSIREM BENSEDDIK</span>
      <header className="about-intro">
        <div>
          <h1>
            Assirem
            <br />
            Benseddik
          </h1>
          <p>
            I’m Assirem, a high school sophomore interested in what happens
            where mathematics, physics, and engineering meet.
          </p>
        </div>
        <div className="about-monogram" aria-hidden="true">
          Ab
        </div>
      </header>
      <section className="biography-grid">
        <h2>
          Mathematics
          <br />
          and physics
        </h2>
        <div>
          <p>
            Mathematics is central to how I approach a problem. I want to
            understand the structure underneath it: what the assumptions are,
            what follows from them, and where an explanation stops being
            convincing.
          </p>
          <p>
            I’m currently taking AP Calculus BC and AP Physics 1. My goal is to
            finish the undergraduate mathematics and physics curriculum by my
            senior year of high school.
          </p>
          <dl>
            <div>
              <dt>Current studies</dt>
              <dd>AP Calculus BC · AP Physics 1</dd>
            </div>
            <div>
              <dt>Academic goal</dt>
              <dd>
                Complete undergraduate mathematics and physics by senior year
              </dd>
            </div>
            <div>
              <dt>Research interests</dt>
              <dd>
                Quantum error correction · Machine learning · Applied
                mathematics
              </dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="biography-grid">
        <h2>Web development, CAD, and robotics</h2>
        <div>
          <p>
            My background includes web development, computer-aided design, and
            robotics. I’m drawn to projects that ask for both a strong technical
            explanation and something I can build, test, or use.
          </p>
          <p>
            I’ve won two Technology Student Association state championships, in
            biotechnology and web development. Those experiences sit alongside
            my interest in engineering: taking an open-ended question, working
            through constraints, and making the result understandable to someone
            else.
          </p>
          <p>
            Synapse brings those interests together. I wanted to investigate a
            specific question about learned quantum error decoding, then create
            a way for people to explore the evidence without hiding the
            difficult parts.
          </p>
          <Link className="editorial-link" href="/study/paper">
            Read my research <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="about-contact">
        <h2>Get in touch</h2>
        <a href="mailto:project.singularity11@gmail.com">
          project.singularity11@gmail.com ↗
        </a>
        <div
          className="portfolio-slot"
          aria-label="Portfolio link not yet available"
        >
          Portfolio —
        </div>
      </section>
    </article>
  );
}
