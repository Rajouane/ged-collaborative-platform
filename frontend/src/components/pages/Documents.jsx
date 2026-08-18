import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Documents.css";
import Sidebar from "./Sidebar.jsx";

export default function Documents() {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [spaces, setSpaces] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        folder_id: "",
        space_id: "",
        file: null,
    });

    /* =========================================================
       LOAD DATA
    ========================================================= */

    useEffect(() => {
        loadDocuments();
        loadFolders();
        loadSpaces();
    }, []);

    /* =========================================================
       DOCUMENTS
    ========================================================= */

    const loadDocuments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/documents");

            const data = response.data;

            if (Array.isArray(data)) {
                setDocuments(data);
            } else if (Array.isArray(data?.data)) {
                setDocuments(data.data);
            } else {
                setDocuments([]);
            }
        } catch (err) {
            console.error("Erreur documents :", err);

            setError(
                err.response?.data?.message ||
                    "Impossible de récupérer les documents."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       FOLDERS
    ========================================================= */

    const loadFolders = async () => {
        try {
            const response = await api.get("/folders");

            const data = response.data;

            if (Array.isArray(data)) {
                setFolders(data);
            } else if (Array.isArray(data?.data)) {
                setFolders(data.data);
            } else {
                setFolders([]);
            }
        } catch (err) {
            console.error("Erreur dossiers :", err);
            setFolders([]);
        }
    };

    /* =========================================================
       SPACES
    ========================================================= */

    const loadSpaces = async () => {
        try {
            const response = await api.get("/spaces");

            const data = response.data;

            if (Array.isArray(data)) {
                setSpaces(data);
            } else if (Array.isArray(data?.data)) {
                setSpaces(data.data);
            } else {
                setSpaces([]);
            }
        } catch (err) {
            console.error("Erreur espaces :", err);
            setSpaces([]);
        }
    };

    /* =========================================================
       CREATE MODAL
    ========================================================= */

    const openCreateModal = () => {
        setFormData({
            title: "",
            description: "",
            folder_id: "",
            space_id: "",
            file: null,
        });

        setError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (creating) {
            return;
        }

        setShowCreateModal(false);

        setFormData({
            title: "",
            description: "",
            folder_id: "",
            space_id: "",
            file: null,
        });
    };

    /* =========================================================
       FORM
    ========================================================= */

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                name === "file"
                    ? files?.[0] || null
                    : value,
        }));
    };

    /* =========================================================
       CREATE DOCUMENT
    ========================================================= */

    const handleCreateDocument = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.title.trim()) {
            setError("Le titre du document est obligatoire.");
            return;
        }

        if (!formData.file) {
            setError("Veuillez sélectionner un fichier.");
            return;
        }

        try {
            setCreating(true);

            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);

            if (formData.folder_id) {
                data.append("folder_id", formData.folder_id);
            }

            if (formData.space_id) {
                data.append("space_id", formData.space_id);
            }

            data.append("file", formData.file);

            await api.post("/documents", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowCreateModal(false);

            setFormData({
                title: "",
                description: "",
                folder_id: "",
                space_id: "",
                file: null,
            });

            await loadDocuments();
        } catch (err) {
            console.error(
                "Erreur création document :",
                err
            );

            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;

                const firstError =
                    Object.values(errors)[0]?.[0];

                setError(
                    firstError ||
                        "Erreur de validation."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        "Impossible de créer le document."
                );
            }
        } finally {
            setCreating(false);
        }
    };

    /* =========================================================
       VIEW
    ========================================================= */

    const handleView = (id) => {
        if (!id) {
            setError(
                "Impossible d'ouvrir ce document."
            );
            return;
        }

        navigate(`/documents/${id}`);
    };

    /* =========================================================
       DELETE
    ========================================================= */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer ce document ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(`/documents/${id}`);

            setDocuments((previous) =>
                previous.filter(
                    (document) =>
                        document.id !== id
                )
            );
        } catch (err) {
            console.error(
                "Erreur suppression :",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Impossible de supprimer ce document."
            );
        }
    };

    /* =========================================================
       CORBEILLE
    ========================================================= */

    const handleTrash = () => {
        navigate("/trash");
    };

    /* =========================================================
       FILE ICON
    ========================================================= */

    const getFileIcon = (document) => {
        const type = (
            document.file_type ||
            document.mime_type ||
            ""
        ).toLowerCase();

        const name = (
            document.file_name ||
            document.filename ||
            ""
        ).toLowerCase();

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return "📕";
        }

        if (
            type.includes("word") ||
            type.includes("document") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return "📘";
        }

        if (
            type.includes("excel") ||
            type.includes("sheet") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {
            return "📗";
        }

        if (
            type.includes("image") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".webp")
        ) {
            return "🖼️";
        }

        if (
            type.includes("zip") ||
            name.endsWith(".zip") ||
            name.endsWith(".rar")
        ) {
            return "🗜️";
        }

        return "📄";
    };

    /* =========================================================
       FILE TYPE
    ========================================================= */

    const getFileType = (document) => {
        const type = (
            document.file_type ||
            document.mime_type ||
            ""
        ).toLowerCase();

        const name = (
            document.file_name ||
            document.filename ||
            ""
        ).toLowerCase();

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return "PDF";
        }

        if (
            type.includes("word") ||
            type.includes("document") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return "WORD";
        }

        if (
            type.includes("excel") ||
            type.includes("sheet") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {
            return "EXCEL";
        }

        if (
            type.includes("image") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".webp")
        ) {
            return "IMAGE";
        }

        return "FICHIER";
    };

    /* =========================================================
       DATE
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "-";
        }

        return value.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    };

    /* =========================================================
       SIZE
    ========================================================= */

    const formatSize = (size) => {
        if (!size) {
            return "-";
        }

        const bytes = Number(size);

        if (Number.isNaN(bytes)) {
            return size;
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(
                bytes /
                (1024 * 1024)
            ).toFixed(1)} MB`;
        }

        return `${(
            bytes /
            (1024 * 1024 * 1024)
        ).toFixed(1)} GB`;
    };

    /* =========================================================
       FILTER
    ========================================================= */

    const filteredDocuments = documents.filter(
        (document) => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const title =
                document.title || "";

            const description =
                document.description || "";

            const folderName =
                document.folder?.name ||
                document.folder_name ||
                "";

            const spaceName =
                document.space?.name ||
                document.space_name ||
                "";

            const fileName =
                document.file_name ||
                document.filename ||
                "";

            const fileType = (
                document.file_type ||
                document.mime_type ||
                ""
            ).toLowerCase();

            const text = `
                ${title}
                ${description}
                ${folderName}
                ${spaceName}
                ${fileName}
            `.toLowerCase();

            const matchesSearch =
                !search ||
                text.includes(search);

            const lowerFileName =
                fileName.toLowerCase();

            let matchesType =
                typeFilter === "all";

            if (typeFilter === "pdf") {
                matchesType =
                    fileType.includes("pdf") ||
                    lowerFileName.endsWith(
                        ".pdf"
                    );
            }

            if (typeFilter === "word") {
                matchesType =
                    fileType.includes("word") ||
                    fileType.includes("document") ||
                    lowerFileName.endsWith(
                        ".doc"
                    ) ||
                    lowerFileName.endsWith(
                        ".docx"
                    );
            }

            if (typeFilter === "excel") {
                matchesType =
                    fileType.includes("excel") ||
                    fileType.includes("sheet") ||
                    lowerFileName.endsWith(
                        ".xls"
                    ) ||
                    lowerFileName.endsWith(
                        ".xlsx"
                    );
            }

            if (typeFilter === "image") {
                matchesType =
                    fileType.includes("image") ||
                    lowerFileName.endsWith(
                        ".jpg"
                    ) ||
                    lowerFileName.endsWith(
                        ".jpeg"
                    ) ||
                    lowerFileName.endsWith(
                        ".png"
                    ) ||
                    lowerFileName.endsWith(
                        ".webp"
                    );
            }

            return (
                matchesSearch &&
                matchesType
            );
        }
    );

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="documents-layout">

            <Sidebar />

            <main className="documents-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="documents-header">

                    <div className="documents-header-info">

                        <h1>
                            Documents
                        </h1>

                        <p>
                            Gérez et organisez
                            vos documents facilement.
                        </p>

                    </div>

                    <div className="documents-tools">

                        {/* SEARCH */}

                        <div className="document-search">

                            <span>
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Rechercher un document..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* FILTER */}

                        <select
                            className="document-filter"
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                Tous les types
                            </option>

                            <option value="pdf">
                                PDF
                            </option>

                            <option value="word">
                                Word
                            </option>

                            <option value="excel">
                                Excel
                            </option>

                            <option value="image">
                                Images
                            </option>

                        </select>

                        {/* CORBEILLE */}

                        <button
                            type="button"
                            className="trash-button"
                            onClick={handleTrash}
                        >
                            <span>🗑️</span>
                            Corbeille
                        </button>

                        {/* NEW DOCUMENT */}

                        <button
                            type="button"
                            className="add-document-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            + Nouveau document
                        </button>

                    </div>

                </header>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <section className="documents-content">

                    {error && (
                        <div className="documents-error">
                            {error}
                        </div>
                    )}

                    {/* RESULT INFO */}

                    {!loading && (
                        <div className="documents-toolbar">

                            <div>
                                <strong>
                                    {filteredDocuments.length}
                                </strong>{" "}
                                document
                                {filteredDocuments.length !== 1
                                    ? "s"
                                    : ""}
                            </div>

                            {(searchTerm ||
                                typeFilter !== "all") && (
                                <button
                                    type="button"
                                    className="clear-filter-button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setTypeFilter(
                                            "all"
                                        );
                                    }}
                                >
                                    Réinitialiser
                                </button>
                            )}

                        </div>
                    )}

                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (
                        <div className="documents-message">
                            <div className="loading-spinner"></div>
                            Chargement des documents...
                        </div>
                    )}

                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!loading &&
                        filteredDocuments.length ===
                            0 && (
                            <div className="empty-documents">

                                <div className="empty-document-icon">
                                    📄
                                </div>

                                <h2>
                                    {searchTerm ||
                                    typeFilter !== "all"
                                        ? "Aucun document trouvé"
                                        : "Aucun document"}
                                </h2>

                                <p>
                                    {searchTerm ||
                                    typeFilter !== "all"
                                        ? "Essayez avec un autre terme ou filtre."
                                        : "Vous n'avez pas encore de document."}
                                </p>

                                {!searchTerm &&
                                    typeFilter ===
                                        "all" && (
                                        <button
                                            type="button"
                                            className="empty-add-button"
                                            onClick={
                                                openCreateModal
                                            }
                                        >
                                            + Ajouter un document
                                        </button>
                                    )}

                            </div>
                        )}

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    {!loading &&
                        filteredDocuments.length >
                            0 && (
                            <div className="documents-table-wrapper">

                                <table className="documents-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                DOCUMENT
                                            </th>

                                            <th>
                                                TYPE
                                            </th>

                                            <th>
                                                ESPACE
                                            </th>

                                            <th>
                                                DOSSIER
                                            </th>

                                            <th>
                                                AUTEUR
                                            </th>

                                            <th>
                                                TAILLE
                                            </th>

                                            <th>
                                                DATE
                                            </th>

                                            <th>
                                                ACTIONS
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredDocuments.map(
                                            (document) => (
                                                <tr
                                                    key={
                                                        document.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="document-name">

                                                            <span className="document-file-icon">
                                                                {getFileIcon(
                                                                    document
                                                                )}
                                                            </span>

                                                            <div>

                                                                <strong>
                                                                    {document.title ||
                                                                        "Sans titre"}
                                                                </strong>

                                                                {(
                                                                    document.file_name ||
                                                                    document.filename
                                                                ) && (
                                                                    <small>
                                                                        {
                                                                            document.file_name ||
                                                                            document.filename
                                                                        }
                                                                    </small>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <span className="document-type">
                                                            {getFileType(
                                                                document
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td>

                                                        {document
                                                            .space
                                                            ?.name ||
                                                            document.space_name ||
                                                            "Aucun espace"}

                                                    </td>

                                                    <td>

                                                        {document
                                                            .folder
                                                            ?.name ||
                                                            document.folder_name ||
                                                            "Aucun dossier"}

                                                    </td>

                                                    <td>

                                                        {document.user
                                                            ? `${document.user.first_name || ""} ${
                                                                  document.user.last_name ||
                                                                  ""
                                                              }`.trim() ||
                                                              document
                                                                  .user
                                                                  .name ||
                                                              document
                                                                  .user
                                                                  .email ||
                                                              "Inconnu"
                                                            : "Inconnu"}

                                                    </td>

                                                    <td>

                                                        {formatSize(
                                                            document.file_size ||
                                                                document.size
                                                        )}

                                                    </td>

                                                    <td>

                                                        {formatDate(
                                                            document.created_at
                                                        )}

                                                    </td>

                                                    <td>

                                                        <div className="document-actions">

                                                            <button
                                                                type="button"
                                                                className="document-action-button"
                                                                onClick={() =>
                                                                    handleView(
                                                                        document.id
                                                                    )
                                                                }
                                                            >
                                                                Voir
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="document-delete-button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        document.id
                                                                    )
                                                                }
                                                            >
                                                                Supprimer
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                </section>

            </main>

            {/* =========================================================
                CREATE MODAL
            ========================================================= */}

            {showCreateModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >

                    <div className="document-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nouveau document
                                </h2>

                                <p className="modal-subtitle">
                                    Ajoutez un document
                                    à un espace collaboratif.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeCreateModal
                                }
                                disabled={creating}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleCreateDocument
                            }
                        >

                            <div className="form-group">

                                <label htmlFor="title">
                                    Titre du document
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Ex : Contrat de travail"
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="description">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Description du document..."
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="space_id">
                                    Espace collaboratif
                                </label>

                                <select
                                    id="space_id"
                                    name="space_id"
                                    value={
                                        formData.space_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Aucun espace
                                    </option>

                                    {spaces.map(
                                        (space) => (
                                            <option
                                                key={
                                                    space.id
                                                }
                                                value={
                                                    space.id
                                                }
                                            >
                                                {space.name}
                                                {" — "}
                                                {space.is_private
                                                    ? "Privé"
                                                    : "Public"}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="form-group">

                                <label htmlFor="folder_id">
                                    Dossier
                                </label>

                                <select
                                    id="folder_id"
                                    name="folder_id"
                                    value={
                                        formData.folder_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Aucun dossier
                                    </option>

                                    {folders.map(
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

                            <div className="form-group">

                                <label htmlFor="file">
                                    Fichier
                                </label>

                                <input
                                    id="file"
                                    name="file"
                                    type="file"
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                                {formData.file && (
                                    <small>
                                        Fichier sélectionné :{" "}
                                        {
                                            formData.file
                                                .name
                                        }
                                    </small>
                                )}

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={creating}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Création..."
                                        : "Créer le document"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}