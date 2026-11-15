"""Original follow-up publication figures; preserves all original figure exports."""
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", "/tmp/syndrome-matplotlib")
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import numpy as np

RESULTS = Path(__file__).resolve().parents[2] / "results"
ROOT = RESULTS.parents[1]
OUT = RESULTS / "figures/follow-up"
NEURAL, FIXED, FAILURE, GRID = "#326449", "#55615b", "#bd493b", "#e3e8e5"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9, "axes.spines.top": False,
    "axes.spines.right": False, "axes.labelcolor": "#27312f", "text.color": "#27312f", "axes.edgecolor": "#9da8a3",
    "xtick.color": "#52615b", "ytick.color": "#52615b", "svg.fonttype": "none", "pdf.fonttype": 42, "savefig.facecolor": "white"})


def digest(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def save(fig, name, title, caption):
    for ext in ["svg", "png", "pdf"]:
        metadata = {"Title": title, "Description": caption} if ext != "pdf" else {"Title": title, "Subject": caption}
        fig.savefig(OUT / f"{name}.{ext}", dpi=180, bbox_inches="tight", metadata=metadata)
    plt.close(fig)


def training_figure(study):
    fig, axes = plt.subplots(1, 2, figsize=(10.6, 6.4))
    fig.subplots_adjust(left=.09, right=.97, bottom=.32, top=.79, wspace=.3)
    fig.suptitle("Training for the noise", fontsize=20, fontweight="bold", x=.09, ha="left", y=.97)
    fig.text(.09, .895, "Equal-budget neural training · distance 3 · Z memory · three rounds", fontsize=10)
    x = np.array([c["measurementNoise"] for c in study["conditions"]]) * 100
    series = [("fixedTraining", "NN trained at pₘ = 0.5%", FIXED, "D", "--"),
              ("matchedTraining", "NN trained at each evaluation pₘ", NEURAL, "o", "-")]
    for col, metric in enumerate(["errorRate", "brier"]):
        ax = axes[col]
        for key, label, color, marker, linestyle in series:
            selected = [next(s for s in c["seeds"] if s["seed"] == 101)[key] for c in study["conditions"]]
            y = np.array([m[metric] for m in selected])
            factor = 100 if metric == "errorRate" else 1
            ax.plot(x, y * factor, marker=marker, color=color, linestyle=linestyle, linewidth=1.5, markersize=5)
            if metric == "errorRate":
                ci = np.array([m["ci95"] for m in selected]) * factor
                ax.errorbar(x, y * factor, yerr=[y*factor-ci[:, 0], ci[:, 1]-y*factor], fmt="none", color=color, capsize=3, elinewidth=.9)
            for seed in [202, 303]:
                values = [next(s for s in c["seeds"] if s["seed"] == seed)[key][metric] * factor for c in study["conditions"]]
                ax.plot(x, values, linestyle="none", marker=marker, markersize=3, markerfacecolor="white", markeredgecolor=color, alpha=.65)
        ax.axvline(.5, color="#9da8a3", linewidth=.8, linestyle=":")
        ax.set_xlabel("Evaluation measurement-flip probability pₘ (%)", labelpad=10)
        ax.set_ylim(bottom=0)
        ax.grid(axis="y", color=GRID, linewidth=.7)
        ax.set_title("A / Binary prediction errors" if col == 0 else "B / Probability quality", fontsize=11, loc="left", pad=12)
    axes[0].set_ylabel("Logical prediction error per complete experiment (%)")
    axes[1].set_ylabel("Brier score (mean squared probability error)")
    handles = [Line2D([0], [0], color=color, linestyle=ls, marker=mk, label=label, markersize=5)
               for _, label, color, mk, ls in series]
    handles.append(Line2D([0], [0], color=FIXED, linestyle="none", marker="o", markerfacecolor="white", markersize=3, label="Hollow small markers: seeds 202 / 303"))
    fig.legend(handles=handles, frameon=False, ncol=1, loc="lower left", bbox_to_anchor=(.085, .155), fontsize=8.5)
    caption = ("Filled points / lines: preselected seed 101; hollow small points: seeds 202 and 303, not confidence intervals.\n"
        "100,000 shared fresh test shots per condition. Error bars: pointwise 95% Wilson intervals for seed 101 only.\n"
        "Brier has no uncertainty bars. Lines connect discrete evaluated settings only; no intermediate measurements.\n"
        "At 0.5%, the fixed and matched models are identical. One train/validation realization per setting; no pooled seeds.\n"
        "Source: " + study["runId"])
    fig.text(.09, .025, caption, fontsize=7.7, linespacing=1.55, va="bottom")
    save(fig, "training-noise-control", "SYNDROME | Equal-budget fixed versus matched neural training", caption)


def confidence_figure(diagnostics, confirmation):
    data = next(d for d in diagnostics["datasets"] if d["source"] == "confirmation")
    assert data["parentRunId"] == confirmation["runId"]
    c = next(c for c in data["conditions"] if c["measurementNoise"] == .03)
    parent = next(c for c in confirmation["conditions"] if c["measurementNoise"] == .03)
    assert c["shots"] == parent["shots"] == 100000
    groups = [g for g in c["selectiveRisk"] if g["count"]]
    bins = [b for b in c["confidenceBins"] if b["count"]]
    fig, axes = plt.subplots(1, 2, figsize=(10.6, 6.7))
    fig.subplots_adjust(left=.09, right=.97, bottom=.32, top=.79, wspace=.3)
    fig.suptitle("Confidence can retain mistakes", fontsize=20, fontweight="bold", x=.09, ha="left", y=.97)
    fig.text(.09, .895, "Frozen seed 101 · 100,000 fresh confirmation shots · measurement noise pₘ = 3%", fontsize=10)
    ax = axes[0]
    coverage = np.array([g["coverage"] for g in groups]) * 100
    errors = np.array([g["errorRate"] for g in groups]) * 100
    ci = np.array([g["ci95"] for g in groups]) * 100
    implied = np.array([1-g["meanConfidence"] for g in groups]) * 100
    ax.errorbar(coverage, errors, yerr=[errors-ci[:, 0], ci[:, 1]-errors], marker="o", color=FAILURE,
                linewidth=1.5, capsize=3, elinewidth=.9, markersize=4, label="Observed conditional error")
    ax.plot(coverage, implied, marker="D", linestyle="--", color=NEURAL, linewidth=1.4, markersize=4, label="Model-implied mean error")
    # Threshold labels are direct data labels, not additional measurements.
    for i, g in enumerate(groups):
        offset = {0: (-16, 12), 1: (-48, 5), 2: (-48, -1), 3: (-48, -10)}.get(i, (-5, 11))
        ax.annotate(f"≥{g['minimumConfidence']:.2f}", (coverage[i], errors[i]), xytext=offset,
                    textcoords="offset points", fontsize=7, color=FAILURE,
                    arrowprops={"arrowstyle": "-", "color": "#9da8a3", "linewidth": .6} if i in [1, 2, 3] else None)
    ax.set(xlim=(80, 101), ylim=(0, 4.4), xlabel="Original test shots retained (%) · zoomed range", ylabel="Logical prediction error among retained shots (%)")
    ax.set_title("A / Coverage and retained errors", fontsize=11, loc="left", pad=12)
    ax.legend(frameon=False, fontsize=7.8, loc="upper left")
    ax.grid(axis="y", color=GRID, linewidth=.7)
    ax = axes[1]
    x = np.array([b["meanConfidence"] for b in bins])
    y = np.array([b["observedAccuracy"] for b in bins])
    ci = np.array([b["observedAccuracyCi95"] for b in bins])
    ax.plot([.48, 1.02], [.48, 1.02], linestyle="--", color="#89958f", linewidth=.9, label="Ideal confidence calibration")
    ax.errorbar(x, y, yerr=[y-ci[:, 0], ci[:, 1]-y], fmt="o", color=NEURAL, capsize=3, elinewidth=.9, markersize=5, label="Observed accuracy (disjoint bins)")
    for b in bins:
        xy = b["meanConfidence"], b["observedAccuracy"]
        offset = (-7, -17) if b["upper"] == 1 else (6, -15)
        ax.annotate(f"n={b['count']:,}", xy, xytext=offset, textcoords="offset points", fontsize=7, ha="right" if b["upper"] == 1 else "left")
    ax.set(xlim=(.48, 1.02), ylim=(.46, 1.035), xlabel="Mean confidence in predicted binary class", ylabel="Observed fraction of correct predictions")
    ax.set_title("B / Confidence versus accuracy", fontsize=11, loc="left", pad=12)
    ax.legend(frameon=False, fontsize=7.8, loc="upper left")
    ax.grid(color=GRID, linewidth=.7)
    caption = ("Confidence = max(P(flip), 1−P(flip)); distinct from event probability. A: overlapping fixed post-hoc cutoffs;\n"
        "labels show the cutoff. B: disjoint confidence bins [0.5,0.6), …, [0.9,1]; labels show counts.\n"
        "Bars are pointwise 95% Wilson intervals, conditional on this model; no simultaneous band or threshold recommendation.\n"
        "Lines guide the eye between saved diagnostic summaries. No model fitting, recalibration, or new evidence here.\n"
        "Data: " + confirmation["runId"] + "\nAnalysis: " + diagnostics["runId"])
    fig.text(.09, .025, caption, fontsize=7.5, linespacing=1.55, va="bottom")
    save(fig, "confidence-coverage", "SYNDROME | Confidence, retained coverage and mistakes", caption)


def main():
    # Preserve all original exports and original figure manifest byte-for-byte.
    prior = {p: digest(p) for p in (RESULTS / "figures").iterdir() if p.is_file()}
    OUT.mkdir(parents=True, exist_ok=True)
    inputs = [RESULTS / "aggregates/training-control.json", RESULTS / "aggregates/diagnostics.json", RESULTS / "aggregates/confirmation.json"]
    training, diagnostics, confirmation = [json.loads(p.read_text()) for p in inputs]
    assert training["status"] == "completed-exploratory-training-control"
    assert diagnostics["status"] == "completed-post-hoc-diagnostics"
    training_figure(training)
    confidence_figure(diagnostics, confirmation)
    for path, expected in prior.items():
        assert digest(path) == expected, f"Prior figure changed: {path}"
    manifest = {"generator": "research/experiments/scripts/plot_followup.py", "scriptSha256": digest(Path(__file__)),
        "executionDateUTC": datetime.now(timezone.utc).isoformat(), "matplotlibVersion": matplotlib.__version__,
        "font": "Bundled DejaVu Sans; no new font download", "dataRuns": [training["runId"], diagnostics["runId"], confirmation["runId"]],
        "inputs": {str(p.relative_to(ROOT)): digest(p) for p in inputs},
        "method": "Original figures generated solely from saved validated artifacts; no measurements, fitting or interpolation",
        "preservedOriginalFigureFiles": {str(p.relative_to(ROOT)): h for p, h in prior.items()},
        "outputs": {p.name: {"sha256": digest(p), "bytes": p.stat().st_size} for p in sorted(OUT.iterdir()) if p.suffix in [".svg", ".png", ".pdf"]}}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"figures": list(manifest["outputs"]), "originalExports": "preserved"}))


if __name__ == "__main__":
    main()
