import { useState, useEffect } from "react";
import { fileService } from "../services/fileService";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  FileCode,
  File as FileIcon,
  Upload,
  FolderPlus,
  Search,
  Edit3,
  Trash2,
  ChevronRight,
  Home,
  X,
  Plus,
} from "lucide-react";

export function FileExplorer({ onStorageChange }) {
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "Home" }]);

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadFileObj, setUploadFileObj] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Rename state
  const [editingItem, setEditingItem] = useState(null); // { id, type: 'file'|'folder', name }
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    loadContent(currentFolderId);
  }, [currentFolderId]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        fileService
          .search(searchQuery)
          .then((res) => setSearchResults(res.data))
          .catch((err) => console.error("Search failed:", err));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const loadContent = async (folderId) => {
    setLoading(true);
    try {
      const res = await fileService.listItems(folderId);
      setFiles(res.data.files || []);
      setFolders(res.data.folders || []);
    } catch (err) {
      console.error("Failed to load file explorer items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    setSearchQuery("");
  };

  const handleBreadcrumbClick = (index) => {
    const target = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentFolderId(target.id);
    setSearchQuery("");
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await fileService.createFolder(newFolderName, currentFolderId);
      setNewFolderName("");
      setIsFolderModalOpen(false);
      loadContent(currentFolderId);
    } catch (err) {
      alert(err.response?.data?.error?.message || "Failed to create folder");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFileObj) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFileObj);
    formData.append("parentId", currentFolderId);

    try {
      await fileService.uploadFile(formData);
      setUploadFileObj(null);
      setIsUploadModalOpen(false);
      loadContent(currentFolderId);
      if (onStorageChange) onStorageChange();
    } catch (err) {
      alert(err.response?.data?.error?.message || "File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem || !renameValue.trim()) return;

    try {
      if (editingItem.type === "file") {
        await fileService.renameFile(editingItem.id, renameValue);
      } else {
        await fileService.renameFolder(editingItem.id, renameValue);
      }
      setEditingItem(null);
      setRenameValue("");
      loadContent(currentFolderId);
    } catch (err) {
      alert("Failed to rename item");
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === "file") {
        await fileService.deleteFile(id);
      } else {
        await fileService.deleteFolder(id);
      }
      loadContent(currentFolderId);
      if (onStorageChange) onStorageChange();
    } catch (err) {
      alert(`Failed to delete ${type}`);
    }
  };

  const renderFileIcon = (mimeType = "", name = "") => {
    const ext = name.split(".").pop()?.toLowerCase();

    if (mimeType.includes("image") || ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    if (mimeType.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(ext)) {
      return <FileText className="w-5 h-5 text-cyan-400" />;
    }
    if (["js", "jsx", "ts", "tsx", "json", "html", "css"].includes(ext)) {
      return <FileCode className="w-5 h-5 text-amber-400" />;
    }
    return <FileIcon className="w-5 h-5 text-slate-400" />;
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "--";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const displayFiles = searchResults ? searchResults.files : files;
  const displayFolders = searchResults ? searchResults.folders : folders;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search files & folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation Trail */}
      {!searchResults && (
        <nav className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 overflow-x-auto">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id} className="flex items-center space-x-1 flex-shrink-0">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`hover:text-cyan-400 transition flex items-center gap-1 font-medium ${
                  idx === breadcrumbs.length - 1 ? "text-cyan-400 font-bold" : ""
                }`}
              >
                {idx === 0 && <Home className="w-3.5 h-3.5 inline" />}
                <span>{crumb.name}</span>
              </button>
            </div>
          ))}
        </nav>
      )}

      {/* File & Folder Grid Display */}
      {loading ? (
        <div className="py-12 flex justify-center items-center text-slate-500 text-xs space-x-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading items...</span>
        </div>
      ) : displayFolders.length === 0 && displayFiles.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
          <p>This folder is empty.</p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="text-cyan-400 hover:underline font-semibold"
          >
            Upload your first file here
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Folders Section */}
          {displayFolders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Folders ({displayFolders.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {displayFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleOpenFolder(folder)}
                    className="group flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition shadow-sm"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Folder className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                        {folder.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ id: folder.id, type: "folder", name: folder.name });
                          setRenameValue(folder.name);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-400"
                        title="Rename Folder"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(folder.id, "folder");
                        }}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {displayFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Files ({displayFiles.length})
              </span>
              <div className="divide-y divide-slate-800/60 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                {displayFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center justify-between p-3.5 hover:bg-slate-900/60 transition text-xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {renderFileIcon(file.mimeType, file.name)}
                      <div>
                        <p className="font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formatSize(file.size)} • {file.provider}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem({ id: file.id, type: "file", name: file.name });
                          setRenameValue(file.name);
                        }}
                        className="p-1.5 text-slate-500 hover:text-cyan-400 transition"
                        title="Rename File"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(file.id, "file")}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                Create New Folder
              </h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Upload File to Storiva
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center space-y-2">
                <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFileObj(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900 cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  {isUploading ? "Uploading..." : "Start Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Rename {editingItem.type}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
