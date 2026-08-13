import Sidebar from "./Sidebar";
import "./Dashboard.css";

export default function ResponsableDashboard() {
    return (
        <div className="dashboard-container">

            <Sidebar />

            <main className="dashboard-content">

                <div className="dashboard-header">

                    <h1>
                        Dashboard Responsable
                    </h1>

                    <p>
                        Bienvenue dans votre espace
                        de gestion.
                    </p>

                </div>

                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>Documents</h3>
                        <strong>35</strong>
                    </div>

                    <div className="stat-card">
                        <h3>Dossiers</h3>
                        <strong>12</strong>
                    </div>

                    <div className="stat-card">
                        <h3>Membres</h3>
                        <strong>18</strong>
                    </div>

                    <div className="stat-card">
                        <h3>Espaces</h3>
                        <strong>4</strong>
                    </div>

                </div>

                <section className="dashboard-section">

                    <h2>
                        Gestion de votre espace
                    </h2>

                    <div className="dashboard-grid">

                        <div className="dashboard-card">

                            <h3>
                                Documents
                            </h3>

                            <p>
                                Gérer les documents
                                de votre espace.
                            </p>

                        </div>

                        <div className="dashboard-card">

                            <h3>
                                Dossiers
                            </h3>

                            <p>
                                Organiser les documents
                                dans les dossiers.
                            </p>

                        </div>

                        <div className="dashboard-card">

                            <h3>
                                Membres
                            </h3>

                            <p>
                                Consulter et gérer
                                les membres.
                            </p>

                        </div>

                        <div className="dashboard-card">

                            <h3>
                                Activités
                            </h3>

                            <p>
                                Consulter les activités
                                récentes.
                            </p>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}