import Link from "next/link";
import { PaperTools } from "@/components/PaperTools";
import { getStudy, getConfirmation, getTrainingControl } from "@/lib/data";
export const metadata = {
  title: "Research paper — Learning under measurement-noise shift",
  description:
    "A detailed account of a bounded surface-code simulation: neural logical-observable decoding, measurement-noise shift, probability calibration, and an equal-budget training control.",
};
const contents = [
  ["abstract", "Abstract"],
  ["question", "01 · The question"],
  ["representation", "02 · What the model sees"],
  ["design", "03 · Experimental design"],
  ["metrics", "04 · Measuring performance"],
  ["results", "05 · Original results"],
  ["confirmation", "06 · Fresh-shot confirmation"],
  ["control", "07 · Training-noise control"],
  ["confidence", "08 · Confidence and error"],
  ["interpretation", "09 · Interpretation and limits"],
  ["reproducibility", "10 · Reproducibility"],
  ["references", "References"],
];
const pct = (p: number, d = 3) => (100 * p).toFixed(d) + "%";
export default function Paper() {
  const study = getStudy(),
    confirmation = getConfirmation(),
    control = getTrainingControl();
  return (
    <article className="paper-page">
      <div className="paper-masthead">
        <span className="micro">
          SYNAPSE / INDEPENDENT COMPUTATIONAL RESEARCH
        </span>
        <span className="micro">TECHNICAL PAPER · DISTANCE 3</span>
      </div>
      <header className="paper-title">
        <h1>
          Measurement-noise shift
          <br />
          in a learned quantum decoder
        </h1>
        <p>
          Logical prediction, probability calibration, and training-distribution
          mismatch in a simulated surface-code memory.
        </p>
        <div className="paper-authorship">
          <span>Assirem Benseddik</span>
          <span>High school sophomore · Independent project</span>
          <span>Simulation study · Not peer reviewed</span>
        </div>
      </header>
      <div className="paper-layout">
        <nav className="paper-toc" aria-label="Paper contents">
          <span className="micro">IN THIS PAPER</span>
          {contents.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
          <a
            className="editorial-link"
            href="/data/technical-report.md"
            download
          >
            Technical record ↓
          </a>
        </nav>
        <div className="paper-article">
          <section id="abstract" className="paper-abstract">
            <h2>Abstract</h2>
            <p>
              A learned decoder makes predictions from the statistical patterns
              in its training data. I investigated how a compact neural decoder
              behaves when the measurement-noise probability changes, using a
              distance-three rotated surface-code Z-memory with three rounds.
              The model receives 24 detector bits and predicts one
              logical-observable flip. A 24→32→16→1 multilayer perceptron was
              trained at measurement-flip probability 0.005 and evaluated at
              0.001, 0.005, 0.015, and 0.03, alongside fixed-prior and
              matched-prior minimum-weight perfect matching.
            </p>
            <p>
              For the predefined reporting initialization, logical error
              increased from 0.390% at the training noise to 3.660% at 0.03. A
              frozen-model confirmation on 100,000 fresh shots per setting
              produced corresponding rates of 0.390% and 3.796%. In a separate
              exploratory control with equal training budgets, matching the
              training noise to the 0.03 evaluation setting reduced seed-101
              error from 3.775% to 2.736%; matched-prior matching achieved
              1.838% on those same control shots. The matched-training
              improvement held across all three initializations at the two
              higher-noise settings, but did not hold at the lowest setting.
            </p>
            <p>
              The results support a narrow conclusion: performance depends on
              the relationship between training and evaluation noise in this
              finite-budget simulation. A sweep of a fixed model does not
              isolate a causal mismatch penalty, and high reported confidence
              does not guarantee low observed error. This study does not
              establish a general ranking of neural decoders or a result on
              quantum hardware.
            </p>
          </section>
          <section id="question">
            <h2>
              <span>01 / MOTIVATION</span>The question behind the experiment.
            </h2>
            <p>
              Quantum error correction is an inference problem as well as a
              physical one. Information is encoded across several physical
              qubits, repeated checks produce imperfect clues, and a classical
              decoder interprets those clues. Even if the code and decoder are
              held fixed, a change in the noise distribution can change what
              those clues mean.
            </p>
            <p>
              I was interested in a specific version of that problem: if a small
              neural network learns to interpret detector histories at one
              measurement-noise level, how well does it work when that
              probability changes? The point was not to build the largest
              decoder I could fit. A small model makes the experiment easier to
              reproduce and the comparisons easier to inspect. It also places an
              explicit limit on the result: a finding about this network is not
              automatically a finding about neural decoding in general.
            </p>
            <p>
              There are two related questions here. The first is descriptive:
              how do logical error and probabilistic prediction change when a
              frozen model is evaluated under different noise? The second is
              comparative: at the same evaluation noise, does a model trained at
              that noise perform differently from one trained at the original
              setting? The original sweep answers the first. The later training
              control gets closer to the second.
            </p>
            <p>
              Keeping these questions separate matters. If I increase
              measurement noise and the decoder makes more mistakes, I have
              changed both the difficulty of the problem and the relationship to
              the training distribution. Calling the entire increase a “mismatch
              cost” would claim more than that experiment identifies.
            </p>
          </section>
          <section id="representation">
            <h2>
              <span>02 / PHYSICAL TASK AND REPRESENTATION</span>Clues about an
              error are not the error itself.
            </h2>
            <p>
              The simulated system is Stim’s{" "}
              <code>surface_code:rotated_memory_z</code> circuit, with code
              distance three and three rounds. Nine data qubits carry the
              encoded information; measurement ancillas extract stabilizer
              checks. A check outcome supplies parity information without
              directly revealing an arbitrary unknown encoded quantum state. The
              simulator uses the specified circuit-level Pauli-noise channels.{" "}
              <Link href="/sources#S03">[1]</Link>
            </p>
            <p>
              A detection event is a violation of an expected relation among
              measurement records. For a repeated interior check, that often
              involves comparing outcomes at neighboring times. Initial and
              terminal detectors have boundary relations defined by the actual
              circuit. I use those exported detector declarations rather than
              assuming every detector is simply the difference of two
              consecutive ancilla measurements.
            </p>
            <p>
              Each complete simulated memory experiment produces a binary vector{" "}
              <i>x</i> ∈ {"{0,1}"}
              <sup>24</sup> and a target <i>y</i> ∈ {"{0,1}"}. The vector
              contains detector outcomes in Stim’s detector-index order. The
              target records whether logical observable zero flipped relative to
              the noiseless reference. In this circuit, that observable is
              associated with the parity of the final Z measurements on data
              qubits 1, 3, and 5.
            </p>
            <div
              className="paper-equation"
              aria-label="Model probability and classification rule"
            >
              p<sub>θ</sub>(x) = P<sub>θ</sub>(y = 1 | x), &nbsp; ŷ = 1[p
              <sub>θ</sub>(x) ≥ 0.5]
            </div>
            <p>
              The network’s job is therefore logical-observable classification.
              It does not have to reconstruct a unique physical fault, and it
              does not output a physical recovery chain. Multiple fault patterns
              can have the same effect on the logical observable. Confusing
              these tasks would make the visual explanation look more
              informative than the experiment actually is.
            </p>
            <p>
              The simulator returns detector features and observable labels
              separately. The true observable is used during supervised training
              and final scoring; it is never included in the model input.
              Detector coordinates are used only to draw the history. The
              website’s connecting lines are coordinate guides, not a recovered
              error path or a measurement of a quantum wavefunction.
            </p>
          </section>
          <section id="design">
            <h2>
              <span>03 / EXPERIMENTAL DESIGN</span>A deliberately bounded
              comparison.
            </h2>
            <h3>Noise and sampling</h3>
            <p>
              The original training and validation distributions use
              measurement-flip probability 0.005. Evaluation changes that
              parameter to 0.001, 0.005, 0.015, or 0.03 while the other
              configured noise probabilities stay at 0.001. The measurement
              parameter also affects terminal measurements in the generated
              circuit; this is not exclusively a model of ancilla-readout drift.
            </p>
            <p>
              The original dataset contains 40,000 training shots, 8,000
              validation shots, and 20,000 final-test shots per noise setting.
              Training, validation, and final tests use separate seeded streams.
              Within each evaluation setting, all competing decoders receive the
              same shots. This makes correctness comparisons paired rather than
              comparisons between unrelated test samples.
            </p>
            <h3>The learned decoder</h3>
            <p>
              The neural model is a multilayer perceptron with 24 inputs, ReLU
              hidden layers of widths 32 and 16, and one logistic output: 1,345
              trainable parameters in total. It minimizes binary log loss using
              Adam with learning rate 0.001, batch size 512, and L2
              regularization 0.0001. Training allows at most 40 epochs with
              patience eight; the selected checkpoint minimizes validation log
              loss.
            </p>
            <p>
              Three model seeds, 101, 202, and 303, vary initialization and
              shuffling while sharing the same training and validation data.
              Seed 101 was designated for primary reporting before final
              evaluation; it was not chosen because it won on the final test.
              The classification threshold stays at 0.5. Neither the checkpoint
              nor the threshold is selected using final-test performance.
            </p>
            <h3>The matching baselines</h3>
            <p>
              PyMatching supplies minimum-weight perfect matching using graphs
              derived from Stim’s detector error models.{" "}
              <Link href="/sources#S04">[2]</Link> The fixed-prior baseline
              retains the graph constructed at the training noise. The
              matched-prior baseline uses a graph built from the actual
              evaluation-noise specification. At the training setting these
              graphs coincide, so their predictions should agree.
            </p>
            <p>
              The matched-prior baseline has useful information: it is told the
              evaluation noise model. It is an informed comparator, not a blind
              system that has discovered a changed distribution. The
              implementation uses ordinary matching with graphlike
              decomposition, rather than optional correlation-aware matching.
              Exact graph matching should not be confused with exact inference
              of the full circuit posterior; decomposition and edge weighting
              can omit circuit-level dependencies.
            </p>
            <p>
              These choices define the comparison. The study contrasts a modest,
              fixed-budget learner with structured baselines under explicit
              noise knowledge. It does not control every architectural or
              informational difference between model families.
            </p>
          </section>
          <section id="metrics">
            <h2>
              <span>04 / METRICS AND UNCERTAINTY</span>Correctness and
              confidence need different measurements.
            </h2>
            <p>
              For a test set of <i>N</i> complete experiments and <i>k</i>{" "}
              incorrect logical predictions, the empirical logical error rate is{" "}
              <i>k/N</i>. It is measured per complete memory experiment, not per
              physical qubit, measurement, or correction round. That denominator
              is essential: a 3% measurement-flip probability and a 3%
              logical-error rate describe different quantities.
            </p>
            <div className="paper-equation">
              Logical error = k / N<br />
              Brier score = (1 / N) ∑<sub>i=1</sub>
              <sup>N</sup> (p<sub>i</sub> − y<sub>i</sub>)²
            </div>
            <p>
              Logical error measures the decision produced by thresholding the
              probability. The Brier score measures the squared error of the
              probability itself. These are complementary, but Brier score is
              not a pure calibration metric: it reflects how predictions
              discriminate between outcomes as well as their calibration. A
              model that usually predicts a rare label near zero can look good
              on an aggregate score while still behaving poorly on the cases
              that matter.
            </p>
            <p>
              Reliability diagrams group event probabilities into ten
              equal-width bins and compare each bin’s mean prediction with its
              observed logical-flip frequency. Empty bins supply no evidence and
              are left missing. Counts are retained because a point based on a
              handful of shots should not look as authoritative as a point based
              on thousands.
            </p>
            <p>
              Reported error intervals use the nominal 95% Wilson score interval
              with <i>z</i> ≈ 1.96. Writing r = k/N, the center is (r +
              z²/(2N))/(1 + z²/N), and the half-width is z√(r(1−r)/N +
              z²/(4N²))/(1 + z²/N). These intervals describe test-sampling
              uncertainty conditional on the fitted model and the simulation.
              They do not include new training datasets, model misspecification,
              or physical-device uncertainty. Even a zero-error sample has an
              upper interval bound above zero.
            </p>
            <p>
              The three neural seeds are shown separately. They share data, so
              pooling their errors into an apparent 60,000-shot independent
              experiment would be misleading. Likewise, pointwise
              reliability-bin intervals are not simultaneous confidence bands
              over the entire calibration curve.
            </p>
          </section>
          <section id="results">
            <h2>
              <span>05 / ORIGINAL EXPERIMENT</span>The frozen model degrades as
              noise rises.
            </h2>
            <p>
              For seed 101, neural logical error rises from 0.155% at
              measurement probability 0.001 to 3.660% at 0.03. At its training
              setting, 0.005, it makes 78 errors in 20,000 shots: 0.390%. The
              Brier score rises from 0.003374 at that setting to 0.031022 at the
              highest noise. <a href="/data/study.json">[3]</a>
            </p>
            <div
              className="table-scroll"
              role="region"
              aria-label="Original study results"
              tabIndex={0}
            >
              <table>
                <caption>
                  Original experiment · predefined seed 101 · 20,000 common test
                  shots per setting.
                </caption>
                <thead>
                  <tr>
                    <th>Measurement noise</th>
                    <th>Neural failures</th>
                    <th>Neural error</th>
                    <th>Matched MWPM</th>
                    <th>Brier</th>
                  </tr>
                </thead>
                <tbody>
                  {study?.conditions.map((c) => (
                    <tr key={c.measurementNoise}>
                      <td>{pct(c.measurementNoise, 1)}</td>
                      <td>{c.neural.failures.toLocaleString()}</td>
                      <td>{pct(c.neural.errorRate)}</td>
                      <td>{pct(c.matchedMatching.errorRate)}</td>
                      <td>{c.neural.brier.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="paper-note">
              “Matched” means the matching graph is given the evaluation-noise
              specification. Exact counts and Wilson intervals for both matching
              priors and all neural seeds remain in the{" "}
              <Link href="/study">interactive evidence</Link>.
            </p>
            <p>
              Matched-prior matching has lower observed error than the neural
              model at every tested setting. At 0.03, it makes 340 mistakes,
              compared with the neural model’s 732. Fixed-prior matching makes
              352. The difference between the two matching baselines is reported
              descriptively; this paper does not assert a significance result
              for that difference.
            </p>
            <p>
              Across the three neural initializations, high-noise failures range
              from 732 to 781. At the training noise they range from 78 to 79.
              Those ranges indicate sensitivity to the optimization run within
              this setup, but three seeds on a shared dataset are not a complete
              estimate of training uncertainty.
            </p>
            <blockquote>
              The sweep establishes degradation under changed noise. It does not
              establish how much of that degradation is caused by training
              mismatch.
            </blockquote>
            <p>
              This distinction shaped the follow-up. More corrupted measurements
              can make the task harder even for a learner trained at the new
              noise. To ask about training mismatch more directly, I needed a
              within-setting comparison, rather than a stronger interpretation
              of the original curve.
            </p>
          </section>
          <section id="confirmation">
            <h2>
              <span>06 / FRESH-SHOT CONFIRMATION</span>More test shots, with the
              model held still.
            </h2>
            <p>
              The confirmation evaluates the original frozen seed-101 checkpoint
              on 100,000 fresh shots at each of the four noise settings. There
              is no retraining, checkpoint reselection, threshold tuning, or
              probability recalibration. The configuration, protocol, and
              execution source were committed before those new labels were
              generated, and the checkpoint hash is retained. This follow-up was
              designed after the original study; it is not retroactively
              described as part of the original protocol.{" "}
              <a href="/data/confirmation.json">[4]</a>
            </p>
            <div
              className="table-scroll"
              role="region"
              aria-label="Fresh-shot confirmation results"
              tabIndex={0}
            >
              <table>
                <caption>
                  Frozen-model confirmation · 100,000 fresh shots per setting.
                </caption>
                <thead>
                  <tr>
                    <th>Measurement noise</th>
                    <th>Neural failures</th>
                    <th>Neural error</th>
                    <th>Matched failures</th>
                    <th>Matched error</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmation?.conditions.map((c) => (
                    <tr key={c.measurementNoise}>
                      <td>{pct(c.measurementNoise, 1)}</td>
                      <td>{c.neural.failures.toLocaleString()}</td>
                      <td>{pct(c.neural.errorRate)}</td>
                      <td>{c.matchedMatching.failures.toLocaleString()}</td>
                      <td>{pct(c.matchedMatching.errorRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              The qualitative pattern persists: error rises across the tested
              noise settings, and matched matching has fewer errors throughout.
              At the highest noise, the frozen neural model makes 3,796
              mistakes; matched matching makes 1,826. The larger sample reduces
              finite-test uncertainty for this particular fitted model.
            </p>
            <p>
              It does not provide an independent training replication. Reusing a
              checkpoint on more shots answers how precisely I have measured
              that checkpoint, not how broadly the result generalizes across
              possible training datasets or model designs. The original and
              confirmation datasets remain separate in the evidence pages.
            </p>
          </section>
          <section id="control">
            <h2>
              <span>07 / EXPLORATORY TRAINING-NOISE CONTROL</span>Change the
              training, keep the test fixed.
            </h2>
            <p>
              The training-control follow-up fits new networks at each of the
              four measurement-noise probabilities. Each training group receives
              40,000 training and 8,000 validation shots, the same architecture
              and optimization rules, and the same three initialization seeds.
              All twelve validation-selected checkpoints are frozen before
              drawing fresh final tests. At each evaluation setting, every
              compared decoder sees the same 100,000 new test shots.{" "}
              <a href="/data/training-control.json">[5]</a>
            </p>
            <p>
              “Fixed training” uses the new 0.005 training group across all
              evaluations. “Matched training” uses the group trained at the
              known evaluation probability. These are newly fitted models, not
              the original checkpoint. At evaluation probability 0.005, the
              fixed and matched procedures identify the same models; identical
              predictions there provide an internal identity check.
            </p>
            <div
              className="table-scroll"
              role="region"
              aria-label="Equal-budget training control results"
              tabIndex={0}
            >
              <table>
                <caption>
                  Training control · seed 101 · failures per 100,000 common
                  evaluation shots.
                </caption>
                <thead>
                  <tr>
                    <th>Evaluation noise</th>
                    <th>Fixed training</th>
                    <th>Matched training</th>
                    <th>Matched MWPM</th>
                  </tr>
                </thead>
                <tbody>
                  {control?.conditions.map((c) => {
                    const seed = c.seeds.find((s) => s.seed === 101);
                    return seed ? (
                      <tr key={c.measurementNoise}>
                        <td>{pct(c.measurementNoise, 1)}</td>
                        <td>{seed.fixedTraining.failures.toLocaleString()}</td>
                        <td>
                          {seed.matchedTraining.failures.toLocaleString()}
                        </td>
                        <td>{c.matchedMatching.failures.toLocaleString()}</td>
                      </tr>
                    ) : null;
                  })}
                </tbody>
              </table>
            </div>
            <p>
              At 0.03, seed 101 moves from 3,775 fixed-training errors to 2,736
              matched-training errors on the same 100,000 shots, a reduction of
              1.039 percentage points. Both error and Brier score improve for
              every initialization at the two higher-noise settings. At 0.001,
              however, matched training produces more classification errors for
              all three initializations; Brier changes are mixed. Matching the
              training probability is not an automatic improvement under a
              finite sample and optimization budget.
            </p>
            <p>
              This is a more direct procedural contrast because evaluation
              difficulty is held constant within each pair. Architecture,
              budget, threshold, and test shots are also held fixed. But the
              training samples differ between noise groups, there is only one
              train/validation realization per group, and optimization is
              finite. The comparison therefore combines changes in training
              distribution with changes in the realized training data and
              learned parameters. It is not a universal causal decomposition of
              mismatch.
            </p>
            <p>
              The matched learner is also told the evaluation probability. The
              experiment does not demonstrate online drift detection or
              automatic adaptation. Those would require a method for identifying
              the changed distribution, a rule for updating the model, and an
              evaluation that includes the cost and uncertainty of both.
            </p>
          </section>
          <section id="confidence">
            <h2>
              <span>08 / POST-HOC CONFIDENCE DIAGNOSTICS</span>A confident
              answer can still be a wrong answer.
            </h2>
            <p>
              The neural output estimates the probability of a logical flip.
              Classification confidence is a different quantity: c = max(p,
              1−p). A prediction with p = 0.001 has low event probability but
              high confidence in the “no flip” class. These quantities should
              not be combined into a single ambiguous “confidence” axis.
            </p>
            <p>
              The diagnostic supplement examines class balance, confusion
              counts, event-probability calibration, confidence groups, and
              selective risk using retained original and confirmation records.
              It does not generate new independent test evidence. Its thresholds
              were fixed for this descriptive analysis after the original
              results were known; they are not a tuned deployment policy.{" "}
              <a href="/data/diagnostics.json">[6]</a>
            </p>
            <p>
              At 3% noise in the confirmation data, requiring classification
              confidence of at least 0.99 retains 83,087 of 100,000 shots, or
              83.087% coverage. There are 1,178 errors among the retained
              predictions, giving about 1.418% selective error. Their mean
              confidence is about 99.84%, while their observed accuracy is about
              98.58%. High confidence therefore does not guarantee the accuracy
              its numerical value might suggest.
            </p>
            <p>
              Coverage is the retained fraction of all shots. Selective risk is
              the error fraction within those retained shots. A lower selective
              risk must be read alongside the discarded fraction; refusing
              difficult cases can change the population being evaluated.
              Threshold groups overlap, so they are not independent experiments.
              The public diagnostics preserve group counts and pointwise
              intervals rather than showing an isolated attractive percentage.
            </p>
            <p>
              The reliability diagrams also have sparse intermediate bins. A
              visually large gap can come from a small number of observations,
              and a low aggregate score can conceal behavior on rare labels. I
              do not report an exact Brier decomposition from these coarsened
              bins: replacing individual probabilities with bin averages changes
              the predictions and requires additional residual terms.
            </p>
          </section>
          <section id="interpretation">
            <h2>
              <span>09 / INTERPRETATION</span>What I think the evidence
              supports.
            </h2>
            <p>
              The central observation is straightforward: this compact neural
              model makes more logical errors under the tested increases in
              measurement noise. A separate control shows that training at the
              known higher evaluation noise improves the learned procedure under
              the matched finite budgets used here. Matching still performs
              better in observed logical error. At lower noise, matched training
              is not consistently better even though the training and evaluation
              probabilities agree.
            </p>
            <p>
              I find the negative result useful. The network did not have to
              outperform matching for the experiment to reveal something. The
              comparison shows why a plausible intuition—train on the right
              distribution and performance should improve—needs to be tested
              under actual sample, capacity, and optimization constraints. The
              low-noise counterexample is part of the finding, not an
              inconvenient setting to remove.
            </p>
            <h3>Limits of the simulated system</h3>
            <p>
              The study covers one code distance, three rounds, one memory
              basis, one observable, and a narrow family of Pauli-noise
              configurations. It does not estimate an error-correction
              threshold, demonstrate scaling with distance, or capture every
              feature of physical noise. Leakage, long-range correlations,
              device drift, and hardware-specific measurement behavior would
              need their own modeling and validation.
            </p>
            <h3>Limits of the learning experiment</h3>
            <p>
              The model is small, and three initializations share each group’s
              realized training data. A different architecture, additional
              training data, different regularization, or a mixed-noise
              objective might change the result. I have not tested those
              alternatives here. The next meaningful replication would vary
              entire training, validation, and test datasets, not simply add
              more initializations to one shared sample.
            </p>
            <h3>Limits of the claims</h3>
            <p>
              This is not a reproduction of AlphaQubit or another published
              neural-decoder system. It makes no claim of quantum computational
              advantage or hardware-ready latency. The recorded CPU
              batch-throughput timing excludes sampling, I/O, and browser work;
              an amortized time per shot is not a measured single-shot decoder
              latency. Published neural-decoder papers are listed as background
              reading, but their content was not verified in the retained
              research record, so I do not use paper-specific performance claims
              to position this result.
            </p>
            <p>
              A stronger next study would combine independent dataset
              replications with longer memories, distance scaling, mixed-noise
              training, and correlation-aware baselines under explicit budgets.
              Those are future experiments. They should be described as
              completed only after their protocols, outputs, and uncertainty can
              be inspected.
            </p>
          </section>
          <section id="reproducibility">
            <h2>
              <span>10 / REPRODUCIBILITY AND RECORD</span>The evidence should
              survive the presentation.
            </h2>
            <p>
              The original study, frozen-model confirmation, and training
              control contain 880,000 distinct final-test shots in total.
              Post-hoc diagnostics and repeated evaluation by different decoders
              do not add independent shots. The three studies retain their own
              run identities and are not pooled into a single headline
              performance estimate.
            </p>
            <p>
              Manifests record configuration and source hashes, package
              versions, sampling seeds, split definitions, model architecture,
              selection rules, checkpoint hashes where relevant, and completion
              status. The original protocol predates its final evaluation. The
              confirmation and training-control protocols predate their fresh
              final labels but follow earlier results; their chronology remains
              explicit.
            </p>
            <p>
              The website reads small saved outputs. It does not retrain a model
              or sample quantum circuits when a visitor moves a slider.
              Representative replay records are the first eight test shots per
              condition, selected without searching their labels. A separate
              failure gallery is handpicked and labeled; its examples cannot
              estimate failure prevalence.
            </p>
            <p>
              The long-form explanation here interprets the retained technical
              record. The experiment scripts, original counts, detector
              declarations, and machine-readable manifests remain the source for
              numerical auditing. A visual effect should make a question easier
              to enter. It should never become an additional scientific claim.
            </p>
            <div className="paper-resource-links">
              <a href="/data/study.json">Original results ↗</a>
              <a href="/data/manifest.json">Original manifest ↗</a>
              <a href="/data/confirmation.json">Confirmation ↗</a>
              <a href="/data/training-control.json">Training control ↗</a>
              <Link href="/methods/circuit">Circuit & detector model ↗</Link>
            </div>
          </section>
          <section id="references">
            <h2>References and underlying records.</h2>
            <ol className="references">
              <li>
                Gidney, C., and contributors.{" "}
                <a href="https://github.com/quantumlib/Stim">
                  Stim: official repository and circuit documentation
                </a>
                . The retained source notes identify the simulator paper,{" "}
                <i>Quantum</i> 5, 497 (2021), DOI 10.22331/q-2021-07-06-497.{" "}
                <Link href="/sources#S03">Source record S03.</Link>
              </li>
              <li>
                Higgott, O., Gidney, C., and contributors.{" "}
                <a href="https://github.com/oscarhiggott/PyMatching">
                  PyMatching: official repository and decoding documentation
                </a>
                . <Link href="/sources#S04">Source record S04.</Link>
              </li>
              <li>
                Synapse computational record.{" "}
                <a href="/data/study.json">
                  Original distance-three memory study
                </a>
                , with <a href="/data/protocol.md">protocol</a> and{" "}
                <a href="/data/supplement.json">paired-outcome supplement</a>.
                Original run <code>{study?.runId}</code>.
              </li>
              <li>
                Synapse computational record.{" "}
                <a href="/data/confirmation.json">
                  Fresh-shot frozen-model confirmation
                </a>
                . The frozen checkpoint, protocol chronology, and disjoint test
                streams are retained in its manifest.
              </li>
              <li>
                Synapse computational record.{" "}
                <a href="/data/training-control.json">
                  Exploratory equal-budget training-noise control
                </a>
                , with <a href="/data/training-control-protocol.md">protocol</a>{" "}
                and <a href="/data/training-control-note.md">result note</a>.
              </li>
              <li>
                Synapse computational record.{" "}
                <a href="/data/diagnostics.json">
                  Post-hoc class-balance, calibration, confidence, and
                  selective-risk diagnostics
                </a>
                . <a href="/data/diagnostics-note.md">Definitions and scope.</a>
              </li>
            </ol>
            <p className="paper-note">
              For the complete source ledger, verification status, and
              background-reading links, see <Link href="/sources">Sources</Link>
              . The original research artifacts retain the SYNDROME run name;
              Synapse is the public project name.
            </p>
          </section>
        </div>
        <aside
          className="paper-margin-notes"
          aria-label="Reading tools and study configuration"
        >
          <PaperTools />
        </aside>
      </div>
    </article>
  );
}
