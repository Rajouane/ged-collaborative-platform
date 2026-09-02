import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Folders.css";

function Folders() {
    const navigate = useNavigate();

    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    const [error, setError] = useState("");

    const [selectedFolder, setSelectedFolder] = useState(null);

    // =====================================================
    // MODAL DOSSIER
    // =====================================================

    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [parentId, setParentId] = useState("");
    const [editingFolder, setEditingFolder] = useState(null);
    const [creating, setCreating] = useState(false);

    // =====================================================
    // MODAL DOCUMENT
    // =====================================================

    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [creatingDocument, setCreatingDocument] = useState(false);

    const [documentForm, setDocumentForm] = useState({
        title: "",
        description: "",
        file: null,
    });

    // =====================================================
    // RECHERCHE / TRI
    // =====================================================

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");

    // =====================================================
    // NORMALISER REPONSE API
    // =====================================================

    const normalizeData = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.documents)) {
            return data.documents;
        }

        if (Array.isArray(data?.folders)) {
            return data.folders;
        }

        if (Array.isArray(data?.data?.data)) {
            return data.data.data;
        }

        return [];
    };

    // =====================================================
    // CHARGER DOSSIERS
    // =====================================================

    useEffect(() => {
        getFolders();
    }, []);

    const getFolders = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get("/folders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const foldersData = normalizeData(response.data);

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

            setError(
                error.response?.data?.message ||
                    "Impossible de récupérer les dossiers."
            );

            setFolders([]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // OUVRIR UN DOSSIER
    // =====================================================

    const openFolder = async (folder) => {
        try {
            setSelectedFolder(folder);
            setDocuments([]);
            setLoadingDocuments(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get("/documents", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const allDocuments = normalizeData(response.data);

            const folderDocuments = allDocuments.filter(
                (document) =>
                    Number(document.folder_id) ===
                    Number(folder.id)
            );

            setDocuments(folderDocuments);
        } catch (error) {
            console.error(
                "Erreur récupération documents du dossier :",
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
                    "Impossible de récupérer les documents du dossier."
            );
        } finally {
            setLoadingDocuments(false);
        }
    };

    // =====================================================
    // FERMER DOSSIER
    // =====================================================

    const closeFolderDocuments = () => {
        setSelectedFolder(null);
        setDocuments([]);
    };

    // =====================================================
    // STATISTIQUES
    // =====================================================

    const totalFolders = folders.length;

    const mainFolders = folders.filter(
        (folder) =>
            !folder.parent_id ||
            folder.parent_id === null
    ).length;

    const subFolders = folders.filter(
        (folder) =>
            folder.parent_id &&
            folder.parent_id !== null
    ).length;

    // =====================================================
    // RECHERCHE + TRI
    // =====================================================

    const filteredFolders = useMemo(() => {
        let result = [...folders];

        if (search.trim()) {
            const searchText = search.toLowerCase();

            result = result.filter((folder) =>
                folder.name
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }

        if (sortBy === "name") {
            result.sort((a, b) =>
                (a.name || "").localeCompare(
                    b.name || ""
                )
            );
        }

        if (sortBy === "name-desc") {
            result.sort((a, b) =>
                (b.name || "").localeCompare(
                    a.name || ""
                )
            );
        }

        if (sortBy === "id") {
            result.sort((a, b) => b.id - a.id);
        }

        if (sortBy === "id-old") {
            result.sort((a, b) => a.id - b.id);
        }

        return result;
    }, [folders, search, sortBy]);

    // =====================================================
    // NOUVEAU DOSSIER
    // =====================================================

    const openCreateModal = () => {
        setEditingFolder(null);
        setFolderName("");
        setParentId("");
        setError("");
        setShowModal(true);
    };

    // =====================================================
    // MODIFIER DOSSIER
    // =====================================================

    const openEditModal = (folder) => {
        setEditingFolder(folder);
        setFolderName(folder.name || "");
        setParentId(folder.parent_id || "");
        setError("");
        setShowModal(true);
    };

    // =====================================================
    // CREER / MODIFIER DOSSIER
    // =====================================================

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
            const token = localStorage.getItem("token");

            const data = {
                name: folderName.trim(),
                parent_id: parentId || null,
            };

            if (editingFolder) {
                const response = await api.put(
                    `/folders/${editingFolder.id}`,
                    data,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                const updatedFolder =
                    response.data?.data ||
                    response.data?.folder ||
                    response.data;

                setFolders((currentFolders) =>
                    currentFolders.map((folder) =>
                        folder.id === editingFolder.id
                            ? updatedFolder
                            : folder
                    )
                );
            } else {
                const response = await api.post(
                    "/folders",
                    data,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
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
                    setFolders((currentFolders) => [
                        ...currentFolders,
                        newFolder,
                    ]);
                } else {
                    await getFolders();
                }
            }

            closeModal();
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

    // =====================================================
    // SUPPRIMER DOSSIER
    // =====================================================

    const deleteFolder = async (folder) => {
        const confirmed = window.confirm(
            `Voulez-vous vraiment supprimer "${folder.name}" ?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const token = localStorage.getItem("token");

            await api.delete(
                `/folders/${folder.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setFolders((currentFolders) =>
                currentFolders.filter(
                    (item) =>
                        item.id !== folder.id
                )
            );

            if (
                selectedFolder &&
                Number(selectedFolder.id) ===
                    Number(folder.id)
            ) {
                closeFolderDocuments();
            }
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

    // =====================================================
    // FERMER MODAL DOSSIER
    // =====================================================

    const closeModal = () => {
        if (creating) {
            return;
        }

        setShowModal(false);
        setFolderName("");
        setParentId("");
        setEditingFolder(null);
        setError("");
    };

    // =====================================================
    // OUVRIR MODAL AJOUT DOCUMENT
    // =====================================================

    const openDocumentModal = () => {
        if (!selectedFolder) {
            return;
        }

        setDocumentForm({
            title: "",
            description: "",
            file: null,
        });

        setError("");
        setShowDocumentModal(true);
    };

    // =====================================================
    // FERMER MODAL DOCUMENT
    // =====================================================

    const closeDocumentModal = () => {
        if (creatingDocument) {
            return;
        }

        setShowDocumentModal(false);

        setDocumentForm({
            title: "",
            description: "",
            file: null,
        });
    };

    // =====================================================
    // CHANGEMENT FORMULAIRE DOCUMENT
    // =====================================================

    const handleDocumentChange = (event) => {
        const { name, value, files } =
            event.target;

        setDocumentForm((previous) => ({
            ...previous,
            [name]: files
                ? files[0]
                : value,
        }));
    };

    // =====================================================
    // AJOUTER DOCUMENT AU DOSSIER
    // =====================================================

    const handleCreateDocument = async (event) => {
        event.preventDefault();

        if (!selectedFolder) {
            setError("Aucun dossier sélectionné.");
            return;
        }

        if (!documentForm.title.trim()) {
            setError(
                "Veuillez saisir le titre du document."
            );
            return;
        }

        if (!documentForm.file) {
            setError(
                "Veuillez sélectionner un fichier."
            );
            return;
        }

        try {
            setCreatingDocument(true);
            setError("");

            const token = localStorage.getItem("token");

            const formData = new FormData();

            formData.append(
                "title",
                documentForm.title.trim()
            );

            formData.append(
                "description",
                documentForm.description.trim()
            );

            // IMPORTANT :
            // association automatique au dossier
            formData.append(
                "folder_id",
                selectedFolder.id
            );

            // Association automatique à l'espace
            if (selectedFolder.space_id) {
                formData.append(
                    "space_id",
                    selectedFolder.space_id
                );
            }

            formData.append(
                "file",
                documentForm.file
            );

            await api.post(
                "/documents",
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            // Fermer le formulaire
            setShowDocumentModal(false);

            setDocumentForm({
                title: "",
                description: "",
                file: null,
            });

            // Recharger les documents du dossier
            await openFolder(selectedFolder);

        } catch (error) {
            console.error(
                "Erreur ajout document :",
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
                    "Impossible d'ajouter le document."
            );
        } finally {
            setCreatingDocument(false);
        }
    };

    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (
        <div className="dashboard-layout">

            <main className="folders-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="folders-header">

                    <div>
                        <h1>Dossiers</h1>

                        <p>
                            Organisez et consultez les
                            documents de votre espace
                            documentaire
                        </p>
                    </div>

                    <button
                        className="add-folder-button"
                        onClick={openCreateModal}
                    >
                        <span>＋</span>
                        Nouveau dossier
                    </button>

                </header>

                {/* =================================================
                    CONTENU
                ================================================= */}

                <section className="folders-content">

                    {error && (
                        <p className="folders-error">
                            {error}
                        </p>
                    )}

                    {/* =================================================
                        STATISTIQUES
                    ================================================= */}

                    <div className="folders-stats">

                        <div className="folder-stat-card">

                            <div className="folder-stat-icon">
                                📁
                            </div>

                            <div className="folder-stat-info">

                                <strong>
                                    {totalFolders}
                                </strong>

                                <span>
                                    Total des dossiers
                                </span>

                            </div>

                        </div>

                        <div className="folder-stat-card">

                            <div className="folder-stat-icon">
                                🗂️
                            </div>

                            <div className="folder-stat-info">

                                <strong>
                                    {mainFolders}
                                </strong>

                                <span>
                                    Dossiers principaux
                                </span>

                            </div>

                        </div>

                        <div className="folder-stat-card">

                            <div className="folder-stat-icon">
                                📂
                            </div>

                            <div className="folder-stat-info">

                                <strong>
                                    {subFolders}
                                </strong>

                                <span>
                                    Sous-dossiers
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        RECHERCHE
                    ================================================= */}

                    <div className="folders-toolbar">

                        <div className="folder-search">

                            <span className="folder-search-icon">
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Rechercher un dossier..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="folder-sort">

                            <label>
                                Trier par
                            </label>

                            <select
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="name">
                                    Nom A → Z
                                </option>

                                <option value="name-desc">
                                    Nom Z → A
                                </option>

                                <option value="id">
                                    Plus récent
                                </option>

                                <option value="id-old">
                                    Plus ancien
                                </option>

                            </select>

                        </div>

                    </div>

                    {/* =================================================
                        CHARGEMENT
                    ================================================= */}

                    {loading && (
                        <div className="folders-message">
                            Chargement des dossiers...
                        </div>
                    )}

                    {/* =================================================
                        AUCUN DOSSIER
                    ================================================= */}

                    {!loading &&
                        filteredFolders.length === 0 && (

                            <div className="empty-folders">

                                <div className="empty-icon">
                                    📁
                                </div>

                                <h2>
                                    {search
                                        ? "Aucun résultat"
                                        : "Aucun dossier"}
                                </h2>

                                <p>
                                    {search
                                        ? "Aucun dossier ne correspond à votre recherche."
                                        : "Créez votre premier dossier pour commencer à organiser vos documents."}
                                </p>

                                {!search && (
                                    <button
                                        className="add-folder-button"
                                        style={{
                                            marginTop:
                                                "20px",
                                        }}
                                        onClick={
                                            openCreateModal
                                        }
                                    >
                                        ＋ Créer un dossier
                                    </button>
                                )}

                            </div>
                        )}

                    {/* =================================================
                        LISTE DES DOSSIERS
                    ================================================= */}

                    {!loading &&
                        filteredFolders.length > 0 && (

                            <div className="folders-grid">

                                {filteredFolders.map(
                                    (folder) => (

                                        <div
                                            className="folder-card"
                                            key={folder.id}
                                        >

                                            <div
                                                className="folder-icon"
                                                onClick={() =>
                                                    openFolder(
                                                        folder
                                                    )
                                                }
                                                style={{
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >
                                                📁
                                            </div>

                                            <div
                                                className="folder-info"
                                                onClick={() =>
                                                    openFolder(
                                                        folder
                                                    )
                                                }
                                                style={{
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >

                                                <h3>
                                                    {folder.name}
                                                </h3>

                                                <p>
                                                    Dossier #
                                                    {folder.id}
                                                </p>

                                                {folder.parent_id ? (
                                                    <small>
                                                        Sous-dossier
                                                    </small>
                                                ) : (
                                                    <small>
                                                        Dossier principal
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
                        )}

                </section>

                {/* =================================================
                    MODAL DOCUMENTS DU DOSSIER
                ================================================= */}

                {selectedFolder && (

                    <div className="modal-overlay">

                        <div
                            className="folder-modal"
                            style={{
                                maxWidth: "850px",
                                width: "90%",
                            }}
                        >

                            {/* HEADER */}

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        📁{" "}
                                        {selectedFolder.name}
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                "5px 0 0",
                                            color: "#777",
                                        }}
                                    >
                                        Documents de ce
                                        dossier
                                    </p>

                                </div>

                                <button
                                    className="modal-close"
                                    onClick={
                                        closeFolderDocuments
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            {/* =================================================
                                ACTION AJOUT DOCUMENT
                            ================================================= */}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-end",
                                    padding:
                                        "15px 20px",
                                    borderBottom:
                                        "1px solid #eee",
                                }}
                            >

                                <button
                                    className="add-folder-button"
                                    onClick={
                                        openDocumentModal
                                    }
                                >
                                    ＋ Ajouter un document
                                </button>

                            </div>

                            {/* DOCUMENTS */}

                            <div
                                style={{
                                    padding: "20px",
                                }}
                            >

                                {loadingDocuments && (
                                    <div className="folders-message">
                                        Chargement des
                                        documents...
                                    </div>
                                )}

                                {!loadingDocuments &&
                                    documents.length === 0 && (

                                        <div
                                            className="empty-folders"
                                            style={{
                                                padding:
                                                    "35px 20px",
                                            }}
                                        >

                                            <div className="empty-icon">
                                                📄
                                            </div>

                                            <h2>
                                                Aucun document
                                            </h2>

                                            <p>
                                                Ce dossier ne
                                                contient aucun
                                                document pour le
                                                moment.
                                            </p>

                                            <button
                                                className="add-folder-button"
                                                onClick={
                                                    openDocumentModal
                                                }
                                            >
                                                ＋ Ajouter un
                                                document
                                            </button>

                                        </div>
                                    )}

                                {!loadingDocuments &&
                                    documents.length > 0 && (

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap: "10px",
                                            }}
                                        >

                                            {documents.map(
                                                (document) => (

                                                    <div
                                                        key={
                                                            document.id
                                                        }
                                                        onClick={() =>
                                                            navigate(
                                                                `/documents/${document.id}`
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "15px",
                                                            padding:
                                                                "15px",
                                                            border:
                                                                "1px solid #e5e7eb",
                                                            borderRadius:
                                                                "10px",
                                                            cursor:
                                                                "pointer",
                                                            background:
                                                                "#fff",
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "28px",
                                                            }}
                                                        >
                                                            📄
                                                        </div>

                                                        <div
                                                            style={{
                                                                flex: 1,
                                                            }}
                                                        >

                                                            <strong>
                                                                {document.name ||
                                                                    document.title ||
                                                                    document.file_name ||
                                                                    "Document sans nom"}
                                                            </strong>

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "4px",
                                                                    fontSize:
                                                                        "13px",
                                                                    color:
                                                                        "#777",
                                                                }}
                                                            >
                                                                Document #
                                                                {
                                                                    document.id
                                                                }
                                                            </div>

                                                        </div>

                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "20px",
                                                            }}
                                                        >
                                                            →
                                                        </span>

                                                    </div>

                                                )
                                            )}

                                        </div>
                                    )}

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    MODAL CREATION / MODIFICATION DOSSIER
                ================================================= */}

                {showModal && (

                    <div
                        className="modal-overlay"
                        onClick={closeModal}
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
                                    onClick={closeModal}
                                    disabled={creating}
                                >
                                    ×
                                </button>

                            </div>

                            <form
                                onSubmit={saveFolder}
                            >

                                <div className="form-group">

                                    <label>
                                        Nom du dossier
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            folderName
                                        }
                                        onChange={(event) =>
                                            setFolderName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex : Ressources Humaines"
                                        disabled={
                                            creating
                                        }
                                        autoFocus
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Dossier parent
                                    </label>

                                    <select
                                        value={
                                            parentId
                                        }
                                        onChange={(event) =>
                                            setParentId(
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            creating
                                        }
                                    >

                                        <option value="">
                                            Aucun — dossier
                                            principal
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

                {/* =================================================
                    MODAL AJOUT DOCUMENT
                ================================================= */}

                {showDocumentModal && (

                    <div
                        className="modal-overlay"
                        onClick={closeDocumentModal}
                    >

                        <div
                            className="folder-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        📄 Nouveau document
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                "5px 0 0",
                                            color: "#777",
                                        }}
                                    >
                                        Ajouter un document
                                        dans{" "}
                                        <strong>
                                            {selectedFolder?.name}
                                        </strong>
                                    </p>

                                </div>

                                <button
                                    className="modal-close"
                                    onClick={
                                        closeDocumentModal
                                    }
                                    disabled={
                                        creatingDocument
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    handleCreateDocument
                                }
                            >

                                {/* TITRE */}

                                <div className="form-group">

                                    <label>
                                        Titre du document *
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            documentForm.title
                                        }
                                        onChange={
                                            handleDocumentChange
                                        }
                                        placeholder="Ex : Rapport mensuel"
                                        disabled={
                                            creatingDocument
                                        }
                                        required
                                    />

                                </div>

                                {/* DESCRIPTION */}

                                <div className="form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            documentForm.description
                                        }
                                        onChange={
                                            handleDocumentChange
                                        }
                                        placeholder="Description du document..."
                                        rows="4"
                                        disabled={
                                            creatingDocument
                                        }
                                    />

                                </div>

                                {/* FICHIER */}

                                <div className="form-group">

                                    <label>
                                        Fichier *
                                    </label>

                                    <input
                                        type="file"
                                        name="file"
                                        onChange={
                                            handleDocumentChange
                                        }
                                        disabled={
                                            creatingDocument
                                        }
                                        required
                                    />

                                    {documentForm.file && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "8px",
                                                padding:
                                                    "10px",
                                                background:
                                                    "#f5f5f5",
                                                borderRadius:
                                                    "8px",
                                                fontSize:
                                                    "13px",
                                            }}
                                        >
                                            📎{" "}
                                            {
                                                documentForm
                                                    .file
                                                    .name
                                            }
                                        </div>

                                    )}

                                </div>

                                {/* DOSSIER AUTOMATIQUE */}

                                <div
                                    style={{
                                        padding:
                                            "12px 15px",
                                        marginBottom:
                                            "20px",
                                        background:
                                            "#f5f7fb",
                                        borderRadius:
                                            "8px",
                                        color:
                                            "#555",
                                    }}
                                >
                                    📁 Dossier :

                                    <strong>
                                        {" "}
                                        {
                                            selectedFolder?.name
                                        }
                                    </strong>
                                </div>

                                {/* ACTIONS */}

                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            closeDocumentModal
                                        }
                                        disabled={
                                            creatingDocument
                                        }
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        className="create-button"
                                        disabled={
                                            creatingDocument
                                        }
                                    >
                                        {creatingDocument
                                            ? "Ajout en cours..."
                                            : "Ajouter le document"}
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