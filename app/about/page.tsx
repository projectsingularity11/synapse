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
            I’m Assirem, a high school sophomore studying mathematics and
            physics while building projects in web development, CAD, and
            robotics.
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
            My background in mathematics shapes how I approach a technical
            problem. I want to understand the assumptions behind a method and
            what happens when those assumptions stop holding, which is the
            question that led me to this project.
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
            My goal for Synapse is to make the reasoning open to inspection. I
            want readers to be able to follow the question, examine the saved
            experiments, and reach their own view of what the evidence supports.
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
