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
    // NORMALISER LA RÉPONSE API
    // =====================================

    const normalizeFolders = (responseData) => {

        // Laravel retourne directement un tableau
        if (Array.isArray(responseData)) {
            return responseData;
        }

        // Laravel retourne :
        // {
        //     data: [...]
        // }
        if (Array.isArray(responseData?.data)) {
            return responseData.data;
        }

        // Laravel retourne :
        // {
        //     folders: [...]
        // }
        if (Array.isArray(responseData?.folders)) {
            return responseData.folders;
        }

        // Laravel retourne :
        // {
        //     data: {
        //         data: [...]
        //     }
        // }
        if (Array.isArray(responseData?.data?.data)) {
            return responseData.data.data;
        }

        console.error(
            "Format de réponse des dossiers inattendu :",
            responseData
        );

        return [];
    };


    // =====================================
    // CHARGER LES DOSSIERS
    // =====================================

    useEffect(() => {
        getFolders();
    }, []);


    const getFolders = async () => {

        try {

            setLoading(true);

            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/folders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            console.log(
                "Réponse API /folders :",
                response.data
            );


            const foldersData =
                normalizeFolders(response.data);


            setFolders(foldersData);


        } catch (error) {

            console.error(
                "Erreur récupération dossiers :",
                error
            );


            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            setFolders([]);


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

        setError("");

        setShowModal(true);
    };


    // =====================================
    // MODIFIER
    // =====================================

    const openEditModal = (folder) => {

        setEditingFolder(folder);

        setFolderName(folder.name || "");

        setParentId(folder.parent_id || "");

        setError("");

        setShowModal(true);
    };


    // =====================================
    // CRÉER / MODIFIER
    // =====================================

    const saveFolder = async (event) => {

        event.preventDefault();


        if (!folderName.trim()) {

            setError(
                "Veuillez saisir un nom de dossier."
            );

            return;
        }


        setCreating(true);

        setError("");


        try {

            const token =
                localStorage.getItem("token");


            // =========================
            // MODIFIER
            // =========================

            if (editingFolder) {

                const response = await api.put(

                    `/folders/${editingFolder.id}`,

                    {
                        name: folderName.trim(),

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


                console.log(
                    "Réponse modification :",
                    response.data
                );


                const updatedFolder =
                    response.data?.data ||
                    response.data?.folder ||
                    response.data;


                setFolders(
                    (currentFolders) => {

                        if (
                            !Array.isArray(
                                currentFolders
                            )
                        ) {
                            return [];
                        }


                        return currentFolders.map(
                            (folder) =>
                                folder.id ===
                                editingFolder.id
                                    ? updatedFolder
                                    : folder
                        );
                    }
                );

            }


            // =========================
            // CRÉER
            // =========================

            else {

                const response = await api.post(

                    "/folders",

                    {
                        name: folderName.trim(),

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


                console.log(
                    "Réponse création :",
                    response.data
                );


                const newFolder =
                    response.data?.data ||
                    response.data?.folder ||
                    response.data;


                if (
                    newFolder &&
                    typeof newFolder === "object" &&
                    !Array.isArray(newFolder)
                ) {

                    setFolders(
                        (currentFolders) => {

                            if (
                                !Array.isArray(
                                    currentFolders
                                )
                            ) {
                                return [
                                    newFolder,
                                ];
                            }


                            return [
                                ...currentFolders,
                                newFolder,
                            ];
                        }
                    );

                } else {

                    // Si le format retourné est inattendu,
                    // on recharge depuis Laravel.

                    await getFolders();
                }
            }


            // =========================
            // FERMER MODAL
            // =========================

            setShowModal(false);

            setFolderName("");

            setParentId("");

            setEditingFolder(null);


        } catch (error) {

            console.error(
                "Erreur sauvegarde dossier :",
                error
            );


            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            setError(
                error.response?.data?.message ||
                "Une erreur est survenue lors de l'enregistrement."
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

            setError("");


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
                (currentFolders) => {

                    if (
                        !Array.isArray(
                            currentFolders
                        )
                    ) {
                        return [];
                    }


                    return currentFolders.filter(
                        (item) =>
                            item.id !== folder.id
                    );
                }
            );


        } catch (error) {

            console.error(
                "Erreur suppression dossier :",
                error
            );


            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            setError(
                error.response?.data?.message ||
                "Impossible de supprimer le dossier."
            );
        }
    };


    // =====================================
    // FERMER MODAL
    // =====================================

    const closeModal = () => {

        if (creating) {
            return;
        }

        setShowModal(false);

        setFolderName("");

        setParentId("");

        setEditingFolder(null);
    };


    // =====================================
    // LISTE SÉCURISÉE DES DOSSIERS
    // =====================================

    const safeFolders =
        Array.isArray(folders)
            ? folders
            : [];


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
                        safeFolders.length === 0 && (

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
                        safeFolders.length > 0 && (

                            <div className="folders-grid">

                                {safeFolders.map(
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
                        onClick={
                            closeModal
                        }
                    >

                        <div
                            className="folder-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            {/* MODAL HEADER */}

                            <div className="modal-header">

                                <h2>

                                    {editingFolder
                                        ? "Modifier le dossier"
                                        : "Nouveau dossier"}

                                </h2>


                                <button
                                    className="modal-close"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={creating}
                                >
                                    ×
                                </button>

                            </div>


                            {/* FORM */}

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
                                        disabled={
                                            creating
                                        }
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
                                        disabled={
                                            creating
                                        }
                                    >

                                        <option value="">
                                            Aucun — dossier principal
                                        </option>


                                        {safeFolders
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
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            creating
                                        }
                                    >
                                        Annuler
                                    </button>


                                    <button
                                        type="submit"
                                        className="create-button"
                                        disabled={
                                            creating ||
                                            !folderName.trim()
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