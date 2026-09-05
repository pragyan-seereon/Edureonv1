import { useEffect, useState } from "react";
import { Images, X, CalendarDays, FolderOpen, Video, Loader2 } from "lucide-react";
import { getPortalAlbumDetail, getPortalAlbums } from "../../api/gallery";

const isVideo = (media) =>
  String(media?.media_type || "").toUpperCase() === "VIDEO" ||
  String(media?.mime_type || "").startsWith("video/");

const normalizeAlbum = (album) => ({
  uuid: album.album_uuid,
  title: album.title,
  category: album.category,
  date: album.album_date,
  description: album.description,
  mediaCount: album.media_count ?? 0,
  cover: album.cover_media?.file_url,
  coverIsVideo: isVideo(album.cover_media),
  media: [],
});

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlbumLoading, setIsAlbumLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAlbums = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPortalAlbums({ page: 1, pageSize: 100 });
      setAlbums((response.data || []).map(normalizeAlbum));
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't load the gallery. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAlbums(); }, []);

  const openAlbum = async (album) => {
    setSelectedAlbum(album);
    setIsAlbumLoading(true);
    try {
      const detail = await getPortalAlbumDetail(album.uuid);
      setSelectedAlbum({
        ...album,
        title: detail.title || album.title,
        date: detail.album_date || album.date,
        media: (detail.media || []).map((media) => ({
          uuid: media.media_uuid,
          url: media.file_url,
          video: isVideo(media),
        })),
      });
    } catch (err) {
      setSelectedAlbum(null);
      setError(err?.response?.data?.detail || "Couldn't open this album.");
    } finally {
      setIsAlbumLoading(false);
    }
  };

  return <div className="min-h-screen bg-[#f7fafc] px-4 py-6 sm:px-6 lg:px-7">
    <div className="mb-7"><p className="mb-1 text-[13px] font-medium uppercase tracking-[0.08em] text-[#173f70]">Student Portal</p><h1 className="text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-[#07182d]">Gallery</h1><p className="mt-1 text-[16px] text-[#48617d]">Photos and videos uploaded by the admin team for student viewing.</p></div>
    {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={loadAlbums} /> : albums.length === 0 ? <EmptyState /> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{albums.map((album) => <GalleryCard key={album.uuid} album={album} onOpen={() => openAlbum(album)} />)}</div>}
    {selectedAlbum && <AlbumModal album={selectedAlbum} isLoading={isAlbumLoading} onClose={() => setSelectedAlbum(null)} />}
  </div>;
}

function GalleryCard({ album, onOpen }) { return <div className="overflow-hidden rounded-[15px] border border-[#dce4ea] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]"><div className="relative h-[278px] overflow-hidden bg-[#e9eef2]">{album.cover ? album.coverIsVideo ? <video src={album.cover} className="h-full w-full object-cover" muted /> : <img src={album.cover} alt={album.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8292a2]"><Images size={45} /></div>}<div className="absolute left-[14px] top-[13px]"><span className="rounded-[9px] bg-[#07336d] px-3 py-[5px] text-[12px] font-semibold text-white">{album.category}</span></div></div><div className="px-[17px] pb-[17px] pt-[18px]"><h2 className="text-[18px] font-medium text-[#081a31]">{album.title}</h2><div className="mt-1 text-[13px] text-[#55708c]">{album.date} · {album.mediaCount} media files</div><p className="mt-[14px] min-h-[42px] text-[16px] leading-[1.45] text-[#536b86]">{album.description || "No description added."}</p><button type="button" onClick={onOpen} className="mt-[13px] flex h-[37px] w-full items-center justify-center gap-2 rounded-[9px] border border-[#d5e0e8] bg-[#f8fbfd] text-[14px] font-medium text-[#07182d] hover:bg-[#eef4f8]"><FolderOpen size={18} />Open Album</button></div></div>; }

function AlbumModal({ album, isLoading, onClose }) { return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-0 sm:px-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="max-h-[92vh] w-full overflow-hidden bg-[#f8fbfd] shadow-2xl sm:max-w-[1150px] sm:rounded-[12px]"><div className="flex items-center justify-between px-5 py-5 sm:px-7"><div><h2 className="text-[21px] font-semibold text-[#0a1d32]">{album.title}</h2><div className="mt-1 flex items-center gap-2 text-[13px] text-[#58718b]"><CalendarDays size={15}/>{album.date}<span>·</span><Images size={15}/>{album.mediaCount} media files</div></div><button type="button" onClick={onClose} aria-label="Close album" className="p-2"><X size={22}/></button></div><div className="max-h-[calc(92vh-92px)] overflow-y-auto px-5 pb-6 sm:px-7">{isLoading ? <LoadingState /> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{album.media.map((item, index) => <div key={item.uuid} className="relative aspect-[1.75/1] overflow-hidden rounded-[9px] bg-[#e9eef2]">{item.video ? <video src={item.url} controls className="h-full w-full object-cover"/> : <img src={item.url} alt={`${album.title} ${index + 1}`} className="h-full w-full object-cover" loading="lazy"/>}{item.video && <Video className="absolute left-2 top-2 text-white" size={18}/>}</div>)}</div>}</div></div></div>; }
function LoadingState() { return <div className="flex items-center justify-center gap-2 py-16 text-[#566d85]"><Loader2 size={18} className="animate-spin"/>Loading gallery...</div>; }
function ErrorState({ message, onRetry }) { return <div className="rounded-[15px] border border-dashed border-[#f1c2c2] bg-white px-5 py-16 text-center"><p className="text-[#7a2020]">{message}</p><button type="button" onClick={onRetry} className="mt-5 rounded-[9px] bg-[#0b3c75] px-4 py-2 text-sm font-semibold text-white">Try Again</button></div>; }
function EmptyState() { return <div className="rounded-[15px] border border-dashed border-[#cfdbe4] bg-white px-5 py-16 text-center text-[#62778d]"><Images className="mx-auto mb-3"/>No gallery albums are available yet.</div>; }
