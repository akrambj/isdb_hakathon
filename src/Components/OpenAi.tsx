import { useState } from "react";

const OpenAi = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");
    setError(null);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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 `,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || "No response.");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Ask OpenAI</h2>
      <textarea
        rows={4}
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {response && (
        <div style={{ marginTop: 20 }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default OpenAi;
