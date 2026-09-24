/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Images,
  Loader2,
  MoreHorizontal,
  Plus,
  Upload,
  Video,
  X,
} from "lucide-react";
import useSessionStore from "../../store/sessionStore";
import { getTeacherClasses } from "../../api/teacherclass";
import {
  addTeacherAlbumMedia,
  createTeacherAlbum,
  getPortalAlbumDetail,
  getPortalAlbums,
  getTeacherAlbumDetail,
  getTeacherAlbums,
  publishTeacherAlbum,
  updateTeacherAlbum,
} from "../../api/gallery";

const initialForm = { title: "", albumDate: "", endDate: "", description: "", files: [] };

const normalizeSessionYear = (value) => {
  const years = String(value || "").match(/\b20\d{2}\b/g);
  return years?.length >= 2 ? `${years[0]}-${years[1].slice(-2)}` : String(value || "").trim();
};

export default function TeacherGallery() {
  const [searchParams] = useSearchParams();
  const requestedClassUuid = searchParams.get("classUuid");
  const requestedSectionUuid = searchParams.get("sectionUuid");
  const sessionYear = useSessionStore((state) => state.sessionYear);
  const [scopes, setScopes] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [schoolAlbums, setSchoolAlbums] = useState([]);
  const [classUuid, setClassUuid] = useState("");
  const [sectionUuid, setSectionUuid] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const sessionScopes = useMemo(
    () => scopes.filter((scope) => normalizeSessionYear(scope.academic_year) === normalizeSessionYear(sessionYear)),
    [scopes, sessionYear]
  );
  const classes = useMemo(
    () => [...new Map(sessionScopes.map((scope) => [scope.class_uuid, scope])).values()],
    [sessionScopes]
  );
  const sections = useMemo(
    () => sessionScopes.filter((scope) => scope.class_uuid === classUuid),
    [sessionScopes, classUuid]
  );
  const assignedClasses = useMemo(
    () =>
      sessionScopes.map((scope) => ({
        classUuid: scope.class_uuid,
        className: scope.class_name,
        sectionUuid: scope.section_uuid,
        sectionName: scope.section_name,
      })),
    [sessionScopes]
  );

  const matchesRequestedClassAndSection = (album) => {
    if (!requestedClassUuid && !requestedSectionUuid) return true;

    const audiences = album.class_audiences ?? album.audiences ?? [];
    return audiences.some((audience) => {
      const classMatches = !requestedClassUuid || audience.class_uuid === requestedClassUuid;
      const sectionUuids = audience.section_uuids ?? [audience.section_uuid];
      const sectionMatches =
        !requestedSectionUuid || sectionUuids.includes(requestedSectionUuid);
      return classMatches && sectionMatches;
    });
  };
  const filteredAlbums = useMemo(
    () => albums.filter(matchesRequestedClassAndSection),
    [albums, requestedClassUuid, requestedSectionUuid],
  );
  const filteredSchoolAlbums = useMemo(
    () => schoolAlbums.filter(matchesRequestedClassAndSection),
    [schoolAlbums, requestedClassUuid, requestedSectionUuid],
  );
  const publishedCount = useMemo(
    () => filteredAlbums.filter((album) => album.is_published).length,
    [filteredAlbums],
  );
  const totalMediaCount = useMemo(
    () => filteredAlbums.reduce((sum, album) => sum + (album.media_count || 0), 0),
    [filteredAlbums],
  );

  const refresh = async () => {
    if (!sessionYear) return;
    const [mine, school] = await Promise.all([
      getTeacherAlbums(sessionYear),
      getPortalAlbums({ pageSize: 100, sessionYear }),
    ]);
    setAlbums(mine);
    setSchoolAlbums(school.data || []);
  };

  useEffect(() => {
    getTeacherClasses()
      .then((result) => setScopes(result.data || []))
      .catch((err) => setError(err?.response?.data?.detail || "Could not load your assigned classes."));
  }, []);

  useEffect(() => {
    setClassUuid((currentClassUuid) => {
      if (classes.some((item) => item.class_uuid === requestedClassUuid))
        return requestedClassUuid;
      if (classes.some((item) => item.class_uuid === currentClassUuid))
        return currentClassUuid;
      return classes[0]?.class_uuid || "";
    });
  }, [sessionYear, classes, requestedClassUuid]);

  useEffect(() => {
    setSectionUuid((currentSectionUuid) => {
      if (sections.some((item) => item.section_uuid === requestedSectionUuid))
        return requestedSectionUuid;
      if (sections.some((item) => item.section_uuid === currentSectionUuid))
        return currentSectionUuid;
      return sections[0]?.section_uuid || "";
    });
  }, [classUuid, sections, requestedSectionUuid]);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch((err) => setError(err?.response?.data?.detail || "Could not load gallery."))
      .finally(() => setLoading(false));
  }, [sessionYear]);

  const closeModal = (force = false) => {
    if (saving && !force) return;
    setModal(false);
    setEditing(null);
    setForm(initialForm);
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(initialForm);
    setModal(true);
  };

  const save = async (publish) => {
    if (!classUuid || !sectionUuid) return setError("No class and section are assigned for the selected session.");
    if (publish && (!form.title.trim() || !form.albumDate))
      return setError("Title and start date are required to publish.");
    if (!editing && publish && !form.files.length)
      return setError("Upload at least one photo or video before publishing.");

    setSaving(true);
    setError("");

    try {
      if (editing) {
        await updateTeacherAlbum(editing.album_uuid, {
          title: form.title || null,
          album_date: form.albumDate || null,
          end_date: form.endDate || null,
          description: form.description,
          session_year: sessionYear,
          class_audiences: [{ class_uuid: classUuid, section_uuids: [sectionUuid] }],
        });
        if (form.files.length) await addTeacherAlbumMedia(editing.album_uuid, form.files);
        if (publish && !editing.is_published) await publishTeacherAlbum(editing.album_uuid);
      } else {
        const data = new FormData();
        if (form.title) data.append("title", form.title);
        if (form.albumDate) data.append("album_date", form.albumDate);
        if (form.endDate) data.append("end_date", form.endDate);
        data.append("session_year", sessionYear);
        data.append("class_audiences", JSON.stringify([{ class_uuid: classUuid, section_uuids: [sectionUuid] }]));
        data.append("audience", "TEACHER");
        data.append("description", form.description);
        data.append("is_published", String(publish));
        form.files.forEach((file) => data.append("files", file));
        await createTeacherAlbum(data);
      }
      closeModal(true);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not save gallery.");
    } finally {
      setSaving(false);
    }
  };

  const openPreview = async (album, school = false) => {
    setOpenMenu(null);
    try {
      setPreview(await (school ? getPortalAlbumDetail(album.album_uuid) : getTeacherAlbumDetail(album.album_uuid)));
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not open gallery.");
    }
  };

  const edit = (album) => {
    setOpenMenu(null);
    const audience = album.class_audiences?.[0] || {};
    setClassUuid(audience.class_uuid || "");
    setSectionUuid(audience.section_uuids?.[0] || "");
    setForm({
      title: album.title || "",
      albumDate: album.album_date || "",
      endDate: album.end_date || "",
      description: album.description || "",
      files: [],
    });
    setEditing(album);
    setModal(true);
  };

  const handlePublish = async (album) => {
    setOpenMenu(null);
    try {
      await publishTeacherAlbum(album.album_uuid);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not publish gallery.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fafc] px-4 py-7 sm:px-6 lg:px-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[13px] font-medium uppercase tracking-[0.08em] text-[#31597e]">
            Teacher Portal
          </p>

          <h1 className="text-[34px] font-medium leading-tight tracking-[-0.025em] text-[#06182d]">Gallery</h1>

          <p className="mt-1 text-[16px] text-[#4c6681]">
            Upload photos and videos for your assigned class and section.
          </p>
        </div>

        <button
          type="button"
          disabled={!sessionScopes.length}
          onClick={openCreateModal}
          className="flex h-[38px] items-center justify-center gap-2 self-start rounded-[10px] bg-[#0b3c75] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#083362] disabled:opacity-50 sm:self-auto"
        >
          <Plus size={18} strokeWidth={2} />
          New Gallery
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="My Albums" value={filteredAlbums.length} icon={<Images size={22} />} />
        <StatCard title="Published" value={publishedCount} icon={<Images size={22} />} />
        <StatCard title="Media Files" value={totalMediaCount} icon={<Images size={22} />} />
      </div>

      {/* =====================================================
          SESSION + ASSIGNED CLASSES
      ====================================================== */}
      <div className="mb-7 rounded-[15px] border border-[#dfe7ed] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-semibold text-[#0a1d32]">My Classes &amp; Sections</h2>
          <p className="text-[13px] text-[#5a7088]">
            Academic session: <span className="font-semibold text-[#0a1d32]">{sessionYear}</span> · change it from
            the top bar
          </p>
        </div>

        {assignedClasses.length === 0 ? (
          <p className="mt-3 text-[14px] text-[#62778d]">No classes or sections are assigned for this session.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {assignedClasses.map((item) => (
              <span
                key={`${item.classUuid}-${item.sectionUuid}`}
                className="rounded-[8px] border border-[#d8e1e8] bg-white px-[11px] py-[4px] text-[11px] font-semibold text-[#0b233c]"
              >
                {item.className} · Section {item.sectionName}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          MY GALLERY
      ====================================================== */}
      <SectionHeading title="My Gallery" />
      {loading ? (
        <LoadingState />
      ) : (
        <AlbumGrid
          albums={filteredAlbums}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onView={(album) => openPreview(album, false)}
          onEdit={edit}
          onPublish={handlePublish}
        />
      )}

      {/* =====================================================
          SCHOOL GALLERY
      ====================================================== */}
      <div className="mt-9">
        <SectionHeading title="School Gallery" />
        <AlbumGrid albums={filteredSchoolAlbums} onView={(album) => openPreview(album, true)} />
      </div>

      {/* =====================================================
          UPLOAD / EDIT MODAL
      ====================================================== */}
      {modal && (
        <GalleryModal
          isEditing={Boolean(editing)}
          form={form}
          setForm={setForm}
          classUuid={classUuid}
          setClassUuid={setClassUuid}
          sectionUuid={sectionUuid}
          setSectionUuid={setSectionUuid}
          classes={classes}
          sections={sections}
          saving={saving}
          onClose={() => closeModal()}
          onSaveDraft={() => save(false)}
          onPublish={() => save(true)}
        />
      )}

      {/* =====================================================
          PREVIEW MODAL
      ====================================================== */}
      {preview && <GalleryPreviewModal album={preview} onClose={() => setPreview(null)} />}
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
        <p className="mt-[1px] text-[20px] font-medium leading-none text-[#07182d]">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({ title }) {
  return <h2 className="mb-3 text-[21px] font-semibold tracking-[-0.02em] text-[#0a1d32]">{title}</h2>;
}

/* ============================================================
   ALBUM GRID / CARD
============================================================ */

function AlbumGrid({ albums, openMenu, setOpenMenu, onView, onEdit, onPublish }) {
  if (!albums.length) {
    return (
      <div className="rounded-[15px] border border-dashed border-[#cfdbe4] bg-white px-5 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9eef2] text-[#0a3567]">
          <ImageIcon size={25} />
        </div>
        <p className="mt-4 text-[15px] text-[#62778d]">No gallery albums for this session.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {albums.map((album) => (
        <AlbumCard
          key={album.album_uuid}
          album={album}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onView={() => onView(album)}
          onEdit={onEdit ? () => onEdit(album) : null}
          onPublish={onPublish ? () => onPublish(album) : null}
        />
      ))}
    </div>
  );
}

function AlbumCard({ album, openMenu, setOpenMenu, onView, onEdit, onPublish }) {
  const hasMenu = Boolean(setOpenMenu) && (onEdit || onPublish);
  const isVideo = String(album.cover_media?.media_type || "").toUpperCase() === "VIDEO";

  return (
    <div className="overflow-visible rounded-[15px] border border-[#dce5eb] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.09)]">
      {/* Cover */}
      <div className="relative h-[220px] overflow-hidden rounded-t-[15px] bg-[#e9eef2]">
        {album.cover_media?.file_url ? (
          isVideo ? (
            <video src={album.cover_media.file_url} className="h-full w-full object-cover" muted />
          ) : (
            <img src={album.cover_media.file_url} alt={album.title} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-[#8292a2]">
            <Images size={40} />
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
          <Images size={13} />
          {album.media_count ?? 0}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-[18px] pb-[18px] pt-[19px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-medium text-[#07182d]">{album.title || "Untitled draft"}</h3>
            <p className="mt-[2px] text-[13px] text-[#4e6984]">
              {album.album_date || "Date pending"} · {album.media_count ?? 0} items
            </p>
          </div>

          {hasMenu ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === album.album_uuid ? null : album.album_uuid)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#10253b] hover:bg-[#edf2f5]"
              >
                <MoreHorizontal size={20} />
              </button>

              {openMenu === album.album_uuid && (
                <div className="absolute right-0 top-8 z-30 w-[170px] overflow-hidden rounded-[9px] border border-[#dce4ea] bg-white py-1 shadow-xl">
                  <MenuButton icon={<Eye size={15} />} label="View Gallery" onClick={onView} />
                  {onEdit && <MenuButton icon={<Edit3 size={15} />} label="Edit Gallery" onClick={onEdit} />}
                  {onPublish && !album.is_published && (
                    <MenuButton icon={<EyeOff size={15} />} label="Publish" onClick={onPublish} />
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onView}
              className="shrink-0 rounded-[8px] border border-[#d7e1e8] px-3 py-[6px] text-[12px] font-semibold text-[#0c427d] hover:bg-[#eef4f9]"
            >
              View
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="mt-[14px] flex flex-wrap gap-2">
          {album.is_published ? (
            <span className="rounded-[8px] bg-[#08366e] px-[11px] py-[4px] text-[11px] font-semibold text-white shadow-sm">
              Published
            </span>
          ) : (
            <span className="rounded-[8px] bg-amber-100 px-[11px] py-[4px] text-[11px] font-semibold text-amber-900">
              Draft
            </span>
          )}
        </div>

        {album.description && (
          <p className="mt-[14px] line-clamp-2 text-[15px] leading-[1.45] text-[#536d88]">{album.description}</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MENU BUTTON
============================================================ */

function MenuButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#20374f] transition hover:bg-[#f1f5f8]"
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================================================
   UPLOAD / EDIT MODAL
============================================================ */

function GalleryModal({
  isEditing,
  form,
  setForm,
  classUuid,
  setClassUuid,
  sectionUuid,
  setSectionUuid,
  classes,
  sections,
  saving,
  onClose,
  onSaveDraft,
  onPublish,
}) {
  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleFiles = (e) => {
    setForm((prev) => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files || [])] }));
    e.target.value = "";
  };

  const removeFile = (index) =>
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-none bg-[#f7fafc] shadow-2xl sm:max-w-[720px] sm:rounded-[10px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 pb-3 pt-6">
          <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#0a1d32]">
            {isEditing ? "Update Gallery" : "Upload Gallery"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#526477] hover:bg-[#e9eef2] disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-7 pb-6 pt-1">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <FormField label="Class">
              <select value={classUuid} onChange={(e) => setClassUuid(e.target.value)} className={inputClass}>
                {classes.map((row) => (
                  <option key={row.class_uuid} value={row.class_uuid}>
                    {row.class_name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Section">
              <select value={sectionUuid} onChange={(e) => setSectionUuid(e.target.value)} className={inputClass}>
                {sections.map((row) => (
                  <option key={row.section_uuid} value={row.section_uuid}>
                    {row.section_name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Sports Day 2026"
                  className={inputClass}
                  autoFocus
                />
              </FormField>
            </div>

            {/* Start Date */}
            <FormField label="Start Date">
              <div className="relative">
                <input
                  type="date"
                  value={form.albumDate}
                  onChange={(e) => updateField("albumDate", e.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#60758a]"
                />
              </div>
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                value={form.endDate}
                min={form.albumDate || undefined}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={inputClass}
              />
            </FormField>

            {/* Description */}
            <div className="sm:col-span-2">
              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className={`${inputClass} min-h-[67px] resize-y`}
                />
              </FormField>
            </div>

            {/* Upload */}
            <div className="sm:col-span-2">
              <FormField label="Upload Photos / Videos">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFiles}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />

                  <div className="flex h-[42px] items-center rounded-[9px] border border-[#d7e1e8] bg-white px-3 text-[14px] text-[#172c43] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    <span className="rounded-md bg-[#edf2f5] px-2 py-1 font-medium">Choose Files</span>

                    <span className="ml-2 truncate text-[#4f6479]">
                      {form.files.length > 0
                        ? `${form.files.length} file${form.files.length > 1 ? "s" : ""} selected`
                        : "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[13px] text-[#60758a]">
                  <Upload size={14} />
                  Photos/videos up to 100 MB each. jpg, png, webp, gif, mp4, webm, mov.
                </div>
              </FormField>
            </div>
          </div>

          {/* Selected Files */}
          {form.files.length > 0 && (
            <div className="mt-4 rounded-[10px] border border-[#dce5eb] bg-white p-3">
              <p className="mb-2 text-[13px] font-semibold text-[#213951]">Selected Files</p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {form.files.map((file, index) => (
                  <SelectedFile key={`${file.name}-${index}`} file={file} onRemove={() => removeFile(index)} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-[40px] rounded-[9px] border border-[#d7e1e8] bg-white px-5 text-[14px] font-medium text-[#0d2137] shadow-sm transition hover:bg-[#f1f5f8] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onSaveDraft}
              className="h-[40px] rounded-[9px] border border-[#0c427d] px-5 text-[14px] font-semibold text-[#0c427d] disabled:opacity-60"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onPublish}
              className="flex h-[40px] items-center gap-2 rounded-[9px] bg-[#0c427d] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#093565] disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
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
      <span className="mb-[5px] block text-[14px] font-medium text-[#52677d]">{label}</span>
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
  const [preview, setPreview] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    // Create the object URL inside the effect. Creating it in useMemo causes
    // React Strict Mode's development cleanup to revoke the URL still in use.
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPreviewFailed(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="group relative overflow-hidden rounded-[8px] border border-[#dce4ea] bg-[#f3f6f8]">
      <div className="aspect-[1.5/1]">
        {preview && !previewFailed ? (
          isVideo ? (
            <video src={preview} className="h-full w-full object-cover" muted onError={() => setPreviewFailed(true)} />
          ) : (
            <img
              src={preview}
              alt={file.name}
              className="h-full w-full object-cover"
              onError={() => setPreviewFailed(true)}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-[#60758a]">
            {isVideo ? <Video size={22} /> : <ImageIcon size={22} />}
          </div>
        )}
      </div>

      <div className="truncate px-2 py-1.5 text-[10px] text-[#4f6479]">{file.name}</div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100"
      >
        <X size={13} />
      </button>

      {isVideo && (
        <div className="absolute left-1 top-1 rounded-md bg-black/60 p-1 text-white">
          <Video size={11} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PREVIEW MODAL
============================================================ */

function GalleryPreviewModal({ album, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[94vh] w-full flex-col overflow-hidden bg-[#f7fafc] sm:max-w-[1150px] sm:rounded-[11px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-[21px] font-semibold text-[#0a1d32]">{album.title}</h2>
            <p className="mt-1 text-[13px] text-[#5a7088]">
              {album.album_date} · {(album.media || []).length} media files
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

        {/* Media */}
        <div className="overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(album.media || []).map((media) => (
              <div
                key={media.media_uuid}
                className="overflow-hidden rounded-[9px] border border-[#dce5eb] bg-[#e9eef2]"
              >
                {media.media_type === "VIDEO" ? (
                  <video src={media.file_url} controls className="aspect-[1.7/1] w-full object-cover" />
                ) : (
                  <img
                    src={media.file_url}
                    alt={media.title || album.title}
                    className="aspect-[1.7/1] w-full object-cover"
                  />
                )}
                {(media.title || media.description) && (
                  <div className="p-2 text-[13px] text-[#213951]">
                    {media.title && <strong className="block">{media.title}</strong>}
                    {media.description && <p className="text-[#5a7088]">{media.description}</p>}
                  </div>
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
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-[15px] border border-[#dfe7ed] bg-white px-5 py-14 text-[15px] text-[#566d85]">
      <Loader2 size={18} className="animate-spin" />
      Loading gallery...
    </div>
  );
}
