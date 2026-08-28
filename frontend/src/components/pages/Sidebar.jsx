import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Sidebar.css";

// =====================================================
// ICÔNES
// =====================================================

const IconDashboard = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
        <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
);

const IconDocuments = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
        <path d="M14 3.5v4h4" />
        <path d="M8.5 13h7M8.5 16.5h7" />
    </svg>
);

const IconFolders = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18v-11.5Z" />
    </svg>
);

const IconSpaces = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 20.5v-13l7-4 7 4v13" />
        <path d="M4.5 20.5h15" />
        <path d="M9.5 20.5V14h5v6.5" />
        <path d="M9.5 9.5h.01M13.99 9.5h.01" />
    </svg>
);

const IconUsers = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
        <path d="M15.5 6a3 3 0 0 1 0 5.9" />
        <path d="M16.8 14.2c2.14.55 3.7 2.54 3.7 5.3" />
    </svg>
);

const IconAnnouncements = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10.5v3a1 1 0 0 0 1 1h1.8l3.7 3.8a.7.7 0 0 0 1.2-.5v-11.6a.7.7 0 0 0-1.2-.5L6.8 9.5H5a1 1 0 0 0-1 1Z" />
        <path d="M15.5 9.2a3.3 3.3 0 0 1 0 5.6" />
        <path d="M18 7a6.3 6.3 0 0 1 0 10" />
    </svg>
);

const IconNotifications = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13.5 6 9.5Z" />
        <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
);

const IconSettings = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V19.6h-2v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7.76v-2h.08A1.7 1.7 0 0 0 9.4 10.94a1.7 1.7 0 0 0-.34-1.88L9 9l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V6.4h2v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.78 9l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21v2h-.06A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
);

const IconLogout = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4.5H8a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 8 19.5h7" />
        <path d="M11 12h9.5" />
        <path d="M17.5 8.5 21 12l-3.5 3.5" />
    </svg>
);

const IconMenu = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6.5h16" />
        <path d="M4 12h16" />
        <path d="M4 17.5h16" />
    </svg>
);

const IconCollapse = ({ collapsed }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {collapsed ? (
            <path d="m9 18 6-6-6-6" />
        ) : (
            <path d="m15 18-6-6 6-6" />
        )}
    </svg>
);

// =====================================================
// SIDEBAR
// =====================================================

export default function Sidebar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // État desktop
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem("sidebarCollapsed") === "true";
    });

    // État mobile
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // =====================================================
    // UTILISATEUR
    // =====================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Erreur lecture utilisateur :", error);
            }
        }
    }, []);

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    useEffect(() => {
        const loadUnreadNotifications = async () => {
            try {
                const response = await api.get("/notifications");
                const data = response.data;

                let notifications = [];

                if (Array.isArray(data)) {
                    notifications = data;
                } else if (Array.isArray(data?.data)) {
                    notifications = data.data;
                } else if (Array.isArray(data?.notifications)) {
                    notifications = data.notifications;
                }

                const unread = notifications.filter(
                    (notification) =>
                        !notification.is_read
                ).length;

                setUnreadNotifications(unread);
            } catch (error) {
                console.error(
                    "Erreur notifications Sidebar :",
                    error
                );

                setUnreadNotifications(0);
            }
        };

        loadUnreadNotifications();

        const interval = setInterval(
            loadUnreadNotifications,
            30000
        );

        return () => clearInterval(interval);
    }, []);

    // =====================================================
    // RESIZE
    // =====================================================

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 700) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, []);

    // =====================================================
    // COLLAPSE
    // =====================================================

    const toggleSidebar = () => {
        setIsCollapsed((previous) => {
            const next = !previous;

            localStorage.setItem(
                "sidebarCollapsed",
                String(next)
            );

            // Événement pour App.jsx
            window.dispatchEvent(
                new CustomEvent("sidebar-change", {
                    detail: {
                        collapsed: next,
                    },
                })
            );

            return next;
        });
    };

    // =====================================================
    // MOBILE
    // =====================================================

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sidebarCollapsed");

        navigate("/login", {
            replace: true,
        });
    };

    // =====================================================
    // ROLE
    // =====================================================

    const roleId = Number(user?.role_id);

    // =====================================================
    // NAVIGATION
    // =====================================================

    const linkClass = ({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    const navItems = [
        {
            to: "/dashboard",
            label: "Dashboard",
            Icon: IconDashboard,
        },
        {
            to: "/documents",
            label: "Documents",
            Icon: IconDocuments,
        },
        {
            to: "/folders",
            label: "Dossiers",
            Icon: IconFolders,
        },
        {
            to: "/spaces",
            label: "Espaces",
            Icon: IconSpaces,
        },
    ];

    return (
        <>
            {/* =====================================================
                HAMBURGER MOBILE
            ===================================================== */}

            <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Ouvrir le menu"
            >
                <IconMenu />
            </button>

            {/* =====================================================
                OVERLAY
            ===================================================== */}

            <div
                className={`sidebar-overlay ${
                    isMobileOpen
                        ? "sidebar-overlay-visible"
                        : ""
                }`}
                onClick={closeMobileMenu}
            />

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside
                className={`sidebar ${
                    isCollapsed
                        ? "sidebar-collapsed"
                        : ""
                } ${
                    isMobileOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                {/* =================================================
                    BOUTON COLLAPSE
                ================================================= */}

                <button
                    type="button"
                    className="sidebar-collapse-btn"
                    onClick={toggleSidebar}
                    aria-label={
                        isCollapsed
                            ? "Ouvrir la sidebar"
                            : "Réduire la sidebar"
                    }
                    title={
                        isCollapsed
                            ? "Ouvrir"
                            : "Réduire"
                    }
                >
                    <IconCollapse
                        collapsed={isCollapsed}
                    />
                </button>

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="sidebar-brand">
                    <img
                        src="/2M.jpg"
                        alt="2M"
                        className="sidebar-logo-image"
                    />
                </div>

                {/* =================================================
                    TITRE
                ================================================= */}

                <div className="sidebar-section-title">
                    Navigation
                </div>

                {/* =================================================
                    MENU
                ================================================= */}

                <nav className="sidebar-menu">

                    {navItems.map(
                        ({
                            to,
                            label,
                            Icon,
                        }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={linkClass}
                                onClick={closeMobileMenu}
                                title={
                                    isCollapsed
                                        ? label
                                        : undefined
                                }
                            >
                                <span className="sidebar-icon">
                                    <Icon />
                                </span>

                                <span className="sidebar-link-text">
                                    {label}
                                </span>
                            </NavLink>
                        )
                    )}

                    {/* UTILISATEURS */}

                    {(roleId === 1 ||
                        roleId === 2) && (
                        <NavLink
                            to="/users"
                            className={linkClass}
                            onClick={closeMobileMenu}
                            title={
                                isCollapsed
                                    ? "Utilisateurs"
                                    : undefined
                            }
                        >
                            <span className="sidebar-icon">
                                <IconUsers />
                            </span>

                            <span className="sidebar-link-text">
                                Utilisateurs
                            </span>
                        </NavLink>
                    )}

                    {/* ANNONCES */}

                    <NavLink
                        to="/announcements"
                        className={linkClass}
                        onClick={closeMobileMenu}
                        title={
                            isCollapsed
                                ? "Annonces"
                                : undefined
                        }
                    >
                        <span className="sidebar-icon">
                            <IconAnnouncements />
                        </span>

                        <span className="sidebar-link-text">
                            Annonces
                        </span>
                    </NavLink>

                    {/* NOTIFICATIONS */}

                    <NavLink
                        to="/notifications"
                        className={linkClass}
                        onClick={closeMobileMenu}
                        title={
                            isCollapsed
                                ? "Notifications"
                                : undefined
                        }
                    >
                        <span className="sidebar-icon notification-icon-wrapper">
                            <IconNotifications />

                            {unreadNotifications > 0 && (
                                <span className="notification-badge">
                                    {unreadNotifications > 99
                                        ? "99+"
                                        : unreadNotifications}
                                </span>
                            )}
                        </span>

                        <span className="sidebar-link-text">
                            Notifications
                        </span>
                    </NavLink>

                    {/* PARAMÈTRES */}

                    <NavLink
                        to="/settings"
                        className={linkClass}
                        onClick={closeMobileMenu}
                        title={
                            isCollapsed
                                ? "Paramètres"
                                : undefined
                        }
                    >
                        <span className="sidebar-icon">
                            <IconSettings />
                        </span>

                        <span className="sidebar-link-text">
                            Paramètres
                        </span>
                    </NavLink>

                </nav>

                <div className="sidebar-spacer" />

                {/* =================================================
                    LOGOUT
                ================================================= */}

                <div className="sidebar-bottom">

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                        title={
                            isCollapsed
                                ? "Déconnexion"
                                : undefined
                        }
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
        </>
    );
}