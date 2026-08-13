import Sidebar from "./Sidebar";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">

            <Sidebar />

            <main className="admin-main">

                {/* HEADER */}

                <header className="admin-header">

                    <div>
                        <span className="admin-label">
                            ESPACE ADMINISTRATION
                        </span>

                        <h1>
                            Dashboard Administrateur
                        </h1>

                        <p>
                            Bienvenue dans votre espace
                            d'administration.
                        </p>
                    </div>

                    <div className="admin-profile">

                        <div className="admin-avatar">
                            A
                        </div>

                        <div>
                            <strong>
                                Admin GED
                            </strong>

                            <span>
                                Administrateur
                            </span>
                        </div>

                    </div>

                </header>


                {/* STATISTIQUES */}

                <section className="admin-stats">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon blue">
                            👥
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Utilisateurs
                            </span>

                            <strong>
                                25
                            </strong>

                            <small>
                                utilisateurs actifs
                            </small>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon purple">
                            📄
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Documents
                            </span>

                            <strong>
                                120
                            </strong>

                            <small>
                                documents enregistrés
                            </small>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon orange">
                            📁
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Dossiers
                            </span>

                            <strong>
                                45
                            </strong>

                            <small>
                                dossiers créés
                            </small>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon green">
                            🏢
                        </div>

                        <div className="admin-stat-info">

                            <span>
                                Espaces
                            </span>

                            <strong>
                                8
                            </strong>

                            <small>
                                espaces collaboratifs
                            </small>

                        </div>

                    </div>

                </section>


                {/* ADMINISTRATION */}

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

                                <a href="/users">
                                    Gérer les utilisateurs →
                                </a>

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

                                <a href="/users">
                                    Gérer les rôles →
                                </a>

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

                                <a href="/spaces">
                                    Gérer les espaces →
                                </a>

                            </div>

                        </div>


                        {/* ACTIVITÉ */}

                        <div className="admin-action-card">

                            <div className="admin-action-icon orange">
                                📊
                            </div>

                            <div className="admin-action-content">

                                <h3>
                                    Journal d'activité
                                </h3>

                                <p>
                                    Consulter les activités
                                    récentes de la plateforme.
                                </p>

                                <a href="/notifications">
                                    Voir les activités →
                                </a>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ACTIVITÉ RÉCENTE */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>

                            <h2>
                                Activité récente
                            </h2>

                            <p>
                                Dernières activités de la plateforme.
                            </p>

                        </div>

                    </div>


                    <div className="admin-activity">

                        <div className="admin-activity-item">

                            <div className="activity-avatar blue">
                                👤
                            </div>

                            <div className="activity-info">

                                <strong>
                                    Nouvel utilisateur
                                </strong>

                                <span>
                                    Un nouvel utilisateur a été ajouté.
                                </span>

                            </div>

                            <time>
                                Aujourd'hui
                            </time>

                        </div>


                        <div className="admin-activity-item">

                            <div className="activity-avatar purple">
                                📄
                            </div>

                            <div className="activity-info">

                                <strong>
                                    Nouveau document
                                </strong>

                                <span>
                                    Un nouveau document a été ajouté.
                                </span>

                            </div>

                            <time>
                                Aujourd'hui
                            </time>

                        </div>


                        <div className="admin-activity-item">

                            <div className="activity-avatar green">
                                🏢
                            </div>

                            <div className="activity-info">

                                <strong>
                                    Nouvel espace
                                </strong>

                                <span>
                                    Un espace collaboratif a été créé.
                                </span>

                            </div>

                            <time>
                                Hier
                            </time>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}