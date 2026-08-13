import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Sidebar.css";

// =========================================
// ICÔNES (trait fin, cohérentes entre elles)
// =========================================

const IconDashboard = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
        <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
);

const IconDocuments = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
        <path d="M14 3.5v4h4" />
        <path d="M8.5 13h7M8.5 16.5h7" />
    </svg>
);

const IconFolders = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18v-11.5Z" />
    </svg>
);

const IconSpaces = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 20.5v-13l7-4 7 4v13" />
        <path d="M4.5 20.5h15" />
        <path d="M9.5 20.5V14h5v6.5" />
        <path d="M9.5 9.5h.01M13.99 9.5h.01" />
    </svg>
);

const IconUsers = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
        <path d="M15.5 6a3 3 0 0 1 0 5.9" />
        <path d="M16.8 14.2c2.14.55 3.7 2.54 3.7 5.3" />
    </svg>
);

const IconAnnouncements = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10.5v3a1 1 0 0 0 1 1h1.8l3.7 3.8a.7.7 0 0 0 1.2-.5v-11.6a.7.7 0 0 0-1.2-.5L6.8 9.5H5a1 1 0 0 0-1 1Z" />
        <path d="M15.5 9.2a3.3 3.3 0 0 1 0 5.6" />
        <path d="M18 7a6.3 6.3 0 0 1 0 10" />
    </svg>
);

const IconNotifications = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13.5 6 9.5Z" />
        <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
);

const IconLogout = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4.5H8a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 8 19.5h7" />
        <path d="M11 12h9.5" />
        <path d="M17.5 8.5 21 12l-3.5 3.5" />
    </svg>
);

export default function Sidebar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    // =========================================
    // RÉCUPÉRER L'UTILISATEUR
    // =========================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );
            }
        }
    }, []);

    const roleId = Number(user?.role_id);

    // =========================================
    // DÉCONNEXION
    // =========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true,
        });
    };

    // =========================================
    // CLASS NAVIGATION
    // =========================================

    const linkClass = ({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    const navItems = [
        { to: "/dashboard", label: "Dashboard", Icon: IconDashboard },
        { to: "/documents", label: "Documents", Icon: IconDocuments },
        { to: "/folders", label: "Dossiers", Icon: IconFolders },
        { to: "/spaces", label: "Espaces", Icon: IconSpaces },
    ];

    return (
        <aside className="sidebar">

            {/* =====================================
                LOGO 2M
            ===================================== */}

            <div className="sidebar-brand">
                <img
                    src="/2M.jpg"
                    alt="2M"
                    className="sidebar-logo-image"
                />
            </div>


            {/* =====================================
                NAVIGATION
            ===================================== */}

            <div className="sidebar-section-title">
                Navigation
            </div>


            <nav className="sidebar-menu">

                {navItems.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} className={linkClass}>
                        <span className="sidebar-icon">
                            <Icon />
                        </span>
                        <span className="sidebar-link-text">
                            {label}
                        </span>
                    </NavLink>
                ))}

                {/* UTILISATEURS — ADMIN + RESPONSABLE */}

                {(roleId === 1 || roleId === 2) && (
                    <NavLink to="/users" className={linkClass}>
                        <span className="sidebar-icon">
                            <IconUsers />
                        </span>
                        <span className="sidebar-link-text">
                            Utilisateurs
                        </span>
                    </NavLink>
                )}

                <NavLink to="/announcements" className={linkClass}>
                    <span className="sidebar-icon">
                        <IconAnnouncements />
                    </span>
                    <span className="sidebar-link-text">
                        Annonces
                    </span>
                </NavLink>

                <NavLink to="/notifications" className={linkClass}>
                    <span className="sidebar-icon">
                        <IconNotifications />
                    </span>
                    <span className="sidebar-link-text">
                        Notifications
                    </span>
                </NavLink>

            </nav>


            


            {/* =====================================
                DÉCONNEXION
            ===================================== */}

            <div className="sidebar-bottom">

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <span className="sidebar-logout-icon">
                        <IconLogout />
                    </span>
                    <span>
                        Déconnexion
                    </span>
                </button>

            </div>

        </aside>
    );
}