
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "./Sidebar";
import "./Folders.css";

function Folders() {

    const [folders, setFolders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [folderName, setFolderName] = useState("");

    const [parentId, setParentId] = useState("");

    const [editingFolder, setEditingFolder] = useState(null);

    const [creating, setCreating] = useState(false);

    const navigate = useNavigate();


    // =====================================
    // CHARGER LES DOSSIERS
    // =====================================

    useEffect(() => {
        getFolders();
    }, []);


    const getFolders = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/folders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFolders(response.data);

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                navigate("/login");

                return;
            }

            setError(
                error.response?.data?.message ||
                "Impossible de récupérer les dossiers."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================
    // NOUVEAU DOSSIER
    // =====================================

    const openCreateModal = () => {

        setEditingFolder(null);

        setFolderName("");

        setParentId("");

        setShowModal(true);
    };


    // =====================================
    // MODIFIER
    // =====================================

    const openEditModal = (folder) => {

        setEditingFolder(folder);

        setFolderName(folder.name);

        setParentId(folder.parent_id || "");

        setShowModal(true);
    };


    // =====================================
    // CRÉER / MODIFIER
    // =====================================

    const saveFolder = async (event) => {

        event.preventDefault();

        if (!folderName.trim()) {
            return;
        }

        setCreating(true);

        setError("");


        try {

            const token = localStorage.getItem("token");


            // =========================
            // MODIFIER
            // =========================

            if (editingFolder) {

                const response = await api.put(

                    `/folders/${editingFolder.id}`,

                    {
                        name: folderName,

                        parent_id:
                            parentId || null,
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


                setFolders(
                    (currentFolders) =>
                        currentFolders.map(
                            (folder) =>
                                folder.id ===
                                editingFolder.id
                                    ? response.data
                                    : folder
                        )
                );

            }


            // =========================
            // CRÉER
            // =========================

            else {

                const response = await api.post(

                    "/folders",

                    {
                        name: folderName,

                        parent_id:
                            parentId || null,
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


                setFolders(
                    (currentFolders) => [
                        ...currentFolders,
                        response.data,
                    ]
                );
            }


            // Fermer la fenêtre

            setShowModal(false);

            setFolderName("");

            setParentId("");

            setEditingFolder(null);


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Une erreur est survenue."
            );

        } finally {

            setCreating(false);

        }
    };


    // =====================================
    // SUPPRIMER
    // =====================================

    const deleteFolder = async (folder) => {

        const confirmed =
            window.confirm(
                `Voulez-vous vraiment supprimer "${folder.name}" ?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.delete(

                `/folders/${folder.id}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            setFolders(
                (currentFolders) =>
                    currentFolders.filter(
                        (item) =>
                            item.id !== folder.id
                    )
            );


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Impossible de supprimer le dossier."
            );
        }
    };


    // =====================================
    // AFFICHAGE
    // =====================================

    return (

        <div className="dashboard-layout">

            <Sidebar />


            <main className="folders-main">


                {/* HEADER */}

                <header className="folders-header">

                    <div>

                        <h1>
                            Dossiers
                        </h1>

                        <p>
                            Gestion des dossiers
                        </p>

                    </div>


                    <button
                        className="add-folder-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Nouveau dossier
                    </button>

                </header>


                {/* CONTENU */}

                <section className="folders-content">


                    {error && (

                        <p className="folders-error">
                            {error}
                        </p>

                    )}


                    {loading && (

                        <p className="folders-message">
                            Chargement...
                        </p>

                    )}


                    {!loading &&
                        folders.length === 0 && (

                            <div className="empty-folders">

                                <div className="empty-icon">
                                    📁
                                </div>

                                <h2>
                                    Aucun dossier
                                </h2>

                                <p>
                                    Créez votre premier
                                    dossier.
                                </p>

                            </div>

                        )
                    }


                    {!loading &&
                        folders.length > 0 && (

                            <div className="folders-grid">

                                {folders.map(
                                    (folder) => (

                                        <div
                                            className="folder-card"
                                            key={folder.id}
                                        >

                                            <div className="folder-icon">
                                                📁
                                            </div>


                                            <div className="folder-info">

                                                <h3>
                                                    {folder.name}
                                                </h3>

                                                <p>
                                                    Dossier #
                                                    {folder.id}
                                                </p>

                                                {folder.parent_id && (

                                                    <small>
                                                        Sous-dossier
                                                    </small>

                                                )}

                                            </div>


                                            <div className="folder-actions">

                                                <button
                                                    className="edit-folder-button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            folder
                                                        )
                                                    }
                                                >
                                                    Modifier
                                                </button>


                                                <button
                                                    className="delete-folder-button"
                                                    onClick={() =>
                                                        deleteFolder(
                                                            folder
                                                        )
                                                    }
                                                >
                                                    Supprimer
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )
                    }

                </section>


                {/* =================================
                    MODAL
                ================================= */}

                {showModal && (

                    <div
                        className="modal-overlay"
                        onClick={() =>
                            setShowModal(false)
                        }
                    >

                        <div
                            className="folder-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            <div className="modal-header">

                                <h2>

                                    {editingFolder
                                        ? "Modifier le dossier"
                                        : "Nouveau dossier"}

                                </h2>


                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    saveFolder
                                }
                            >


                                {/* NOM */}

                                <div className="form-group">

                                    <label>
                                        Nom du dossier
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            folderName
                                        }
                                        onChange={
                                            (event) =>
                                                setFolderName(
                                                    event.target.value
                                                )
                                        }
                                        placeholder="Ex: Contrats"
                                        required
                                    />

                                </div>


                                {/* PARENT */}

                                <div className="form-group">

                                    <label>
                                        Dossier parent
                                    </label>


                                    <select
                                        value={
                                            parentId
                                        }
                                        onChange={
                                            (event) =>
                                                setParentId(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="">
                                            Aucun — dossier principal
                                        </option>


                                        {folders
                                            .filter(
                                                (folder) =>
                                                    !editingFolder ||
                                                    folder.id !==
                                                        editingFolder.id
                                            )
                                            .map(
                                                (folder) => (

                                                    <option
                                                        key={
                                                            folder.id
                                                        }
                                                        value={
                                                            folder.id
                                                        }
                                                    >
                                                        {folder.name}
                                                    </option>

                                                )
                                            )}

                                    </select>

                                </div>


                                {/* BOUTONS */}

                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                    >
                                        Annuler
                                    </button>


                                    <button
                                        type="submit"
                                        className="create-button"
                                        disabled={
                                            creating
                                        }
                                    >

                                        {creating
                                            ? "Enregistrement..."
                                            : editingFolder
                                                ? "Enregistrer"
                                                : "Créer le dossier"}

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

export default Folders;

