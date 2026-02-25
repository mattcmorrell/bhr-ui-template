import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../components';

type FileStatus = 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
type FailedStage = 'upload' | 'processing';

interface UploadItem {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: FileStatus;
  uploadProgress: number;
  processingProgress: number;
  queueCycles: number;
  failedStage?: FailedStage;
  errorMessage?: string;
}

interface DisplayUploadItem extends UploadItem {
  uploadedAtLabel: string;
}

const STORAGE_KEY = 'new-account-onboarding-upload-state-v1';
const BASELINE_PROFILE_COMPLETION = 12;
const MAX_PROFILE_COMPLETION_ON_UPLOAD_STEP = 95;

function formatUploadedAtLabel(uploadedAt: string): string {
  const parsed = new Date(uploadedAt);
  if (Number.isNaN(parsed.getTime())) return uploadedAt;
  return parsed.toLocaleString();
}

function getFileCompletion(item: UploadItem): number {
  if (item.status === 'completed') return 1;
  if (item.status === 'processing') return 0.5 + (item.processingProgress / 100) * 0.5;
  if (item.status === 'uploaded') return 0.5;
  if (item.status === 'uploading') return (item.uploadProgress / 100) * 0.5;
  if (item.failedStage === 'processing') return 0.5 + (item.processingProgress / 100) * 0.5;
  return (item.uploadProgress / 100) * 0.5;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusMeta(
  status: FileStatus
): { label: string; colorClass: string; icon: 'arrows-rotate' | 'check-circle' | 'triangle-exclamation' | 'clock' } {
  if (status === 'uploading') {
    return {
      label: 'Uploading',
      colorClass: 'text-[var(--text-neutral-medium)]',
      icon: 'arrows-rotate',
    };
  }
  if (status === 'uploaded') {
    return {
      label: 'Uploaded',
      colorClass: 'text-[var(--text-neutral-medium)]',
      icon: 'clock',
    };
  }
  if (status === 'processing') {
    return {
      label: 'Processing',
      colorClass: 'text-[var(--color-primary-strong)]',
      icon: 'arrows-rotate',
    };
  }
  if (status === 'completed') {
    return {
      label: 'Ready',
      colorClass: 'text-[var(--color-primary-strong)]',
      icon: 'check-circle',
    };
  }
  return {
    label: 'Failed',
    colorClass: 'text-[#d62828]',
    icon: 'triangle-exclamation',
  };
}

export function NewAccountOnboarding() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as UploadItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadItems));
  }, [uploadItems]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!navigator.onLine) return;
      setUploadItems((current) => {
        const hasQueueWork = current.some(
          (item) => item.status === 'uploading' || item.status === 'uploaded' || item.status === 'processing'
        );
        if (!hasQueueWork) return current;

        const nextItems = current.map((item): UploadItem => {
          if (item.status === 'uploading') {
            const nextUploadProgress = Math.min(100, item.uploadProgress + Math.floor(Math.random() * 18 + 12));
            const shouldFailUpload = Math.random() < 0.03;
            if (shouldFailUpload) {
              return {
                ...item,
                status: 'failed',
                failedStage: 'upload',
                errorMessage: 'Upload failed. Please retry.',
              };
            }
            if (nextUploadProgress >= 100) {
              return {
                ...item,
                status: 'uploaded',
                uploadProgress: 100,
                queueCycles: 0,
                failedStage: undefined,
                errorMessage: undefined,
              };
            }
            return { ...item, uploadProgress: nextUploadProgress };
          }

          if (item.status === 'uploaded') {
            const nextQueueCycles = item.queueCycles + 1;
            if (nextQueueCycles >= 2) {
              return { ...item, status: 'processing', queueCycles: nextQueueCycles, processingProgress: 5 };
            }
            return { ...item, queueCycles: nextQueueCycles };
          }

          if (item.status === 'processing') {
            const shouldFailProcessing = Math.random() < 0.02;
            if (shouldFailProcessing) {
              return {
                ...item,
                status: 'failed',
                failedStage: 'processing',
                errorMessage: 'Processing failed. Reprocess or reupload to continue.',
              };
            }
            const nextProcessing = Math.min(100, item.processingProgress + Math.floor(Math.random() * 14 + 8));
            if (nextProcessing >= 100) {
              return {
                ...item,
                status: 'completed',
                processingProgress: 100,
                failedStage: undefined,
                errorMessage: undefined,
              };
            }
            return { ...item, processingProgress: nextProcessing };
          }

          return item;
        });

        return nextItems;
      });
    }, 700);

    return () => window.clearInterval(interval);
  }, []);

  const { counts, uploadedCount, sortedItems } = useMemo(() => {
    const nextCounts = uploadItems.reduce(
      (acc, item) => ({
        ...acc,
        [item.status]: acc[item.status] + 1,
      }),
      { uploading: 0, uploaded: 0, processing: 0, completed: 0, failed: 0 }
    );
    const nextSortedItems: DisplayUploadItem[] = uploadItems.map((item) => {
      return {
        ...item,
        uploadedAtLabel: formatUploadedAtLabel(item.uploadedAt),
      };
    });

    nextSortedItems.sort((a, b) => {
      const t = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      if (t !== 0) return t;
      return a.id.localeCompare(b.id);
    });

    return { counts: nextCounts, uploadedCount: uploadItems.length - nextCounts.uploading, sortedItems: nextSortedItems };
  }, [uploadItems]);

  const hasActiveWork = counts.uploading > 0 || counts.uploaded > 0 || counts.processing > 0;
  const canContinue = counts.completed > 0;
  const profileCompletionPercent = useMemo(() => {
    if (uploadItems.length === 0) return BASELINE_PROFILE_COMPLETION;
    const total = uploadItems.reduce((sum, item) => sum + getFileCompletion(item), 0);
    const fileDrivenCompletion = total / uploadItems.length;
    const calculated = Math.round(
      BASELINE_PROFILE_COMPLETION +
        fileDrivenCompletion * (MAX_PROFILE_COMPLETION_ON_UPLOAD_STEP - BASELINE_PROFILE_COMPLETION)
    );
    return Math.min(calculated, MAX_PROFILE_COMPLETION_ON_UPLOAD_STEP);
  }, [uploadItems]);
  const hasFirstCompletion = counts.completed > 0;

  const appendFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const now = new Date().toISOString();
    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      name: file.name,
      size: file.size,
      uploadedAt: now,
      status: 'uploading',
      uploadProgress: 0,
      processingProgress: 0,
      queueCycles: 0,
      failedStage: undefined,
      errorMessage: undefined,
    }));

    setUploadItems((current) => [...current, ...newItems]);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-[1060px] rounded-[var(--radius-large)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-6 shadow-[var(--shadow-300)]">
        <div>
          <button
            type="button"
            onClick={() => navigate('/setup-account')}
            className="inline-flex items-center gap-2 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]"
          >
            <Icon name="angle-left" size={12} />
            Back to Setup
          </button>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="md:max-w-[72%]">
              <h1
                className="text-[42px] leading-[50px] text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', fontWeight: 700 }}
              >
                Let&apos;s Get Started!
              </h1>
              <p className="mt-2 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">
                Upload company documents to begin setup. You&apos;re already making progress!
              </p>
            </div>
            <div className="w-full md:w-[25%] md:min-w-[220px]">
              <div className="mb-2 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-x-strong)]">Profile completion</div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-neutral-x-weak)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary-strong)] transition-all duration-300"
                  style={{ width: `${profileCompletionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[var(--radius-small)] border border-dashed border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-x-weak)] p-6">
          <div>
            <p className="text-[18px] font-medium leading-[28px] text-[var(--text-neutral-x-strong)]">Upload company documents</p>
            <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">
              Drag and drop files here or browse. Accepted: PDF, DOCX, XLSX, CSV, PNG, JPG.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-3">
                <p className="text-[13px] font-medium leading-[19px] text-[var(--text-neutral-x-strong)]">Start Here: Recommended to get started</p>
                <ul className="mt-1 list-disc pl-5 text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                  <li>Employee data</li>
                  <li>Job data</li>
                  <li>Payroll file</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-3">
                <p className="text-[13px] font-medium leading-[19px] text-[var(--text-neutral-x-strong)]">You can add later</p>
                <ul className="mt-1 list-disc pl-5 text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                  <li>Pay schedules</li>
                  <li>Tax information</li>
                  <li>W-2s and W-4s</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="text" size="small" icon="circle-plus-lined" onClick={() => inputRef.current?.click()}>
              Add more documents
            </Button>
            <span className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
              {uploadItems.length} file{uploadItems.length === 1 ? '' : 's'} queued
            </span>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              appendFiles(event.target.files);
              event.currentTarget.value = '';
            }}
          />
        </section>

        {(hasActiveWork || isOffline) && (
          <section className="mt-5 rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-selected-weak)] p-4">
            <div className="flex items-center gap-3">
              <Icon name="arrows-rotate" size={14} className={isOffline ? 'text-[var(--text-neutral-medium)]' : 'animate-spin text-[var(--color-primary-strong)]'} />
              <p className="text-[14px] leading-[20px] text-[var(--text-neutral-x-strong)]">
                {isOffline
                  ? 'Network disconnected. Queue state is saved locally and will resume automatically when connection returns.'
                  : 'Processing uploads. You can continue adding documents while this runs.'}
              </p>
            </div>
            {!isOffline && counts.processing > 0 && (
              <p className="mt-2 text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                Processing your file. This usually takes about 30 seconds.
              </p>
            )}
          </section>
        )}

        {hasFirstCompletion && (
          <div className="mt-4 rounded-[var(--radius-xx-small)] border border-[#b9e0b9] bg-[#ecf8ec] px-4 py-3 text-[13px] leading-[19px] text-[var(--text-neutral-x-strong)]">
            Nice work. You&apos;re making progress.
          </div>
        )}

        <section className="mt-5 rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)]">
          <div className="border-b border-[var(--border-neutral-x-weak)] px-4 py-3 text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">
            {uploadedCount} files uploaded, {counts.processing} processing, {counts.completed} completed, {counts.failed} failed
          </div>

          {uploadItems.length === 0 ? (
            <div className="px-4 py-8 text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">
              No files uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-neutral-x-weak)]">
              {sortedItems.map((item) => {
                const meta = statusMeta(item.status);
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">{item.name}</p>
                        <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                          {formatBytes(item.size)} • {item.uploadedAtLabel}
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-2 text-[13px] leading-[19px] ${meta.colorClass}`}>
                        <Icon
                          name={meta.icon}
                          size={12}
                          className={item.status === 'uploading' || item.status === 'processing' ? 'animate-spin' : ''}
                        />
                        {meta.label}
                      </div>
                    </div>

                    {item.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#d2d2d2]">
                          <div className="h-full rounded-full bg-[var(--color-primary-strong)] transition-all" style={{ width: `${item.uploadProgress}%` }} />
                        </div>
                        <p className="mt-1 text-[12px] leading-[16px] text-[var(--text-neutral-medium)]">{item.uploadProgress}%</p>
                      </div>
                    )}

                    {item.status === 'processing' && (
                      <p className="mt-2 text-[12px] leading-[16px] text-[var(--text-neutral-medium)]">
                        Processing your file. This usually takes about 30 seconds.
                      </p>
                    )}

                    {item.status === 'failed' && (
                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-[12px] leading-[16px] text-[#d62828]">
                          {item.errorMessage ?? 'Upload failed. Retry upload to continue.'}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setUploadItems((current) =>
                              current.map((entry) =>
                                entry.id === item.id
                                  ? {
                                      ...entry,
                                      status: 'uploading',
                                      uploadProgress: 0,
                                      processingProgress: 0,
                                      queueCycles: 0,
                                      failedStage: undefined,
                                      errorMessage: undefined,
                                    }
                                  : entry
                              )
                            )
                          }
                          className="text-[12px] font-semibold leading-[16px] text-[#0b4fd1]"
                        >
                          {item.failedStage === 'processing' ? 'Reupload' : 'Retry Upload'}
                        </button>
                        {item.failedStage === 'processing' && (
                          <button
                            type="button"
                            onClick={() =>
                              setUploadItems((current) =>
                                current.map((entry) =>
                                  entry.id === item.id
                                    ? {
                                        ...entry,
                                        status: 'processing',
                                        processingProgress: 0,
                                        failedStage: undefined,
                                        errorMessage: undefined,
                                      }
                                    : entry
                                )
                              )
                            }
                            className="text-[12px] font-semibold leading-[16px] text-[#0b4fd1]"
                          >
                            Reprocess
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {canContinue && (hasActiveWork || counts.failed > 0) && (
          <div className="mt-4 rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-x-weak)] px-4 py-3 text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
            Some files are still processing or failed. You can continue setup now and return to manage documents later.
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="primary"
            size="small"
            disabled={!canContinue}
            onClick={() => navigate('/setup-account')}
            title={!canContinue ? 'At least one completed file is required to continue setup.' : undefined}
          >
            Continue Setup
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NewAccountOnboarding;
