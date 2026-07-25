import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export const Route = createFileRoute("/api/parse-notes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
          }
          if (file.size > MAX_BYTES) {
            return Response.json({ error: "File too large (max 10MB)" }, { status: 413 });
          }

          const name = file.name.toLowerCase();
          const type = file.type;

          if (
            name.endsWith(".txt") ||
            name.endsWith(".md") ||
            type.startsWith("text/") ||
            type === "application/json"
          ) {
            const text = await file.text();
            return Response.json({ text });
          }

          if (name.endsWith(".pdf") || type === "application/pdf") {
            const { extractText, getDocumentProxy } = await import("unpdf");
            const buffer = new Uint8Array(await file.arrayBuffer());
            const pdf = await getDocumentProxy(buffer);
            const { text } = await extractText(pdf, { mergePages: true });
            return Response.json({
              text: (Array.isArray(text) ? text.join("\n\n") : text).trim(),
            });
          }

          return Response.json(
            { error: "Unsupported file type. Upload .txt, .md, or .pdf" },
            { status: 415 },
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to parse file";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
