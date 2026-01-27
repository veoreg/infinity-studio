
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// RESOURCES
// In a large app, we would move these to separate JSON files (public/locales/en/translation.json),
// but for now, we'll keep them here for speed and simplicity.

const resources = {
    en: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Gallery",
            nav_generate: "Generate",

            // Avatar Generator Labels
            label_gender: "GENDER",
            label_age: "AGE",
            label_nation: "NATION",
            label_clothing: "CLOTHING",
            label_role: "ROLE",
            label_style: "STYLE",

            btn_generate: "GENERATE AVATAR",
            btn_download: "DOWNLOAD",
            btn_clear: "CLEAR",

            // Comparison / Edit
            badge_original: "ORIGINAL",
            badge_result: "RESULT",

            // Quick Edit
            edit_placeholder: "E.g. Make hair blonde, add glasses...",
            btn_refine: "REFINE",
            btn_cancel: "CANCEL",

            // Sections
            section_visual_source: "VISUAL SOURCE",
            section_fine_tuning: "FINE TUNING",

            // Status
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

            label_gender: "ПОЛ",
            label_age: "ВОЗРАСТ",
            label_nation: "НАЦИЯ",
            label_clothing: "ОДЕЖДА",
            label_role: "РОЛЬ",
            label_style: "СТИЛЬ",

            btn_generate: "СГЕНЕРИРОВАТЬ",
            btn_download: "СКАЧАТЬ",
            btn_clear: "ОЧИСТИТЬ",

            badge_original: "ОРИГИНАЛ",
            badge_result: "РЕЗУЛЬТАТ",

            edit_placeholder: "Напр.: Сделай волосы светлыми, добавь очки...",
            btn_refine: "УЛУЧШИТЬ",
            btn_cancel: "ОТМЕНА",

            section_visual_source: "ИСТОЧНИК",
            section_fine_tuning: "НАСТРОЙКИ",

            status_ready: "ГОТОВО",
            status_processing: "ОБРАБОТКА",
            status_error: "ОШИБКА",
        }
    },
    de: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Galerie",
            nav_generate: "Generieren",

            label_gender: "GESCHLECHT",
            label_age: "ALTER",
            label_nation: "NATION",
            label_clothing: "KLEIDUNG",
            label_role: "ROLLE",
            label_style: "STIL",

            btn_generate: "GENERIEREN",
            btn_download: "HERUNTERLADEN",
            btn_clear: "LÖSCHEN",

            badge_original: "ORIGINAL",
            badge_result: "ERGEBNIS",

            edit_placeholder: "Z.B. Blonde Haare, Brille hinzufügen...",
            btn_refine: "VERBESSERN",
            btn_cancel: "ABBRECHEN",

            section_visual_source: "VISUELLE QUELLE",
            section_fine_tuning: "FEINABSTIMMUNG",

            status_ready: "BEREIT",
            status_processing: "VERARBEITUNG",
            status_error: "FEHLER",
        }
    },
    es: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "Galería",
            nav_generate: "Generar",

            label_gender: "GÉNERO",
            label_age: "EDAD",
            label_nation: "NACIÓN",
            label_clothing: "ROPA",
            label_role: "ROL",
            label_style: "ESTILO",

            btn_generate: "GENERAR",
            btn_download: "DESCARGAR",
            btn_clear: "BORRAR",

            badge_original: "ORIGINAL",
            badge_result: "RESULTADO",

            edit_placeholder: "Ej: Hacer cabello rubio, añadir gafas...",
            btn_refine: "MEJORAR",
            btn_cancel: "CANCELAR",

            section_visual_source: "FUENTE VISUAL",
            section_fine_tuning: "AJUSTE FINO",

            status_ready: "LISTO",
            status_processing: "PROCESANDO",
            status_error: "ERROR",
        }
    },
    th: {
        translation: {
            app_title: "INFINITY AVATARS",
            nav_gallery: "แกลเลอรี",
            nav_generate: "สร้าง",

            label_gender: "เพศ",
            label_age: "อายุ",
            label_nation: "เชื้อชาติ",
            label_clothing: "เครื่องแต่งกาย",
            label_role: "บทบาท",
            label_style: "สไตล์",

            btn_generate: "สร้างอวตาร",
            btn_download: "ดาวน์โหลด",
            btn_clear: "ล้าง",

            badge_original: "ต้นฉบับ",
            badge_result: "ผลลัพธ์",

            edit_placeholder: "เช่น ทำผมสีบลอนด์, ใส่แว่น...",
            btn_refine: "ปรับปรุง",
            btn_cancel: "ยกเลิก",

            section_visual_source: "แหล่งข้อมูลภาพ",
            section_fine_tuning: "ปรับแต่งละเอียด",

            status_ready: "พร้อม",
            status_processing: "กำลังประมวลผล",
            status_error: "ข้อผิดพลาด",
        }
    }
};

i18n
    .use(LanguageDetector) // Enables auto-detection (browser settings)
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Default language if detection fails
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

export default i18n;
