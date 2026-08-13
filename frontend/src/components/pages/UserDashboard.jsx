import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import "./Dashboard.css";

export default function UserDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        const data = localStorage.getItem("user");

        if (data) {
            try {
                setUser(JSON.parse(data));
            } catch (error) {
                console.error(
                    "Erreur utilisateur :",
                    error
                );
            }
        }

    }, []);


    const firstName =
        user?.first_name || "Utilisateur";

    const lastName =
        user?.last_name || "";


    return (
        <div className="user-dashboard-page">

            {/* SIDEBAR */}

            <Sidebar />


            {/* CONTENU */}

            <main className="user-dashboard-main">

                {/* HEADER */}

                <header className="user-dashboard-header">

                    <div>

                        <span className="user-dashboard-label">
                            ESPACE UTILISATEUR
                        </span>

                        <h1>
                            Bonjour {firstName} 👋
                        </h1>

                        <p>
                            Bienvenue dans votre espace
                            personnel de gestion documentaire.
                        </p>

                    </div>


                    <div className="user-account">

                        <div className="user-account-avatar">

                            {firstName
                                .charAt(0)
                                .toUpperCase()}

                            {lastName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div>

                            <strong>
                                {firstName} {lastName}
                            </strong>

                            <span>
                                Utilisateur
                            </span>

                        </div>

                    </div>

                </header>


                {/* STATISTIQUES */}

                <section className="user-stats">

                    <div className="user-stat">

                        <div className="user-stat-icon blue">
                            📄
                        </div>

                        <div>
                            <span>
                                Mes documents
                            </span>

                            <strong>
                                15
                            </strong>
                        </div>

                    </div>


                    <div className="user-stat">

                        <div className="user-stat-icon purple">
                            📁
                        </div>

                        <div>
                            <span>
                                Mes dossiers
                            </span>

                            <strong>
                                6
                            </strong>
                        </div>

                    </div>


                    <div className="user-stat">

                        <div className="user-stat-icon green">
                            🏢
                        </div>

                        <div>
                            <span>
                                Mes espaces
                            </span>

                            <strong>
                                3
                            </strong>
                        </div>

                    </div>


                    <div className="user-stat">

                        <div className="user-stat-icon orange">
                            🔔
                        </div>

                        <div>
                            <span>
                                Notifications
                            </span>

                            <strong>
                                5
                            </strong>
                        </div>

                    </div>

                </section>


                {/* ACTIONS */}

                <section className="user-section">

                    <div className="user-section-title">

                        <div>

                            <h2>
                                Mon espace
                            </h2>

                            <p>
                                Accédez rapidement à vos
                                ressources.
                            </p>

                        </div>

                    </div>


                    <div className="user-cards">


                        {/* DOCUMENTS */}

                        <button
                            className="user-card"
                            onClick={() =>
                                navigate("/documents")
                            }
                        >

                            <div className="user-card-icon blue">
                                📄
                            </div>

                            <h3>
                                Mes documents
                            </h3>

                            <p>
                                Consulter et gérer
                                vos documents.
                            </p>

                            <span>
                                Ouvrir →
                            </span>

                        </button>


                        {/* DOSSIERS */}

                        <button
                            className="user-card"
                            onClick={() =>
                                navigate("/folders")
                            }
                        >

                            <div className="user-card-icon purple">
                                📁
                            </div>

                            <h3>
                                Mes dossiers
                            </h3>

                            <p>
                                Organiser vos documents
                                dans vos dossiers.
                            </p>

                            <span>
                                Ouvrir →
                            </span>

                        </button>


                        {/* ESPACES */}

                        <button
                            className="user-card"
                            onClick={() =>
                                navigate("/spaces")
                            }
                        >

                            <div className="user-card-icon green">
                                🏢
                            </div>

                            <h3>
                                Mes espaces
                            </h3>

                            <p>
                                Accéder à vos espaces
                                collaboratifs.
                            </p>

                            <span>
                                Ouvrir →
                            </span>

                        </button>


                        {/* NOTIFICATIONS */}

                        <button
                            className="user-card"
                            onClick={() =>
                                navigate("/notifications")
                            }
                        >

                            <div className="user-card-icon orange">
                                🔔
                            </div>

                            <h3>
                                Notifications
                            </h3>

                            <p>
                                Consulter vos dernières
                                notifications.
                            </p>

                            <span>
                                Ouvrir →
                            </span>

                        </button>

                    </div>

                </section>


                {/* ACTIVITÉ */}

                <section className="user-section">

                    <div className="user-section-title">

                        <div>

                            <h2>
                                Activité récente
                            </h2>

                            <p>
                                Vos dernières actions.
                            </p>

                        </div>

                    </div>


                    <div className="user-activity">

                        <div className="user-activity-item">

                            <div className="activity-icon blue">
                                📄
                            </div>

                            <div>

                                <strong>
                                    Document ajouté
                                </strong>

                                <p>
                                    Rapport annuel 2026.pdf
                                </p>

                            </div>

                            <span>
                                Aujourd'hui
                            </span>

                        </div>


                        <div className="user-activity-item">

                            <div className="activity-icon purple">
                                📁
                            </div>

                            <div>

                                <strong>
                                    Dossier créé
                                </strong>

                                <p>
                                    Documents importants
                                </p>

                            </div>

                            <span>
                                Hier
                            </span>

                        </div>


                        <div className="user-activity-item">

                            <div className="activity-icon green">
                                🔄
                            </div>

                            <div>

                                <strong>
                                    Document modifié
                                </strong>

                                <p>
                                    Contrat de travail.pdf
                                </p>

                            </div>

                            <span>
                                Hier
                            </span>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}