import { useEffect, useState } from "react";

import api from "../services/api";

import Sidebar from "./Sidebar.jsx";

import "./Announcements.css";

export default function Announcements() {

    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    const user = JSON.parse(localStorage.getItem("user") || "null");

    // role 1 = Admin
    // role 2 = Responsable
    // role 3 = Utilisateur

    const isAdmin =
        Number(user?.role_id) === 1 ||
        Number(user?.role) === 1 ||
        Number(user?.role?.id) === 1 ||
        user?.role?.name?.toLowerCase() === "admin" ||
        user?.role?.name?.toLowerCase() === "administrateur" ||
        user?.role_name?.toLowerCase() === "admin" ||
        user?.role_name?.toLowerCase() === "administrateur";

    // =====================================================
    // STATES
    // =====================================================

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });

    const [saving, setSaving] = useState(false);

    // =====================================================
    // CHARGER LES ANNONCES
    // =====================================================

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/announcements");

            const data = response.data;

            if (Array.isArray(data)) {
                setAnnouncements(data);
            } else if (Array.isArray(data?.data)) {
                setAnnouncements(data.data);
            } else {
                setAnnouncements([]);
            }

        } catch (err) {
            console.error("Erreur chargement annonces :", err);

            setError(
                err?.response?.data?.message ||
                "Impossible de charger les annonces."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // =====================================================
    // FORMULAIRE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // OUVRIR MODAL CRÉATION
    // =====================================================

    const openCreateModal = () => {
        if (!isAdmin) return;

        setEditingAnnouncement(null);

        setFormData({
            title: "",
            content: "",
        });

        setShowModal(true);
    };

    // =====================================================
    // OUVRIR MODAL MODIFICATION
    // =====================================================

    const openEditModal = (announcement) => {
        if (!isAdmin) return;

        setEditingAnnouncement(announcement);

        setFormData({
            title: announcement?.title || "",
            content: announcement?.content || "",
        });

        setShowModal(true);
    };

    // =====================================================
    // FERMER MODAL
    // =====================================================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingAnnouncement(null);

        setFormData({
            title: "",
            content: "",
        });
    };

    // =====================================================
    // CRÉER / MODIFIER
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin) return;

        if (!formData.title.trim()) {
            alert("Veuillez saisir le titre de l'annonce.");
            return;
        }

        if (!formData.content.trim()) {
            alert("Veuillez saisir le contenu de l'annonce.");
            return;
        }

        try {
            setSaving(true);

            const data = {
                title: formData.title.trim(),
                content: formData.content.trim(),
            };

            if (editingAnnouncement) {
                await api.put(
                    `/announcements/${editingAnnouncement.id}`,
                    data
                );
            } else {
                await api.post("/announcements", data);
            }

            setShowModal(false);
            setEditingAnnouncement(null);

            setFormData({
                title: "",
                content: "",
            });

            await fetchAnnouncements();

        } catch (err) {
            console.error("Erreur sauvegarde annonce :", err);

            alert(
                err?.response?.data?.message ||
                "Une erreur est survenue lors de l'enregistrement."
            );

        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // SUPPRIMER
    // =====================================================

    const handleDelete = async (announcement) => {
        if (!isAdmin) return;

        const confirmed = window.confirm(
            `Voulez-vous vraiment supprimer l'annonce "${announcement?.title || ""}" ?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/announcements/${announcement.id}`);

            await fetchAnnouncements();

        } catch (err) {
            console.error("Erreur suppression annonce :", err);

            alert(
                err?.response?.data?.message ||
                "Impossible de supprimer cette annonce."
            );
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "";

        try {
            return new Date(date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return "";
        }
    };

    // =====================================================
    // NOM AUTEUR
    // =====================================================

    const getAuthorName = (announcement) => {

        if (announcement?.author) {

            const firstName =
                announcement.author.first_name ||
                announcement.author.firstname ||
                "";

            const lastName =
                announcement.author.last_name ||
                announcement.author.lastname ||
                "";

            const fullName = `${firstName} ${lastName}`.trim();

            if (fullName) {
                return fullName;
            }

            if (announcement.author.name) {
                return announcement.author.name;
            }

            if (announcement.author.email) {
                return announcement.author.email;
            }
        }

        if (announcement?.user) {

            const firstName =
                announcement.user.first_name ||
                announcement.user.firstname ||
                "";

            const lastName =
                announcement.user.last_name ||
                announcement.user.lastname ||
                "";

            const fullName = `${firstName} ${lastName}`.trim();

            if (fullName) {
                return fullName;
            }

            if (announcement.user.name) {
                return announcement.user.name;
            }

            if (announcement.user.email) {
                return announcement.user.email;
            }
        }

        return "Administrateur";
    };

    // =====================================================
    // RECHERCHE
    // =====================================================

    const filteredAnnouncements = announcements.filter((announcement) => {

        const searchValue = search.toLowerCase().trim();

        if (!searchValue) {
            return true;
        }

        const title = String(
            announcement?.title || ""
        ).toLowerCase();

        const content = String(
            announcement?.content || ""
        ).toLowerCase();

        const author = getAuthorName(
            announcement
        ).toLowerCase();

        return (
            title.includes(searchValue) ||
            content.includes(searchValue) ||
            author.includes(searchValue)
        );
    });

    // =====================================================
    // RENDU
    // =====================================================

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="announcements-page">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="announcements-header">

                    <div>
                        <h1>📢 Annonces</h1>

                        <p>
                            Consultez les dernières annonces et
                            informations importantes.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={openCreateModal}
                        >
                            + Nouvelle annonce
                        </button>
                    )}

                </div>

                {/* =====================================================
                    RECHERCHE
                ===================================================== */}

                <div className="announcements-toolbar">

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une annonce..."
                        className="search-input"
                    />

                </div>

                {/* =====================================================
                    ERREUR
                ===================================================== */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* =====================================================
                    LOADING
                ===================================================== */}

                {loading ? (

                    <div className="loading-state">
                        Chargement des annonces...
                    </div>

                ) : filteredAnnouncements.length === 0 ? (

                    /* =================================================
                       AUCUNE ANNONCE
                    ================================================= */

                    <div className="empty-state">

                        <div className="empty-icon">
                            📢
                        </div>

                        <h2>
                            {search
                                ? "Aucune annonce trouvée"
                                : "Aucune annonce"}
                        </h2>

                        <p>
                            {search
                                ? "Aucune annonce ne correspond à votre recherche."
                                : "Il n'y a actuellement aucune annonce disponible."}
                        </p>

                        {isAdmin && !search && (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={openCreateModal}
                            >
                                + Créer une annonce
                            </button>
                        )}

                    </div>

                ) : (

                    /* =================================================
                       LISTE DES ANNONCES
                    ================================================= */

                    <div className="announcements-grid">

                        {filteredAnnouncements.map(
                            (announcement, index) => {

                                const announcementKey =
                                    announcement?.id !== undefined &&
                                    announcement?.id !== null
                                        ? `announcement-${announcement.id}`
                                        : `announcement-fallback-${index}-${announcement?.title || "item"}`;

                                return (
                                    <article
                                        className="announcement-card"
                                        key={announcementKey}
                                    >

                                        {/* =============================
                                            CARD HEADER
                                        ============================== */}

                                        <div className="announcement-card-header">

                                            <div className="announcement-icon">
                                                📢
                                            </div>

                                            <div className="announcement-card-title">

                                                <h2>
                                                    {announcement?.title ||
                                                        "Sans titre"}
                                                </h2>

                                                <span>
                                                    {formatDate(
                                                        announcement?.created_at ||
                                                        announcement?.createdAt
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                        {/* =============================
                                            CONTENU
                                        ============================== */}

                                        <div className="announcement-content">

                                            <p>
                                                {announcement?.content ||
                                                    "Aucun contenu."}
                                            </p>

                                        </div>

                                        {/* =============================
                                            FOOTER
                                        ============================== */}

                                        <div className="announcement-footer">

                                            <div className="announcement-author">

                                                <span className="author-icon">
                                                    👤
                                                </span>

                                                <span>
                                                    {getAuthorName(
                                                        announcement
                                                    )}
                                                </span>

                                            </div>

                                            {/* =========================
                                                ACTIONS ADMIN
                                            ========================== */}

                                            {isAdmin && (

                                                <div className="announcement-actions">

                                                    <button
                                                        type="button"
                                                        className="btn-edit"
                                                        onClick={() =>
                                                            openEditModal(
                                                                announcement
                                                            )
                                                        }
                                                    >
                                                        ✏️ Modifier
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                announcement
                                                            )
                                                        }
                                                    >
                                                        🗑️ Supprimer
                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

                {/* =====================================================
                    MODAL CRÉATION / MODIFICATION
                ===================================================== */}

                {showModal && isAdmin && (

                    <div
                        className="modal-overlay"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                closeModal();
                            }
                        }}
                    >

                        <div className="modal-content">

                            {/* =============================
                                MODAL HEADER
                            ============================== */}

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        {editingAnnouncement
                                            ? "Modifier l'annonce"
                                            : "Nouvelle annonce"}
                                    </h2>

                                    <p>
                                        {editingAnnouncement
                                            ? "Modifiez les informations de l'annonce."
                                            : "Créez une nouvelle annonce pour les utilisateurs."}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    ×
                                </button>

                            </div>

                            {/* =============================
                                FORMULAIRE
                            ============================== */}

                            <form onSubmit={handleSubmit}>

                                <div className="form-group">

                                    <label htmlFor="announcement-title">
                                        Titre
                                    </label>

                                    <input
                                        id="announcement-title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Titre de l'annonce"
                                        disabled={saving}
                                        maxLength={255}
                                    />

                                </div>

                                <div className="form-group">

                                    <label htmlFor="announcement-content">
                                        Contenu
                                    </label>

                                    <textarea
                                        id="announcement-content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        placeholder="Écrivez le contenu de l'annonce..."
                                        rows={7}
                                        disabled={saving}
                                    />

                                </div>

                                {/* =============================
                                    MODAL ACTIONS
                                ============================== */}

                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Enregistrement..."
                                            : editingAnnouncement
                                            ? "Enregistrer les modifications"
                                            : "Publier l'annonce"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}