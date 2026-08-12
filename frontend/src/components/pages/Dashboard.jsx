
import React from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";

function Dashboard() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <header className="dashboard-header">

                    <div>
                        <h1>Tableau de bord</h1>

                        <p>
                            Bienvenue sur votre espace de travail.
                        </p>
                    </div>

                    <div className="user-info">

                        <strong>
                            {user?.first_name} {user?.last_name}
                        </strong>

                        <span>
                            {user?.email}
                        </span>

                    </div>

                </header>

                <main className="dashboard-content">

                    <div className="dashboard-cards">

                        <div className="dashboard-card">
                            <span className="card-icon">
                                📁
                            </span>

                            <div>
                                <h3>Dossiers</h3>
                                <p>
                                    Gérer les dossiers
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <span className="card-icon">
                                📄
                            </span>

                            <div>
                                <h3>Documents</h3>
                                <p>
                                    Gérer les documents
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <span className="card-icon">
                                🏢
                            </span>

                            <div>
                                <h3>Espaces</h3>
                                <p>
                                    Espaces collaboratifs
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <span className="card-icon">
                                👥
                            </span>

                            <div>
                                <h3>Utilisateurs</h3>
                                <p>
                                    Gérer les utilisateurs
                                </p>
                            </div>
                        </div>

                    </div>

                    <section className="dashboard-welcome">

                        <h2>
                            Bienvenue sur GED Platform 👋
                        </h2>

                        <p>
                            Depuis cet espace, vous pouvez
                            gérer vos documents, dossiers et
                            espaces collaboratifs.
                        </p>

                    </section>

                </main>

            </div>

        </div>
    );
}

export default Dashboard;

