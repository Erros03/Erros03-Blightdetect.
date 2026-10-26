import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, AlertTriangle, Zap, Play, Square, Terminal, Power, ExternalLink } from 'lucide-react';
import { startConveyor, stopConveyor, testMotorFwd, testMotorRev, type SerialStatus } from '../lib/arduino.ts';

interface MotorDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  serialStatus: SerialStatus;
}

export const MotorDiagnosticModal: React.FC<MotorDiagnosticModalProps> = ({
  isOpen,
  onClose,
  serialStatus,
}) => {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--linen-surface)] border border-[var(--sand)] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[var(--bark)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--sand)] bg-[var(--linen)]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-[var(--terracotta)]/15 text-[var(--terracotta)] border border-[var(--terracotta)]/30">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--bark)] font-serif">
                DC Motor & L298N Diagnostic Wizard
              </h2>
              <p className="text-xs text-[var(--bark-muted)]">
                Step-by-step isolation to find why the motor is not rotating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--bark-muted)] hover:text-[var(--bark)] hover:bg-[var(--sand)]/50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Quick Direct Controls Bar */}
          <div className="p-4 rounded-xl bg-[var(--linen)] border border-[var(--sand)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[var(--bark)] font-serif">Live Motor Overrides:</span>
              <p className="text-[11px] text-[var(--bark-muted)]">
                Connection: {serialStatus.isConnected ? '● Connected' : '○ Offline'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => testMotorFwd()}
                disabled={!serialStatus.isConnected}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-olive hover:bg-olive-dark text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                Force Forward
              </button>
              <button
                onClick={() => testMotorRev()}
                disabled={!serialStatus.isConnected}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sand)] text-[var(--bark)] border border-[var(--sand)] shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                Force Reverse
              </button>
              <button
                onClick={() => stopConveyor()}
                disabled={!serialStatus.isConnected}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-tomato hover:bg-tomato-hover text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                Stop
              </button>
            </div>
          </div>

          {/* 4-Step Hardware Isolation Checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--bark)] font-serif">
              Perform These 4 Physical Checks (In Order):
            </h3>

            {/* Check 1 */}
            <div
              onClick={() => setStep1Done(!step1Done)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                step1Done
                  ? 'bg-[var(--sage-light)]/70 border-[var(--olive)]'
                  : 'bg-[var(--linen)] border-[var(--sand)] hover:border-[var(--sand-dark)]'
              }`}
            >
              <div className={`mt-0.5 p-1 rounded-full ${step1Done ? 'text-[var(--olive)]' : 'text-[var(--sand-dark)]'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[#263238]">
                  1. 10-Second Motor Bypass Test (Is the motor and 12V transformer alive?)
                </p>
                <p className="text-[#607D8B] leading-relaxed">
                  Disconnect the two DC motor wires from the L298N and touch them <strong>directly to the + and - of your 12V 5A regulated step-down transformer</strong> (Panel Recommendation #16: Regulated AC-to-DC transformer must be used instead of batteries to prevent voltage sag under load).
                </p>
                <p className="text-[#607D8B] italic text-[11px]">
                  • If it doesn&apos;t spin when touched directly to the 12V transformer terminals, the motor is jammed/burned or your power supply is not receiving 220V AC input.
                </p>
              </div>
            </div>

            {/* Check 2 */}
            <div
              onClick={() => setStep2Done(!step2Done)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                step2Done
                  ? 'bg-[var(--sage-light)]/70 border-[var(--olive)]'
                  : 'bg-[var(--linen)] border-[var(--sand)] hover:border-[var(--sand-dark)]'
              }`}
            >
              <div className={`mt-0.5 p-1 rounded-full ${step2Done ? 'text-[var(--olive)]' : 'text-[var(--sand-dark)]'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--bark)] font-serif">
                  2. Common Ground Wire (The #1 reason Arduino signals fail)
                </p>
                <p className="text-[var(--bark-muted)] leading-relaxed">
                  Is there a physical wire connecting <strong>Arduino GND</strong> to the <strong>L298N GND screw terminal</strong>?
                </p>
                <p className="text-[var(--bark-light)] italic text-[11px]">
                  • Without a common ground wire, the Arduino pins D4 & D3 float at 0V relative to the L298N, so the driver never receives the turn-on signal.
                </p>
              </div>
            </div>

            {/* Check 3 */}
            <div
              onClick={() => setStep3Done(!step3Done)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                step3Done
                  ? 'bg-[var(--sage-light)]/70 border-[var(--olive)]'
                  : 'bg-[var(--linen)] border-[var(--sand)] hover:border-[var(--sand-dark)]'
              }`}
            >
              <div className={`mt-0.5 p-1 rounded-full ${step3Done ? 'text-[var(--olive)]' : 'text-[var(--sand-dark)]'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--bark)] font-serif">
                  3. L298N ENA Black Jumper
                </p>
                <p className="text-[var(--bark-muted)] leading-relaxed">
                  Ensure the black plastic shorting jumper is <strong>firmly seated on the 2 ENA pins</strong>. Do NOT connect any wire from Arduino Pin D5.
                </p>
                <p className="text-[var(--bark-light)] italic text-[11px]">
                  • This locks ENA permanently to 5V (100% full torque).
                </p>
              </div>
            </div>

            {/* Check 4 */}
            <div
              onClick={() => setStep4Done(!step4Done)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                step4Done
                  ? 'bg-[var(--sage-light)]/70 border-[var(--olive)]'
                  : 'bg-[var(--linen)] border-[var(--sand)] hover:border-[var(--sand-dark)]'
              }`}
            >
              <div className={`mt-0.5 p-1 rounded-full ${step4Done ? 'text-[var(--olive)]' : 'text-[var(--sand-dark)]'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--bark)] font-serif">
                  4. Motor Terminals (OUT1/OUT2 vs OUT3/OUT4)
                </p>
                <p className="text-[var(--bark-muted)] leading-relaxed">
                  Ensure your DC motor leads are screwed into <strong>OUT1 and OUT2</strong> (the side controlled by IN1 & IN2).
                </p>
                <p className="text-[var(--bark-light)] italic text-[11px]">
                  • If connected to OUT3 and OUT4, the motor is wired to IN3 & IN4 instead of IN1 & IN2.
                </p>
              </div>
            </div>
          </div>

          {/* Live Terminal Log Snapshot */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--bark)] flex items-center space-x-1.5 font-serif">
              <Terminal className="h-4 w-4 text-[var(--olive)]" />
              <span>Serial Monitor Traffic (Recent Commands):</span>
            </span>
            <div className="p-3.5 rounded-lg bg-[var(--bark)] border border-[var(--sand)] font-mono text-[11px] max-h-36 overflow-y-auto space-y-1 text-[var(--linen)]">
              {serialStatus.logs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-center space-x-2">
                  <span className="text-[var(--sand)] text-[10px]">{log.timestamp}</span>
                  <span className={`px-1 rounded text-[10px] font-bold ${log.type === 'tx' ? 'text-[var(--terracotta)]' : 'text-[var(--sage-light)]'}`}>
                    {log.type.toUpperCase()}
                  </span>
                  <span className={log.type === 'tx' ? 'text-[var(--sand-light)]' : 'text-[var(--sage-light)]'}>
                    {log.message}
                  </span>
                </div>
              ))}
              {serialStatus.logs.length === 0 && (
                <div className="text-[var(--sand)] italic">No serial traffic yet. Click &apos;Force Forward&apos; above.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--linen)] border-t border-[var(--sand)] flex justify-between items-center">
          <p className="text-xs text-[var(--bark-muted)]">
            {step1Done && step2Done && step3Done && step4Done
              ? '✓ All 4 hardware checks confirmed!'
              : 'Complete the 4 checks above to pinpoint the problem.'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-[var(--linen-surface)] hover:bg-[var(--sand)] border border-[var(--sand)] text-[var(--bark)] transition-colors cursor-pointer"
          >
            Close Wizard
          </button>
        </div>
      </div>
    </div>
  );
};
