import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, LogOut, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin, saveProject, deleteProject } from "@/lib/projects.functions";
import {
  saveCertificate,
  deleteCertificate,
} from "@/lib/certificates.functions";
import {
  emptyCertificate,
  type Certificate,
  type CertificateInput,
} from "@/lib/certificates";
import { projectsQuery, certificatesQuery, skillGroupsQuery, experiencesQuery } from "@/lib/queries";
import { emptySkillGroup, type SkillGroup, type SkillGroupInput } from "@/lib/skills";
import { saveSkillGroup, deleteSkillGroup } from "@/lib/skills.functions";
import {
  EMPLOYMENT_TYPES,
  emptyExperience,
  experiencePeriod,
  type Experience,
  type ExperienceInput,
} from "@/lib/experiences";
import { saveExperience, deleteExperience } from "@/lib/experiences.functions";
import {
  DOWNLOAD_PLATFORMS,
  GITHUB_VISIBILITIES,
  PROJECT_CATEGORIES,
  SCREENSHOT_BUCKET,
  emptyProject,
  slugify,
  toProjectInput,
  type GithubVisibility,
  type Project,
  type ProjectInput,
} from "@/lib/projects";

/** Move an item within a list so the admin controls display order. */
function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item as T);
  return next;
}

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — manage projects" },
      { name: "description", content: "Private dashboard to add and edit portfolio projects." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — manage projects" },
      { property: "og:description", content: "Private portfolio project dashboard." },
    ],
  }),
  component: AdminPage,
});

const inputClass =
  "mt-1.5 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery(projectsQuery);
  const { data: certificates } = useQuery(certificatesQuery);
  const { data: skillGroups } = useQuery(skillGroupsQuery);
  const { data: experiences } = useQuery(experiencesQuery);
  const { data: adminInfo, isLoading: checkingRole } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkIsAdmin(),
  });

  const [draft, setDraft] = useState<ProjectInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingDesigns, setUploadingDesigns] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [certDraft, setCertDraft] = useState<CertificateInput | null>(null);
  const [certSaving, setCertSaving] = useState(false);
  const [certUploading, setCertUploading] = useState(false);
  const [skillDraft, setSkillDraft] = useState<SkillGroupInput | null>(null);
  const [skillSaving, setSkillSaving] = useState(false);
  const [expDraft, setExpDraft] = useState<ExperienceInput | null>(null);
  const [expSaving, setExpSaving] = useState(false);

  async function handleExpSave() {
    if (!expDraft) return;
    if (!expDraft.role.trim()) {
      toast.error("Role title is required");
      return;
    }
    setExpSaving(true);
    try {
      await saveExperience({
        data: {
          experience: {
            ...expDraft,
            role: expDraft.role.trim(),
            highlights: expDraft.highlights.map((h) => h.trim()).filter(Boolean),
            tech: expDraft.tech.map((t) => t.trim()).filter(Boolean),
          } as Experience,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Experience saved");
      setExpDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save experience");
    } finally {
      setExpSaving(false);
    }
  }

  async function handleExpDelete(id: string, role: string) {
    if (!window.confirm(`Delete “${role}”?`)) return;
    try {
      await deleteExperience({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Experience deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete experience");
    }
  }


  async function handleSkillSave() {
    if (!skillDraft) return;
    if (!skillDraft.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSkillSaving(true);
    try {
      await saveSkillGroup({
        data: {
          group: {
            ...skillDraft,
            name: skillDraft.name.trim(),
            items: skillDraft.items.map((i) => i.trim()).filter(Boolean),
          } as SkillGroup,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["skill-groups"] });
      toast.success("Skill category saved");
      setSkillDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save skill category");
    } finally {
      setSkillSaving(false);
    }
  }

  async function handleSkillDelete(id: string, name: string) {
    if (!window.confirm(`Delete “${name}” and its tools?`)) return;
    try {
      await deleteSkillGroup({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["skill-groups"] });
      toast.success("Skill category deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete skill category");
    }
  }



  async function handleCertUpload(files: FileList | null) {
    if (!files || !certDraft) return;
    setCertUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const path = `certificates/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage
        .from(SCREENSHOT_BUCKET)
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        continue;
      }
      uploaded.push(path);
    }
    setCertUploading(false);
    if (uploaded.length > 0) {
      setCertDraft((current) =>
        current ? { ...current, images: [...current.images, ...uploaded] } : current,
      );
      toast.success(`${uploaded.length} image(s) uploaded`);
    }
  }

  async function handleCertSave() {
    if (!certDraft) return;
    if (!certDraft.title) {
      toast.error("Certificate title is required");
      return;
    }
    setCertSaving(true);
    try {
      await saveCertificate({ data: { certificate: certDraft as Certificate } });
      await queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate saved");
      setCertDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save certificate");
    } finally {
      setCertSaving(false);
    }
  }

  async function handleCertDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”?`)) return;
    try {
      await deleteCertificate({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete certificate");
    }
  }

  useEffect(() => {
    if (draft && !draft.id && !draft.slug && draft.title) {
      setDraft((current) => (current ? { ...current, slug: slugify(current.title) } : current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.title]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function uploadFiles(files: FileList, folder: string) {
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const base = draft?.slug || "draft";
      const path = `${base}/${folder}${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from(SCREENSHOT_BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });
      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        continue;
      }
      uploaded.push(path);
    }
    return uploaded;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !draft) return;
    setUploading(true);
    const uploaded = await uploadFiles(files, "");
    setUploading(false);
    if (uploaded.length > 0) {
      setDraft((current) =>
        current ? { ...current, screenshots: [...current.screenshots, ...uploaded] } : current,
      );
      toast.success(`${uploaded.length} screenshot(s) uploaded`);
    }
  }

  async function handleDesignUpload(files: FileList | null) {
    if (!files || !draft) return;
    setUploadingDesigns(true);
    const uploaded = await uploadFiles(files, "designs/");
    setUploadingDesigns(false);
    if (uploaded.length > 0) {
      setDraft((current) =>
        current ? { ...current, designs: [...current.designs, ...uploaded] } : current,
      );
      toast.success(`${uploaded.length} design page(s) uploaded`);
    }
  }

  async function handleDocUpload(files: FileList | null) {
    if (!files || !draft) return;
    setUploadingDoc(true);
    const uploaded = await uploadFiles(files, "docs/");
    setUploadingDoc(false);
    if (uploaded[0]) {
      setDraft((current) => (current ? { ...current, doc_path: uploaded[0]! } : current));
      toast.success("Resource uploaded");
    }
  }


  async function handleSave() {
    if (!draft) return;
    if (!draft.title || !draft.slug) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      await saveProject({ data: { project: draft as Project } });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project saved");
      setDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This can't be undone.`)) return;
    try {
      await deleteProject({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete project");
    }
  }

  if (checkingRole) {
    return <p className="mx-auto max-w-5xl px-5 py-24 font-mono text-sm text-muted-foreground">Checking access…</p>;
  }

  if (!adminInfo?.isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="font-mono text-xl font-bold">Not authorised</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is signed in but has no admin role, so it can&apos;t manage projects.
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">user id: {adminInfo?.userId}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSignOut}
            className="rounded-sm border border-border px-4 py-2 text-sm hover:border-primary"
          >
            Sign out
          </button>
          <Link to="/" className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // admin
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Manage projects</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDraft({ ...emptyProject, sort_order: (projects?.length ?? 0) + 1 })}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New project
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:border-primary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {draft ? (
        <section className="mt-8 rounded-md border border-primary/40 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm text-accent">
              {draft.id ? "edit project" : "new project"}
            </h2>
            <button onClick={() => setDraft(null)} aria-label="Close editor">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="title">
              <input
                className={inputClass}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field label="slug (url)">
              <input
                className={inputClass}
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
              />
            </Field>
            <Field label="category">
              <select
                className={inputClass}
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                {PROJECT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="period (e.g. 2024 – 2025)">
              <input
                className={inputClass}
                value={draft.period}
                onChange={(e) => setDraft({ ...draft, period: e.target.value })}
              />
            </Field>
            <Field label="role">
              <input
                className={inputClass}
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              />
            </Field>
            <Field label="sort order">
              <input
                type="number"
                className={inputClass}
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              />
            </Field>
            <Field label="live url">
              <input
                className={inputClass}
                value={draft.live_url ?? ""}
                onChange={(e) => setDraft({ ...draft, live_url: e.target.value })}
              />
            </Field>
            <Field label="github repository">
              <select
                className={inputClass}
                value={draft.github_visibility}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    github_visibility: e.target.value as GithubVisibility,
                    github_url: e.target.value === "public" ? draft.github_url : null,
                  })
                }
              >
                {GITHUB_VISIBILITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            {draft.github_visibility === "public" ? (
              <Field label="github url">
                <input
                  className={inputClass}
                  value={draft.github_url ?? ""}
                  onChange={(e) => setDraft({ ...draft, github_url: e.target.value })}
                />
              </Field>
            ) : null}
            <Field label="video url (Drive / YouTube / mp4 — optional)">
              <input
                className={inputClass}
                value={draft.video_url ?? ""}
                onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
              />
            </Field>
            <Field label="documentation / slides link (Drive PDF, Google Slides — optional)">
              <input
                className={inputClass}
                value={draft.doc_url ?? ""}
                onChange={(e) => setDraft({ ...draft, doc_url: e.target.value })}
              />
            </Field>
          </div>


          <div className="mt-4 space-y-4">
            <Field label="summary (card text)">
              <textarea
                rows={2}
                className={inputClass}
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              />
            </Field>
            <Field label="description (full page, blank line = new paragraph)">
              <textarea
                rows={6}
                className={inputClass}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            <Field label="tech stack (comma separated)">
              <input
                className={inputClass}
                value={draft.tech.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    tech: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="highlights (one per line)">
              <textarea
                rows={4}
                className={inputClass}
                value={draft.highlights.join("\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    highlights: e.target.value.split("\n").map((v) => v.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
          </div>

          <div className="mt-5">
            <span className="font-mono text-xs text-muted-foreground">screenshots</span>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              order below is the order shown on the project page
            </p>
            <div className="mt-2 space-y-1.5">
              {draft.screenshots.map((path, index) => (
                <div
                  key={path}
                  className="flex items-center gap-2 rounded-sm bg-secondary px-2 py-1 font-mono text-[11px]"
                >
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="flex-1 truncate">{path.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, screenshots: move(draft.screenshots, index, -1) })
                    }
                    aria-label="Move screenshot up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, screenshots: move(draft.screenshots, index, 1) })
                    }
                    aria-label="Move screenshot down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        screenshots: draft.screenshots.filter((p) => p !== path),
                      })
                    }
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:border-primary">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload images"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          </div>

          <div className="mt-5">
            <span className="font-mono text-xs text-muted-foreground">
              design pages (shown as a zoomable board)
            </span>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              order below is the left-to-right order on the design board
            </p>
            <div className="mt-2 space-y-1.5">
              {draft.designs.map((path, index) => (
                <div
                  key={path}
                  className="flex items-center gap-2 rounded-sm bg-secondary px-2 py-1 font-mono text-[11px]"
                >
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="flex-1 truncate">{path.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, designs: move(draft.designs, index, -1) })}
                    aria-label="Move design page up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, designs: move(draft.designs, index, 1) })}
                    aria-label="Move design page down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, designs: draft.designs.filter((p) => p !== path) })
                    }
                    aria-label="Remove design page"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:border-primary">
              <Upload className="h-4 w-4" />
              {uploadingDesigns ? "Uploading…" : "Upload design pages"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleDesignUpload(e.target.files)}
              />
            </label>
          </div>

          <div className="mt-5">
            <span className="font-mono text-xs text-muted-foreground">
              documentation or slide deck file (PDF, PPT, PPTX, ODP, KEY — optional)
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {draft.doc_path ? (
                <span className="flex items-center gap-2 rounded-sm bg-secondary px-2 py-1 font-mono text-[11px]">
                  {draft.doc_path.split("/").pop()}
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, doc_path: null })}
                    aria-label="Remove documentation file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:border-primary">
                <Upload className="h-4 w-4" />
                {uploadingDoc ? "Uploading…" : "Upload PDF / slides"}
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.odp,.key,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  onChange={(e) => handleDocUpload(e.target.files)}
                />
              </label>
            </div>
          </div>



          <div className="mt-5">
            <span className="font-mono text-xs text-muted-foreground">
              app download links (optional — shown on the project page)
            </span>
            <div className="mt-2 space-y-2">
              {draft.downloads.map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[130px_1fr_1fr_auto]">
                  <select
                    className="rounded-sm border border-border bg-card px-2 py-2 text-sm outline-none focus:border-primary"
                    value={item.platform}
                    onChange={(e) => {
                      const next = [...draft.downloads];
                      next[index] = { ...item, platform: e.target.value };
                      setDraft({ ...draft, downloads: next });
                    }}
                  >
                    {DOWNLOAD_PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="button label (e.g. Download APK)"
                    value={item.label}
                    onChange={(e) => {
                      const next = [...draft.downloads];
                      next[index] = { ...item, label: e.target.value };
                      setDraft({ ...draft, downloads: next });
                    }}
                  />
                  <input
                    className="rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="https://…"
                    value={item.url}
                    onChange={(e) => {
                      const next = [...draft.downloads];
                      next[index] = { ...item, url: e.target.value };
                      setDraft({ ...draft, downloads: next });
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 text-sm hover:border-destructive"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        downloads: draft.downloads.filter((_, i) => i !== index),
                      })
                    }
                    aria-label="Remove download link"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setDraft({
                  ...draft,
                  downloads: [...draft.downloads, { platform: "Android", label: "", url: "" }],
                })
              }
              className="mt-3 inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:border-primary"
            >
              <Plus className="h-4 w-4" /> Add download link
            </button>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
            />
            Feature on the home page
          </label>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save project"}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded-sm border border-border px-4 py-2 text-sm hover:border-primary"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-10 space-y-3">
        {isLoading ? (
          <p className="font-mono text-sm text-muted-foreground">Loading…</p>
        ) : (
          (projects ?? []).map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{project.title}</h3>
                  {project.featured ? (
                    <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                      featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  /projects/{project.slug} · {project.category}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDraft(toProjectInput(project))}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id, project.title)}
                  className="rounded-sm border border-destructive/50 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // work experience
          </h2>
          <button
            onClick={() =>
              setExpDraft({ ...emptyExperience, sort_order: (experiences?.length ?? 0) + 1 })
            }
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-primary"
          >
            <Plus className="h-4 w-4" /> New experience
          </button>
        </div>

        {expDraft ? (
          <div className="mt-5 rounded-md border border-primary/40 bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm text-accent">
                {expDraft.id ? "edit experience" : "new experience"}
              </h3>
              <button onClick={() => setExpDraft(null)} aria-label="Close experience editor">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="role / job title">
                <input
                  className={inputClass}
                  value={expDraft.role}
                  onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })}
                />
              </Field>
              <Field label="company">
                <input
                  className={inputClass}
                  value={expDraft.company}
                  onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                />
              </Field>
              <Field label="location (e.g. Chennai, Remote)">
                <input
                  className={inputClass}
                  value={expDraft.location}
                  onChange={(e) => setExpDraft({ ...expDraft, location: e.target.value })}
                />
              </Field>
              <Field label="employment type">
                <select
                  className={inputClass}
                  value={expDraft.employment_type}
                  onChange={(e) => setExpDraft({ ...expDraft, employment_type: e.target.value })}
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="start date (e.g. Jan 2026)">
                <input
                  className={inputClass}
                  value={expDraft.start_date}
                  onChange={(e) => setExpDraft({ ...expDraft, start_date: e.target.value })}
                />
              </Field>
              <Field label="end date (e.g. Aug 2026)">
                <input
                  className={inputClass}
                  disabled={expDraft.is_current}
                  placeholder={expDraft.is_current ? "Present" : ""}
                  value={expDraft.end_date}
                  onChange={(e) => setExpDraft({ ...expDraft, end_date: e.target.value })}
                />
              </Field>
              <Field label="company url (optional)">
                <input
                  className={inputClass}
                  value={expDraft.company_url ?? ""}
                  onChange={(e) => setExpDraft({ ...expDraft, company_url: e.target.value })}
                />
              </Field>
              <Field label="sort order">
                <input
                  type="number"
                  className={inputClass}
                  value={expDraft.sort_order}
                  onChange={(e) => setExpDraft({ ...expDraft, sort_order: Number(e.target.value) })}
                />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={expDraft.is_current}
                onChange={(e) => setExpDraft({ ...expDraft, is_current: e.target.checked })}
              />
              I currently work here
            </label>

            <div className="mt-4">
              <Field label="summary">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={expDraft.summary}
                  onChange={(e) => setExpDraft({ ...expDraft, summary: e.target.value })}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="highlights (one per line)">
                <textarea
                  rows={4}
                  className={inputClass}
                  value={expDraft.highlights.join("\n")}
                  onChange={(e) =>
                    setExpDraft({ ...expDraft, highlights: e.target.value.split("\n") })
                  }
                />
              </Field>
              <Field label="tech used (comma separated)">
                <textarea
                  rows={4}
                  className={inputClass}
                  value={expDraft.tech.join(", ")}
                  onChange={(e) =>
                    setExpDraft({ ...expDraft, tech: e.target.value.split(",") })
                  }
                />
              </Field>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleExpSave}
                disabled={expSaving}
                className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {expSaving ? "Saving…" : "Save experience"}
              </button>
              <button
                onClick={() => setExpDraft(null)}
                className="rounded-sm border border-border px-4 py-2 text-sm hover:border-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {(experiences ?? []).map((experience) => (
            <div
              key={experience.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
            >
              <div>
                <h3 className="text-sm font-semibold">
                  {experience.role}
                  {experience.company ? ` @ ${experience.company}` : ""}
                </h3>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {[experiencePeriod(experience), experience.employment_type]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpDraft({ ...experience })}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleExpDelete(experience.id, experience.role)}
                  className="rounded-sm border border-destructive/50 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${experience.role}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {(experiences ?? []).length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">
              No work experience added yet — add roles here when you start.
            </p>
          ) : null}
        </div>
      </section>


      <section className="mt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // certificates
          </h2>
          <button
            onClick={() =>
              setCertDraft({
                ...emptyCertificate,
                sort_order: (certificates?.length ?? 0) + 1,
              })
            }
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-primary"
          >
            <Plus className="h-4 w-4" /> New certificate
          </button>
        </div>

        {certDraft ? (
          <div className="mt-5 rounded-md border border-primary/40 bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm text-accent">
                {certDraft.id ? "edit certificate" : "new certificate"}
              </h3>
              <button onClick={() => setCertDraft(null)} aria-label="Close certificate editor">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="title">
                <input
                  className={inputClass}
                  value={certDraft.title}
                  onChange={(e) => setCertDraft({ ...certDraft, title: e.target.value })}
                />
              </Field>
              <Field label="issuer (e.g. NPTEL, Udemy)">
                <input
                  className={inputClass}
                  value={certDraft.issuer}
                  onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })}
                />
              </Field>
              <Field label="issued on (e.g. Mar 2025)">
                <input
                  className={inputClass}
                  value={certDraft.issued_on}
                  onChange={(e) => setCertDraft({ ...certDraft, issued_on: e.target.value })}
                />
              </Field>
              <Field label="credential url (optional)">
                <input
                  className={inputClass}
                  value={certDraft.credential_url ?? ""}
                  onChange={(e) => setCertDraft({ ...certDraft, credential_url: e.target.value })}
                />
              </Field>
              <Field label="sort order">
                <input
                  type="number"
                  className={inputClass}
                  value={certDraft.sort_order}
                  onChange={(e) =>
                    setCertDraft({ ...certDraft, sort_order: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            <div className="mt-5">
              <span className="font-mono text-xs text-muted-foreground">certificate images</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {certDraft.images.map((path) => (
                  <span
                    key={path}
                    className="flex items-center gap-2 rounded-sm bg-secondary px-2 py-1 font-mono text-[11px]"
                  >
                    {path.split("/").pop()}
                    <button
                      type="button"
                      onClick={() =>
                        setCertDraft({
                          ...certDraft,
                          images: certDraft.images.filter((p) => p !== path),
                        })
                      }
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:border-primary">
                <Upload className="h-4 w-4" />
                {certUploading ? "Uploading…" : "Upload images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleCertUpload(e.target.files)}
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleCertSave}
                disabled={certSaving}
                className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {certSaving ? "Saving…" : "Save certificate"}
              </button>
              <button
                onClick={() => setCertDraft(null)}
                className="rounded-sm border border-border px-4 py-2 text-sm hover:border-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {(certificates ?? []).map((certificate) => (
            <div
              key={certificate.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
            >
              <div>
                <h3 className="text-sm font-semibold">{certificate.title}</h3>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {[certificate.issuer, certificate.issued_on].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCertDraft({
                      ...certificate,
                      images: certificate.image_paths,
                    })
                  }
                  className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleCertDelete(certificate.id, certificate.title)}
                  className="rounded-sm border border-destructive/50 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${certificate.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {(certificates ?? []).length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">No certificates added yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // skills
          </h2>
          <button
            onClick={() =>
              setSkillDraft({
                ...emptySkillGroup,
                sort_order: (skillGroups?.length ?? 0) + 1,
              })
            }
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-primary"
          >
            <Plus className="h-4 w-4" /> New skill category
          </button>
        </div>

        {skillDraft ? (
          <div className="mt-5 rounded-md border border-primary/40 bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm text-accent">
                {skillDraft.id ? "edit skill category" : "new skill category"}
              </h3>
              <button onClick={() => setSkillDraft(null)} aria-label="Close skill editor">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="category name">
                <input
                  className={inputClass}
                  value={skillDraft.name}
                  onChange={(e) =>
                    setSkillDraft({ ...skillDraft, name: e.target.value })
                  }
                  placeholder="Frameworks & Libraries"
                />
              </Field>
              <Field label="sort order">
                <input
                  type="number"
                  className={inputClass}
                  value={skillDraft.sort_order}
                  onChange={(e) =>
                    setSkillDraft({ ...skillDraft, sort_order: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="tools / skills (one per line)">
                <textarea
                  rows={6}
                  className={inputClass}
                  value={skillDraft.items.join("\n")}
                  onChange={(e) =>
                    setSkillDraft({
                      ...skillDraft,
                      items: e.target.value.split("\n"),
                    })
                  }
                  placeholder={"React\nFlutter\nTensorFlow"}
                />
              </Field>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSkillSave}
                disabled={skillSaving}
                className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {skillSaving ? "Saving…" : "Save skill category"}
              </button>
              <button
                onClick={() => setSkillDraft(null)}
                className="rounded-sm border border-border px-4 py-2 text-sm hover:border-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {(skillGroups ?? []).map((group) => (
            <div
              key={group.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-border bg-card p-4"
            >
              <div>
                <h3 className="text-sm font-semibold">{group.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSkillDraft({ ...group })}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSkillDelete(group.id, group.name)}
                  className="rounded-sm border border-destructive/50 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${group.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {(skillGroups ?? []).length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">No skill categories yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

