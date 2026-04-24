import { Button, Icon } from '../../components';
import type { JobProfileCompetency } from '../../data/settingsData';

/** Teal accent for AI suggestion tiles (aligned with job profile AI hints). */
const SUGGESTION_ACCENT = '#005b7f';

const iconActionClass =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)] transition-all duration-200 hover:bg-[var(--surface-neutral-xx-weak)] cursor-pointer';

type SavedProps = {
  variant: 'saved';
  competency: JobProfileCompetency;
  onEdit: () => void;
  onDelete: () => void;
};

type SuggestionProps = {
  variant: 'suggestion';
  competency: JobProfileCompetency;
  onAccept: () => void;
  onReject: () => void;
};

export type CompetencyCardProps = SavedProps | SuggestionProps;

export function CompetencyCard(props: CompetencyCardProps) {
  const { competency } = props;
  const { name, description, level } = competency;
  const isSuggestion = props.variant === 'suggestion';

  const iconColorClass = isSuggestion ? '' : 'text-[var(--color-primary-strong)]';
  const iconStyle = isSuggestion ? { color: SUGGESTION_ACCENT } : undefined;

  const titleClassSaved =
    'm-0 cursor-pointer border-0 bg-transparent p-0 text-left text-[16px] font-semibold text-[var(--color-primary-strong)] hover:underline';
  const titleClassSuggestion = 'm-0 text-[16px] font-semibold';
  const titleSuggestionStyle = { color: SUGGESTION_ACCENT } as const;

  const body = (
    <>
      <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-x-small)] bg-[var(--surface-neutral-xx-weak)]">
        <Icon name="clipboard" size={18} className={iconColorClass} style={iconStyle} />
      </div>
      {props.variant === 'saved' ? (
        <button type="button" onClick={props.onEdit} className={titleClassSaved}>
          {name}
        </button>
      ) : (
        <h3 className={titleClassSuggestion} style={titleSuggestionStyle}>
          {name}
        </h3>
      )}
      <p className="m-0 mt-2 text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">{description}</p>
      <span className="mt-3 inline-flex self-start rounded-[var(--radius-full)] bg-[var(--surface-neutral-x-weak)] px-3 py-1 text-[13px] font-medium text-[var(--text-neutral-strong)]">
        {level}
      </span>
      <div className="mt-auto pt-5 flex flex-wrap gap-2">
        {props.variant === 'saved' ? (
          <>
            <Button type="button" variant="standard" icon="pen" onClick={props.onEdit}>
              Edit
            </Button>
            <Button type="button" variant="standard" icon="trash-can" onClick={props.onDelete}>
              Delete
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={props.onAccept}
              className={iconActionClass}
              style={{ boxShadow: 'var(--shadow-100)' }}
              aria-label="Accept suggestion"
            >
              <Icon name="check" size={16} className="text-[var(--icon-neutral-x-strong)]" />
            </button>
            <button
              type="button"
              onClick={props.onReject}
              className={iconActionClass}
              style={{ boxShadow: 'var(--shadow-100)' }}
              aria-label="Reject suggestion"
            >
              <Icon name="xmark" size={16} className="text-[var(--icon-neutral-x-strong)]" />
            </button>
          </>
        )}
      </div>
    </>
  );

  if (isSuggestion) {
    return (
      <div
        className="rounded-[var(--radius-large)] p-[1.5px]"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, #6dd4c0 0%, #f4c4a0 24%, #e88888 48%, #b8a8e8 72%, #6dd4c0 100%)',
          boxShadow: 'var(--shadow-300)',
        }}
      >
        <article className="flex flex-col h-full rounded-[22.5px] bg-[var(--surface-neutral-white)] p-6">{body}</article>
      </div>
    );
  }

  return (
    <article
      className="flex flex-col rounded-[var(--radius-large)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-6"
      style={{ boxShadow: 'var(--shadow-300)' }}
    >
      {body}
    </article>
  );
}
