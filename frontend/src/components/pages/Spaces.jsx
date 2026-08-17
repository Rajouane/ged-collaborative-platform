import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Spaces.css";

export default function Spaces() {
    const navigate = useNavigate();

    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        is_private: false,
    });

    /* =========================================================
       USER / ROLE
    ========================================================= */

    const getCurrentUser = () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return null;
            }

            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Erreur utilisateur:", error);
            return null;
        }
    };

    const currentUser = getCurrentUser();

    const isAdmin =
        currentUser?.role_id === 1 ||
        currentUser?.role?.id === 1 ||
        currentUser?.role?.name?.toLowerCase() === "admin" ||
        currentUser?.role?.name?.toLowerCase() === "administrateur" ||
        currentUser?.role_name?.toLowerCase() === "admin" ||
        currentUser?.role_name?.toLowerCase() === "administrateur";

    /* =========================================================
       LOAD SPACES
    ========================================================= */

    const loadSpaces = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/spaces");

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];

            setSpaces(data);
        } catch (err) {
            console.error("Erreur espaces:", err);

            setError(
                err.response?.data?.message ||
                "Impossible de charger les espaces."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSpaces();
    }, []);

    /* =========================================================
       CREATE SPACE
    ========================================================= */

    const openCreateModal = () => {
        setCreateError("");

        setForm({
            name: "",
            description: "",
            is_private: false,
        });

        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (creating) {
            return;
        }

        setShowCreateModal(false);
        setCreateError("");

        setForm({
            name: "",
            description: "",
            is_private: false,
        });
    };

    const handleInput = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const handleCreateSpace = async (event) => {
        event.preventDefault();

        setCreateError("");

        const name = form.name.trim();

        if (!name) {
            setCreateError(
                "Veuillez saisir le nom de l'espace."
            );
            return;
        }

        try {
            setCreating(true);

            const response = await api.post("/spaces", {
                name,
                description:
                    form.description.trim() || null,
                is_private: Boolean(form.is_private),
            });

            const createdSpace =
                response.data?.data ||
                response.data;

            /*
             * On ajoute immédiatement le nouvel espace
             * dans la liste.
             */
            if (createdSpace?.id) {
                setSpaces((previous) => [
                    createdSpace,
                    ...previous,
                ]);
            } else {
                /*
                 * Si Laravel retourne une réponse différente,
                 * on recharge la liste.
                 */
                await loadSpaces();
            }

            setShowCreateModal(false);

            setForm({
                name: "",
                description: "",
                is_private: false,
            });

        } catch (err) {
            console.error(
                "Erreur création espace:",
                err
            );

            const validationErrors =
                err.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(validationErrors)
                        ?.flat?.()[0];

                setCreateError(
                    firstError ||
                    "Les informations saisies sont invalides."
                );
            } else {
                setCreateError(
                    err.response?.data?.message ||
                    "Impossible de créer l'espace."
                );
            }
        } finally {
            setCreating(false);
        }
    };

    /* =========================================================
       OPEN SPACE
    ========================================================= */

    const openSpace = (space) => {
        if (!space?.id) {
            return;
        }

        navigate(`/spaces/${space.id}`);
    };

    /* =========================================================
       HELPERS
    ========================================================= */

    const getSpaceInitial = (space) => {
        return (
            space?.name
                ?.charAt(0)
                ?.toUpperCase() || "E"
        );
    };

    const getMemberCount = (space) => {
        return Number(
            space?.members_count ??
            space?.members?.length ??
            0
        );
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="spaces-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="spaces-header">

                <div className="spaces-header-text">

                    <span className="page-label">
                        COLLABORATION
                    </span>

                    <h1>
                        Espaces
                    </h1>

                    <p>
                        Gérez vos espaces de travail
                        collaboratifs.
                    </p>

                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="create-space-button"
                        onClick={openCreateModal}
                    >
                        <span className="create-space-plus">
                            +
                        </span>

                        <span>
                            Nouvel espace
                        </span>
                    </button>
                )}

            </header>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="spaces-error">
                    <span>⚠</span>

                    <div>
                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={loadSpaces}
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="spaces-loading">

                    <div className="spaces-spinner"></div>

                    <p>
                        Chargement des espaces...
                    </p>

                </div>

            ) : spaces.length === 0 ? (

                /* =============================================
                   EMPTY
                ============================================= */

                <div className="spaces-empty">

                    <div className="empty-icon">
                        📁
                    </div>

                    <h2>
                        Aucun espace disponible
                    </h2>

                    <p>
                        {isAdmin
                            ? "Créez votre premier espace de travail collaboratif."
                            : "Vous n'avez accès à aucun espace collaboratif pour le moment."}
                    </p>

                    {isAdmin && (
                        <button
                            type="button"
                            className="empty-create-space-button"
                            onClick={openCreateModal}
                        >
                            + Créer mon premier espace
                        </button>
                    )}

                </div>

            ) : (

                /* =============================================
                   SPACES GRID
                ============================================= */

                <div className="spaces-grid">

                    {spaces.map((space) => {

                        const memberCount =
                            getMemberCount(space);

                        return (
                            <article
                                className="space-card"
                                key={space.id}
                                onClick={() =>
                                    openSpace(space)
                                }
                            >

                                <div className="space-card-top">

                                    <div className="space-card-icon">
                                        {getSpaceInitial(space)}
                                    </div>

                                    <div className="space-card-top-right">

                                        {space.is_private && (
                                            <span className="space-private-badge">
                                                🔒 Privé
                                            </span>
                                        )}

                                        <span className="space-arrow">
                                            →
                                        </span>

                                    </div>

                                </div>

                                <div className="space-card-body">

                                    <h2>
                                        {space.name}
                                    </h2>

                                    <p>
                                        {space.description ||
                                            "Aucune description pour cet espace."}
                                    </p>

                                </div>

                                <div className="space-card-footer">

                                    <span className="space-members-info">
                                        <span>
                                            👥
                                        </span>

                                        {memberCount}{" "}
                                        membre
                                        {memberCount > 1
                                            ? "s"
                                            : ""}
                                    </span>

                                    <span className="space-open-label">
                                        Ouvrir →
                                    </span>

                                </div>

                            </article>
                        );
                    })}

                </div>
            )}

            {/* =================================================
                CREATE SPACE MODAL
            ================================================= */}

            {showCreateModal && (

                <div
                    className="space-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >

                    <div className="space-modal">

                        {/* HEADER */}

                        <div className="space-modal-header">

                            <div>

                                <span className="modal-label">
                                    ESPACE
                                </span>

                                <h2>
                                    Nouvel espace
                                </h2>

                                <p>
                                    Créez un nouvel espace
                                    de travail collaboratif.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeCreateModal}
                                disabled={creating}
                            >
                                ×
                            </button>

                        </div>

                        {/* ERROR */}

                        {createError && (
                            <div className="create-space-error">
                                ⚠ {createError}
                            </div>
                        )}

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleCreateSpace
                            }
                        >

                            {/* NAME */}

                            <div className="space-form-group">

                                <label>
                                    Nom de l'espace
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInput}
                                    placeholder="Ex. Ressources Humaines"
                                    disabled={creating}
                                    autoFocus
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="space-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={handleInput}
                                    placeholder="Décrivez cet espace..."
                                    rows="4"
                                    disabled={creating}
                                />

                            </div>

                            {/* PRIVACY */}

                            <label className="privacy-option">

                                <input
                                    type="checkbox"
                                    name="is_private"
                                    checked={
                                        form.is_private
                                    }
                                    onChange={
                                        handleInput
                                    }
                                    disabled={creating}
                                />

                                <span className="privacy-checkbox"></span>

                                <span className="privacy-content">

                                    <strong>
                                        Espace privé
                                    </strong>

                                    <small>
                                        Limiter l'accès aux
                                        membres autorisés.
                                    </small>

                                </span>

                            </label>

                            {/* ACTIONS */}

                            <div className="space-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-space-button"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={creating}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="submit-space-button"
                                    disabled={creating}
                                >

                                    {creating ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            + Créer l'espace
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}