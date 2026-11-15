"""Export shareable figures from validated saved results; no new experiment."""
import hashlib
import json
import os
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", "/tmp/syndrome-matplotlib")
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

RESULTS = Path(__file__).resolve().parents[2] / "results"
OUT = RESULTS / "figures"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.spines.top": False,
                     "axes.spines.right": False, "axes.labelcolor": "#27312f", "text.color": "#27312f",
                     "axes.edgecolor": "#9da8a3", "xtick.color": "#52615b", "ytick.color": "#52615b",
                     "svg.fonttype": "none", "pdf.fonttype": 42, "savefig.facecolor": "white"})


def save(fig, name, title, description):
    for ext in ["svg", "png", "pdf"]:
        meta = {"Title": title, "Description": description} if ext == "svg" else {"Title": title} if ext == "pdf" else {"Title": title, "Description": description}
        fig.savefig(OUT / f"{name}.{ext}", dpi=180, bbox_inches="tight", metadata=meta)
    plt.close(fig)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    study_path = RESULTS / "aggregates" / "study.json"
    extra_path = RESULTS / "aggregates" / "supplement.json"
    study = json.loads(study_path.read_text())
    extra = json.loads(extra_path.read_text())
    assert extra["parentRunId"] == study["runId"]
    rid = study["runId"]
    fig, ax = plt.subplots(figsize=(8.8, 5.6))
    fig.subplots_adjust(bottom=.27, top=.85)
    fig.suptitle("When the measurement noise changes", fontsize=19, fontweight="bold", x=.12, ha="left")
    ax.set_title("Logical-observable prediction error · distance 3 · Z memory · 3 rounds", fontsize=10, loc="left", pad=15)
    colors = ["#32666a", "#7c5494", "#bd592f"]
    keys = ["neural", "fixedMatching", "matchedMatching"]
    names = ["Neural (seed 101)", "MWPM, fixed training prior", "MWPM, matched evaluation prior"]
    x = np.array([c["measurementNoise"] for c in study["conditions"]]) * 100
    for key, label, color, marker in zip(keys, names, colors, ["o", "s", "^"]):
        metrics = [c[key] for c in study["conditions"]]
        y = np.array([m["errorRate"] for m in metrics]) * 100
        ci = np.array([m["ci95"] for m in metrics]) * 100
        ax.errorbar(x, y, yerr=np.array([y - ci[:, 0], ci[:, 1] - y]), label=label, color=color, marker=marker,
                    linewidth=1.5, markersize=5, capsize=3, elinewidth=.9)
    ax.axvline(.5, color="#9da8a3", linewidth=.8, linestyle=":")
    ax.text(.53, 3.15, "Training pₘ = 0.5%", fontsize=9, color="#52615b")
    ax.set_xlabel("Measurement-flip probability pₘ (%)")
    ax.set_ylabel("Logical prediction error per complete experiment (%)")
    ax.set_ylim(bottom=0)
    ax.grid(axis="y", color="#e3e8e5", linewidth=.7)
    ax.legend(frameon=False, fontsize=9, loc="upper left")
    caption = ("20,000 shots per setting, shared across decoders. Bars: pointwise 95% Wilson intervals.\n"
               "Lines connect discrete evaluated settings only; no intermediate measurements. Matched-prior MWPM\n"
               "knows the test noise model. Measurement flips include final data readout. Source: " + rid)
    fig.text(.12, .055, caption, fontsize=8, va="bottom", linespacing=1.5)
    save(fig, "logical-error-sweep", "SYNDROME | Logical prediction error under measurement-noise shift", caption)

    fig, axes = plt.subplots(2, 2, figsize=(9.4, 7.8), sharex="col", gridspec_kw={"height_ratios": [3, 1]})
    fig.subplots_adjust(bottom=.24, top=.84, hspace=.12, wspace=.2)
    fig.suptitle("Probability is a claim. Calibration tests it.", fontsize=19, fontweight="bold", x=.12, ha="left")
    for column, p, title, color in [(0, .005, "Training distribution · pₘ = 0.5%", "#32666a"), (1, .03, "Shifted distribution · pₘ = 3%", "#bd592f")]:
        condition = next(c for c in extra["conditions"] if c["measurementNoise"] == p)
        bins = condition["reliability"]
        occupied = [b for b in bins if b["count"]]
        ax = axes[0, column]
        ax.plot([0, 1], [0, 1], linestyle="--", linewidth=.8, color="#89958f", label="Ideal calibration")
        means = np.array([b["meanPrediction"] for b in occupied])
        freq = np.array([b["observedFrequency"] for b in occupied])
        ci = np.array([b["observedFrequencyCi95"] for b in occupied])
        ax.errorbar(means, freq, yerr=np.array([freq-ci[:, 0], ci[:, 1]-freq]), fmt="o", capsize=2.5,
                    markersize=5, color=color, label="Observed (seed 101)", elinewidth=1)
        ax.set_title(title, fontsize=10, loc="left", pad=12)
        ax.set(xlim=(-.025, 1.025), ylim=(-.025, 1.025), aspect="equal")
        ax.grid(color="#e3e8e5", linewidth=.6)
        if column == 0:
            ax.set_ylabel("Observed fraction with observable flip")
            ax.legend(frameon=False, fontsize=8, loc="upper left")
        bar = axes[1, column]
        centers = np.array([(b["lower"]+b["upper"])/2 for b in bins])
        counts = [b["count"] for b in bins]
        bar.bar(centers, counts, width=.075, color=color, alpha=.85)
        bar.set_yscale("log")
        bar.set_ylim(1, 35000)
        bar.set_yticks([1, 100, 10000], ["1", "100", "10k"])
        bar.set_xlabel("Predicted probability of observable flip")
        if column == 0:
            bar.set_ylabel("Bin count\n(log scale)")
    caption = ("Fixed bins [0, 0.1), …, [0.9, 1]; 20,000 test shots per panel. Empty bins omitted, never shown as zero.\n"
               "Dots: bin mean predicted probability versus observed flip fraction. Bars: pointwise 95% Wilson\n"
               "intervals on the observed fraction, not simultaneous confidence bands. Bin counts are shown below.\n"
               "This is event-probability calibration, not confidence-in-correctness. Source: " + rid)
    fig.text(.12, .055, caption, fontsize=8, va="bottom", linespacing=1.5)
    save(fig, "calibration", "SYNDROME | Neural event-probability calibration and bin counts", caption)
    manifest = {"parentRunId": rid, "generator": "research/experiments/scripts/plot.py", "method": "Saved aggregates only; no new measurements",
                "inputs": {str(p.relative_to(RESULTS.parent.parent)): hashlib.sha256(p.read_bytes()).hexdigest() for p in [study_path, extra_path]},
                "scriptSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), "matplotlibVersion": matplotlib.__version__,
                "outputs": {p.name: {"sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "bytes": p.stat().st_size} for p in sorted(OUT.glob("*")) if p.suffix in [".svg", ".png", ".pdf"]}}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"figures": list(manifest["outputs"]), "parentRunId": rid}))


if __name__ == "__main__":
    main()
