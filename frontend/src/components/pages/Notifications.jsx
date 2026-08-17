import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Notifications.css";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    // =========================================================
    // LOAD NOTIFICATIONS
    // =========================================================

    const loadNotifications = useCallback(async () => {
        try {
            setError("");

            const response =
                await api.get("/notifications");

            const data = response.data;

            const result = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];

            setNotifications(result);
        } catch (err) {
            console.error(
                "Erreur notifications:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de charger les notifications."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // =========================================================
    // INITIAL LOAD + REFRESH
    // =========================================================

    useEffect(() => {
        loadNotifications();

        const interval = setInterval(
            loadNotifications,
            10000
        );

        return () => {
            clearInterval(interval);
        };
    }, [loadNotifications]);

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    const unreadCount = useMemo(() => {
        return notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;
    }, [notifications]);

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    const markAsRead = async (notification) => {
        if (
            !notification ||
            notification.is_read
        ) {
            return;
        }

        try {
            setMarkingId(notification.id);

            await api.put(
                `/notifications/${notification.id}`
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? {
                            ...item,
                            is_read: true,
                        }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Erreur lecture notification:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de marquer la notification comme lue."
            );
        } finally {
            setMarkingId(null);
        }
    };

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    const markAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            setMarkingAll(true);

            await api.put(
                "/notifications/read-all"
            );

            setNotifications((previous) =>
                previous.map((item) => ({
                    ...item,
                    is_read: true,
                }))
            );
        } catch (err) {
            console.error(
                "Erreur notifications:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de marquer les notifications comme lues."
            );
        } finally {
            setMarkingAll(false);
        }
    };

    // =========================================================
    // ICON
    // =========================================================

    const getNotificationIcon = (
        notification
    ) => {
        const type =
            notification?.type
                ?.toString()
                ?.toLowerCase();

        if (
            type === "space_added" ||
            type === "space-member-added"
        ) {
            return "👥";
        }

        if (
            type === "document" ||
            type === "document_added"
        ) {
            return "📄";
        }

        if (
            type === "announcement"
        ) {
            return "📢";
        }

        if (
            type === "success"
        ) {
            return "✓";
        }

        if (
            type === "warning"
        ) {
            return "!";
        }

        return "🔔";
    };

    // =========================================================
    // ICON CLASS
    // =========================================================

    const getNotificationTypeClass = (
        notification
    ) => {
        const type =
            notification?.type
                ?.toString()
                ?.toLowerCase();

        if (
            type === "space_added" ||
            type === "space-member-added"
        ) {
            return "space";
        }

        if (
            type === "document" ||
            type === "document_added"
        ) {
            return "document";
        }

        if (
            type === "announcement"
        ) {
            return "announcement";
        }

        if (
            type === "success"
        ) {
            return "success";
        }

        if (
            type === "warning"
        ) {
            return "warning";
        }

        return "default";
    };

    // =========================================================
    // DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleString(
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

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="notifications-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="notifications-header">

                <div className="notifications-title-wrapper">

                    <div className="notifications-title-icon">
                        🔔
                    </div>

                    <div>
                        <div className="notifications-title-line">

                            <h1>
                                Notifications
                            </h1>

                            {unreadCount > 0 && (
                                <span className="notifications-count">
                                    {unreadCount}
                                </span>
                            )}

                        </div>

                        <p>
                            Consultez vos dernières notifications
                            et les activités importantes.
                        </p>
                    </div>

                </div>

                {unreadCount > 0 && (

                    <button
                        type="button"
                        className="notifications-read-all"
                        onClick={
                            markAllAsRead
                        }
                        disabled={markingAll}
                    >
                        {markingAll ? (
                            <>
                                <span className="notification-button-spinner" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                ✓
                                Tout marquer comme lu
                            </>
                        )}
                    </button>

                )}

            </header>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="notifications-alert">

                    <div className="notifications-alert-icon">
                        !
                    </div>

                    <div className="notifications-alert-content">

                        <strong>
                            Une erreur est survenue
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}

            {/* =================================================
                CONTENT
            ================================================= */}

            {loading ? (

                <div className="notifications-loading">

                    <div className="notifications-spinner" />

                    <span>
                        Chargement des notifications...
                    </span>

                </div>

            ) : notifications.length === 0 ? (

                <div className="notifications-empty">

                    <div className="notifications-empty-icon">
                        🔔
                    </div>

                    <h2>
                        Aucune notification
                    </h2>

                    <p>
                        Vous êtes à jour. Aucune nouvelle
                        notification pour le moment.
                    </p>

                </div>

            ) : (

                <div className="notifications-container">

                    <div className="notifications-list">

                        {notifications.map(
                            (notification) => {

                                const isUnread =
                                    !notification.is_read;

                                const iconClass =
                                    getNotificationTypeClass(
                                        notification
                                    );

                                return (

                                    <article
                                        key={
                                            notification.id
                                        }
                                        className={
                                            `notification-card ${
                                                isUnread
                                                    ? "notification-unread"
                                                    : "notification-read"
                                            }`
                                        }
                                        onClick={() =>
                                            isUnread &&
                                            markAsRead(
                                                notification
                                            )
                                        }
                                    >

                                        <div
                                            className={
                                                `notification-icon ${iconClass}`
                                            }
                                        >
                                            {getNotificationIcon(
                                                notification
                                            )}
                                        </div>

                                        <div className="notification-body">

                                            <div className="notification-top">

                                                <h3>
                                                    {
                                                        notification.title ||
                                                        "Notification"
                                                    }
                                                </h3>

                                                {isUnread && (
                                                    <span className="unread-label">
                                                        Nouvelle
                                                    </span>
                                                )}

                                            </div>

                                            <p>
                                                {
                                                    notification.message ||
                                                    "Vous avez reçu une nouvelle notification."
                                                }
                                            </p>

                                            <div className="notification-bottom">

                                                <span className="notification-date">
                                                    {formatDate(
                                                        notification.created_at
                                                    )}
                                                </span>

                                                {isUnread && (

                                                    <button
                                                        type="button"
                                                        className="notification-read-button"
                                                        disabled={
                                                            markingId ===
                                                            notification.id
                                                        }
                                                        onClick={(
                                                            event
                                                        ) => {
                                                            event.stopPropagation();

                                                            markAsRead(
                                                                notification
                                                            );
                                                        }}
                                                    >
                                                        {markingId ===
                                                        notification.id
                                                            ? "..."
                                                            : "Marquer comme lu"}
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                        {isUnread && (
                                            <span className="notification-unread-dot" />
                                        )}

                                    </article>

                                );
                            }
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}