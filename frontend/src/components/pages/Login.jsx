import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import logo from "../../../public/2M.jpg";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email,
                password: password,
            });

            console.log("Réponse Laravel :", response.data);

            const token = response.data.token;
            const user = response.data.user;

            if (!token) {
                setError("Token non reçu.");
                return;
            }

            if (!user) {
                setError("Utilisateur non reçu.");
                return;
            }

            // Sauvegarder le token
            localStorage.setItem("token", token);

            // Sauvegarder l'utilisateur
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            console.log("Connexion réussie.");

            // Redirection
            navigate("/dashboard");

        } catch (error) {
            console.error("Erreur login :", error);

            if (error.response) {
                console.error(
                    "Status :",
                    error.response.status
                );

                console.error(
                    "Réponse :",
                    error.response.data
                );

                if (error.response.data?.message) {
                    setError(
                        error.response.data.message
                    );
                } else if (
                    error.response.status === 401
                ) {
                    setError(
                        "Email ou mot de passe incorrect."
                    );
                } else {
                    setError(
                        "Erreur lors de la connexion."
                    );
                }

            } else {
                setError(
                    "Impossible de contacter le serveur Laravel."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* =================================
                LEFT — BRAND PANEL
            ================================= */}

            <div className="login-brand">

                <div className="login-brand-grid" />
                <div className="login-brand-glow" />

                <img
                    className="login-brand-logo"
                    src={logo}
                    alt="2M"
                />

                <h1 className="login-brand-heading">
                    Vos documents, classés,
                    retrouvés en un instant.
                </h1>

                <p className="login-brand-sub">
                    La plateforme GED de 2M centralise vos
                    dossiers, espaces et annonces dans un
                    seul espace sécurisé.
                </p>

                <div className="login-brand-features">

                    <div className="login-brand-feature">
                        <span className="login-brand-feature-dot">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        </span>
                        Accès sécurisé par espace et par rôle
                    </div>

                    <div className="login-brand-feature">
                        <span className="login-brand-feature-dot">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 6h16M4 12h16M4 18h10" />
                            </svg>
                        </span>
                        Classement automatique des dossiers
                    </div>

                    <div className="login-brand-feature">
                        <span className="login-brand-feature-dot">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20V10M18 20V4M6 20v-4" />
                            </svg>
                        </span>
                        Suivi et notifications en temps réel
                    </div>

                </div>

                <p className="login-brand-footer">
                    © 2026 2M — Gestion Électronique de Documents
                </p>

            </div>


            {/* =================================
                RIGHT — FORM PANEL
            ================================= */}

            <div className="login-form-panel">

                <div className="login-card">

                    {/* HEADER */}

                    <p className="login-eyebrow">
                        Espace 2M
                    </p>

                    <div className="login-header">

                        <h2>
                            Bienvenue
                        </h2>

                        <p>
                            Connectez-vous à votre espace GED
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="login-error">
                            <span className="error-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}


                    {/* FORM */}

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        {/* EMAIL */}

                        <div className="login-field">

                            <label htmlFor="email">
                                Adresse email
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                        <path d="M3 7l9 6 9-6" />
                                    </svg>
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="exemple@email.com"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="login-field">

                            <div className="password-label">

                                <label htmlFor="password">
                                    Mot de passe
                                </label>

                            </div>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="4" y="11" width="16" height="9" rx="2" />
                                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                    </svg>
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Votre mot de passe"
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Masquer le mot de passe"
                                            : "Afficher le mot de passe"
                                    }
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* OPTIONS */}

                        <div className="login-options">

                            <label className="remember-me">

                                <input
                                    type="checkbox"
                                />

                                <span>
                                    Se souvenir de moi
                                </span>

                            </label>

                            <Link
                                to="/forgot-password"
                                className="forgot-password"
                            >
                                Mot de passe oublié ?
                            </Link>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>

                                    Connexion...
                                </>
                            ) : (
                                <>
                                    Se connecter

                                    <span className="button-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>


                    {/* FOOTER */}

                    <div className="login-footer">

                        Besoin d'aide ?{" "}
                        <a href="mailto:support@2m.ma">
                            Contactez votre administrateur
                        </a>

                    </div>

                </div>

            </div>

        </div>
    );
}
