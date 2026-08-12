
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    GED
                </div>

                <div>
                    <h2>GED Platform</h2>
                    <span>Gestion documentaire</span>
                </div>
            </div>

            <nav className="sidebar-menu">

                <button
                    className="sidebar-item active"
                    onClick={() => navigate("/dashboard")}
                >
                    <span>📊</span>
                    Dashboard
                </button>

                <button
                    className="sidebar-item"
                    onClick={() => navigate("/folders")}
                >
                    <span>📁</span>
                    Dossiers
                </button>

                <button
                    className="sidebar-item"
                    onClick={() => navigate("/documents")}
                >
                    <span>📄</span>
                    Documents
                </button>

                <button
                    className="sidebar-item"
                    onClick={() => navigate("/spaces")}
                >
                    <span>🏢</span>
                    Espaces
                </button>

                <button
                    className="sidebar-item"
                    onClick={() => navigate("/users")}
                >
                    <span>👥</span>
                    Utilisateurs
                </button>

                <button
                    className="sidebar-item"
                    onClick={() => navigate("/notifications")}
                >
                    <span>🔔</span>
                    Notifications
                </button>

            </nav>

            <div className="sidebar-bottom">

                <button className="sidebar-item">
                    <span>⚙️</span>
                    Paramètres
                </button>

                <button
                    className="sidebar-item logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    Déconnexion
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;

