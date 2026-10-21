'use client';
import { useState } from 'react';
// ---------- Mock data ----------
type Verdict = 'Supported' | 'Contradicted' | 'Unverified';
interface AnalysisResult {
  verdict: Verdict;
  summary: string;
  warningSigns: string[];
  sources: { title: string; url: string; outlet: string }[];
  nextSteps: string[];
}
const MOCK_ANALYSES: Record<string, AnalysisResult> = {
  default: {
    verdict: 'Unverified',
    summary:
      'We could not find this claim reported by any major credible news outlet. Treat with caution until verified.',
    warningSigns: [
      'No named source or author',
      'Emotional / urgent language detected',
      'Shared as a screenshot or forwarded message',
    ],
    sources: [
      {
        title: 'How to verify a viral claim in 5 minutes',
        url: 'https://www.snopes.com/fact-check/',
        outlet: 'Snopes',
      },
      {
        title: 'Forwarded messages: the fact-checker’s checklist',
        url: 'https://www.poynter.org/fact-checking/',
        outlet: 'Poynter',
      },
      {
        title: 'WhatsApp misinformation: what to look for',
        url: 'https://fullfact.org/',
        outlet: 'Full Fact',
      },
    ],
    nextSteps: [
      'Search the exact phrase in quotes on Google and see if any credible outlet has reported it.',
      'Reverse image search any photos or screenshots included in the message.',
      'Check the original source — is there a named person, outlet, or official document?',
      'Wait at least 24 hours before forwarding; real news will still be real tomorrow.',
    ],
  },
};
// Keyword-based heuristics for the demo
function analyzeText(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const warningSigns: string[] = [];
  let verdict: Verdict = 'Unverified';
  let summary =
    'We could not confirm this claim against our mock database of credible sources.';
  if (/(urgent|immediately|act now|before it.s too late|share now)/.test(lower)) {
    warningSigns.push('Urgent / pressure language detected');
  }
  if (/(pay|payment|wire|transfer|bitcoin|gift card|bank details)/.test(lower)) {
    warningSigns.push('Requests for payment or financial details');
  }
  if (/(forward|share with|send to 10|whatsapp group)/.test(lower)) {
    warningSigns.push('Asks you to forward the message');
  }
  if (/(miracle|cure|doctors are hiding|they don.t want you to know)/.test(lower)) {
    warningSigns.push('Sensational or conspiratorial framing');
  }
  if (/(breaking|shocking|exposed)/.test(lower)) {
    warningSigns.push('Clickbait language ("breaking", "shocking", "exposed")');
  }
  if (/(100%|definitely|guaranteed|nobody is talking about)/.test(lower)) {
    warningSigns.push('Absolute or exaggerated claims');
  }
  if (/(http|www\.|\.com|\.ly)/.test(lower) && /(bit\.ly|tinyurl|t\.co)/.test(lower)) {
    warningSigns.push('Shortened / suspicious link');
  }
  if (warningSigns.length === 0) {
    warningSigns.push('No obvious red flags — but source could not be verified');
  }
  // Toy verdict rules
  if (/(vaccines? cause|miracle cure|cures? cancer|5g causes|drinking bleach)/.test(lower)) {
    verdict = 'Contradicted';
    summary =
      'This claim contradicts established reporting from multiple credible health organizations and fact-checkers.';
  } else if (/(covid-19 is caused by|world health organization announced|nasa confirmed|reuters reported)/.test(lower)) {
    verdict = 'Supported';
    summary =
      'This claim matches reporting from recognized credible sources in our mock database.';
  }
  const base = MOCK_ANALYSES.default;
  return {
    ...base,
    verdict,
    summary,
    warningSigns,
  };
}
// ---------- Quiz data ----------
interface QuizQuestion {
  id: number;
  message: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    message:
      '🚨 URGENT: Forward this to 10 friends! WhatsApp will start charging ₹500/month from tomorrow unless you forward this message. Share now before it’s too late!!',
    choices: [
      'It contains urgent language and a forwarding demand',
      'It correctly warns about a real policy change',
      'It uses WhatsApp’s official logo, so it’s real',
    ],
    correctIndex: 0,
    explanation:
      'Classic chain-letter pattern: urgency (“URGENT”, “before it’s too late”), a demand to forward to N people, and no named source. WhatsApp has never announced per-user monthly fees. Real service changes are announced on WhatsApp’s official blog and app, not via forwarded messages.',
  },
  {
    id: 2,
    message:
      'Hello, I am from your bank. Your account will be blocked in 2 hours. Please click this link and enter your card number, OTP and PIN to verify: http://secure-bank-verify.xyz/login',
    choices: [
      'It’s legitimate because it mentions my bank',
      'It’s a phishing attempt — banks never ask for OTP/PIN via link',
      'It’s a government notice about account blocking',
    ],
    correctIndex: 1,
    explanation:
      'Red flags: (1) artificial deadline (“in 2 hours”), (2) asks for secret credentials (OTP, PIN, card number) — banks never ask for these, (3) a non-bank URL (secure-bank-verify.xyz). Legitimate banks send you to their own domain and never request OTPs. Never click; open your bank’s app or call the number on the back of your card.',
  },
  {
    id: 3,
    message:
      'Breaking: Scientists have discovered that drinking hot lemon water every morning cures cancer. Big pharma is hiding this because they want to sell chemotherapy. Doctors don’t want you to know!',
    choices: [
      'It’s supported by scientists, so it’s true',
      'It uses conspiratorial language and absolute claims without a source',
      'It’s a verified medical breakthrough',
    ],
    correctIndex: 1,
    explanation:
      'Red flags: “Breaking”, “doctors don’t want you to know”, “big pharma is hiding” — classic conspiratorial framing. Absolute claims (“cures cancer”) with no named study, journal, or researcher. Real medical findings are published in peer-reviewed journals (e.g., The Lancet, NEJM) and reported by credible outlets. Cross-check on WHO, NIH, or your country’s health ministry website.',
  },
];
// ---------- Sub-components ----------
function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const styles: Record<Verdict, string> = {
    Supported: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Contradicted: 'bg-red-100 text-red-800 border-red-300',
    Unverified: 'bg-amber-100 text-amber-800 border-amber-300',
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${styles[verdict]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          verdict === 'Supported'
            ? 'bg-emerald-500'
            : verdict === 'Contradicted'
            ? 'bg-red-500'
            : 'bg-amber-500'
        }`}
      />
      {verdict}
    </span>
  );
}
function SectionTitle({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{step}</p>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
// ---------- Main page ----------
export default function TrustAIPage() {
  // Checker state
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Quiz state
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const handleAnalyze = () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResult(null);
    // Simulate analysis latency for the demo
    setTimeout(() => {
      setResult(analyzeText(input));
      setAnalyzing(false);
    }, 600);
  };
  const resetChecker = () => {
    setInput('');
    setResult(null);
  };
  const quizComplete = submitted && answers.every((a) => a !== null);
  const score = answers.reduce<number>(
    (acc, a, i) => (a === QUIZ[i].correctIndex ? acc + 1 : acc),
    0
  );
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white font-bold">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">TrustAI</h1>
              <p className="text-xs text-slate-500">Misinformation tracker</p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#checker" className="hover:text-indigo-600">Checker</a>
            <a href="#quiz" className="hover:text-indigo-600">Learn</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-16">
        {/* ============ SECTION 1: CHECKER ============ */}
        <section id="checker">
          <SectionTitle
            step="Step 1 · Check"
            title="Paste a message or link"
            subtitle="We'll flag suspicious patterns and suggest credible sources."
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label htmlFor="claim" className="mb-2 block text-sm font-medium text-slate-700">
              WhatsApp message or news link
            </label>
            <textarea
              id="claim"
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 🚨 URGENT: Forward this to 10 friends! WhatsApp will start charging from tomorrow..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                {input.length} characters · demo uses mock analysis
              </p>
              <div className="flex gap-2">
                {result && (
                  <button
                    onClick={resetChecker}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={!input.trim() || analyzing}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {analyzing ? 'Analyzing…' : 'Analyze'}
                </button>
              </div>
            </div>
          </div>
          {/* Results */}
          {analyzing && (
            <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          )}
          {result && !analyzing && (
            <div className="mt-6 space-y-4">
              {/* Verdict card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <VerdictBadge verdict={result.verdict} />
                  <p className="text-sm text-slate-500">AI assessment (mock)</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{result.summary}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Warning signs */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <span className="text-lg">⚠️</span> Warning signs
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.warningSigns.map((w) => (
                      <li key={w} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Credible sources */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="text-lg">📚</span> Credible sources
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.sources.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-2 rounded-lg p-1.5 transition hover:bg-slate-50"
                        >
                          <span className="mt-0.5 text-xs font-semibold text-indigo-600 group-hover:underline">
                            {s.outlet}
                          </span>
                          <span className="text-sm text-slate-700 group-hover:text-indigo-700">
                            {s.title}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Next steps */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                  <span className="text-lg">✅</span> What to check before sharing
                </h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-indigo-900">
                  {result.nextSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </section>
        {/* ============ SECTION 2: QUIZ ============ */}
        <section id="quiz">
          <SectionTitle
            step="Step 2 · Learn"
            title="Spot the red flags"
            subtitle="Read each suspicious message and pick the best explanation."
          />
          <div className="space-y-4">
            {QUIZ.map((q, qi) => {
              const selected = answers[qi];
              return (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {qi + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Sample message
                    </span>
                  </div>
                  <blockquote className="rounded-xl border-l-4 border-slate-300 bg-slate-50 p-3 text-sm italic text-slate-700">
                    {q.message}
                  </blockquote>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    What is the biggest warning sign?
                  </p>
                  <div className="mt-2 space-y-2">
                    {q.choices.map((choice, ci) => {
                      const isSelected = selected === ci;
                      const isCorrect = ci === q.correctIndex;
                      const showState = submitted && isSelected;
                      let cls =
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ';
                      if (!submitted) {
                        cls += isSelected
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                      } else if (isSelected) {
                        cls += isCorrect
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                          : 'border-red-400 bg-red-50 text-red-900';
                      } else {
                        cls += 'border-slate-200 text-slate-600';
                      }
                      return (
                        <label key={ci} className={cls}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={isSelected}
                            disabled={submitted}
                            onChange={() => {
                              const next = [...answers];
                              next[qi] = ci;
                              setAnswers(next);
                            }}
                            className="mt-0.5 accent-indigo-600"
                          />
                          <span>{choice}</span>
                          {showState && (
                            <span className="ml-auto text-sm font-bold">
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Why: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">
              {quizComplete
                ? `You scored ${score} / ${QUIZ.length}. ${score === QUIZ.length ? 'Great job spotting the red flags! 🎉' : 'Review the explanations above and try again.'}`
                : 'Answer all 3 questions to reveal explanations.'}
            </p>
            <div className="flex gap-2">
              {quizComplete && (
                <button
                  onClick={() => {
                    setAnswers(Array(QUIZ.length).fill(null));
                    setSubmitted(false);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setSubmitted(true)}
                disabled={answers.some((a) => a === null) || submitted}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Reveal explanations
              </button>
            </div>
          </div>
        </section>
        <footer className="pb-6 text-center text-xs text-slate-400">
          TrustAI · Hackathon demo · Mock analysis only — always verify with official sources.
        </footer>
      </main>
    </div>
  );
}
