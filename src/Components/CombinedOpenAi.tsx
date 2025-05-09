import { useEffect, useState } from "react";

function CombinedOpenAi() {
  const [data, setData] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    standards: string[];
    keywords: string[];
  } | null>(null);

  const context =
    "Ijarah MBT Accounting (in Lessee’s books) On 1 January 2019 Alpha Islamic bank (Lessee) entered into an Ijarah MBT arrangement with Super Generators for Ijarah of a heavy-duty generator purchase by Super Generators at a price of USD 450,000. Super Generators has also paid USD 12,000 as import tax and US 30,000 for freight charges. The Ijarah Term is 02 years and expected residual value at the end USD 5,000. At the end of Ijarah Term, it is highly likely that the option of transfer of ownership of the underlying asset to the lessee shall be exercised through purchase at a price of USD 3,000. Alpha Islamic Bank will amortize the ‘right of use’ on yearly basis and it is required to pay yearly rental of USD 300,000.";

  const questions =
    "Provide the following accounting entry in the books of Alpha Islamic Bank";

  const prompt = `Here is a set of rules: $${
    data ? JSON.stringify(data) : "No rules available"
  }.
Here is a context: ${context}.
Here are the questions: ${questions}.

Please return:
1. The full accounting journal entries.
2. Metadata JSON containing:
   - FAS standards mentioned
   - Keywords detected (e.g., 'Ijarah', 'Depreciation', 'Liability', etc.)`;

  const handleSend = async () => {
    if (!prompt.trim()) return;
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
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
      const content = data.choices?.[0]?.message?.content || "No response.";

      const parts = content.split(/\n\n\{\"standards\"/);
      const responseText = parts[0]?.trim();
      const metadataJSON = parts[1] ? `{"standards"${parts[1]}` : null;

      setResponse(responseText);
      if (metadataJSON) {
        try {
          setMetadata(JSON.parse(metadataJSON));
        } catch (e) {
          console.warn("Failed to parse metadata JSON");
        }
      }
    } catch (err) {
      console.error("Error fetching from OpenAI:", err);
    }
  };

  useEffect(() => {
    fetch("/message.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => {
        console.error("Error fetching JSON:", error);
      });
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">
        Accounting AI Assistant
      </h1>
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Generate Journal Entries
      </button>
      {response && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow text-gray-800 whitespace-pre-wrap">
          <h2 className="font-semibold text-lg mb-2">AI Response:</h2>
          {response}
        </div>
      )}
      {metadata && (
        <div className="mt-4 p-4 border border-blue-300 bg-blue-50 rounded">
          <h2 className="font-semibold text-lg text-blue-800">Metadata:</h2>
          <div className="mt-2">
            <p>
              <strong>FAS Standards:</strong> {metadata.standards.join(", ")}
            </p>
            <p>
              <strong>Keywords:</strong> {metadata.keywords.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CombinedOpenAi;
