import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardPlus, Send } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';

interface IssueWizardProps {
  token: string;
  onSubmitted?: () => void;
}

type IssueFormState = {
  title: string;
  description: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'NETWORK' | 'CLEANLINESS' | 'SECURITY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  building: string;
  roomNumber: string;
};

const initialState: IssueFormState = {
  title: '',
  description: '',
  category: 'OTHER',
  priority: 'MEDIUM',
  building: '',
  roomNumber: '',
};

export const IssueWizard = ({ token, onSubmitted }: IssueWizardProps) => {
  const [form, setForm] = useState<IssueFormState>(initialState);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(
    () => form.title.trim().length > 4 && form.description.trim().length > 10,
    [form.description, form.title],
  );

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = await apiRequest<{ ticketNo: string }>('/issues', {
        method: 'POST',
        token,
        body: {
          title: form.title,
          description: form.description,
          category: form.category,
          priority: form.priority,
          building: form.building,
          roomNumber: form.roomNumber,
          wizardMeta: {
            submittedFrom: 'student-dashboard',
            wizardStep: step,
          },
        },
      });

      setMessage(`Issue submitted: ${result.ticketNo}`);
      setForm(initialState);
      setStep(1);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard interactive>
      <SectionHeader
        title="New Report Wizard"
        subtitle="Create a structured issue report in two quick steps."
        icon={<ClipboardPlus className="h-5 w-5" />}
      />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className="field"
              placeholder="Issue title"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="field min-h-24"
              placeholder="Describe the issue and impact"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="field"
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    category: event.target.value as IssueFormState['category'],
                  }))
                }
              >
                <option value="NETWORK">Network</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="CLEANLINESS">Cleanliness</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>
              <select
                className="field"
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: event.target.value as IssueFormState['priority'],
                  }))
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <button
              disabled={!canContinue}
              onClick={() => setStep(2)}
              className="btn-primary disabled:opacity-40"
            >
              Continue
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <input
              value={form.building}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, building: event.target.value }))
              }
              className="field"
              placeholder="Building"
            />
            <input
              value={form.roomNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, roomNumber: event.target.value }))
              }
              className="field"
              placeholder="Room Number"
            />

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setStep(1)} className="btn-muted">
                Back
              </button>
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </GlassCard>
  );
};
