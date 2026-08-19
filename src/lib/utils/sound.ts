// Web Audio API Sound Synthesizer for Admin Alerts

export function playAdminSound(type: "purchase" | "cart" | "alert" = "purchase") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === "purchase") {
      // Triumph Chime (Two-tone melody: C5 -> G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(783.99, now + 0.12); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.25); // C6

      osc2.frequency.setValueAtTime(261.63, now);
      osc2.frequency.setValueAtTime(392.0, now + 0.12);
      osc2.frequency.setValueAtTime(523.25, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } else if (type === "cart") {
      // Soft POP / Ping sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.08); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Alert Ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.error("Audio playback error:", err);
  }
}

// Request & Send Browser Native Push Notification
export async function sendNativeNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  try {
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/icon.png",
        badge: "/icon.png",
        ...options,
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          icon: "/icon.png",
          badge: "/icon.png",
          ...options,
        });
      }
    }
  } catch (err) {
    console.error("Native notification error:", err);
  }
}
