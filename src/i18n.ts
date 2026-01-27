
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
        }
    },
    ru: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Галерея",
            nav_generate: "Генератор",
            nav_cinematic: "КИНО-ВИДЕО",

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
        }
    },
    de: { // German
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Galerie",
            nav_generate: "Generieren",
            nav_cinematic: "CINEMATIC VIDEO",
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
        }
    },
    es: { // Spanish
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Galería",
            nav_generate: "Generar",
            nav_cinematic: "CINEMATIC VIDEO",
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
        }
    },
    th: { // Thai
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "แกลเลอรี",
            nav_generate: "สร้าง",
            nav_cinematic: "CINEMATIC VIDEO",
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
