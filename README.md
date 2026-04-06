# @theyahia/voximplant-mcp

MCP-сервер для Voximplant API — звонки, SMS, записи, сценарии, правила. **11 инструментов + 2 скилла.**

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
      "env": {
        "VOXIMPLANT_ACCOUNT_ID": "your-id",
        "VOXIMPLANT_API_KEY": "your-key"
      }
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
{
  "servers": {
    "voximplant": {
      "command": "npx",
      "args": ["-y", "@theyahia/voximplant-mcp"],
      "env": {
        "VOXIMPLANT_ACCOUNT_ID": "your-id",
        "VOXIMPLANT_API_KEY": "your-key"
      }
    }
  }
}
```

### Streamable HTTP

```bash
npx @theyahia/voximplant-mcp --http
# Сервер стартует на http://localhost:3000/mcp
# Health check: http://localhost:3000/health
# Порт можно задать через PORT=8080
```

> Требуется `VOXIMPLANT_ACCOUNT_ID` и `VOXIMPLANT_API_KEY`. Получите в [панели управления Voximplant](https://manage.voximplant.com).

## Инструменты (11)

| Инструмент | Описание |
|------------|----------|
| `get_call_history` | История звонков за период |
| `get_users` | Список пользователей |
| `send_sms` | Отправить SMS |
| `get_account_info` | Информация об аккаунте (баланс, тариф) |
| `get_scenarios` | Список сценариев |
| `update_scenario` | Обновить код/название сценария |
| `get_rules` | Правила маршрутизации приложения |
| `start_call` | Инициировать исходящий звонок |
| `get_active_calls` | Активные сессии звонков |
| `get_sms_history` | История SMS сообщений |
| `get_recordings` | Получить ссылки на записи звонков |

## Скиллы (2)

| Скилл | Описание |
|-------|----------|
| `skill-call-history` | История звонков за последние 24 часа (сводка) |
| `skill-account-info` | Информация об аккаунте Voximplant |

## Примеры

```
Покажи историю звонков за вчера
Список пользователей Voximplant
Отправь SMS на +79001234567
Покажи информацию об аккаунте
Какие сценарии настроены?
Покажи правила для приложения 123
Начни звонок по правилу 456
Какие звонки сейчас активны?
Покажи историю SMS за январь
Дай ссылки на записи звонков за вчера
```

## Лицензия

MIT
