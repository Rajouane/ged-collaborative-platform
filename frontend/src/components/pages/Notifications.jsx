import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "./Sidebar";
import "./Notifications.css";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // CHARGER LES NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/notifications");

            console.log(
                "Notifications Laravel :",
                response.data
            );

            setNotifications(response.data);

        } catch (error) {
            console.error(
                "Erreur récupération notifications :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de récupérer les notifications."
            );

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
    // NOTIFICATIONS NON LUES
    // ==========================================

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    // ==========================================
    // MARQUER COMME LUE
    // ==========================================

    const markAsRead = async (id) => {
        try {
            const response = await api.put(
                `/notifications/${id}`
            );

            console.log(
                "Notification lue :",
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

        } catch (error) {
            console.error(
                "Erreur notification :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de marquer la notification comme lue."
            );
        }
    };

    // ==========================================
    // TOUT MARQUER COMME LU
    // ==========================================

    const markAllAsRead = async () => {
        try {
            await api.put(
                "/notifications-read-all"
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map(
                    (notification) => ({
                        ...notification,
                        is_read: true,
                    })
                )
            );

        } catch (error) {
            console.error(
                "Erreur marquage notifications :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de marquer les notifications comme lues."
            );
        }
    };

    // ==========================================
    // SUPPRIMER
    // ==========================================

    const deleteNotification = async (id) => {
        const confirmed = window.confirm(
            "Voulez-vous supprimer cette notification ?"
        );

        if (!confirmed) {
            return;
        }

        try {
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

        } catch (error) {
            console.error(
                "Erreur suppression notification :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de supprimer la notification."
            );
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString(
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
    // AFFICHAGE
    // ==========================================

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="notifications-main">

                {/* HEADER */}

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

                {/* STATISTIQUE */}

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

                {/* ERREUR */}

                {error && (
                    <div className="notification-error">
                        {error}
                    </div>
                )}

                {/* CHARGEMENT */}

                {loading ? (
                    <div className="notifications-loading">
                        Chargement des notifications...
                    </div>

                ) : notifications.length === 0 ? (

                    /* AUCUNE NOTIFICATION */

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

                    </div>

                ) : (

                    /* LISTE */

                    <div className="notifications-list">

                        {notifications.map(
                            (notification) => (

                                <div
                                    key={notification.id}
                                    className={`notification-card ${
                                        notification.is_read
                                            ? "read"
                                            : "unread"
                                    }`}
                                >

                                    {/* ICON */}

                                    <div className="notification-icon">
                                        {notification.is_read
                                            ? "✓"
                                            : "🔔"}
                                    </div>

                                    {/* CONTENU */}

                                    <div className="notification-content">

                                        <div className="notification-title-row">

                                            <h3>
                                                {
                                                    notification.title
                                                }
                                            </h3>

                                            {!notification.is_read && (
                                                <span className="unread-badge">
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

                                    <div className="notification-actions">

                                        {!notification.is_read && (
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
                            )
                        )}

                    </div>
                )}

            </main>

        </div>
    );
}