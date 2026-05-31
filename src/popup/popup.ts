import {
  getSettings,
  setSettings,
  onSettingsChanged,
  type Settings,
} from "../settings";

const enabledEl = document.getElementById("enabled") as HTMLInputElement;
const debugEl = document.getElementById("debug") as HTMLInputElement;
const statusEl = document.getElementById("status");

function render(settings: Settings): void {
  enabledEl.checked = settings.enabled;
  debugEl.checked = settings.debug;
  if (!statusEl) return;
  statusEl.textContent = settings.enabled
    ? "Filtering active on instagram.com"
    : "Filtering disabled";
}

enabledEl.addEventListener("change", () => {
  void setSettings({ enabled: enabledEl.checked });
});

debugEl.addEventListener("change", () => {
  void setSettings({ debug: debugEl.checked });
});

onSettingsChanged(render);

void getSettings().then(render);
