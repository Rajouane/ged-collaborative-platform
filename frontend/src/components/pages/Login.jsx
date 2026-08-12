
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email,
                password: password,
            });

            console.log("Réponse Laravel :", response.data);

            // Récupération du token
            const token = response.data.token;

            // Récupération de l'utilisateur
            const user = response.data.user;

            // Sauvegarde dans le navigateur
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Redirection vers Dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Erreur login :", error);

            if (error.response) {
                setError(
                    error.response.data.message ||
                    "Email ou mot de passe incorrect"
                );
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
            <div className="login-wrapper">

                <div className="login-brand">
                    <div className="brand-logo">
                        GED
                    </div>

                    <h1>GED Platform</h1>

                    <p>
                        Gestion Électronique des Documents
                    </p>
                </div>

                <div className="login-card">

                    <div className="login-header">
                        <h2>Bienvenue</h2>

                        <p>
                            Connectez-vous à votre compte
                        </p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label htmlFor="email">
                                Adresse email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="admin@ged.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Mot de passe
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Connexion..."
                                : "Se connecter"}
                        </button>

                    </form>
                </div>

                <p className="login-footer">
                    © 2026 GED Platform — Tous droits réservés
                </p>

            </div>
        </div>
    );
}

export default Login;

