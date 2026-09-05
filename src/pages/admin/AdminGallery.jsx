import { useMemo, useRef, useState } from "react";
import {
  Images,
  Plus,
  MoreHorizontal,
  X,
  CalendarDays,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Eye,
  Edit3,
  Archive,
} from "lucide-react";

const initialAlbums = [
  {
    id: 1,
    title: "Annual Day 2025",
    date: "2025-11-14",
    category: "Cultural",
    audience: "All",
    description:
      "Cultural performances, prize distribution and the senior choir.",
    published: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Inter-house Sports Meet",
    date: "2025-10-02",
    category: "Sports",
    audience: "All",
    description: "Track events, relay finals and the house march past.",
    published: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: 3,
    title: "Science Exhibition",
    date: "2025-09-12",
    category: "Academics",
    audience: "All",
    description: "Working models by classes VIII–XII.",
    published: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: 4,
    title: "Educational Excursion",
    date: "2025-08-20",
    category: "Excursion",
    audience: "Students",
    description: "Memorable moments from the educational field trip.",
    published: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
];

export default function AdminGallery() {
  const [albums, setAlbums] = useState(initialAlbums);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [previewAlbum, setPreviewAlbum] = useState(null);

  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "Events",
    audience: "All",
    description: "",
    files: [],
  });

  const totalFiles = useMemo(
    () => albums.reduce((sum, album) => sum + album.media.length, 0),
    [albums]
  );

  const publishedCount = useMemo(
    () => albums.filter((album) => album.published).length,
    [albums]
  );

  const resetForm = () => {
    setForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "Events",
      audience: "All",
      description: "",
      files: [],
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleCreateAlbum = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter album title.");
      return;
    }

    const newMedia = form.files.map((file) => ({
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file),
    }));

    const newAlbum = {
      id: Date.now(),
      title: form.title,
      date: form.date,
      category: form.category,
      audience: form.audience,
      description: form.description,
      published: true,
      media: newMedia,
    };

    setAlbums((prev) => [newAlbum, ...prev]);
    closeCreateModal();
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this album?"
    );

    if (!confirmed) return;

    setAlbums((prev) => prev.filter((album) => album.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-[#f6fafc] px-4 py-7 sm:px-6 lg:px-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[13px] font-medium uppercase tracking-[0.08em] text-[#31597e]">
            Admin · Campus
          </p>

          <h1 className="text-[34px] font-medium leading-tight tracking-[-0.025em] text-[#06182d]">
            Media Gallery
          </h1>

          <p className="mt-1 text-[16px] text-[#4c6681]">
            Create albums, upload photos/videos and publish them to student
            and parent portals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex h-[38px] items-center justify-center gap-2 self-start rounded-[10px] bg-[#0b3c75] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#083362] sm:self-auto"
        >
          <Plus size={18} strokeWidth={2} />
          New Album
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Albums"
          value={albums.length}
          icon={<Images size={22} />}
        />

        <StatCard
          title="Published"
          value={publishedCount}
          icon={<Images size={22} />}
        />

        <StatCard
          title="Media Files"
          value={totalFiles}
          icon={<Images size={22} />}
        />
      </div>

      {/* =====================================================
          ALBUM GRID
      ====================================================== */}
      {albums.length === 0 ? (
        <EmptyState onCreate={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              onPreview={() => {
                setPreviewAlbum(album);
                setOpenMenu(null);
              }}
              onDelete={() => handleDelete(album.id)}
            />
          ))}
        </div>
      )}

      {/* =====================================================
          CREATE ALBUM MODAL
      ====================================================== */}
      {showCreateModal && (
        <CreateAlbumModal
          form={form}
          setForm={setForm}
          onClose={closeCreateModal}
          onSubmit={handleCreateAlbum}
        />
      )}

      {/* =====================================================
          PREVIEW MODAL
      ====================================================== */}
      {previewAlbum && (
        <AlbumPreviewModal
          album={previewAlbum}
          onClose={() => setPreviewAlbum(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ title, value, icon }) {
  return (
    <div className="flex min-h-[86px] items-center rounded-[15px] border border-[#dfe7ed] bg-white px-[18px] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="mr-[15px] flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-[9px] bg-[#e9edf1] text-[#0a3567]">
        {icon}
      </div>

      <div>
        <p className="text-[14px] text-[#566d85]">{title}</p>
        <p className="mt-[1px] text-[20px] font-medium leading-none text-[#07182d]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ALBUM CARD
============================================================ */

function AlbumCard({
  album,
  openMenu,
  setOpenMenu,
  onPreview,
  onDelete,
}) {
  const cover = album.media?.[0]?.url;

  return (
    <div className="overflow-visible rounded-[15px] border border-[#dce5eb] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.09)]">
      {/* Cover */}
      <div className="relative h-[280px] overflow-hidden rounded-t-[15px] bg-[#e9eef2]">
        {cover ? (
          album.media[0].type === "video" ? (
            <video
              src={cover}
              className="h-full w-full object-cover"
              muted
            />
          ) : (
            <img
              src={cover}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-[#8292a2]">
            <Images size={45} />
          </div>
        )}

        {/* Media count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
          <Images size={13} />
          {album.media.length}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-[18px] pb-[18px] pt-[19px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-medium text-[#07182d]">
              {album.title}
            </h2>

            <p className="mt-[2px] text-[13px] text-[#4e6984]">
              {album.date} · {album.media.length} items
            </p>
          </div>

          {/* More */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === album.id ? null : album.id)
              }
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#10253b] hover:bg-[#edf2f5]"
            >
              <MoreHorizontal size={20} />
            </button>

            {openMenu === album.id && (
              <div className="absolute right-0 top-8 z-30 w-[155px] overflow-hidden rounded-[9px] border border-[#dce4ea] bg-white py-1 shadow-xl">
                <MenuButton
                  icon={<Eye size={15} />}
                  label="View Album"
                  onClick={onPreview}
                />

                <MenuButton
                  icon={<Edit3 size={15} />}
                  label="Edit Album"
                  onClick={() => setOpenMenu(null)}
                />

                <MenuButton
                  icon={<Archive size={15} />}
                  label="Archive"
                  onClick={() => setOpenMenu(null)}
                />

                <MenuButton
                  danger
                  icon={<Trash2 size={15} />}
                  label="Delete"
                  onClick={onDelete}
                />
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-[14px] flex flex-wrap gap-2">
          <span className="rounded-[8px] border border-[#d8e1e8] bg-white px-[11px] py-[4px] text-[11px] font-semibold text-[#0b233c]">
            {album.category}
          </span>

          {album.published && (
            <span className="rounded-[8px] bg-[#08366e] px-[11px] py-[4px] text-[11px] font-semibold text-white shadow-sm">
              Published
            </span>
          )}
        </div>

        <p className="mt-[14px] line-clamp-2 min-h-[44px] text-[16px] leading-[1.45] text-[#536d88]">
          {album.description || "No description added."}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   MENU BUTTON
============================================================ */

function MenuButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-[#20374f] hover:bg-[#f1f5f8]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================================================
   CREATE ALBUM MODAL
============================================================ */

function CreateAlbumModal({ form, setForm, onClose, onSubmit }) {
  const fileInputRef = useRef(null);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setForm((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  };

  const removeFile = (index) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-none bg-[#f7fafc] shadow-2xl sm:max-w-[865px] sm:rounded-[10px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 pb-3 pt-6">
          <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#0a1d32]">
            Create Gallery Album
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#526477] hover:bg-[#e9eef2]"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="overflow-y-auto px-7 pb-6 pt-1"
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {/* Album Title */}
            <FormField label="Album Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Annual Day 2026"
                className={inputClass}
                autoFocus
              />
            </FormField>

            {/* Date */}
            <FormField label="Date">
              <div className="relative">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className={`${inputClass} pr-11`}
                />

                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#60758a]"
                />
              </div>
            </FormField>

            {/* Category */}
            <FormField label="Category">
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={inputClass}
              >
                <option value="Events">Events</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Academics">Academics</option>
                <option value="Excursion">Excursion</option>
                <option value="Celebration">Celebration</option>
                <option value="Other">Other</option>
              </select>
            </FormField>

            {/* Audience */}
            <FormField label="Audience">
              <select
                value={form.audience}
                onChange={(e) => updateField("audience", e.target.value)}
                className={inputClass}
              >
                <option value="All">All</option>
                <option value="Students">Students</option>
                <option value="Parents">Parents</option>
                <option value="Students & Parents">
                  Students & Parents
                </option>
              </select>
            </FormField>

            {/* Description */}
            <div className="sm:col-span-2">
              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  rows={3}
                  placeholder=""
                  className={`${inputClass} min-h-[67px] resize-y`}
                />
              </FormField>
            </div>

            {/* Upload */}
            <div className="sm:col-span-2">
              <FormField label="Upload Photos / Videos">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFiles}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />

                  <div className="flex h-[42px] items-center rounded-[9px] border border-[#d7e1e8] bg-white px-3 text-[14px] text-[#172c43] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    <span className="rounded-md bg-[#edf2f5] px-2 py-1 font-medium">
                      Choose Files
                    </span>

                    <span className="ml-2 truncate text-[#4f6479]">
                      {form.files.length > 0
                        ? `${form.files.length} file${
                            form.files.length > 1 ? "s" : ""
                          } selected`
                        : "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[13px] text-[#60758a]">
                  <Upload size={14} />
                  Files are stored locally in the browser for UI preview only.
                </div>
              </FormField>
            </div>
          </div>

          {/* Selected Files */}
          {form.files.length > 0 && (
            <div className="mt-4 rounded-[10px] border border-[#dce5eb] bg-white p-3">
              <p className="mb-2 text-[13px] font-semibold text-[#213951]">
                Selected Files
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {form.files.map((file, index) => (
                  <SelectedFile
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] rounded-[9px] border border-[#d7e1e8] bg-white px-5 text-[14px] font-medium text-[#0d2137] shadow-sm transition hover:bg-[#f1f5f8]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-[40px] rounded-[9px] bg-[#0c427d] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#093565]"
            >
              Publish Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-[5px] block text-[14px] font-medium text-[#52677d]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-[9px] border border-[#d7e1e8] bg-white px-3 py-[10px] text-[15px] text-[#172c43] outline-none shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition placeholder:text-[#7c8da0] focus:border-[#2781c8] focus:ring-1 focus:ring-[#2781c8]";

/* ============================================================
   SELECTED FILE
============================================================ */

function SelectedFile({ file, onRemove }) {
  const isVideo = file.type.startsWith("video/");
  const preview = URL.createObjectURL(file);

  return (
    <div className="group relative overflow-hidden rounded-[8px] border border-[#dce4ea] bg-[#f3f6f8]">
      <div className="aspect-[1.5/1]">
        {isVideo ? (
          <video
            src={preview}
            className="h-full w-full object-cover"
            muted
          />
        ) : (
          <img
            src={preview}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="truncate px-2 py-1.5 text-[10px] text-[#4f6479]">
        {file.name}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100"
      >
        <X size={13} />
      </button>

      {isVideo && (
        <div className="absolute left-1 top-1 rounded-md bg-black/60 p-1 text-white">
          <Video size={12} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ALBUM PREVIEW MODAL
============================================================ */

function AlbumPreviewModal({ album, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[94vh] w-full flex-col overflow-hidden bg-[#f7fafc] sm:max-w-[1150px] sm:rounded-[11px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-[21px] font-semibold text-[#0a1d32]">
              {album.title}
            </h2>

            <p className="mt-1 text-[13px] text-[#5a7088]">
              {album.date} · {album.media.length} media files
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#526477] hover:bg-[#e8edf1]"
          >
            <X size={22} />
          </button>
        </div>

        {/* Images */}
        <div className="overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {album.media.map((media, index) => (
              <div
                key={index}
                className="relative aspect-[1.7/1] overflow-hidden rounded-[9px] border border-[#dce5eb] bg-[#e9eef2]"
              >
                {media.type === "video" ? (
                  <video
                    src={media.url}
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={`${album.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-[15px] border border-dashed border-[#cfdbe4] bg-white px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9eef2] text-[#0a3567]">
        <ImageIcon size={25} />
      </div>

      <h3 className="mt-4 text-[18px] font-semibold text-[#10253b]">
        No albums yet
      </h3>

      <p className="mt-1 text-[14px] text-[#62778d]">
        Create your first gallery album and upload photos or videos.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-[9px] bg-[#0b3c75] px-4 text-[14px] font-semibold text-white"
      >
        <Plus size={17} />
        New Album
      </button>
    </div>
  );
}