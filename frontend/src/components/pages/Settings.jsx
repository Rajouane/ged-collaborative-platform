import { useEffect, useState } from "react";

import api from "../services/api";

import { useTranslation } from "react-i18next";

import "./Settings.css";

export default function Settings() {
    const { t } = useTranslation();

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    const [password, setPassword] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [language, setLanguage] = useState(
        localStorage.getItem("language") || "fr"
    );

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const [profileError, setProfileError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    // =====================================================
    // CHARGER UTILISATEUR
    // =====================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            setProfile({
                first_name: parsedUser.first_name || "",
                last_name: parsedUser.last_name || "",
                email: parsedUser.email || "",
            });
        } catch (error) {
            console.error("Erreur utilisateur :", error);
        }
    }, []);

    // =====================================================
    // INITIALISER LA DIRECTION DE LA PAGE
    // =====================================================

    useEffect(() => {
        document.documentElement.lang = language;

        document.documentElement.dir =
            language === "ar" ? "rtl" : "ltr";
    }, [language]);

    // =====================================================
    // CHANGER LA LANGUE
    // =====================================================

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;

        setLanguage(selectedLanguage);

        localStorage.setItem(
            "language",
            selectedLanguage
        );

        document.documentElement.lang = selectedLanguage;

        document.documentElement.dir =
            selectedLanguage === "ar"
                ? "rtl"
                : "ltr";

        // Recharge l'application pour appliquer
        // les traductions enregistrées.
        window.location.reload();
    };

    // =====================================================
    // MODIFIER PROFIL
    // =====================================================

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));

        setProfileMessage("");
        setProfileError("");
    };

    // =====================================================
    // ENREGISTRER PROFIL
    // =====================================================

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        setProfileMessage("");
        setProfileError("");

        if (!profile.first_name.trim()) {
            setProfileError(
                "Le prénom est obligatoire."
            );
            return;
        }

        if (!profile.last_name.trim()) {
            setProfileError(
                "Le nom est obligatoire."
            );
            return;
        }

        try {
            setProfileLoading(true);

            const response = await api.put(
                "/profile",
                {
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                }
            );

            const updatedUser =
                response.data?.user ||
                response.data?.data ||
                {
                    ...user,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                };

            const finalUser = {
                ...user,
                ...updatedUser,
                first_name: profile.first_name,
                last_name: profile.last_name,
            };

            setUser(finalUser);

            localStorage.setItem(
                "user",
                JSON.stringify(finalUser)
            );

            setProfileMessage(
                "Votre profil a été modifié avec succès."
            );
        } catch (error) {
            console.error(
                "Erreur modification profil :",
                error
            );

            setProfileError(
                error.response?.data?.message ||
                "Impossible de modifier le profil."
            );
        } finally {
            setProfileLoading(false);
        }
    };

    // =====================================================
    // PASSWORD CHANGE
    // =====================================================

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPassword((previous) => ({
            ...previous,
            [name]: value,
        }));

        setPasswordMessage("");
        setPasswordError("");
    };

    // =====================================================
    // MODIFIER PASSWORD
    // =====================================================

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (!password.current_password) {
            setPasswordError(
                "Veuillez saisir votre mot de passe actuel."
            );
            return;
        }

        if (!password.password) {
            setPasswordError(
                "Veuillez saisir un nouveau mot de passe."
            );
            return;
        }

        if (password.password.length < 8) {
            setPasswordError(
                "Le nouveau mot de passe doit contenir au moins 8 caractères."
            );
            return;
        }

        if (
            password.password !==
            password.password_confirmation
        ) {
            setPasswordError(
                "Les mots de passe ne correspondent pas."
            );
            return;
        }

        try {
            setPasswordLoading(true);

            await api.put(
                "/profile/password",
                {
                    current_password:
                        password.current_password,

                    password:
                        password.password,

                    password_confirmation:
                        password.password_confirmation,
                }
            );

            setPassword({
                current_password: "",
                password: "",
                password_confirmation: "",
            });

            setPasswordMessage(
                "Votre mot de passe a été modifié avec succès."
            );
        } catch (error) {
            console.error(
                "Erreur modification mot de passe :",
                error
            );

            setPasswordError(
                error.response?.data?.message ||
                "Impossible de modifier le mot de passe."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <main className="settings-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="settings-header">
                <div>
                    <h1>
                        {t("settings")}
                    </h1>

                    <p>
                        Gérez votre profil,
                        votre sécurité et vos préférences.
                    </p>
                </div>
            </header>

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <section className="settings-content">

                {/* =================================================
                    PROFIL
                ================================================= */}

                <div className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon profile-icon">
                            👤
                        </div>

                        <div>
                            <h2>
                                {t("profile")}
                            </h2>

                            <p>
                                Modifiez vos informations personnelles.
                            </p>
                        </div>

                    </div>

                    <form
                        className="settings-form"
                        onSubmit={handleUpdateProfile}
                    >

                        <div className="settings-form-grid">

                            <div className="settings-field">

                                <label>
                                    Prénom
                                </label>

                                <input
                                    name="first_name"
                                    type="text"
                                    value={profile.first_name}
                                    onChange={handleProfileChange}
                                    placeholder="Votre prénom"
                                />

                            </div>

                            <div className="settings-field">

                                <label>
                                    Nom
                                </label>

                                <input
                                    name="last_name"
                                    type="text"
                                    value={profile.last_name}
                                    onChange={handleProfileChange}
                                    placeholder="Votre nom"
                                />

                            </div>

                        </div>

                        <div className="settings-field">

                            <label>
                                Adresse email
                            </label>

                            <input
                                type="email"
                                value={profile.email}
                                disabled
                            />

                            <small>
                                L'adresse email ne peut pas être
                                modifiée ici.
                            </small>

                        </div>

                        {profileError && (
                            <div className="settings-error">
                                {profileError}
                            </div>
                        )}

                        {profileMessage && (
                            <div className="settings-success">
                                {profileMessage}
                            </div>
                        )}

                        <div className="settings-actions">

                            <button
                                type="submit"
                                className="settings-primary-button"
                                disabled={profileLoading}
                            >
                                {profileLoading
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                        </div>

                    </form>

                </div>

                {/* =================================================
                    SECURITE
                ================================================= */}

                <div className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon security-icon">
                            🔐
                        </div>

                        <div>
                            <h2>
                                {t("security")}
                            </h2>

                            <p>
                                Modifiez votre mot de passe.
                            </p>
                        </div>

                    </div>

                    <form
                        className="settings-form"
                        onSubmit={handleUpdatePassword}
                    >

                        {/* MOT DE PASSE ACTUEL */}

                        <div className="settings-field">

                            <label>
                                Mot de passe actuel
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    name="current_password"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        password.current_password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Votre mot de passe actuel"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            (previous) => !previous
                                        )
                                    }
                                >
                                    {showCurrentPassword
                                        ? "◉"
                                        : "◌"}
                                </button>

                            </div>

                        </div>

                        {/* NOUVEAU MOT DE PASSE */}

                        <div className="settings-field">

                            <label>
                                Nouveau mot de passe
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        password.password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Nouveau mot de passe"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) => !previous
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "◉"
                                        : "◌"}
                                </button>

                            </div>

                        </div>

                        {/* CONFIRMATION */}

                        <div className="settings-field">

                            <label>
                                Confirmer le mot de passe
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    name="password_confirmation"
                                    type={
                                        showPasswordConfirmation
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        password.password_confirmation
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Confirmer le nouveau mot de passe"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPasswordConfirmation(
                                            (previous) => !previous
                                        )
                                    }
                                >
                                    {showPasswordConfirmation
                                        ? "◉"
                                        : "◌"}
                                </button>

                            </div>

                        </div>

                        <div className="password-help">

                            <span>
                                ℹ️
                            </span>

                            <span>
                                Le mot de passe doit contenir
                                au minimum 8 caractères.
                            </span>

                        </div>

                        {passwordError && (
                            <div className="settings-error">
                                {passwordError}
                            </div>
                        )}

                        {passwordMessage && (
                            <div className="settings-success">
                                {passwordMessage}
                            </div>
                        )}

                        <div className="settings-actions">

                            <button
                                type="submit"
                                className="settings-primary-button"
                                disabled={passwordLoading}
                            >
                                {passwordLoading
                                    ? "Modification..."
                                    : "Modifier le mot de passe"}
                            </button>

                        </div>

                    </form>

                </div>

                {/* =================================================
                    LANGUE
                ================================================= */}

                <div className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon language-icon">
                            🌐
                        </div>

                        <div>
                            <h2>
                                {t("language")}
                            </h2>

                            <p>
                                Choisissez la langue de l'application.
                            </p>
                        </div>

                    </div>

                    <div className="settings-language">

                        <div className="settings-field">

                            <label>
                                Langue de l'application
                            </label>

                            <select
                                value={language}
                                onChange={handleLanguageChange}
                            >

                                <option value="fr">
                                    🇫🇷 Français
                                </option>

                                <option value="en">
                                    🇬🇧 English
                                </option>

                                <option value="ar">
                                    🇲🇦 العربية
                                </option>

                            </select>

                        </div>

                        <div className="language-info">

                            <span>
                                ✓
                            </span>

                            <span>
                                Votre préférence est enregistrée
                                automatiquement.
                            </span>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}