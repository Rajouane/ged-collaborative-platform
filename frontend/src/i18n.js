import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    fr: {
        translation: {
            dashboard: "Dashboard",
            documents: "Documents",
            folders: "Dossiers",
            spaces: "Espaces",
            users: "Utilisateurs",
            announcements: "Annonces",
            notifications: "Notifications",
            settings: "Paramètres",
            logout: "Déconnexion",

            navigation: "NAVIGATION",

            welcome: "Bienvenue",
            user_space: "ESPACE UTILISATEUR",
            admin_space: "ESPACE ADMINISTRATION",

            profile: "Profil",
            security: "Sécurité",
            language: "Langue",

            save: "Enregistrer",
            cancel: "Annuler",
            delete: "Supprimer",
            edit: "Modifier",
            add: "Ajouter",

            application_language: "Langue de l'application",
            language_saved:
                "Votre préférence est enregistrée automatiquement.",

            first_name: "Prénom",
            last_name: "Nom",
            email: "Adresse email",

            current_password: "Mot de passe actuel",
            new_password: "Nouveau mot de passe",
            confirm_password: "Confirmer le mot de passe",

            change_password: "Modifier le mot de passe",

            my_documents: "Mes documents",
            my_folders: "Mes dossiers",
            my_spaces: "Mes espaces",

            activity: "Activité récente",
            administration: "Administration",

            search: "Rechercher",
            loading: "Chargement...",
        },
    },

    en: {
        translation: {
            dashboard: "Dashboard",
            documents: "Documents",
            folders: "Folders",
            spaces: "Spaces",
            users: "Users",
            announcements: "Announcements",
            notifications: "Notifications",
            settings: "Settings",
            logout: "Logout",

            navigation: "NAVIGATION",

            welcome: "Welcome",
            user_space: "USER AREA",
            admin_space: "ADMINISTRATION AREA",

            profile: "Profile",
            security: "Security",
            language: "Language",

            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            edit: "Edit",
            add: "Add",

            application_language: "Application language",
            language_saved:
                "Your preference is saved automatically.",

            first_name: "First name",
            last_name: "Last name",
            email: "Email address",

            current_password: "Current password",
            new_password: "New password",
            confirm_password: "Confirm password",

            change_password: "Change password",

            my_documents: "My documents",
            my_folders: "My folders",
            my_spaces: "My spaces",

            activity: "Recent activity",
            administration: "Administration",

            search: "Search",
            loading: "Loading...",
        },
    },

    ar: {
        translation: {
            dashboard: "لوحة التحكم",
            documents: "الوثائق",
            folders: "المجلدات",
            spaces: "المساحات",
            users: "المستخدمون",
            announcements: "الإعلانات",
            notifications: "الإشعارات",
            settings: "الإعدادات",
            logout: "تسجيل الخروج",

            navigation: "التنقل",

            welcome: "مرحبا",
            user_space: "مساحة المستخدم",
            admin_space: "مساحة الإدارة",

            profile: "الملف الشخصي",
            security: "الأمان",
            language: "اللغة",

            save: "حفظ",
            cancel: "إلغاء",
            delete: "حذف",
            edit: "تعديل",
            add: "إضافة",

            application_language: "لغة التطبيق",
            language_saved:
                "يتم حفظ تفضيلك تلقائياً.",

            first_name: "الاسم الشخصي",
            last_name: "اسم العائلة",
            email: "البريد الإلكتروني",

            current_password: "كلمة المرور الحالية",
            new_password: "كلمة المرور الجديدة",
            confirm_password: "تأكيد كلمة المرور",

            change_password: "تغيير كلمة المرور",

            my_documents: "وثائقي",
            my_folders: "مجلداتي",
            my_spaces: "مساحاتي",

            activity: "النشاط الأخير",
            administration: "الإدارة",

            search: "بحث",
            loading: "جاري التحميل...",
        },
    },
};

const savedLanguage =
    localStorage.getItem("language") || "fr";

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: "fr",

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;