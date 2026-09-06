import { useMemo, useState } from "react";
import type { Answers, Result } from "./engine";
import { PERSONAS, evaluate, isMustComplete, isResult, nextQuestion } from "./engine";
import { Interview } from "./components/Interview";
import { Results } from "./components/Results";
import { Welcome } from "./components/Welcome";

type Screen = "welcome" | "interview" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [history, setHistory] = useState<Answers[]>([{}]);
  const [personaName, setPersonaName] = useState<string | null>(null);
  const answers = history[history.length - 1] ?? {};

  const result: Result | { error: string } | null = useMemo(() => {
    if (!isMustComplete(answers)) return null;
    return evaluate(answers);
  }, [answers]);

  function patch(partial: Answers) {
    setHistory((h) => [...h, { ...h[h.length - 1], ...partial }]);
  }

  function startFresh() {
    setHistory([{}]);
    setPersonaName(null);
    setScreen("interview");
  }

  function startPersona(id: (typeof PERSONAS)[number]["id"], jump: boolean) {
    const p = PERSONAS.find((x) => x.id === id)!;
    setHistory([{ ...p.answers }]);
    setPersonaName(p.name);
    setScreen(jump ? "results" : "interview");
  }

  const q = nextQuestion(answers);

  return (
    <div className="app">
      {screen === "welcome" && (
        <Welcome onStart={startFresh} onPersona={startPersona} />
      )}
      {screen === "interview" && (
        <Interview
          answers={answers}
          question={q}
          personaName={personaName}
          canSeeResults={isMustComplete(answers)}
          onPatch={patch}
          onBack={() => {
            if (history.length <= 1) {
              setScreen("welcome");
              return;
            }
            setHistory((h) => h.slice(0, -1));
          }}
          onSkipExtra={() => {
            if (!q || q.must) return;
            if (q.id === "credit") return;
            patch({ [q.id]: null } as Answers);
          }}
          onFinish={() => setScreen("results")}
        />
      )}
      {screen === "results" && result && isResult(result) && (
        <Results
          answers={answers}
          result={result}
          personaName={personaName}
          onEdit={() => setScreen("interview")}
          onRestart={() => {
            setHistory([{}]);
            setPersonaName(null);
            setScreen("welcome");
          }}
        />
      )}
    </div>
  );
}
