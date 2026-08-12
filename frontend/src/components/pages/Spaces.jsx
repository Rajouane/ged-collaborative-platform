import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "./Sidebar";
import "./Spaces.css";

export default function Spaces() {
    const [spaces, setSpaces] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        is_private: false,
        owner_id: "",
    });

    const [saving, setSaving] = useState(false);

    // ==========================================
    // CHARGER LES ESPACES
    // ==========================================

    const fetchSpaces = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/spaces");

            console.log("Spaces Laravel :", response.data);

            setSpaces(response.data);

        } catch (err) {
            console.error(
                "Erreur récupération espaces :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de récupérer les espaces."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CHARGER LES UTILISATEURS
    // ==========================================

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users");

            console.log(
                "Utilisateurs Laravel :",
                response.data
            );

            setUsers(response.data);

        } catch (err) {
            console.error(
                "Erreur récupération utilisateurs :",
                err
            );
        }
    };

    // ==========================================
    // CHARGEMENT INITIAL
    // ==========================================

    useEffect(() => {
        fetchSpaces();
        fetchUsers();
    }, []);

    // ==========================================
    // RECHERCHE
    // ==========================================

    const filteredSpaces = spaces.filter((space) => {
        const text = `
            ${space.name}
            ${space.description || ""}
            ${space.owner?.first_name || ""}
            ${space.owner?.last_name || ""}
            ${space.owner?.email || ""}
        `.toLowerCase();

        return text.includes(
            search.toLowerCase()
        );
    });

    // ==========================================
    // CHANGEMENT FORMULAIRE
    // ==========================================

    const handleChange = (event) => {
        const { name, value, type, checked } =
            event.target;

        setForm({
            ...form,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        });
    };

    // ==========================================
    // OUVRIR MODAL
    // ==========================================

    const openModal = () => {
        setForm({
            name: "",
            description: "",
            is_private: false,
            owner_id: "",
        });

        setError("");
        setShowModal(true);
    };

    // ==========================================
    // FERMER MODAL
    // ==========================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);

        setForm({
            name: "",
            description: "",
            is_private: false,
            owner_id: "",
        });

        setError("");
    };

    // ==========================================
    // CRÉER ESPACE
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!form.name.trim()) {
            setError(
                "Le nom de l'espace est obligatoire."
            );

            return;
        }

        if (!form.owner_id) {
            setError(
                "Veuillez sélectionner un propriétaire."
            );

            return;
        }

        try {
            setSaving(true);

            const response = await api.post(
                "/spaces",
                {
                    name: form.name,
                    description: form.description,
                    is_private: form.is_private,
                    owner_id: form.owner_id,
                }
            );

            console.log(
                "Espace créé :",
                response.data
            );

            setSpaces((currentSpaces) => [
                response.data,
                ...currentSpaces,
            ]);

            closeModal();

        } catch (err) {
            console.error(
                "Erreur création espace :",
                err
            );

            console.error(
                "Réponse Laravel :",
                err.response?.data
            );

            if (
                err.response?.data?.errors
            ) {
                const errors =
                    err.response.data.errors;

                const messages =
                    Object.values(errors)
                        .flat()
                        .join(" ");

                setError(messages);

            } else {
                setError(
                    err.response?.data?.message ||
                    "Erreur lors de la création de l'espace."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // SUPPRIMER ESPACE
    // ==========================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cet espace ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/spaces/${id}`
            );

            setSpaces(
                (currentSpaces) =>
                    currentSpaces.filter(
                        (space) =>
                            space.id !== id
                    )
            );

        } catch (err) {
            console.error(
                "Erreur suppression espace :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de supprimer l'espace."
            );
        }
    };

    // ==========================================
    // AFFICHAGE
    // ==========================================

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="spaces-main">

                {/* ================= HEADER ================= */}

                <div className="spaces-header">

                    <div>
                        <h1>Espaces</h1>

                        <p>
                            Gérez les espaces collaboratifs
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-space-btn"
                        onClick={openModal}
                    >
                        + Nouvel espace
                    </button>

                </div>

                {/* ================= STATISTIQUES ================= */}

                <div className="spaces-stats">

                    <div className="space-stat-card">

                        <div className="space-stat-icon">
                            📁
                        </div>

                        <div>
                            <span>
                                Total espaces
                            </span>

                            <strong>
                                {spaces.length}
                            </strong>
                        </div>

                    </div>


                    <div className="space-stat-card">

                        <div className="space-stat-icon">
                            🔓
                        </div>

                        <div>
                            <span>
                                Espaces publics
                            </span>

                            <strong>
                                {
                                    spaces.filter(
                                        (space) =>
                                            !space.is_private
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>


                    <div className="space-stat-card">

                        <div className="space-stat-icon">
                            🔒
                        </div>

                        <div>
                            <span>
                                Espaces privés
                            </span>

                            <strong>
                                {
                                    spaces.filter(
                                        (space) =>
                                            space.is_private
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                </div>

                {/* ================= CARD ================= */}

                <div className="spaces-card">

                    <div className="spaces-card-header">

                        <div>
                            <h2>
                                Liste des espaces
                            </h2>

                            <p>
                                {filteredSpaces.length} espace
                                {filteredSpaces.length > 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        <div className="spaces-search">

                            <span>
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Rechercher un espace..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* ================= CONTENT ================= */}

                    <div className="spaces-table-container">

                        {loading ? (

                            <div className="spaces-loading">
                                Chargement des espaces...
                            </div>

                        ) : filteredSpaces.length === 0 ? (

                            <div className="spaces-empty">

                                <div>
                                    📁
                                </div>

                                <h3>
                                    Aucun espace trouvé
                                </h3>

                                <p>
                                    Créez votre premier espace
                                    collaboratif.
                                </p>

                                <button
                                    type="button"
                                    onClick={openModal}
                                >
                                    + Créer un espace
                                </button>

                            </div>

                        ) : (

                            <table className="spaces-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Espace
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Propriétaire
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Membres
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredSpaces.map(
                                        (space) => (

                                            <tr
                                                key={
                                                    space.id
                                                }
                                            >

                                                {/* ESPACE */}

                                                <td>

                                                    <div className="space-info">

                                                        <div className="space-icon">
                                                            📁
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    space.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                ID #
                                                                {
                                                                    space.id
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* DESCRIPTION */}

                                                <td>

                                                    <span className="space-description">

                                                        {
                                                            space.description ||
                                                            "Aucune description"
                                                        }

                                                    </span>

                                                </td>

                                                {/* OWNER */}

                                                <td>

                                                    <div className="owner-info">

                                                        <div className="owner-avatar">

                                                            {space.owner?.first_name?.charAt(0)}
                                                            {space.owner?.last_name?.charAt(0)}

                                                        </div>

                                                        <div>

                                                            <strong>

                                                                {
                                                                    space.owner
                                                                        ? `${space.owner.first_name} ${space.owner.last_name}`
                                                                        : "Non défini"
                                                                }

                                                            </strong>

                                                            <small>

                                                                {
                                                                    space.owner?.email ||
                                                                    ""
                                                                }

                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* TYPE */}

                                                <td>

                                                    {space.is_private ? (

                                                        <span className="space-type private">
                                                            🔒 Privé
                                                        </span>

                                                    ) : (

                                                        <span className="space-type public">
                                                            🔓 Public
                                                        </span>

                                                    )}

                                                </td>

                                                {/* MEMBRES */}

                                                <td>

                                                    <span className="members-count">

                                                        👥

                                                        {" "}

                                                        {
                                                            space.members?.length ||
                                                            0
                                                        }

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="space-actions">

                                                        <button
                                                            type="button"
                                                            className="space-action view"
                                                            title="Voir"
                                                            onClick={() =>
                                                                alert(
                                                                    `Espace : ${space.name}`
                                                                )
                                                            }
                                                        >
                                                            👁️
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="space-action delete"
                                                            title="Supprimer"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    space.id
                                                                )
                                                            }
                                                        >
                                                            🗑️
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>

            </main>

            {/* ================= MODAL ================= */}

            {showModal && (

                <div
                    className="space-modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="space-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="space-modal-header">

                            <div>

                                <h2>
                                    Nouvel espace
                                </h2>

                                <p>
                                    Créer un espace collaboratif
                                </p>

                            </div>

                            <button
                                type="button"
                                className="space-close-btn"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        {/* ERROR */}

                        {error && (

                            <div className="space-form-error">
                                {error}
                            </div>

                        )}

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            {/* NOM */}

                            <div className="space-form-group">

                                <label>
                                    Nom de l'espace
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Ex: Service Informatique"
                                    required
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="space-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Description de l'espace..."
                                    rows="4"
                                />

                            </div>

                            {/* PROPRIETAIRE */}

                            <div className="space-form-group">

                                <label>
                                    Propriétaire
                                </label>

                                <select
                                    name="owner_id"
                                    value={form.owner_id}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Sélectionner un propriétaire
                                    </option>

                                    {users.map(
                                        (user) => (

                                            <option
                                                key={
                                                    user.id
                                                }
                                                value={
                                                    user.id
                                                }
                                            >

                                                {
                                                    user.first_name
                                                }{" "}
                                                {
                                                    user.last_name
                                                }

                                                {" - "}

                                                {
                                                    user.email
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* PRIVÉ */}

                            <div className="space-private-option">

                                <input
                                    id="space-private"
                                    type="checkbox"
                                    name="is_private"
                                    checked={
                                        form.is_private
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <label htmlFor="space-private">

                                    <strong>
                                        Espace privé
                                    </strong>

                                    <small>
                                        Seuls les membres autorisés
                                        pourront accéder à cet espace.
                                    </small>

                                </label>

                            </div>

                            {/* ACTIONS */}

                            <div className="space-modal-actions">

                                <button
                                    type="button"
                                    className="space-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="space-save-btn"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Création..."
                                        : "Créer l'espace"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}