import { useState } from "react";
import {
  Images,
  X,
  Image as ImageIcon,
  CalendarDays,
  FolderOpen,
} from "lucide-react";

const galleryData = [
  {
    id: 1,
    title: "Annual Day 2025",
    category: "Cultural",
    date: "2025-11-14",
    description:
      "Cultural performances, prize distribution and the senior choir.",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 2,
    title: "Inter-house Sports Meet",
    category: "Sports",
    date: "2025-10-02",
    description: "Track events, relay finals and the house march past.",
    cover:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 3,
    title: "Science Exhibition",
    category: "Academics",
    date: "2025-09-12",
    description: "Working models by classes VII–XII.",
    cover:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 4,
    title: "Educational Excursion",
    category: "Excursion",
    date: "2025-08-20",
    description: "Memorable moments from the educational field trip.",
    cover:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export default function Gallery() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const openAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] px-4 py-6 sm:px-6 lg:px-7">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-7">
        <p className="mb-1 text-[13px] font-medium uppercase tracking-[0.08em] text-[#173f70]">
          Student Portal
        </p>

        <h1 className="text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-[#07182d]">
          Gallery
        </h1>

        <p className="mt-1 text-[16px] text-[#48617d]">
          Photos and videos uploaded by the admin team for student viewing.
        </p>
      </div>

      {/* =========================
          GALLERY GRID
      ========================== */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {galleryData.map((album) => (
          <GalleryCard
            key={album.id}
            album={album}
            onOpen={() => openAlbum(album)}
          />
        ))}
      </div>

      {/* =========================
          ALBUM MODAL
      ========================== */}
      {selectedAlbum && (
        <AlbumModal album={selectedAlbum} onClose={closeAlbum} />
      )}
    </div>
  );
}

/* ============================================================
   GALLERY CARD
============================================================ */

function GalleryCard({ album, onOpen }) {
  return (
    <div className="overflow-hidden rounded-[15px] border border-[#dce4ea] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_5px_16px_rgba(15,23,42,0.10)]">
      {/* Cover Image */}
      <div className="relative h-[278px] overflow-hidden">
        <img
          src={album.cover}
          alt={album.title}
          className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
        />

        {/* Category */}
        <div className="absolute left-[14px] top-[13px]">
          <span className="rounded-[9px] bg-[#07336d] px-3 py-[5px] text-[12px] font-semibold text-white shadow-sm">
            {album.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-[17px] pb-[17px] pt-[18px]">
        <h2 className="text-[18px] font-medium leading-[1.25] text-[#081a31]">
          {album.title}
        </h2>

        {/* Date / Files */}
        <div className="mt-[2px] text-[13px] text-[#55708c]">
          {album.date} · {album.images.length} media files
        </div>

        {/* Description */}
        <p className="mt-[14px] min-h-[42px] text-[16px] leading-[1.45] text-[#536b86]">
          {album.description}
        </p>

        {/* Open Album */}
        <button
          type="button"
          onClick={onOpen}
          className="mt-[13px] flex h-[37px] w-full items-center justify-center gap-2 rounded-[9px] border border-[#d5e0e8] bg-[#f8fbfd] text-[14px] font-medium text-[#07182d] transition hover:bg-[#eef4f8] focus:outline-none focus:ring-2 focus:ring-[#123f73]/20"
        >
          <FolderOpen size={18} strokeWidth={1.8} />
          <span>Open Album</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ALBUM MODAL
============================================================ */

function AlbumModal({ album, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-0 sm:px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full overflow-hidden rounded-none border border-[#d5dee6] bg-[#f8fbfd] shadow-2xl sm:max-w-[1150px] sm:rounded-[12px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-[21px] font-semibold text-[#0a1d32]">
              {album.title}
            </h2>

            <div className="mt-1 flex items-center gap-2 text-[13px] text-[#58718b]">
              <CalendarDays size={15} />
              <span>{album.date}</span>

              <span>·</span>

              <Images size={15} />
              <span>{album.images.length} media files</span>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close album"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#526477] transition hover:bg-[#e9eef2] hover:text-[#0b1e34]"
          >
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        {/* Gallery */}
        <div className="max-h-[calc(92vh-92px)] overflow-y-auto px-5 pb-6 sm:px-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {album.images.map((image, index) => (
              <div
                key={`${album.id}-${index}`}
                className="group relative aspect-[1.75/1] overflow-hidden rounded-[9px] border border-[#dbe3e9] bg-[#e9eef2]"
              >
                <img
                  src={image}
                  alt={`${album.title} ${index + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Image number */}
                <div className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}