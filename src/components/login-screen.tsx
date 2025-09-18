import { useState } from "react";

const fakeUsers = [
  { id: "u1", name: "Alice", avatar: "👩" },
  { id: "u2", name: "Bob", avatar: "🧑" },
  { id: "u3", name: "Charlie", avatar: "👨" },
];

export default function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(fakeUsers[0].id);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const user = fakeUsers.find((u) => u.id === selectedId);
    if (!user) {
      setError("Please select a valid user.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("circlesUser", JSON.stringify(user));
      onLogin(user);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-w-screen min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Logo */}
      <div className="mb-8 text-3xl font-bold text-brand text-amber-600">⭕circles</div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-80">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sign in as</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4"
          disabled={loading}
        >
          {fakeUsers.map((u) => (
            <option key={u.id} value={u.id}>{`${u.avatar} ${u.name}`}</option>
          ))}
        </select>

        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
