import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./SpaceDetails.css";

export default function SpaceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [space, setSpace] = useState(null);
    const [members, setMembers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [foldersLoading, setFoldersLoading] = useState(false);

    const [error, setError] = useState("");

    const [uploadError, setUploadError] = useState("");
    const [folderError, setFolderError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);

    /* =========================================================
       AJOUT MEMBRES
    ========================================================= */

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const [memberError, setMemberError] = useState("");
    const [memberSuccess, setMemberSuccess] = useState("");

    const [uploading, setUploading] = useState(false);
    const [creatingFolder, setCreatingFolder] = useState(false);

    /* =========================================================
       SUPPRESSION ESPACE (ADMIN)
    ========================================================= */

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [documentForm, setDocumentForm] = useState({
        title: "",
        description: "",
        file: null,
        folder_id: "",
    });

    const [folderForm, setFolderForm] = useState({
        name: "",
        description: "",
        parent_id: "",
    });

    /* =========================================================
       UTILISATEUR COURANT / ROLE
    ========================================================= */

    const getCurrentUser = () => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Erreur utilisateur:", error);
            return null;
        }
    };

    const currentUser = getCurrentUser();

    const isAdmin =
        Number(currentUser?.role_id) === 1 ||
        currentUser?.role?.id === 1 ||
        currentUser?.role?.name?.toLowerCase() === "admin" ||
        currentUser?.role?.name?.toLowerCase() === "administrateur" ||
        currentUser?.role_name?.toLowerCase() === "admin" ||
        currentUser?.role_name?.toLowerCase() === "administrateur";

    /* =========================================================
       HELPERS API
    ========================================================= */

    const extractData = (response) => {
        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.data?.data)) {
            return response.data.data;
        }

        return [];
    };

    const extractObject = (response) => {
        return (
            response?.data?.data ||
            response?.data ||
            null
        );
    };

    /* =========================================================
       LOAD SPACE
    ========================================================= */

    const loadSpace = async () => {
        const response = await api.get(`/spaces/${id}`);

        const data = extractObject(response);

        setSpace(data);

        if (Array.isArray(data?.members)) {
            setMembers(data.members);
        }
    };

    /* =========================================================
       LOAD MEMBERS
    ========================================================= */

    const loadMembers = async () => {
        try {
            const response = await api.get(`/spaces/${id}/members`);

            setMembers(extractData(response));

        } catch (err) {
            console.error("Erreur membres:", err);

            setMembers([]);
        }
    };

    /* =========================================================
       LOAD USERS DISPONIBLES
    ========================================================= */

    const loadUsers = async () => {
        try {
            setMembersLoading(true);
            setMemberError("");

            /*
             * On utilise /spaces/users
             * car cette route existe dans api.php.
             */
            const response = await api.get("/spaces/users");

            let data = extractData(response);

            /*
             * Certains contrôleurs peuvent retourner :
             *
             * {
             *   data: [...]
             * }
             *
             * ou une pagination Laravel.
             */

            if (!data.length && Array.isArray(response?.data?.data)) {
                data = response.data.data;
            }

            /*
             * IDs des membres actuels
             */
            const existingMemberIds = members.map((member) => {
                const user = getUser(member);
                return Number(user?.id);
            });

            /*
             * On retire les utilisateurs
             * déjà membres de l'espace.
             */
            const availableUsers = data.filter(
                (user) => !existingMemberIds.includes(Number(user.id))
            );

            setUsers(availableUsers);

        } catch (err) {
            console.error("Erreur utilisateurs:", err);

            setMemberError(
                err.response?.data?.message ||
                "Impossible de charger les utilisateurs disponibles."
            );

            setUsers([]);

        } finally {
            setMembersLoading(false);
        }
    };

    /* =========================================================
       LOAD DOCUMENTS
    ========================================================= */

    const loadDocuments = async () => {
        try {
            setDocumentsLoading(true);

            const response = await api.get("/documents", {
                params: {
                    space_id: id,
                },
            });

            setDocuments(extractData(response));

        } catch (err) {
            console.error("Erreur documents:", err);

            setDocuments([]);

        } finally {
            setDocumentsLoading(false);
        }
    };

    /* =========================================================
       LOAD FOLDERS
    ========================================================= */

    const loadFolders = async () => {
        try {
            setFoldersLoading(true);

            const response = await api.get("/folders", {
                params: {
                    space_id: id,
                },
            });

            setFolders(extractData(response));

        } catch (err) {
            console.error("Erreur dossiers:", err);

            setFolders([]);

        } finally {
            setFoldersLoading(false);
        }
    };

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {
        if (!id) {
            return;
        }

        const loadEverything = async () => {
            try {
                setLoading(true);
                setError("");

                await loadSpace();

                await Promise.all([
                    loadMembers(),
                    loadDocuments(),
                    loadFolders(),
                ]);

            } catch (err) {
                console.error("Erreur espace:", err);

                setError(
                    err.response?.data?.message ||
                    "Impossible de charger cet espace."
                );

            } finally {
                setLoading(false);
            }
        };

        loadEverything();
    }, [id]);

    /* =========================================================
       USER HELPERS
    ========================================================= */

    const getUser = (member) => {
        return member?.user || member;
    };

    const getUserName = (member) => {
        const user = getUser(member);

        if (!user) {
            return "Utilisateur";
        }

        const fullName = `${user.first_name || ""} ${
            user.last_name || ""
        }`.trim();

        return (
            fullName ||
            user.name ||
            user.email ||
            "Utilisateur"
        );
    };

    const getInitial = (member) => {
        return (
            getUserName(member)?.charAt(0)?.toUpperCase() ||
            "U"
        );
    };

    /* =========================================================
       DOCUMENT HELPERS
    ========================================================= */

    const getDocumentName = (document) => {
        return (
            document?.title ||
            document?.name ||
            document?.original_name ||
            document?.file_name ||
            "Document"
        );
    };

    const getFileExtension = (document) => {
        const fileName =
            document?.file_name ||
            document?.original_name ||
            document?.name ||
            "";

        if (!fileName.includes(".")) {
            return "FILE";
        }

        return fileName.split(".").pop().toUpperCase();
    };

    const formatFileSize = (size) => {
        if (!size) {
            return "";
        }

        const number = Number(size);

        if (Number.isNaN(number)) {
            return "";
        }

        if (number < 1024) {
            return `${number} B`;
        }

        if (number < 1024 * 1024) {
            return `${(number / 1024).toFixed(1)} KB`;
        }

        if (number < 1024 * 1024 * 1024) {
            return `${(number / (1024 * 1024)).toFixed(1)} MB`;
        }

        return `${(number / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "";
        }

        return parsed.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /* =========================================================
       FOLDER HELPERS
    ========================================================= */

    const getFolderDocumentCount = (folderId) => {
        return documents.filter(
            (document) => Number(document.folder_id) === Number(folderId)
        ).length;
    };

    const getParentFolderName = (folder) => {
        if (!folder?.parent_id) {
            return "Dossier principal";
        }

        const parent = folders.find(
            (item) => Number(item.id) === Number(folder.parent_id)
        );

        return parent?.name || "Sous-dossier";
    };

    /* =========================================================
       DOCUMENT MODAL
    ========================================================= */

    const openUploadModal = () => {
        setUploadError("");
        setSuccessMessage("");

        setDocumentForm({
            title: "",
            description: "",
            file: null,
            folder_id: "",
        });

        setShowUploadModal(true);
    };

    const closeUploadModal = () => {
        if (uploading) {
            return;
        }

        setShowUploadModal(false);
        setUploadError("");
    };

    const handleDocumentInput = (event) => {
        const { name, value } = event.target;

        setDocumentForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        setDocumentForm((previous) => ({
            ...previous,
            file,
        }));

        setUploadError("");
    };

    /* =========================================================
       UPLOAD DOCUMENT
    ========================================================= */

    const handleUpload = async (event) => {
        event.preventDefault();

        setUploadError("");
        setSuccessMessage("");

        if (!documentForm.title.trim()) {
            setUploadError("Veuillez saisir le titre du document.");
            return;
        }

        if (!documentForm.file) {
            setUploadError("Veuillez sélectionner un fichier.");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append("title", documentForm.title.trim());
            formData.append("description", documentForm.description.trim());
            formData.append("space_id", String(id));

            if (documentForm.folder_id) {
                formData.append("folder_id", documentForm.folder_id);
            }

            formData.append("file", documentForm.file);

            await api.post("/documents", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            await loadDocuments();

            setSuccessMessage("Document ajouté avec succès.");

            setDocumentForm({
                title: "",
                description: "",
                file: null,
                folder_id: "",
            });

            setTimeout(() => {
                setShowUploadModal(false);
                setSuccessMessage("");
            }, 700);

        } catch (err) {
            console.error("Erreur upload:", err);

            const errors = err.response?.data?.errors;

            const fileError = errors?.file?.[0];
            const titleError = errors?.title?.[0];

            setUploadError(
                fileError ||
                titleError ||
                err.response?.data?.message ||
                "Impossible d'ajouter le document."
            );

        } finally {
            setUploading(false);
        }
    };

    /* =========================================================
       FOLDER MODAL
    ========================================================= */

    const openFolderModal = () => {
        setFolderError("");

        setFolderForm({
            name: "",
            description: "",
            parent_id: "",
        });

        setShowFolderModal(true);
    };

    const closeFolderModal = () => {
        if (creatingFolder) {
            return;
        }

        setShowFolderModal(false);
        setFolderError("");
    };

    const handleFolderInput = (event) => {
        const { name, value } = event.target;

        setFolderForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =========================================================
       CREATE FOLDER
    ========================================================= */

    const handleCreateFolder = async (event) => {
        event.preventDefault();

        setFolderError("");

        if (!folderForm.name.trim()) {
            setFolderError("Veuillez saisir le nom du dossier.");
            return;
        }

        try {
            setCreatingFolder(true);

            await api.post("/folders", {
                name: folderForm.name.trim(),
                description: folderForm.description.trim() || null,
                space_id: id,
                parent_id: folderForm.parent_id || null,
            });

            await loadFolders();

            setShowFolderModal(false);

            setFolderForm({
                name: "",
                description: "",
                parent_id: "",
            });

        } catch (err) {
            console.error("Erreur création dossier:", err);

            setFolderError(
                err.response?.data?.message ||
                "Impossible de créer le dossier."
            );

        } finally {
            setCreatingFolder(false);
        }
    };

    /* =========================================================
       MEMBERS MODAL
    ========================================================= */

    const openMemberModal = async () => {
        setMemberError("");
        setMemberSuccess("");
        setSelectedUserIds([]);

        setShowMemberModal(true);

        await loadUsers();
    };

    const closeMemberModal = () => {
        if (addingMembers) {
            return;
        }

        setShowMemberModal(false);
        setMemberError("");
        setMemberSuccess("");
        setSelectedUserIds([]);
    };

    const toggleUserSelection = (userId) => {
        const numericId = Number(userId);

        setSelectedUserIds((previous) => {
            if (previous.includes(numericId)) {
                return previous.filter((id) => id !== numericId);
            }

            return [...previous, numericId];
        });
    };

    /* =========================================================
       ADD MEMBERS
    ========================================================= */

    const handleAddMembers = async (event) => {
        event.preventDefault();

        setMemberError("");
        setMemberSuccess("");

        if (selectedUserIds.length === 0) {
            setMemberError("Veuillez sélectionner au moins un utilisateur.");
            return;
        }

        try {
            setAddingMembers(true);

            /*
             * Ton API possède :
             *
             * POST /spaces/{space}/members
             *
             * On ajoute chaque utilisateur
             * sélectionné.
             */

            for (const userId of selectedUserIds) {
                await api.post(`/spaces/${id}/members`, {
                    user_id: userId,
                });
            }

            await loadMembers();

            setMemberSuccess("Les membres ont été ajoutés avec succès.");

            setSelectedUserIds([]);

            /*
             * Recharge également la liste
             * des utilisateurs disponibles.
             */
            await loadUsers();

            setTimeout(() => {
                setShowMemberModal(false);
                setMemberSuccess("");
            }, 800);

        } catch (err) {
            console.error("Erreur ajout membre:", err);

            setMemberError(
                err.response?.data?.message ||
                "Impossible d'ajouter les membres."
            );

        } finally {
            setAddingMembers(false);
        }
    };

    /* =========================================================
       DELETE SPACE (ADMIN)
    ========================================================= */

    const openDeleteModal = () => {
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setShowDeleteModal(false);
        setDeleteError("");
    };

    const handleDeleteSpace = async () => {
        try {
            setDeleting(true);
            setDeleteError("");

            await api.delete(`/spaces/${id}`);

            navigate("/spaces", { replace: true });

        } catch (err) {
            console.error("Erreur suppression espace:", err);

            setDeleteError(
                err.response?.data?.message ||
                "Impossible de supprimer cet espace."
            );

            setDeleting(false);
        }
    };

    /* =========================================================
       OPEN DOCUMENT / FOLDER
    ========================================================= */

    const openDocument = (document) => {
        if (!document?.id) {
            return;
        }

        navigate(`/documents/${document.id}`);
    };

    const openFolder = (folder) => {
        if (!folder?.id) {
            return;
        }

        navigate(`/folders/${folder.id}`);
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="space-details-page">
                <div className="space-loading">
                    <div className="loading-spinner"></div>
                    <p>Chargement de l'espace...</p>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error || !space) {
        return (
            <div className="space-details-page">
                <div className="space-error-page">
                    <div className="error-icon">!</div>

                    <h2>Impossible d'ouvrir cet espace</h2>

                    <p>
                        {error ||
                            "Cet espace n'existe pas ou vous n'avez pas accès."}
                    </p>

                    <button
                        className="space-back-button"
                        onClick={() => navigate("/spaces")}
                    >
                        ← Retour aux espaces
                    </button>
                </div>
            </div>
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="space-details-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="space-details-header">

                <div className="space-header-top-row">
                    <button
                        className="back-button"
                        onClick={() => navigate("/spaces")}
                    >
                        ← Retour aux espaces
                    </button>

                    {isAdmin && (
                        <button
                            type="button"
                            className="delete-space-button"
                            onClick={openDeleteModal}
                        >
                            🗑 Supprimer l'espace
                        </button>
                    )}
                </div>

                <div className="space-header-main">

                    <div className="space-header-icon">
                        {space.name?.charAt(0)?.toUpperCase() || "E"}
                    </div>

                    <div className="space-header-info">

                        <div className="space-title-line">

                            <h1>{space.name}</h1>

                            {space.is_private && (
                                <span className="private-badge">
                                    🔒 Privé
                                </span>
                            )}

                        </div>

                        <p>
                            {space.description ||
                                "Espace de travail collaboratif"}
                        </p>

                    </div>

                </div>

            </div>

            {/* =================================================
                STATS
            ================================================= */}

            <div className="space-stats">

                <div className="space-stat-card">
                    <div className="stat-icon">📄</div>
                    <div>
                        <strong>{documents.length}</strong>
                        <span>Documents</span>
                    </div>
                </div>

                <div className="space-stat-card">
                    <div className="stat-icon">📁</div>
                    <div>
                        <strong>{folders.length}</strong>
                        <span>Dossiers</span>
                    </div>
                </div>

                <div className="space-stat-card">
                    <div className="stat-icon">👥</div>
                    <div>
                        <strong>{members.length}</strong>
                        <span>Membres</span>
                    </div>
                </div>

                <div className="space-stat-card">
                    <div className="stat-icon">📅</div>
                    <div>
                        <strong>{formatDate(space.created_at)}</strong>
                        <span>Créé le</span>
                    </div>
                </div>

            </div>

            {/* =================================================
                FOLDERS
            ================================================= */}

            <section className="space-section">

                <div className="space-section-header">

                    <div>
                        <span className="section-label">ORGANISATION</span>
                        <h2>Dossiers</h2>
                        <p>Organisez les documents de cet espace.</p>
                    </div>

                    <button
                        className="add-folder-space-button"
                        onClick={openFolderModal}
                    >
                        <span>+</span>
                        Nouveau dossier
                    </button>

                </div>

                {foldersLoading ? (

                    <div className="documents-loading">
                        <div className="small-spinner"></div>
                        <span>Chargement des dossiers...</span>
                    </div>

                ) : folders.length === 0 ? (

                    <div className="documents-empty">
                        <div className="documents-empty-icon">📁</div>
                        <h3>Aucun dossier</h3>
                        <p>Créez un dossier pour organiser vos documents.</p>

                        <button
                            className="empty-add-button"
                            onClick={openFolderModal}
                        >
                            + Créer un dossier
                        </button>
                    </div>

                ) : (

                    <div className="space-folders-grid">

                        {folders.map((folder) => (
                            <div
                                className="space-folder-card"
                                key={folder.id}
                                onClick={() => openFolder(folder)}
                            >

                                <div className="space-folder-icon">📁</div>

                                <div className="space-folder-content">

                                    <h3>{folder.name}</h3>

                                    <span className="folder-parent">
                                        {getParentFolderName(folder)}
                                    </span>

                                    <p>
                                        {folder.description ||
                                            "Aucune description"}
                                    </p>

                                    <div className="folder-card-footer">
                                        <span>
                                            {getFolderDocumentCount(folder.id)}{" "}
                                            document
                                            {getFolderDocumentCount(folder.id) > 1
                                                ? "s"
                                                : ""}
                                        </span>

                                        <strong>Ouvrir →</strong>
                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

            {/* =================================================
                DOCUMENTS
            ================================================= */}

            <section className="space-section">

                <div className="space-section-header">

                    <div>
                        <span className="section-label">CONTENU</span>
                        <h2>Documents</h2>
                        <p>Documents associés à cet espace.</p>
                    </div>

                    <button
                        className="add-document-button"
                        onClick={openUploadModal}
                    >
                        <span className="add-icon">+</span>
                        Ajouter un document
                    </button>

                </div>

                {documentsLoading ? (

                    <div className="documents-loading">
                        <div className="small-spinner"></div>
                        <span>Chargement des documents...</span>
                    </div>

                ) : documents.length === 0 ? (

                    <div className="documents-empty">
                        <div className="documents-empty-icon">📄</div>
                        <h3>Aucun document</h3>
                        <p>
                            Ajoutez votre premier document dans cet espace.
                        </p>

                        <button
                            className="empty-add-button"
                            onClick={openUploadModal}
                        >
                            + Ajouter un document
                        </button>
                    </div>

                ) : (

                    <div className="documents-grid">

                        {documents.map((document) => (
                            <div
                                className="document-card"
                                key={document.id}
                                onClick={() => openDocument(document)}
                            >

                                <div className="document-card-icon">📄</div>

                                <div className="document-card-content">

                                    <h3>{getDocumentName(document)}</h3>

                                    <div className="document-meta">
                                        <span>
                                            {getFileExtension(document)}
                                        </span>

                                        {document.file_size && (
                                            <>
                                                <i>•</i>
                                                <span>
                                                    {formatFileSize(
                                                        document.file_size
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {document.folder && (
                                        <div className="document-folder-tag">
                                            📁 {document.folder.name}
                                        </div>
                                    )}

                                    <p>
                                        {document.description ||
                                            "Aucune description"}
                                    </p>

                                    <div className="document-footer">
                                        <span>
                                            {formatDate(document.created_at)}
                                        </span>

                                        <span className="document-open">
                                            Ouvrir →
                                        </span>
                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

            {/* =================================================
                MEMBERS
            ================================================= */}

            <section className="space-section">

                <div className="space-section-header">

                    <div>
                        <span className="section-label">COLLABORATION</span>
                        <h2>Membres de l'espace</h2>
                        <p>Utilisateurs ayant accès à cet espace.</p>
                    </div>

                    <div className="members-header-actions">

                        <div className="members-count">
                            {members.length}
                        </div>

                        {isAdmin && (
                            <button
                                type="button"
                                className="add-member-space-button"
                                onClick={openMemberModal}
                            >
                                <span>+</span>
                                Ajouter des membres
                            </button>
                        )}

                    </div>

                </div>

                {members.length === 0 ? (

                    <div className="members-empty">
                        <div>👥</div>
                        <h3>Aucun membre</h3>
                        <p>Aucun utilisateur n'est associé à cet espace.</p>

                        {isAdmin && (
                            <button
                                type="button"
                                className="empty-add-button"
                                onClick={openMemberModal}
                            >
                                + Ajouter un membre
                            </button>
                        )}
                    </div>

                ) : (

                    <div className="members-grid">

                        {members.map((member) => {

                            const user = getUser(member);

                            return (
                                <div
                                    className="member-card"
                                    key={member.id || user?.id}
                                >

                                    <div className="member-avatar">
                                        {getInitial(member)}
                                    </div>

                                    <div className="member-data">
                                        <strong>{getUserName(member)}</strong>
                                        <span>{user?.email || ""}</span>
                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </section>

            {/* =================================================
                FOLDER MODAL
            ================================================= */}

            {showFolderModal && (

                <div
                    className="upload-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeFolderModal();
                        }
                    }}
                >

                    <div className="upload-modal">

                        <div className="upload-modal-header">

                            <div>
                                <span className="modal-label">DOSSIER</span>
                                <h2>Nouveau dossier</h2>
                                <p>Créez un dossier dans cet espace.</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeFolderModal}
                                disabled={creatingFolder}
                            >
                                ×
                            </button>

                        </div>

                        {folderError && (
                            <div className="upload-error">{folderError}</div>
                        )}

                        <form onSubmit={handleCreateFolder}>

                            <div className="form-group">
                                <label>
                                    Nom du dossier
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={folderForm.name}
                                    onChange={handleFolderInput}
                                    placeholder="Ex. Contrats"
                                    disabled={creatingFolder}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={folderForm.description}
                                    onChange={handleFolderInput}
                                    placeholder="Description du dossier..."
                                    rows="4"
                                    disabled={creatingFolder}
                                />
                            </div>

                            <div className="form-group">
                                <label>Dossier parent</label>

                                <select
                                    name="parent_id"
                                    value={folderForm.parent_id}
                                    onChange={handleFolderInput}
                                    disabled={creatingFolder}
                                >
                                    <option value="">
                                        Aucun — dossier principal
                                    </option>

                                    {folders.map((folder) => (
                                        <option
                                            key={folder.id}
                                            value={folder.id}
                                        >
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="current-space">
                                <span>Espace</span>
                                <strong>📁 {space.name}</strong>
                            </div>

                            <div className="upload-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeFolderModal}
                                    disabled={creatingFolder}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="submit-upload-button"
                                    disabled={creatingFolder}
                                >
                                    {creatingFolder ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Création...
                                        </>
                                    ) : (
                                        <>✓ Créer le dossier</>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                DOCUMENT MODAL
            ================================================= */}

            {showUploadModal && (

                <div
                    className="upload-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeUploadModal();
                        }
                    }}
                >

                    <div className="upload-modal">

                        <div className="upload-modal-header">

                            <div>
                                <span className="modal-label">DOCUMENT</span>
                                <h2>Ajouter un document</h2>
                                <p>Ajoutez un document à cet espace.</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeUploadModal}
                                disabled={uploading}
                            >
                                ×
                            </button>

                        </div>

                        {successMessage && (
                            <div className="upload-success">
                                ✓ {successMessage}
                            </div>
                        )}

                        {uploadError && (
                            <div className="upload-error">{uploadError}</div>
                        )}

                        <form onSubmit={handleUpload}>

                            <div className="form-group">
                                <label>
                                    Titre du document
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={documentForm.title}
                                    onChange={handleDocumentInput}
                                    placeholder="Ex. Rapport annuel 2026"
                                    disabled={uploading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Dossier</label>

                                <select
                                    name="folder_id"
                                    value={documentForm.folder_id}
                                    onChange={handleDocumentInput}
                                    disabled={uploading}
                                >
                                    <option value="">Aucun dossier</option>

                                    {folders.map((folder) => (
                                        <option
                                            key={folder.id}
                                            value={folder.id}
                                        >
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={documentForm.description}
                                    onChange={handleDocumentInput}
                                    placeholder="Description du document..."
                                    rows="4"
                                    disabled={uploading}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Fichier
                                    <span>*</span>
                                </label>

                                <label
                                    className={`file-dropzone ${
                                        documentForm.file ? "has-file" : ""
                                    }`}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />

                                    {documentForm.file ? (
                                        <>
                                            <div className="file-selected-icon">
                                                ✓
                                            </div>

                                            <strong>
                                                {documentForm.file.name}
                                            </strong>

                                            <span>
                                                Cliquez pour changer le
                                                fichier
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="file-upload-icon">
                                                ↑
                                            </div>

                                            <strong>
                                                Cliquez pour sélectionner un
                                                fichier
                                            </strong>

                                            <span>
                                                Taille maximale : 10 MB
                                            </span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="current-space">
                                <span>Espace de destination</span>
                                <strong>📁 {space.name}</strong>
                            </div>

                            <div className="upload-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeUploadModal}
                                    disabled={uploading}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="submit-upload-button"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Ajout en cours...
                                        </>
                                    ) : (
                                        <>✓ Ajouter le document</>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                MEMBER MODAL
            ================================================= */}

            {showMemberModal && (

                <div
                    className="upload-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeMemberModal();
                        }
                    }}
                >

                    <div className="upload-modal member-modal">

                        <div className="upload-modal-header">

                            <div>
                                <span className="modal-label">
                                    COLLABORATION
                                </span>
                                <h2>Ajouter des membres</h2>
                                <p>
                                    Sélectionnez les utilisateurs qui auront
                                    accès à cet espace.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeMemberModal}
                                disabled={addingMembers}
                            >
                                ×
                            </button>

                        </div>

                        {memberSuccess && (
                            <div className="upload-success">
                                ✓ {memberSuccess}
                            </div>
                        )}

                        {memberError && (
                            <div className="upload-error">{memberError}</div>
                        )}

                        {membersLoading ? (

                            <div className="members-modal-loading">
                                <div className="small-spinner"></div>
                                <span>Chargement des utilisateurs...</span>
                            </div>

                        ) : users.length === 0 ? (

                            <div className="members-modal-empty">
                                <div className="members-modal-empty-icon">
                                    👥
                                </div>

                                <h3>Aucun utilisateur disponible</h3>

                                <p>
                                    Tous les utilisateurs ont déjà accès à
                                    cet espace.
                                </p>
                            </div>

                        ) : (

                            <form onSubmit={handleAddMembers}>

                                <div className="users-selection-list">

                                    {users.map((user) => {

                                        const fullName = `${
                                            user.first_name || ""
                                        } ${user.last_name || ""}`.trim();

                                        const displayName =
                                            fullName ||
                                            user.name ||
                                            user.email ||
                                            "Utilisateur";

                                        const selected =
                                            selectedUserIds.includes(
                                                Number(user.id)
                                            );

                                        return (

                                            <div
                                                key={user.id}
                                                className={`user-selection-card ${
                                                    selected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    toggleUserSelection(
                                                        user.id
                                                    )
                                                }
                                            >

                                                <div className="user-selection-checkbox">
                                                    {selected && (
                                                        <span>✓</span>
                                                    )}
                                                </div>

                                                <div className="user-selection-avatar">
                                                    {displayName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="user-selection-info">
                                                    <strong>
                                                        {displayName}
                                                    </strong>
                                                    <span>{user.email}</span>
                                                </div>

                                            </div>

                                        );
                                    })}

                                </div>

                                <div className="selected-members-info">
                                    <span>
                                        {selectedUserIds.length} utilisateur
                                        {selectedUserIds.length > 1
                                            ? "s"
                                            : ""}{" "}
                                        sélectionné
                                        {selectedUserIds.length > 1
                                            ? "s"
                                            : ""}
                                    </span>
                                </div>

                                <div className="current-space">
                                    <span>Espace de destination</span>
                                    <strong>📁 {space.name}</strong>
                                </div>

                                <div className="upload-modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={closeMemberModal}
                                        disabled={addingMembers}
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        className="submit-upload-button"
                                        disabled={
                                            addingMembers ||
                                            selectedUserIds.length === 0
                                        }
                                    >
                                        {addingMembers ? (
                                            <>
                                                <span className="button-spinner"></span>
                                                Ajout en cours...
                                            </>
                                        ) : (
                                            <>✓ Ajouter les membres</>
                                        )}
                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>
            )}

            {/* =================================================
                DELETE SPACE MODAL (ADMIN)
            ================================================= */}

            {showDeleteModal && (

                <div
                    className="upload-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDeleteModal();
                        }
                    }}
                >

                    <div className="upload-modal delete-modal">

                        <div className="delete-modal-icon">⚠</div>

                        <h2>Supprimer « {space.name} » ?</h2>

                        <p>
                            Cette action est irréversible. Tous les
                            documents et dossiers de cet espace seront
                            définitivement supprimés.
                        </p>

                        {deleteError && (
                            <div className="upload-error">{deleteError}</div>
                        )}

                        <div className="upload-modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={handleDeleteSpace}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Suppression...
                                    </>
                                ) : (
                                    <>🗑 Supprimer définitivement</>
                                )}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}
