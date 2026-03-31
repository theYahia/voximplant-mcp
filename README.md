# @theyahia/voximplant-mcp

MCP-сервер для Voximplant API — история звонков, пользователи, SMS. **3 инструмента.**

[![npm](https://img.shields.io/npm/v/@theyahia/voximplant-mcp)](https://www.npmjs.com/package/@theyahia/voximplant-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "voximplant": {
      "command": "npx",
      "args": ["-y", "@theyahia/voximplant-mcp"],
      "env": { "VOXIMPLANT_ACCOUNT_ID": "your-id", "VOXIMPLANT_API_KEY": "your-key" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add voximplant -e VOXIMPLANT_ACCOUNT_ID=your-id -e VOXIMPLANT_API_KEY=your-key -- npx -y @theyahia/voximplant-mcp
```

### VS Code / Cursor

```json
{ "servers": { "voximplant": { "command": "npx", "args": ["-y", "@theyahia/voximplant-mcp"], "env": { "VOXIMPLANT_ACCOUNT_ID": "your-id", "VOXIMPLANT_API_KEY": "your-key" } } } }
```

> Требуется `VOXIMPLANT_ACCOUNT_ID` и `VOXIMPLANT_API_KEY`. Получите в [панели управления Voximplant](https://manage.voximplant.com).

## Инструменты (3)

| Инструмент | Описание |
|------------|----------|
| `get_call_history` | История звонков за период |
| `get_users` | Список пользователей |
| `send_sms` | Отправить SMS |

## Примеры

```
Покажи историю звонков за вчера
Список пользователей Voximplant
Отправь SMS на +79001234567
```

## Лицензия

MIT
