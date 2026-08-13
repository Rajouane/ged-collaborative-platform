import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
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

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/dashboard");

        } catch (error) {
            console.error("Erreur login :", error);

            if (error.response) {
                if (error.response.data?.message) {
                    setError(error.response.data.message);
                } else if (error.response.status === 401) {
                    setError("Email ou mot de passe incorrect.");
                } else {
                    setError("Erreur lors de la connexion.");
                }
            } else {
                setError("Impossible de contacter le serveur Laravel.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* =================================
                DECORATIVE BACKGROUND BLOBS
            ================================= */}

            <div className="bg-blob blob-violet"></div>
            <div className="bg-blob blob-cyan"></div>
            <div className="bg-blob blob-pink"></div>


            {/* =================================
                GLASS LOGIN CARD
            ================================= */}

            <div className="login-card">

                <div className="login-logo">
                    <img src="/2M.jpg" alt="2M" />
                </div>

                <div className="login-header">
                    <h1>Bienvenue</h1>
                    <p>Connectez-vous à votre espace GED</p>
                </div>

                {error && (
                    <div className="login-error">
                        <span className="error-icon">!</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleLogin}>

                    <div className="login-field">
                        <label htmlFor="email">Adresse email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉</span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@email.com"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Mot de passe</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Votre mot de passe"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    <div className="login-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Se souvenir de moi</span>
                        </label>

                        <Link to="/forgot-password" className="forgot-password">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Connexion...
                            </>
                        ) : (
                            <>
                                Se connecter
                                <span className="button-arrow">→</span>
                            </>
                        )}
                    </button>

                </form>

                <div className="login-footer">
                    <p>Plateforme de Gestion Électronique des Documents</p>
                    <span>© 2026 2M Collaborative Platform</span>
                </div>

            </div>

        </div>
    );
}