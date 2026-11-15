// Audio assets: Kenney Interface Sounds, CC0. Audio is unlocked only by an explicit user gesture.
let context: AudioContext | null = null,
  enabled = false;
const buffers = new Map<string, AudioBuffer>();
let pending: Promise<void> | null = null,
  lastTick = 0;
export async function enableInterfaceSound(value: boolean) {
  enabled = value;
  if (!value) return;
  context ??= new AudioContext();
  await context.resume();
  pending ??= Promise.all(
    ["click", "switch", "tick"].map(async (name) => {
      const response = await fetch(`/audio/${name}.ogg`);
      if (!response.ok) throw new Error("Sound file unavailable");
      buffers.set(
        name,
        await context!.decodeAudioData(await response.arrayBuffer()),
      );
    }),
  )
    .then(() => {})
    .catch(() => {
      pending = null;
      enabled = false;
    });
  await pending;
}
export function playInterfaceSound(kind = "click") {
  if (!enabled || !context || context.state !== "running") return;
  const now = performance.now();
  if (now - lastTick < 90) return;
  lastTick = now;
  const buffer = buffers.get(kind);
  if (!buffer) return;
  const source = context.createBufferSource(),
    gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = kind === "tick" ? 0.06 : 0.11;
  source.connect(gain);
  gain.connect(context.destination);
  source.onended = () => {
    source.disconnect();
    gain.disconnect();
  };
  source.start();
}
