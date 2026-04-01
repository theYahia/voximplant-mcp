import { voxGet } from "../client.js";

export const skillAccountInfo = {
  name: "skill-account-info",
  title: "Информация об аккаунте",
  description: "Получить информацию об аккаунте Voximplant: баланс, тариф, лимиты.",
  async run(): Promise<string> {
    const result = await voxGet("GetAccountInfo", {});
    return JSON.stringify(
      {
        title: "Информация об аккаунте Voximplant",
        data: result,
      },
      null,
      2,
    );
  },
};
