import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllAppointments, getMyAppointments } from '@/services/appointmentService';
import { useAuth } from '@/hooks/useAuth';

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const STORAGE_KEY      = 'ec_last_pending_ids';

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Two-note ascending chime: E5 → G#5
    const notes = [
      { freq: 659.25, start: 0,    duration: 0.35 },
      { freq: 830.61, start: 0.18, duration: 0.45 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type            = 'sine';
      osc.frequency.value = freq;

      const t = ctx.currentTime + start;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.start(t);
      osc.stop(t + duration);
    });

    // Auto-close context after chime finishes
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Web Audio not supported — silent fail
  }
}

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveSeenIds(ids) {
  // Keep only the last 200 IDs to avoid unbounded growth
  const arr = [...ids].slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export function useAppointmentAlert() {
  const { user }       = useAuth();
  const isLoggedIn     = !!user;
  const isAdmin        = user?.role === 'admin';
  const timerRef       = useRef(null);
  const initializedRef = useRef(false);

  const check = useCallback(async () => {
    try {
      // Admins see all pending appointments; regular users see only their own
      const all = isAdmin
        ? await getAllAppointments({ status: 'pending' })
        : await getMyAppointments();

      // For non-admin users filter to only pending ones
      const pending = isAdmin ? all : all.filter((a) => a.status === 'pending');

      const seenIds = getSeenIds();
      const newOnes = pending.filter((a) => !seenIds.has(a._id));

      // On the very first run, just snapshot current IDs — no alert
      if (!initializedRef.current) {
        pending.forEach((a) => seenIds.add(a._id));
        saveSeenIds(seenIds);
        initializedRef.current = true;
        return;
      }

      if (newOnes.length > 0) {
        playChime();

        const names = newOnes
          .slice(0, 3)
          .map((a) => a.guestName || a.customer?.name || 'Guest')
          .join(', ');

        toast(
          (t) => (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold-400 text-sm">📅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">
                  {newOnes.length} new appointment{newOnes.length > 1 ? 's' : ''}!
                </p>
                <p className="text-dark-300 text-xs mt-0.5 truncate">{names}{newOnes.length > 3 ? ` +${newOnes.length - 3} more` : ''}</p>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = isAdmin ? '/admin/appointments' : '/my-appointments';
                  }}
                  className="text-gold-400 text-xs font-medium mt-1.5 hover:text-gold-300 transition-colors"
                >
                  View appointments →
                </button>
              </div>
              <button onClick={() => toast.dismiss(t.id)} className="text-dark-500 hover:text-white transition-colors text-xs mt-0.5">✕</button>
            </div>
          ),
          {
            duration: 10_000,
            style: {
              background:   '#1a1a1a',
              border:       '1px solid #2a2a2a',
              color:        '#fff',
              padding:      '12px 14px',
              borderRadius: '12px',
              maxWidth:     '340px',
            },
          }
        );

        newOnes.forEach((a) => seenIds.add(a._id));
        saveSeenIds(seenIds);
      }
    } catch {
      // Network errors silently ignored during background polling
    }
  }, [isAdmin, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoggedIn) {
      initializedRef.current = false;
      clearInterval(timerRef.current);
      return;
    }

    check();
    timerRef.current = setInterval(check, POLL_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [isLoggedIn, check]);
}
