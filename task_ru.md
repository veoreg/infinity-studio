# Список задач: AI Photo Editor & n8n Integration

## 💎 Redesign 2026 (UI/UX Overhaul)
- [ ] **Phase 1: Planning & Structure**
    - [x] Create Implementation Plan.
    - [x] Update Header (Compact Coins).
    - [x] Remove Hero Banner.
- [ ] **Phase 2: Left Panel (Galleries)**
    - [x] Create `AssetSidebar` (Moved to Right).
    - [x] Implement Premium 2-Column Grid for Showcase.
    - [x] Add "Inject Frame" Hover Action.
- [ ] **Phase 3: Center Stage**
    - [/] Refactor `AvatarGenerator` Layout (Columns Adjusted).
    - [ ] Optimize Controls (Inputs & Sliders).
- [ ] **Phase 4: Right Panel (History)**
    - [x] Move History/Assets to Right Sidebar.
    - [x] Design Refinement (Video Generator Style).
    - [x] Move 'Fine Tuning' Block to Right Column.

- [x] **Phase 5: Video Generator Left Panel**
    - [x] **Layout**: Change Grid from 2 columns to **3 columns**.
    - [x] **Filter Tabs**: Add a sticky header with tabs [PHOTOS | VIDEOS] (or Photos/Videos toggle).
    - [x] **Filtering Logic**: Show only relevant items based on active tab.
    - [x] **Click Logic**: Maintain existing logic (Photo->Input, Video->Player).


## 🟢 Выполнено (Frontend UI)
- [x] Реализован премиальный интерфейс модального окна `EditPhotoModal`.
- [x] Добавлен интерактивный слайдер сравнения "До/После".
- [x] Реализована загрузка собственных изображений прямо в редактор.
- [x] Оптимизирована верстка: две колонки на десктопе, кнопка "Switch Source" перенесена в удобное место.
- [x] Исправлена контрастность поля ввода инструкций и текста-плейсхолдера.
- [x] **UI Polish**: Исправлен стиль ввода возраста ("Age" input) и выравнивание.
- [x] **UI Polish**: Восстановлены все опции для dropdown-меню (Role, Nation).
- [x] **Feature**: Полная галерея истории (Видео + Фото) в правой панели.
- [x] **UI Polish**: Новый премиальный индикатор загрузки (вместо старого спиннера).
- [x] **UI Polish**: Добавлен заголовок "Create Your Avatar" (Landing Header) в рабочей области.
- [x] **UI Controls**: Добавлена кнопка "На весь экран" (Maximize).
- [x] **UI Controls**: Редизайн кнопок (Edit / Download) в стиле Video Generator + Airy Update (компактные).
- [x] **UI Fix**: Исправлено наложение ползунка "Likeness Strength" на текст.
- [x] **Feature**: Кнопка "Load & Edit" в сайдбаре (взамен LIVE). Загружает картинку и сразу открывает Edit Modal.

## 🟡 В процессе (Backend / n8n)
- [ ] **n8n Workflow**:
    - [ ] Добавить узел `Switch` после первого `Set` для разделения потоков (`generate` vs `edit`).
    - [ ] Создать отдельный вспомогательный Workflow для обработки `edit`.
    - [ ] Настроить Quen VLM на прием оригинала и текстового запроса.
- [ ] **Supabase Logic**:
    - [ ] Реализовать создание новой записи для каждой правки с сохранением `parent_id` в метаданных.
    - [ ] Проверить передачу URL между Supabase и n8n/ComfyUI.

## 🔴 Предстоящие задачи (Frontend Integration)
- [ ] Обновить функцию `onSubmit` в `AvatarGenerator.tsx` для отправки `job_type: edit` и `parent_id`.
- [ ] Добавить отображение "истории правок" в галерее (группировка по `parent_id`).
- [ ] Реализовать сохранение промежуточных этапов (до и после апскейла) для слайдера сравнения.

---
> [!TIP]
> Используй `parent_id` в метаданных Supabase, чтобы не терять связь между оригиналом и его вариациями в будущем.
