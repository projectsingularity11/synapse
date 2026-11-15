# Relaxed editorial and motion refinement

The homepage now leads with a complete research question and a connected first-person explanation. The hero's four-number instrument strip and duplicate floating annotation are removed. The research introduction, four-step film, and finding each receive more space; the final three-card grid becomes two spacious reading rows. About copy follows the same direct student voice. Research results, technical paper content, recorded demos, and saved artifacts are preserved.

Reduced effects now remove the complete cursor/fluid/trail layer, including the tracker and point. Ambient light continues on smaller, slower independent paths without zoom or rotation. Pointer influence is removed in this mode. Hidden tabs still pause background work. The 3D hero remains paused, with an accurate static-view caption. Mobile chapter buttons return the chosen explanation to view, and reduced-mode mobile artwork receives its own uncropped space.

A small, original, seeded SVG paper-grain tile adds a matte texture to black reading and scene surfaces. It is static and does not introduce a per-frame noise shader. Printing removes the texture. The new logo and favicon are an original geometric layered-memory mark, with a white frame and a flame-orange facet.

## References

[KODE Immersive](https://kodeimmersive.com/) supplies the visual direction: tactile grain, confident typography, and reflective objects. Its hero was inspected through the [Supahero reference capture](https://supahero.io/hero/kode-immersive). [Lusion](https://lusion.co/) supplies the structural direction: a large visual introduction followed by focused explanations and deeper work. Primary site content was reviewed; direct captures in the workspace's software renderer stayed in the studios' loading sequences, so no pixel-for-pixel comparison is claimed. Reference assets and marketing copy are not included in the project.

## Verification

Build and lint pass. Sixteen distinct targeted browser checks pass across the main run and focused rerun: home/Explorer/About/paper accessibility, responsive widths, exact saved-history links, measured noise controls, touch and keyboard chapter controls, WebGL rendering/context loss, full/reduced effects, and the new mobile chapter-position regression.

The background test confirms that ambient animation continues in reduced mode, its duration exceeds 30 seconds, pointer translation is cleared, and the whole cursor layer, point, and tracker are hidden. Static SVG assets retain original source under `app/icon.svg` and `public/art/paper-grain.svg`.

Production-browser samples of 180 requestAnimationFrame intervals per case:

| Mode | Desktop average | Phone average | p95 frame interval |
|---|---:|---:|---:|
| Full effects | 57.14Hz | 59.02Hz | 16.7–16.8ms |
| Reduced effects | 59.67Hz | 60.00Hz | 16.8ms |

These measure scheduling in CPU-composited Chromium with software graphics, not physical-device presentation or a guaranteed minimum. The full-effects phone sample recorded one 55ms main-thread task; the reduced samples recorded none. QA output and screenshots are under `docs/qa/editorial/`.
