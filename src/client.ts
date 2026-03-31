const BASE_URL = "https://api.voximplant.com/platform_api";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;

export async function voxGet(method: string, params: Record<string, string> = {}): Promise<unknown> {
  const accountId = process.env.VOXIMPLANT_ACCOUNT_ID;
  const apiKey = process.env.VOXIMPLANT_API_KEY;
  if (!accountId || !apiKey) throw new Error("VOXIMPLANT_ACCOUNT_ID и VOXIMPLANT_API_KEY не заданы");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const query = new URLSearchParams({
      ...params,
      account_id: accountId,
      api_key: apiKey,
    });

    try {
      const response = await fetch(`${BASE_URL}/${method}?${query.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        if (data.error) {
          const err = data.error as { msg?: string; code?: number };
          throw new Error(`Voximplant ошибка ${err.code ?? ""}: ${err.msg ?? "неизвестная ошибка"}`);
        }
        return data;
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[voximplant-mcp] ${response.status}, повтор через ${delay}мс (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`Voximplant HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[voximplant-mcp] Таймаут, повтор (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Voximplant API: все попытки исчерпаны");
}
