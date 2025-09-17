import  { useEffect, useState } from "react";

// Circles - Minimal MVP single-file React app (TypeScript/TSX)
// Tailwind-friendly markup. Drop into a Vite + React + Tailwind project as src/App.tsx

type Message = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

type Circle = {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  members: string[]; // simple list of member names
  messages: Message[];
};

const STORAGE_KEY = "circles-mvp:v1";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function loadFromStorage(): Circle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Circle[];
  } catch (e) {
    console.error("load error", e);
    return [];
  }
}

function saveToStorage(circles: Circle[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
  } catch (e) {
    console.error("save error", e);
  }
}

export default function AppCircles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [me, setMe] = useState<string>(() => {
    // ephemeral username stored locally
    return localStorage.getItem("circles:me") || `Guest_${Math.floor(Math.random() * 9000) + 1000}`;
  });

  // UI state
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleDesc, setNewCircleDesc] = useState("");
  const [composeText, setComposeText] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const data = loadFromStorage();
    if (data.length === 0) {
      // bootstrap a few example public circles
      const example: Circle[] = [
        {
          id: uid("circle"),
          name: "Frontend Snacks",
          description: "Small, friendly chat about UI, microfrontends, and CSS.",
          isPublic: true,
          members: [me],
          messages: [
            { id: uid("m"), text: "Welcome to Frontend Snacks!", author: "Host", createdAt: nowISO() },
          ],
        },
        {
          id: uid("circle"),
          name: "Local Events",
          description: "Share meetups and IRL hangouts.",
          isPublic: true,
          members: [],
          messages: [],
        },
      ];
      setCircles(example);
      saveToStorage(example);
      setSelectedId(example[0].id);
      return;
    }
    setCircles(data);
    if (!selectedId && data[0]) setSelectedId(data[0].id);
  }, []);

  useEffect(() => {
    saveToStorage(circles);
  }, [circles]);

  useEffect(() => {
    localStorage.setItem("circles:me", me);
  }, [me]);

  function createCircle() {
    if (!newCircleName.trim()) return;
    const c: Circle = {
      id: uid("circle"),
      name: newCircleName.trim(),
      description: newCircleDesc.trim() || undefined,
      isPublic: true,
      members: [me],
      messages: [
        { id: uid("m"), text: `Circle created by ${me}` , author: me, createdAt: nowISO() },
      ],
    };
    setCircles((s) => [c, ...s]);
    setNewCircleName("");
    setNewCircleDesc("");
    setShowCreate(false);
    setSelectedId(c.id);
  }

  function joinCircle(id: string) {
    setCircles((cs) =>
      cs.map((c) => (c.id === id && !c.members.includes(me) ? { ...c, members: [...c.members, me] } : c))
    );
    setSelectedId(id);
  }

  function postMessage(text: string) {
    if (!selectedId || !text.trim()) return;
    const msg: Message = { id: uid("m"), text: text.trim(), author: me, createdAt: nowISO() };
    setCircles((cs) => cs.map((c) => (c.id === selectedId ? { ...c, messages: [...c.messages, msg] } : c)));
    setComposeText("");
  }

  function generateInviteLink(id: string) {
    // simple invite token (not secure) — encodes circle id so others can join
    const token = btoa(id);
    return `${location.origin}/join?token=${token}`;
  }

  // Simple UI helpers
  const selected = circles.find((c) => c.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <header className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Circles — Minimal</h1>
          <p className="text-sm text-gray-600">Small groups, less noise. Built for clarity.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={me}
            onChange={(e) => setMe(e.target.value)}
            className="border border-gray-200 px-3 py-1 rounded-md text-sm"
            title="Your display name"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            + New Circle
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: circle list */}
        <aside className="col-span-1 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Circles</h2>
            <span className="text-xs text-gray-500">{circles.length}</span>
          </div>

          <ul className="mt-3 space-y-3">
            {circles.map((c) => (
              <li
                key={c.id}
                className={`p-3 rounded-md border cursor-pointer ${c.id === selectedId ? "border-blue-400 bg-blue-50" : "border-transparent"}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.members.length} members</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); joinCircle(c.id); }}
                      className="text-xs px-2 py-1 rounded-md border"
                    >
                      Join
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(generateInviteLink(c.id)); }}
                      className="text-xs text-gray-500"
                      title="Copy invite link"
                    >
                      🔗
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-sm text-gray-500">
            Tip: Circles are small by design. Use public circles to discover topics.
          </div>
        </aside>

        {/* Center: conversation */}
        <section className="col-span-2 bg-white p-4 rounded-lg shadow-sm">
          {!selected ? (
            <div className="text-center text-gray-500">No circle selected</div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selected.name}</h3>
                  <div className="text-xs text-gray-500">{selected.description}</div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{selected.members.length} members</div>
                  <div className="mt-2">Invite: <button className="underline" onClick={() => navigator.clipboard?.writeText(generateInviteLink(selected.id))}>Copy</button></div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4 max-h-[56vh] overflow-y-auto space-y-3">
                {selected.messages.length === 0 && <div className="text-gray-400">No messages yet — start the conversation.</div>}
                {selected.messages.map((m) => (
                  <div key={m.id} className="p-3 rounded-md bg-gray-50 border">
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <div className="font-medium">{m.author}</div>
                      <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm">{m.text}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder={`Message as ${me}`}
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                  onClick={() => postMessage(composeText)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Create modal (very small) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h4 className="font-semibold">Create a new Circle</h4>
            <label className="block text-sm mt-3">Name</label>
            <input value={newCircleName} onChange={(e) => setNewCircleName(e.target.value)} className="w-full border px-3 py-2 rounded-md" />
            <label className="block text-sm mt-3">Description (optional)</label>
            <input value={newCircleDesc} onChange={(e) => setNewCircleDesc(e.target.value)} className="w-full border px-3 py-2 rounded-md" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-3 py-1">Cancel</button>
              <button onClick={createCircle} className="px-3 py-1 bg-blue-600 text-white rounded-md">Create</button>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-5xl mx-auto text-xs text-gray-500 mt-6">Built as an MVP demo — local-first, privacy-friendly, and lightweight.</footer>
    </div>
  );
}
