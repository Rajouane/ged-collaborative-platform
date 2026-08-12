import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "./Sidebar";
import "./Users.css";

export default function Users() {
    // =====================================================
    // STATES
    // =====================================================

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(false);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_id: "",
        department: "",
        phone: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [submitting, setSubmitting] = useState(false);

    // =====================================================
    // RÉCUPÉRER LES UTILISATEURS
    // =====================================================

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");

            console.log("Utilisateurs Laravel :", response.data);

            setUsers(response.data);
        } catch (err) {
            console.error(
                "Erreur récupération utilisateurs :",
                err
            );

            console.error(
                "Réponse Laravel :",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Impossible de récupérer les utilisateurs."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RÉCUPÉRER LES RÔLES
    // =====================================================

    const fetchRoles = async () => {
        try {
            setLoadingRoles(true);

            const response = await api.get("/roles");

            console.log("Rôles Laravel :", response.data);

            setRoles(response.data);

        } catch (err) {
            console.error(
                "Erreur récupération rôles :",
                err
            );

            console.error(
                "Réponse Laravel :",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Impossible de récupérer les rôles."
            );

        } finally {
            setLoadingRoles(false);
        }
    };

    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // =====================================================
    // RECHERCHE
    // =====================================================

    const filteredUsers = users.filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email} ${
            user.department || ""
        } ${user.role?.name || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // =====================================================
    // MODIFIER LE FORMULAIRE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    // =====================================================
    // OUVRIR MODAL
    // =====================================================

    const openModal = () => {
        setError("");
        setSuccess("");

        setForm({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role_id: "",
            department: "",
            phone: "",
        });

        setShowModal(true);
    };

    // =====================================================
    // FERMER MODAL
    // =====================================================

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setShowModal(false);

        setError("");

        setForm({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role_id: "",
            department: "",
            phone: "",
        });
    };

    // =====================================================
    // AJOUTER UTILISATEUR
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Vérification prénom
        if (!form.first_name.trim()) {
            setError("Le prénom est obligatoire.");
            return;
        }

        // Vérification nom
        if (!form.last_name.trim()) {
            setError("Le nom est obligatoire.");
            return;
        }

        // Vérification email
        if (!form.email.trim()) {
            setError("L'email est obligatoire.");
            return;
        }

        // Vérification mot de passe
        if (form.password.length < 8) {
            setError(
                "Le mot de passe doit contenir au moins 8 caractères."
            );
            return;
        }

        // Vérification rôle
        if (!form.role_id) {
            setError("Veuillez sélectionner un rôle.");
            return;
        }

        try {
            setSubmitting(true);

            // =================================================
            // DONNÉES ENVOYÉES À LARAVEL
            // =================================================

            const data = {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                role_id: Number(form.role_id),
                department: form.department || null,
                phone: form.phone || null,
            };

            console.log(
                "===== CRÉATION UTILISATEUR ====="
            );

            console.log("Données envoyées :", data);

            // =================================================
            // POST /api/users
            // =================================================

            const response = await api.post(
                "/users",
                data
            );

            console.log(
                "Utilisateur créé :",
                response.data
            );

            // Ajouter directement le nouvel utilisateur
            setUsers((currentUsers) => [
                ...currentUsers,
                response.data,
            ]);

            // Reset formulaire
            setForm({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                role_id: "",
                department: "",
                phone: "",
            });

            setSuccess(
                "Utilisateur créé avec succès."
            );

            // Fermer après un petit délai
            setTimeout(() => {
                setShowModal(false);
                setSuccess("");
            }, 800);

        } catch (err) {
            console.error(
                "Erreur création utilisateur :",
                err
            );

            console.error(
                "Réponse Laravel :",
                err.response?.data
            );

            // Erreur validation Laravel
            if (err.response?.data?.errors) {
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
                    "Erreur lors de la création de l'utilisateur."
                );
            }

        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // SUPPRIMER UTILISATEUR
    // =====================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cet utilisateur ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/users/${id}`
            );

            setUsers(
                (currentUsers) =>
                    currentUsers.filter(
                        (user) => user.id !== id
                    )
            );

            setSuccess(
                "Utilisateur supprimé avec succès."
            );

            setTimeout(() => {
                setSuccess("");
            }, 2000);

        } catch (err) {
            console.error(
                "Erreur suppression utilisateur :",
                err
            );

            console.error(
                "Réponse Laravel :",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Impossible de supprimer cet utilisateur."
            );
        }
    };

    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (
        <div className="dashboard-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar />

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="users-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="users-header">

                    <div>
                        <h1>Utilisateurs</h1>

                        <p>
                            Gérer les utilisateurs de la plateforme
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-user-btn"
                        onClick={openModal}
                    >
                        + Nouvel utilisateur
                    </button>

                </div>

                {/* =================================================
                    MESSAGE SUCCESS
                ================================================= */}

                {success && !showModal && (
                    <div className="form-success">
                        {success}
                    </div>
                )}

                {/* =================================================
                    MESSAGE ERROR
                ================================================= */}

                {error && !showModal && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                <div className="users-stats">

                    <div className="stat-card">

                        <div className="stat-icon">
                            👥
                        </div>

                        <div>
                            <span>
                                Total utilisateurs
                            </span>

                            <strong>
                                {users.length}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            ✅
                        </div>

                        <div>
                            <span>
                                Utilisateurs actifs
                            </span>

                            <strong>
                                {
                                    users.filter(
                                        (user) =>
                                            user.is_active
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            🔴
                        </div>

                        <div>
                            <span>
                                Utilisateurs inactifs
                            </span>

                            <strong>
                                {
                                    users.filter(
                                        (user) =>
                                            !user.is_active
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                </div>

                {/* =================================================
                    TABLEAU
                ================================================= */}

                <div className="users-card">

                    <div className="users-card-header">

                        <div>
                            <h2>
                                Liste des utilisateurs
                            </h2>

                            <p>
                                {filteredUsers.length} utilisateur
                                {filteredUsers.length > 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        <div className="search-box">

                            <span>
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="table-container">

                        {loading ? (

                            <div className="loading">
                                Chargement des utilisateurs...
                            </div>

                        ) : filteredUsers.length === 0 ? (

                            <div className="empty-state">

                                <div>
                                    👥
                                </div>

                                <h3>
                                    Aucun utilisateur trouvé
                                </h3>

                                <p>
                                    Aucun utilisateur ne correspond
                                    à votre recherche.
                                </p>

                            </div>

                        ) : (

                            <table className="users-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Utilisateur
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Rôle
                                        </th>

                                        <th>
                                            Département
                                        </th>

                                        <th>
                                            Téléphone
                                        </th>

                                        <th>
                                            Statut
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredUsers.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                            >

                                                {/* UTILISATEUR */}

                                                <td>

                                                    <div className="user-info">

                                                        <div className="user-avatar">

                                                            {user.first_name?.charAt(
                                                                0
                                                            )}

                                                            {user.last_name?.charAt(
                                                                0
                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    user.first_name
                                                                }{" "}
                                                                {
                                                                    user.last_name
                                                                }
                                                            </strong>

                                                            <small>
                                                                ID #
                                                                {
                                                                    user.id
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* EMAIL */}

                                                <td>

                                                    <span className="email">
                                                        {
                                                            user.email
                                                        }
                                                    </span>

                                                </td>

                                                {/* ROLE */}

                                                <td>

                                                    <span className="role-badge">

                                                        {
                                                            user.role?.name ||
                                                            "Non défini"
                                                        }

                                                    </span>

                                                </td>

                                                {/* DEPARTEMENT */}

                                                <td>

                                                    {
                                                        user.department || (
                                                            <span className="not-defined">
                                                                Non défini
                                                            </span>
                                                        )
                                                    }

                                                </td>

                                                {/* TELEPHONE */}

                                                <td>

                                                    {
                                                        user.phone || (
                                                            <span className="not-defined">
                                                                Non défini
                                                            </span>
                                                        )
                                                    }

                                                </td>

                                                {/* STATUT */}

                                                <td>

                                                    {user.is_active ? (

                                                        <span className="status active">

                                                            <span></span>

                                                            Actif

                                                        </span>

                                                    ) : (

                                                        <span className="status inactive">

                                                            <span></span>

                                                            Inactif

                                                        </span>

                                                    )}

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="actions">

                                                        <button
                                                            type="button"
                                                            className="action-btn view"
                                                            title="Voir"
                                                            onClick={() =>
                                                                alert(
                                                                    `Utilisateur : ${user.first_name} ${user.last_name}\nEmail : ${user.email}\nRôle : ${user.role?.name || "Non défini"}`
                                                                )
                                                            }
                                                        >
                                                            👁️
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="action-btn delete"
                                                            title="Supprimer"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user.id
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

            {/* =================================================
                MODAL AJOUT UTILISATEUR
            ================================================= */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="user-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nouvel utilisateur
                                </h2>

                                <p>
                                    Ajouter un utilisateur à la plateforme
                                </p>

                            </div>

                            <button
                                type="button"
                                className="close-modal"
                                onClick={closeModal}
                                disabled={submitting}
                            >
                                ×
                            </button>

                        </div>

                        {/* ERREUR */}

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        {/* SUCCÈS */}

                        {success && (
                            <div className="form-success">
                                {success}
                            </div>
                        )}

                        {/* FORMULAIRE */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            {/* PRÉNOM + NOM */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Prénom *
                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        value={
                                            form.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Prénom"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Nom *
                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        value={
                                            form.last_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nom"
                                        required
                                    />

                                </div>

                            </div>

                            {/* EMAIL */}

                            <div className="form-group">

                                <label>
                                    Email *
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="exemple@email.com"
                                    required
                                />

                            </div>

                            {/* MOT DE PASSE */}

                            <div className="form-group">

                                <label>
                                    Mot de passe *
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={
                                        form.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Minimum 8 caractères"
                                    minLength="8"
                                    required
                                />

                            </div>

                            {/* ROLE */}

                            <div className="form-group">

                                <label>
                                    Rôle *
                                </label>

                                <select
                                    name="role_id"
                                    value={
                                        form.role_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        loadingRoles ||
                                        submitting
                                    }
                                >

                                    <option value="">
                                        {loadingRoles
                                            ? "Chargement des rôles..."
                                            : "Sélectionner un rôle"}
                                    </option>

                                    {roles.map(
                                        (role) => (

                                            <option
                                                key={
                                                    role.id
                                                }
                                                value={
                                                    role.id
                                                }
                                            >
                                                {
                                                    role.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                                {!loadingRoles &&
                                    roles.length === 0 && (
                                        <small className="form-help">
                                            Aucun rôle disponible.
                                            Vérifiez la table roles.
                                        </small>
                                    )}

                            </div>

                            {/* DEPARTEMENT */}

                            <div className="form-group">

                                <label>
                                    Département
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    value={
                                        form.department
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Ex: Informatique"
                                />

                            </div>

                            {/* TELEPHONE */}

                            <div className="form-group">

                                <label>
                                    Téléphone
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={
                                        form.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Ex: 0612345678"
                                />

                            </div>

                            {/* BUTTONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeModal}
                                    disabled={
                                        submitting
                                    }
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={
                                        submitting ||
                                        loadingRoles
                                    }
                                >

                                    {submitting
                                        ? "Création..."
                                        : "Créer l'utilisateur"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}