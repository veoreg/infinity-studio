# AI Girls Studio - Project Context & Memory

Этот файл является "памятью" проекта. Он обновляется в конце каждой сессии, чтобы любой агент (или я сам после очистки контекста) мог быстро понять текущее состояние дел.

## ❗️ Правила коммуникации
- **Язык**: Все общение, комментарии и логи вести строго на **Русском языке**.
- **Логирование**: Обновлять лог изменений (walkthrough) сразу после внедрения фич.
- **ВНИМАНИЕ (Strict Rule)**: Запрещено вносить любые изменения в N8n и ComfyUI воркфлоу без явного разрешения пользователя. Совсем.

## 🛠 Стек технологий
- **Frontend**: React + Vite + TypeScript + Tailwind CSS.
- **Backend/DB**: Supabase (Database, Auth, Realtime, Storage).
- **Automation**: N8n (обработка видео, деплой на кастомном сервере).
- **UI Style**: Art Deco / Luxury (золото, черный бархат).
- **PWA**: Manifest, Service Worker, Custom Install Prompt.

## 🏗 Архитектура деплоя (JAMstack)

### Фронтенд (Vercel + Netlify)
```
Git Push → Vercel/Netlify → Auto Build → CDN → Production URL
```
- **Vercel**: https://infinity-studio-ai.vercel.app/
- **Netlify**: https://tourmaline-axolotl-048b75.netlify.app/
- **Как работает**: Автодеплой при `git push` в main ветку (CI/CD)

### Бэкенд (N8N Webhooks — Serverless)
```
Frontend API Call → N8N Webhook → ComfyUI → Supabase Storage
```
- **Нет традиционного сервера** — прямые вызовы webhook
- **N8N** хостится на собственном сервере (n8n.develotex.io)

### База данных (Supabase)
- **Realtime**: Подписки на изменения для мониторинга статуса генерации
- **REST API**: CRUD операции с таблицей `generations`
- **Storage**: Хранение сгенерированных картинок и видео
- **Auth**: Система аутентификации

## 🚀 Текущий функционал
- **Video Generator**: Генерация видео из картинок (через N8n и Wan2.1).
- **Avatar Creator**: Раздел для создания аватаров.
- **User Gallery**: Полноценная лента-кинолента с историей генераций из Supabase.
- **PWA Ready**: Приложение устанавливается как нативная программа (Manifest + SW).

### 4. AI Image Refiner (Editor)
- **UI**: Interactive "Before/After" slider with side-by-side layout on desktop.
- **Workflow**: Dedicated branch in N8n (`job_type: edit`). Supports 1, 2, or 3 reference images (Multi-Input).
- **History**: Creates new records in Supabase with `parent_id`.

## 📝 Задачи (Current & Future)

### ✅ Completed (Recent)
- [x] **PWA Implementation**: Manifest, SW, Install Prompt UI.
- [x] **Traffic Generator Foundation**: Python watermark script, Gemini Prompt, N8n JSON Structure.

### 📅 План на следующую сессию (Next Session)
1. **Workflow 3: Admin Telegram Bot**:
   - Команда `/stats`: Отчет по регистрациям и оплатам (24ч).
   - Команда `/restart`: Перезагрузка Docker-контейнера ComfyUI (SSH).
2. **Workflow 4: Biometric Authenticator (Self-Hosted)**:
   - **Stack**: Python FastAPI + InsightFace (Buffalo_L) + Docker GPU.
   - **Logic**: Face Embedding > Vector Search (pgvector) > Cosine Similarity.
   - **Liveness**: Motion Challenge (blink/smile) to prevent spoofing.
3. **Workflow 1: Traffic Generator (Finalize)**:
   - Импорт JSON и настройка путей в N8n.
4. **Workflow 2: Smart Payment**:
   - Вебхук оплаты -> Обновление баланса в Supabase.

## ⚠️ Известные проблемы
- **Видео отображение**: Иногда показывается старое тестовое видео (мониторинг продолжается).

## 🔗 Важные ссылки
- **Repository**: `https://github.com/veoreg/infinity-studio`
- **N8n Webhook**: `https://n8n.develotex.io/webhook/wan_context_safeMode_3_SB`
- **Main Workflow**: `e:\AI_girl_flux_dev\APP_VID\n8n\n8n_WAN22enhanced_safeMode_3+SB_MAIN.json`

---
*Обновлено агентом Antigravity (Google Deepmind).*
