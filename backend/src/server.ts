import express from "express";
import { config } from "./config.js";
import { syncMedicamentos } from "./sync.js";

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/sync", async (req, res) => {
  const token = req.header("x-api-token") ?? req.query.token;

  if (token !== config.SYNC_API_TOKEN) {
    res.status(401).json({ error: "Token inválido ou ausente" });
    return;
  }

  try {
    const result = await syncMedicamentos();
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Erro inesperado na sincronização"
    });
  }
});

app.listen(config.PORT, () => {
  console.log(`PedCalc sync API ouvindo na porta ${config.PORT}`);
});
