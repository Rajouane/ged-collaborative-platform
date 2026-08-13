import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "./Sidebar";
import "./Notifications.css";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // RÉCUPÉRER LES NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/notifications");

            console.log("Status notifications :", response.status);
            console.log("Notifications Laravel :", response.data);

            // Laravel doit normalement retourner un tableau
            if (Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                // Protection si Laravel retourne :
                // { notifications: [...] }
                if (Array.isArray(response.data.notifications)) {
                    setNotifications(response.data.notifications);
                } else {
                    setNotifications([]);
                }
            }

        } catch (err) {
            console.error(
                "Erreur récupération notifications :",
                err
            );

            console.error(
                "Status :",
                err.response?.status
            );

            console.error(
                "Réponse Laravel :",
                err.response?.data
            );

            if (err.response?.status === 401) {
                setError(
                    "Votre session a expiré. Veuillez vous reconnecter."
                );
            } else if (err.response?.status === 404) {
                setError(
                    "La route des notifications est introuvable."
                );
            } else if (err.response?.status === 500) {
                setError(
                    "Erreur interne du serveur Laravel."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Impossible de récupérer les notifications."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CHARGEMENT INITIAL
    // ==========================================

    useEffect(() => {
        fetchNotifications();
    }, []);

    // ==========================================
    // COMPTER LES NOTIFICATIONS NON LUES
    // ==========================================

    const unreadCount = notifications.filter(
        (notification) =>
            notification.is_read === false ||
            notification.is_read === 0
    ).length;

    // ==========================================
    // MARQUER UNE NOTIFICATION COMME LUE
    // ==========================================

    const markAsRead = async (id) => {
        try {
            setError("");

            const response = await api.put(
                `/notifications/${id}`
            );

            console.log(
                "Notification marquée comme lue :",
                response.data
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map(
                    (notification) =>
                        notification.id === id
                            ? {
                                  ...notification,
                                  is_read: true,
                              }
                            : notification
                )
            );

        } catch (err) {
            console.error(
                "Erreur marquage notification :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de marquer la notification comme lue."
            );
        }
    };

    // ==========================================
    // TOUT MARQUER COMME LU
    // ==========================================

    const markAllAsRead = async () => {
        try {
            setError("");

            await api.put(
                "/notifications/read-all"
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map(
                    (notification) => ({
                        ...notification,
                        is_read: true,
                    })
                )
            );

        } catch (err) {
            console.error(
                "Erreur marquage de toutes les notifications :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de marquer les notifications comme lues."
            );
        }
    };

    // ==========================================
    // SUPPRIMER UNE NOTIFICATION
    // ==========================================

    const deleteNotification = async (id) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cette notification ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/notifications/${id}`
            );

            setNotifications(
                (currentNotifications) =>
                    currentNotifications.filter(
                        (notification) =>
                            notification.id !== id
                    )
            );

        } catch (err) {
            console.error(
                "Erreur suppression notification :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de supprimer la notification."
            );
        }
    };

    // ==========================================
    // FORMATTER LA DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const formattedDate = new Date(date);

        if (Number.isNaN(formattedDate.getTime())) {
            return "";
        }

        return formattedDate.toLocaleString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // ==========================================
    // DÉTERMINER SI UNE NOTIFICATION EST LUE
    // ==========================================

    const isRead = (notification) => {
        return (
            notification.is_read === true ||
            notification.is_read === 1
        );
    };

    // ==========================================
    // AFFICHAGE
    // ==========================================

    return (
        <div className="dashboard-layout">

            {/* SIDEBAR */}

            <Sidebar />

            {/* CONTENU PRINCIPAL */}

            <main className="notifications-main">

                {/* =========================
                    HEADER
                ========================== */}

                <header className="notifications-header">

                    <div>
                        <h1>
                            Notifications
                        </h1>

                        <p>
                            Consultez vos notifications
                            et actualités.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="mark-all-button"
                            onClick={markAllAsRead}
                        >
                            ✓ Tout marquer comme lu
                        </button>
                    )}

                </header>

                {/* =========================
                    RÉSUMÉ
                ========================== */}

                <div className="notification-summary">

                    <div className="notification-summary-icon">
                        🔔
                    </div>

                    <div>
                        <span>
                            Notifications non lues
                        </span>

                        <strong>
                            {unreadCount}
                        </strong>
                    </div>

                </div>

                {/* =========================
                    ERREUR
                ========================== */}

                {error && (
                    <div className="notification-error">

                        <span>
                            ⚠️
                        </span>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {/* =========================
                    CHARGEMENT
                ========================== */}

                {loading ? (

                    <div className="notifications-loading">

                        <div className="loading-icon">
                            🔔
                        </div>

                        <p>
                            Chargement des notifications...
                        </p>

                    </div>

                ) : notifications.length === 0 ? (

                    /* =========================
                       AUCUNE NOTIFICATION
                    ========================== */

                    <div className="notifications-empty">

                        <div className="empty-icon">
                            🔔
                        </div>

                        <h2>
                            Aucune notification
                        </h2>

                        <p>
                            Vous n'avez aucune
                            notification pour le moment.
                        </p>

                        <button
                            type="button"
                            className="refresh-button"
                            onClick={fetchNotifications}
                        >
                            🔄 Actualiser
                        </button>

                    </div>

                ) : (

                    /* =========================
                       LISTE DES NOTIFICATIONS
                    ========================== */

                    <div className="notifications-list">

                        {notifications.map(
                            (notification) => {

                                const notificationIsRead =
                                    isRead(notification);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-card ${
                                            notificationIsRead
                                                ? "read"
                                                : "unread"
                                        }`}
                                    >

                                        {/* ICÔNE */}

                                        <div
                                            className="notification-icon"
                                        >
                                            {notificationIsRead
                                                ? "✓"
                                                : "🔔"}
                                        </div>

                                        {/* CONTENU */}

                                        <div
                                            className="notification-content"
                                        >

                                            <div
                                                className="notification-title-row"
                                            >

                                                <h3>
                                                    {
                                                        notification.title
                                                    }
                                                </h3>

                                                {!notificationIsRead && (
                                                    <span
                                                        className="unread-badge"
                                                    >
                                                        Nouveau
                                                    </span>
                                                )}

                                            </div>

                                            <p>
                                                {
                                                    notification.message
                                                }
                                            </p>

                                            <small>
                                                {formatDate(
                                                    notification.created_at
                                                )}
                                            </small>

                                        </div>

                                        {/* ACTIONS */}

                                        <div
                                            className="notification-actions"
                                        >

                                            {!notificationIsRead && (
                                                <button
                                                    type="button"
                                                    className="read-button"
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    ✓ Lire
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="delete-button"
                                                title="Supprimer"
                                                onClick={() =>
                                                    deleteNotification(
                                                        notification.id
                                                    )
                                                }
                                            >
                                                🗑️
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </main>

        </div>
    );
}
