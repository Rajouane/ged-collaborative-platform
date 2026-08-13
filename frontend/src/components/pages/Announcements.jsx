import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "./Sidebar.jsx";
import "./Announcements.css";

export default function Announcements() {

    const [announcements, setAnnouncements] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });


    /* =========================================
       GET ANNOUNCEMENTS
    ========================================= */

    const fetchAnnouncements = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await api.get("/announcements");

            console.log(
                "Annonces reçues :",
                response.data
            );

            /*
             * Laravel peut retourner :
             * [
             *   ...
             * ]
             *
             * ou :
             * {
             *   data: [...]
             * }
             */

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];

            setAnnouncements(data);

        } catch (err) {

            console.error(
                "Erreur récupération annonces :",
                err
            );

            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Impossible de récupérer les annonces."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    /* =========================================
       LOAD
    ========================================= */

    useEffect(() => {

        fetchAnnouncements();

    }, []);


    /* =========================================
       FORM CHANGE
    ========================================= */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /* =========================================
       OPEN CREATE
    ========================================= */

    const openCreateModal = () => {

        setEditingId(null);

        setFormData({
            title: "",
            content: "",
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    /* =========================================
       OPEN EDIT
    ========================================= */

    const openEditModal = (announcement) => {

        setEditingId(announcement.id);

        setFormData({
            title: announcement.title || "",
            content: announcement.content || "",
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    /* =========================================
       CLOSE MODAL
    ========================================= */

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingId(null);

        setFormData({
            title: "",
            content: "",
        });
    };


    /* =========================================
       CREATE / UPDATE
    ========================================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        if (!formData.title.trim()) {

            setError(
                "Le titre de l'annonce est obligatoire."
            );

            return;
        }

        if (!formData.content.trim()) {

            setError(
                "Le contenu de l'annonce est obligatoire."
            );

            return;
        }

        setSaving(true);

        try {

            if (editingId) {

                await api.put(
                    `/announcements/${editingId}`,
                    {
                        title: formData.title,
                        content: formData.content,
                    }
                );

                setSuccess(
                    "Annonce modifiée avec succès."
                );

            } else {

                await api.post(
                    "/announcements",
                    {
                        title: formData.title,
                        content: formData.content,
                    }
                );

                setSuccess(
                    "Annonce créée avec succès."
                );
            }

            setShowModal(false);

            setEditingId(null);

            setFormData({
                title: "",
                content: "",
            });

            await fetchAnnouncements();

        } catch (err) {

            console.error(
                "Erreur sauvegarde annonce :",
                err
            );

            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else if (
                err.response?.data?.errors
            ) {

                const errors =
                    err.response.data.errors;

                const firstError =
                    Object.values(errors)?.[0]?.[0];

                setError(
                    firstError ||
                    "Erreur de validation."
                );

            } else {

                setError(
                    "Impossible d'enregistrer l'annonce."
                );
            }

        } finally {

            setSaving(false);
        }
    };


    /* =========================================
       DELETE
    ========================================= */

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cette annonce ?"
        );

        if (!confirmed) {
            return;
        }

        setError("");

        setSuccess("");

        try {

            await api.delete(
                `/announcements/${id}`
            );

            setSuccess(
                "Annonce supprimée avec succès."
            );

            await fetchAnnouncements();

        } catch (err) {

            console.error(
                "Erreur suppression annonce :",
                err
            );

            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Impossible de supprimer l'annonce."
                );
            }
        }
    };


    /* =========================================
       SEARCH
    ========================================= */

    const filteredAnnouncements =
        announcements.filter((announcement) => {

            const title =
                announcement.title || "";

            const content =
                announcement.content || "";

            const author =
                announcement.user
                    ? `${announcement.user.first_name || ""} ${announcement.user.last_name || ""}`
                    : "";

            const text = `
                ${title}
                ${content}
                ${author}
            `.toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        });


    /* =========================================
       DATE
    ========================================= */

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        try {

            return new Date(date).toLocaleDateString(
                "fr-FR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }
            );

        } catch {

            return date;
        }
    };


    /* =========================================
       AUTHOR
    ========================================= */

    const getAuthorName = (announcement) => {

        if (!announcement.user) {
            return "Utilisateur";
        }

        const firstName =
            announcement.user.first_name || "";

        const lastName =
            announcement.user.last_name || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return fullName || "Utilisateur";
    };


    /* =========================================
       AUTHOR INITIAL
    ========================================= */

    const getAuthorInitial = (announcement) => {

        const name =
            getAuthorName(announcement);

        return (
            name.charAt(0).toUpperCase() ||
            "U"
        );
    };


    /* =========================================
       RETURN
    ========================================= */

    return (
        <div className="announcements-page">

            {/* =====================================
                SIDEBAR
            ====================================== */}

            <Sidebar />


            {/* =====================================
                MAIN
            ====================================== */}

            <main className="announcements-main">

                {/* =================================
                    HEADER
                ================================== */}

                <header className="announcements-header">

                    <div>

                        <h1>
                            Annonces
                        </h1>

                        <p>
                            Consultez et gérez les annonces
                            de la plateforme.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="add-announcement-button"
                        onClick={openCreateModal}
                    >

                        <span>
                            +
                        </span>

                        Nouvelle annonce

                    </button>

                </header>


                {/* =================================
                    CONTENT
                ================================== */}

                <section className="announcements-content">


                    {/* ==============================
                        ALERT ERROR
                    =============================== */}

                    {error && (

                        <div className="announcement-alert error">

                            {error}

                        </div>

                    )}


                    {/* ==============================
                        ALERT SUCCESS
                    =============================== */}

                    {success && (

                        <div className="announcement-alert success">

                            {success}

                        </div>

                    )}


                    {/* ==============================
                        TOOLBAR
                    =============================== */}

                    <div className="announcements-toolbar">

                        <div className="announcement-search">

                            <span>
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Rechercher une annonce..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>


                        <div className="announcement-count">

                            <strong>
                                {filteredAnnouncements.length}
                            </strong>

                            annonce(s)

                        </div>

                    </div>


                    {/* ==============================
                        LOADING
                    =============================== */}

                    {loading && (

                        <div className="announcement-loading">

                            Chargement des annonces...

                        </div>

                    )}


                    {/* ==============================
                        EMPTY
                    =============================== */}

                    {!loading &&
                        filteredAnnouncements.length === 0 && (

                            <div className="empty-announcements">

                                <div className="empty-announcement-icon">
                                    📢
                                </div>

                                <h2>
                                    Aucune annonce
                                </h2>

                                <p>
                                    {search
                                        ? "Aucune annonce ne correspond à votre recherche."
                                        : "Aucune annonce n'a encore été publiée."
                                    }
                                </p>

                                {!search && (

                                    <button
                                        type="button"
                                        onClick={openCreateModal}
                                    >
                                        Créer une annonce
                                    </button>

                                )}

                            </div>

                        )}


                    {/* ==============================
                        CARDS
                    =============================== */}

                    {!loading &&
                        filteredAnnouncements.length > 0 && (

                            <div className="announcements-grid">

                                {filteredAnnouncements.map(
                                    (announcement) => (

                                        <article
                                            className="announcement-card"
                                            key={announcement.id}
                                        >

                                            <div className="announcement-card-top">

                                                <div className="announcement-icon">
                                                    📢
                                                </div>

                                                <span className="announcement-card-date">

                                                    {formatDate(
                                                        announcement.created_at
                                                    )}

                                                </span>

                                            </div>


                                            <h2>
                                                {announcement.title}
                                            </h2>


                                            <p className="announcement-content-text">

                                                {announcement.content}

                                            </p>


                                            <div className="announcement-card-footer">


                                                {/* AUTHOR */}

                                                <div className="announcement-author">

                                                    <div className="announcement-avatar">

                                                        {getAuthorInitial(
                                                            announcement
                                                        )}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {getAuthorName(
                                                                announcement
                                                            )}
                                                        </strong>

                                                        <span>
                                                            Auteur
                                                        </span>

                                                    </div>

                                                </div>


                                                {/* ACTIONS */}

                                                <div className="announcement-actions">

                                                    <button
                                                        type="button"
                                                        className="edit-announcement-button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                announcement
                                                            )
                                                        }
                                                    >
                                                        Modifier
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="delete-announcement-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                announcement.id
                                                            )
                                                        }
                                                    >
                                                        Supprimer
                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        )}

                </section>

            </main>


            {/* =====================================
                MODAL
            ====================================== */}

            {showModal && (

                <div
                    className="announcement-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !saving
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="announcement-modal">


                        {/* MODAL HEADER */}

                        <div className="announcement-modal-header">

                            <div>

                                <div className="modal-title-icon">
                                    📢
                                </div>

                                <div>

                                    <h2>
                                        {editingId
                                            ? "Modifier l'annonce"
                                            : "Nouvelle annonce"
                                        }
                                    </h2>

                                    <p>
                                        {editingId
                                            ? "Modifiez les informations de l'annonce."
                                            : "Publiez une nouvelle annonce."
                                        }
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="announcement-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form onSubmit={handleSubmit}>


                            <div className="announcement-form-group">

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
                                    maxLength={255}
                                    required
                                />

                            </div>


                            <div className="announcement-form-group">

                                <label htmlFor="announcement-content">
                                    Contenu
                                </label>

                                <textarea
                                    id="announcement-content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Écrivez le contenu de l'annonce..."
                                    rows="7"
                                    required
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="announcement-modal-actions">

                                <button
                                    type="button"
                                    className="announcement-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Annuler
                                </button>


                                <button
                                    type="submit"
                                    className="announcement-save-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Enregistrement..."
                                        : editingId
                                            ? "Modifier"
                                            : "Publier"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}