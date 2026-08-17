import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        users: 0,
        documents: 0,
        folders: 0,
        spaces: 0,
        notifications: 0,
    });

    const [loading, setLoading] = useState(true);


    // =====================================================
    // UTILISATEUR
    // =====================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            return;
        }

        try {

            const parsedUser =
                JSON.parse(storedUser);

            setUser(parsedUser);

        } catch (error) {

            console.error(
                "Erreur utilisateur :",
                error
            );

        }

    }, []);


    // =====================================================
    // STATISTIQUES
    // =====================================================

    useEffect(() => {

        const fetchStats = async () => {

            try {

                setLoading(true);

                const response =
                    await api.get(
                        "/dashboard/stats"
                    );

                const data =
                    response.data || {};

                setStats({

                    users:
                        Number(data.users) || 0,

                    documents:
                        Number(data.documents) || 0,

                    folders:
                        Number(data.folders) || 0,

                    spaces:
                        Number(data.spaces) || 0,

                    notifications:
                        Number(data.notifications) || 0,

                });

            } catch (error) {

                console.error(
                    "Erreur statistiques :",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        fetchStats();

    }, []);


    // =====================================================
    // NOM
    // =====================================================

    const firstName =
        user?.first_name || "Admin";

    const lastName =
        user?.last_name || "";


    const fullName =
        `${firstName} ${lastName}`.trim();


    // =====================================================
    // INITIALS
    // =====================================================

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase();


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-dashboard">


            {/* =================================================
                CONTENU
            ================================================= */}

            <main className="admin-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="admin-header">

                    <div>

                        <span className="admin-label">
                            ESPACE ADMINISTRATION
                        </span>

                        <h1>
                            Dashboard Administrateur
                        </h1>

                        <p>
                            Bienvenue {fullName} dans votre
                            espace d'administration.
                        </p>

                    </div>


                    <div className="admin-profile">

                        <div className="admin-avatar">

                            {initials || "A"}

                        </div>


                        <div>

                            <strong>
                                {fullName}
                            </strong>

                            <span>
                                Administrateur
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                <section className="admin-stats">


                    {/* UTILISATEURS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon blue">
                            👥
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Utilisateurs
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.users}
                            </strong>

                            <small>
                                utilisateurs enregistrés
                            </small>

                        </div>

                    </div>


                    {/* DOCUMENTS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon purple">
                            📄
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Documents
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.documents}
                            </strong>

                            <small>
                                documents enregistrés
                            </small>

                        </div>

                    </div>


                    {/* DOSSIERS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon orange">
                            📁
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Dossiers
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.folders}
                            </strong>

                            <small>
                                dossiers créés
                            </small>

                        </div>

                    </div>


                    {/* ESPACES */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon green">
                            🏢
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Espaces
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.spaces}
                            </strong>

                            <small>
                                espaces collaboratifs
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ADMINISTRATION
                ================================================= */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>

                            <h2>
                                Administration
                            </h2>

                            <p>
                                Gérez les différents éléments
                                de la plateforme.
                            </p>

                        </div>

                    </div>


                    <div className="admin-actions">


                        {/* UTILISATEURS */}

                        <div className="admin-action-card">

                            <div className="admin-action-icon blue">
                                👥
                            </div>

                            <div className="admin-action-content">

                                <h3>
                                    Gestion des utilisateurs
                                </h3>

                                <p>
                                    Ajouter, modifier,
                                    supprimer et consulter
                                    les utilisateurs.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/users")
                                    }
                                >
                                    Gérer les utilisateurs →
                                </button>

                            </div>

                        </div>


                        {/* RÔLES */}

                        <div className="admin-action-card">

                            <div className="admin-action-icon purple">
                                🔐
                            </div>

                            <div className="admin-action-content">

                                <h3>
                                    Gestion des rôles
                                </h3>

                                <p>
                                    Gérer les rôles et les
                                    permissions des utilisateurs.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/users")
                                    }
                                >
                                    Gérer les rôles →
                                </button>

                            </div>

                        </div>


                        {/* ESPACES */}

                        <div className="admin-action-card">

                            <div className="admin-action-icon green">
                                🏢
                            </div>

                            <div className="admin-action-content">

                                <h3>
                                    Gestion des espaces
                                </h3>

                                <p>
                                    Gérer les espaces
                                    collaboratifs de la plateforme.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/spaces")
                                    }
                                >
                                    Gérer les espaces →
                                </button>

                            </div>

                        </div>


                        {/* NOTIFICATIONS */}

                        <div className="admin-action-card">

                            <div className="admin-action-icon orange">
                                🔔
                            </div>

                            <div className="admin-action-content">

                                <h3>
                                    Notifications
                                </h3>

                                <p>
                                    Vous avez{" "}
                                    <strong>
                                        {stats.notifications}
                                    </strong>{" "}
                                    notification(s) non lue(s).
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/notifications"
                                        )
                                    }
                                >
                                    Voir les notifications →
                                </button>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    VUE RAPIDE
                ================================================= */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>

                            <h2>
                                Vue rapide
                            </h2>

                            <p>
                                État actuel de la plateforme.
                            </p>

                        </div>

                    </div>


                    <div className="admin-activity">


                        {/* USERS */}

                        <div className="admin-activity-item">

                            <div className="activity-avatar blue">
                                👥
                            </div>

                            <div className="activity-info">

                                <strong>
                                    Utilisateurs
                                </strong>

                                <span>
                                    {stats.users} utilisateurs
                                    enregistrés.
                                </span>

                            </div>

                            <time>
                                Maintenant
                            </time>

                        </div>


                        {/* DOCUMENTS */}

                        <div className="admin-activity-item">

                            <div className="activity-avatar purple">
                                📄
                            </div>

                            <div className="activity-info">

                                <strong>
                                    Documents
                                </strong>

                                <span>
                                    {stats.documents} documents
                                    enregistrés.
                                </span>

                            </div>

                            <time>
                                Maintenant
                            </time>

                        </div>


                        {/* SPACES */}

                        <div className="admin-activity-item">

                            <div className="activity-avatar green">
                                🏢
                            </div>

                            <div className="activity-info">

                                <strong>
                                    Espaces
                                </strong>

                                <span>
                                    {stats.spaces} espaces
                                    collaboratifs.
                                </span>

                            </div>

                            <time>
                                Maintenant
                            </time>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}