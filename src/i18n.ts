
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Gallery",
            nav_generate: "Generate",
            nav_cinematic: "CINEMATIC VIDEO",
            nav_signin: "Sign In",

            btn_generate: "GENERATE AVATAR",
            btn_download: "DOWNLOAD",
            btn_clear: "CLEAR",

            badge_original: "ORIGINAL",
            badge_result: "RESULT",

            section_visual_source: "VISUAL SOURCE",
            section_fine_tuning: "FINE TUNING",

            label_bg_reference: "BACKGROUND REFERENCE",
            label_body_ref: "BODY REFERENCE",
            label_face_ref: "FACE REFERENCE",
            label_likeness: "LIKENESS STRENGTH",

            // Control Labels
            label_body_structure: "Body Structure",
            label_art_style: "Art Style",
            label_prompt: "PROMPT DETAILS",
            label_seed: "Seed:",
            label_raw: "Raw",
            label_upscale: "Upscale",

            // Upload Zone
            drag_n_drop: "Drag & drop or click to upload",
            drop_to_upload: "Drop to Upload",
            uploading: "Uploading...",
            image_uploaded: "Image Uploaded",
            supports_formats: "Supports JPG, PNG, WEBP",
            error_file_type: "Please upload an image file",
            error_upload_failed: "Upload failed. Please try again.",

            // Placeholders
            ph_prompt: "Describe specific details...",
            ph_click_upload: "Click to Upload",
            ph_click_body: "Click to Upload Body Reference",
            ph_click_bg: "Click to Upload Background Reference",
            ph_close_unused: "(CLOSE IF UNUSED)",

            ph_face_photo: "Face Photo",
            ph_body_ref_image: "Body Reference Image",
            ph_bg_ref_image: "Background Reference Image",

            // Options: Body
            body_ai: "AI Decide / Empty",
            body_fitness: "Fitness Model",
            body_thin: "Thin / Model",
            body_athletic: "Athletic",
            body_curvy: "Curvy",

            // Options: Style
            style_ai: "AI Decide / Empty",
            style_realism: "Realistic RAW",
            style_vintage: "Vintage Pin-Up",
            style_polaroid: "Private Polaroid",
            style_analogue: "Analogue Film",
            style_anime: "Anime / Manga",
            style_hentai: "Hentai / NSFW",
            style_fashion: "Fashion Editorial",
            style_gothic: "Gothic Noir",

            status_ready: "READY",
            status_processing: "PROCESSING",
            status_error: "ERROR",

            // Video Generator
            vid_vis_ref: "Visual References",
            vid_filter_all: "All",
            vid_filter_photos: "Photos",
            vid_filter_videos: "Videos",
            vid_items: "ITEMS",
            vid_forging: "Forging...",

            vid_queue_active: "QUEUE ACTIVE",
            vid_gen_active: "GENERATION ACTIVE",
            vid_est_wait: "EST: WAITING",
            vid_est_time: "EST: 5-6 MINS",

            vid_src_img: "Source Image",
            vid_click_drag_main: "Click or Drag Image",
            vid_vision_prompt: "Vision Prompt",
            vid_ph_prompt: "Describe the motion, atmosphere, and desire...",

            vid_btn_create: "CREATE VIDEO",
            vid_active_workspace: "Active Workspace",

            vid_history: "History",
            vid_lib: "My Library",
            vid_trending: "Trending",

            vid_watch: "WATCH",
            vid_extend: "Extend Video",
            vid_upscale: "Upscale 4K",
            vid_save: "Save",
            vid_sub_extend: "+5 SEC",
            vid_sub_enhance: "ENHANCE",
            vid_sub_original: "ORIGINAL",

            vid_mode_safe: "SAFE",
            vid_mode_spicy: "SPICY",
            vid_tagline_title: "Infinity Video",
            vid_tagline_desc: "Forging digital desire. The pinnacle of <1>ai aesthetics</1>.", // <1> tag placeholder

            // Global Tooltips
            label_details: "Details",
            tooltip_download: "Download",
            tooltip_delete: "Delete",
            tooltip_open_full: "Open Full Size",

            // Avatar Generator Extra
            section_source_frames: "Source Frames",
            btn_load_edit: "Load & Edit",
            title_identity_forge: "Identity Forge",
            title_create_avatar: "Create Your <1>Avatar</1>",
            desc_identity_forge: "The ultimate forge for high-fidelity personal identities and artistic portraits.",

            banner_exclusive: "Exclusive Access",
            banner_get_pleasure: "Get Pleasure",

            opt_gender: "Gender",
            opt_age: "Age",
            opt_nation: "Nation",
            opt_clothing: "Clothing",
            opt_role: "Role",
        }
    },
    ru: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Галерея",
            nav_generate: "Генератор",
            nav_cinematic: "КИНО-ВИДЕО",
            nav_signin: "Войти",

            btn_generate: "СГЕНЕРИРОВАТЬ",
            btn_download: "СКАЧАТЬ",
            btn_clear: "ОЧИСТИТЬ",

            badge_original: "ОРИГИНАЛ",
            badge_result: "РЕЗУЛЬТАТ",

            section_visual_source: "ИСТОЧНИК",
            section_fine_tuning: "НАСТРОЙКИ",

            label_bg_reference: "ФОН (РЕФЕРЕНС)",
            label_body_ref: "ТЕЛО (РЕФЕРЕНС)",
            label_face_ref: "ЛИЦО (РЕФЕРЕНС)",
            label_likeness: "СИЛА СХОДСТВА",

            label_body_structure: "Тип Фигуры",
            label_art_style: "Стиль Арта",
            label_prompt: "ДЕТАЛИ ПРОМПТА",
            label_seed: "Сид:",
            label_raw: "Raw (Сырой)",
            label_upscale: "Upscale (HD)",

            // Upload Zone
            drag_n_drop: "Нажмите или перетащите файл",
            drop_to_upload: "Отпустите файл",
            uploading: "Загрузка...",
            image_uploaded: "Загружено",
            supports_formats: "Поддержка JPG, PNG, WEBP",
            error_file_type: "Пожалуйста, загрузите изображение",
            error_upload_failed: "Ошибка загрузки. Попробуйте еще раз.",

            ph_prompt: "Опишите детали (на английском)...",
            ph_click_upload: "Нажмите для загрузки",
            ph_click_body: "Загрузить референс тела",
            ph_click_bg: "Загрузить референс фона",
            ph_close_unused: "(ЗАКРОЙТЕ ЕСЛИ НЕ НУЖНО)",

            ph_face_photo: "Фото Лица",
            ph_body_ref_image: "Референс Тела",
            ph_bg_ref_image: "Референс Фона",

            body_ai: "ИИ решает / Пусто",
            body_fitness: "Фитнес модель",
            body_thin: "Худощавая / Модель",
            body_athletic: "Атлетичная",
            body_curvy: "С формами (Curvy)",

            style_ai: "ИИ решает / Пусто",
            style_realism: "Реализм (RAW)",
            style_vintage: "Винтаж Пин-Ап",
            style_polaroid: "Полароид (Приват)",
            style_analogue: "Пленочное Фото",
            style_anime: "Аниме / Манга",
            style_hentai: "NSFW / Хентай",
            style_fashion: "Фэшн Эдиториал",
            style_gothic: "Готика Нуар",

            status_ready: "ГОТОВО",
            status_processing: "ОБРАБОТКА",
            status_error: "ОШИБКА",

            // Video Generator
            vid_vis_ref: "Визуальные Референсы",
            vid_filter_all: "Все",
            vid_filter_photos: "Фото",
            vid_filter_videos: "Видео",
            vid_items: "ЭЛЕМЕНТОВ",
            vid_forging: "Создание...",

            vid_queue_active: "ОЧЕРЕДЬ АКТИВНА",
            vid_gen_active: "ГЕНЕРАЦИЯ АКТИВНА",
            vid_est_wait: "ВРЕМЯ: ОЖИДАНИЕ",
            vid_est_time: "ВРЕМЯ: 5-6 МИН",

            vid_src_img: "Исходное Изображение",
            vid_click_drag_main: "Нажмите или перетащите",
            vid_vision_prompt: "Визуальный Промпт",
            vid_ph_prompt: "Опишите движение, атмосферу и желания (на английском)...",

            vid_btn_create: "СОЗДАТЬ ВИДЕО",
            vid_active_workspace: "Активная Область",

            vid_history: "История",
            vid_lib: "Библиотека",
            vid_trending: "Тренды",

            vid_watch: "СМОТРЕТЬ",
            vid_extend: "Продлить",
            vid_upscale: "Upscale 4K",
            vid_save: "Сохранить",
            vid_sub_extend: "+5 СЕК",
            vid_sub_enhance: "УЛУЧШИТЬ",
            vid_sub_original: "ОРИГИНАЛ",

            vid_mode_safe: "БЕЗОПАСНО",
            vid_tagline_title: "Infinity Video",
            vid_mode_spicy: "ПИКАНТНО",
            vid_tagline_desc: "Создание цифрового желания. Вершина <1>эстетики ИИ</1>.",

            // Global Tooltips
            label_details: "Подробнее",
            tooltip_download: "Скачать",
            tooltip_delete: "Удалить",
            tooltip_open_full: "Открыть оригинал",

            // Avatar Generator Extra
            section_source_frames: "Исходные кадры",
            btn_load_edit: "Загрузить",
            title_identity_forge: "Кузница Личности",
            title_create_avatar: "Создай <1>Аватар</1>",
            desc_identity_forge: "Идеальный инструмент для создания персональных аватаров и художественных портретов.",

            banner_exclusive: "Эксклюзив",
            banner_get_pleasure: "Получить доступ",

            opt_gender: "Пол",
            opt_age: "Возраст",
            opt_nation: "Нация",
            opt_clothing: "Одежда",
            opt_role: "Роль",
        }
    },
    de: { // German
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Galerie",
            nav_generate: "Generieren",
            nav_cinematic: "KINO-VIDEO", // Translated
            btn_generate: "GENERIEREN",
            badge_original: "ORIGINAL",
            section_fine_tuning: "FEINABSTIMMUNG",
            label_body_structure: "Körpertyp",
            label_art_style: "Kunststil",
            body_ai: "KI Entscheidet",
            style_ai: "KI Entscheidet",
            drag_n_drop: "Ziehen und Ablegen",
            drop_to_upload: "Zum Hochladen ablegen",
            uploading: "Hochladen...",
            supports_formats: "JPG, PNG, WEBP unterstützt",

            vid_btn_create: "VIDEO ERSTELLEN",
            vid_tagline_title: "Infinity Video",
            vid_history: "Verlauf",
            vid_vis_ref: "Visuelle Referenzen",
            title_create_avatar: "Erstelle deinen <1>Avatar</1>",

            vid_extend: "Erweitern",
            vid_sub_extend: "+5 SEK",
            vid_upscale: "Upscale 4K",
            vid_sub_enhance: "VERBESSERN",
            vid_save: "Speichern",
            vid_sub_original: "ORIGINAL",
        }
    },
    es: { // Spanish
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Galería",
            nav_generate: "Generar",
            nav_cinematic: "VIDEO CINEMÁTICO", // Translated
            btn_generate: "GENERAR",
            badge_original: "ORIGINAL",
            section_fine_tuning: "AJUSTE FINO",
            label_body_structure: "Tipo de Cuerpo",
            label_art_style: "Estilo Artístico",
            body_ai: "IA Decide",
            style_ai: "IA Decide",
            drag_n_drop: "Arrastrar y soltar",
            drop_to_upload: "Soltar para subir",
            uploading: "Subiendo...",
            supports_formats: "Soporta JPG, PNG, WEBP",

            vid_btn_create: "CREAR VIDEO",
            vid_tagline_title: "Infinity Video",
            vid_history: "Historial",
            vid_vis_ref: "Referencias Visuales",
            title_create_avatar: "Crea tu <1>Avatar</1>",

            vid_extend: "Extender",
            vid_sub_extend: "+5 SEG",
            vid_upscale: "Upscale 4K",
            vid_sub_enhance: "MEJORAR",
            vid_save: "Guardar",
            vid_sub_original: "ORIGINAL",
        }
    },
    th: { // Thai
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "แกลเลอรี",
            nav_generate: "สร้าง",
            nav_cinematic: "วิดีโอภาพยนตร์", // Translated
            btn_generate: "สร้างอวตาร",
            badge_original: "ต้นฉบับ",
            section_fine_tuning: "ปรับแต่งละเอียด",
            label_body_structure: "รูปร่าง",
            label_art_style: "สไตล์ศิลปะ",
            body_ai: "AI ตัดสินใจ",
            style_ai: "AI ตัดสินใจ",
            drag_n_drop: "ลากและวาง",
            drop_to_upload: "วางเพื่ออัปโหลด",
            uploading: "กำลังอัปโหลด...",
            supports_formats: "รองรับ JPG, PNG, WEBP",

            vid_btn_create: "สร้างวิดีโอ",
            vid_tagline_title: "Infinity Video",
            vid_history: "ประวัติ",
            vid_vis_ref: "อ้างอิงภาพ",
            title_create_avatar: "สร้าง <1>อวตาร</1>",

            vid_extend: "ขยายวิดีโอ",
            vid_sub_extend: "+5 วินาที",
            vid_upscale: "Upscale 4K",
            vid_sub_enhance: "ปรับปรุง",
            vid_save: "บันทึก",
            vid_sub_original: "ต้นฉบับ",
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
