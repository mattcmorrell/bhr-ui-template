import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../components';

const heroArtworkUrl = 'https://www.figma.com/api/mcp/asset/38fabaa8-c47a-4967-a672-6df35ae6419e';
const ONBOARDING_TEST_STORAGE_KEY = 'new-account-onboarding-upload-state-v1';

interface SetupTask {
  id: string;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  modules: Array<{
    id: string;
    icon: 'gear' | 'user-group' | 'chart-line' | 'bullhorn' | 'circle-dollar' | 'spa';
    title: string;
    description: string;
  }>;
}

const setupTasks: SetupTask[] = [
  {
    id: 'company-setup',
    title: 'Company Setup',
    description: 'Add company info and choose your settings',
    progressLabel: '25% Complete',
    progressValue: 25,
    modules: [
      {
        id: 'personalize',
        icon: 'gear',
        title: 'Personalize BambooHR',
        description: "Enter your company's details and preferences",
      },
      {
        id: 'contact',
        icon: 'user-group',
        title: 'Contact Info',
        description: 'How do we reach out to you?',
      },
    ],
  },
  {
    id: 'people-operations',
    title: 'People Operations',
    description: 'Create employee records and data',
    progressLabel: '10% Complete',
    progressValue: 10,
    modules: [
      {
        id: 'employee-records',
        icon: 'user-group',
        title: 'Employee Records',
        description: 'Import your roster and profile details',
      },
      {
        id: 'job-info',
        icon: 'chart-line',
        title: 'Job Information',
        description: 'Define departments, titles, and reporting lines',
      },
    ],
  },
  {
    id: 'talent-growth',
    title: 'Talent and Growth',
    description: 'Hiring and Performance',
    progressLabel: '0% Complete',
    progressValue: 0,
    modules: [
      {
        id: 'hiring-workflows',
        icon: 'chart-line',
        title: 'Hiring Workflows',
        description: 'Set stages and approval workflows',
      },
      {
        id: 'performance-cycles',
        icon: 'chart-line',
        title: 'Performance Cycles',
        description: 'Create review cadence and goal templates',
      },
    ],
  },
  {
    id: 'employee-engagement',
    title: 'Employee Engagement',
    description: 'Manage your Total Rewards and Community',
    progressLabel: '0% Complete',
    progressValue: 0,
    modules: [
      {
        id: 'total-rewards',
        icon: 'bullhorn',
        title: 'Total Rewards',
        description: 'Show compensation and benefit visibility',
      },
      {
        id: 'community',
        icon: 'bullhorn',
        title: 'Employee Community',
        description: 'Launch announcements and team channels',
      },
    ],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description: 'Start running your payroll',
    progressLabel: '0% Complete',
    progressValue: 0,
    modules: [
      {
        id: 'payroll-setup',
        icon: 'circle-dollar',
        title: 'Payroll Setup',
        description: 'Configure earnings, deductions, and taxes',
      },
      {
        id: 'run-payroll',
        icon: 'circle-dollar',
        title: 'Run Payroll',
        description: 'Preview and process your first payroll',
      },
      {
        id: 'year-to-date',
        icon: 'circle-dollar',
        title: 'Year-to-Date',
        description: 'Review year-to-date payroll totals and records',
      },
    ],
  },
  {
    id: 'benefits',
    title: 'Benefits',
    description: 'Set up your employee benefits',
    progressLabel: '0% Complete',
    progressValue: 0,
    modules: [
      {
        id: 'benefit-plans',
        icon: 'spa',
        title: 'Benefit Plans',
        description: 'Create and assign benefit offerings',
      },
      {
        id: 'enrollment',
        icon: 'spa',
        title: 'Enrollment Window',
        description: 'Define dates and eligibility rules',
      },
    ],
  },
];

function LeftRailItem({
  task,
  active,
  onClick,
}: {
  task: SetupTask;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full rounded-[var(--radius-small)] border px-4 py-3 text-left transition-all
        ${
          active
            ? 'border-[var(--color-primary-medium)] bg-[var(--surface-selected-weak)]'
            : 'border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] hover:bg-[var(--surface-neutral-x-weak)]'
        }
      `}
      style={{ boxShadow: 'var(--shadow-100)' }}
    >
      <div className="flex items-center gap-4">
        <Icon
          name={task.modules[0].icon}
          size={20}
          className={active ? 'text-[var(--color-primary-strong)]' : 'text-[var(--icon-neutral-x-strong)]'}
        />
        <div className="min-w-0">
          <p
            className={`text-[21px] leading-[26px] ${active ? 'text-[var(--color-primary-strong)]' : 'text-[var(--text-neutral-x-strong)]'}`}
            style={{ fontFamily: 'Fields, system-ui, sans-serif', fontWeight: 600 }}
          >
            {task.title}
          </p>
          <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">{task.description}</p>
        </div>
      </div>
    </button>
  );
}

function ModuleCard({
  moduleId,
  title,
  description,
  icon,
  onClick,
}: {
  moduleId: string;
  title: string;
  description: string;
  icon: 'gear' | 'user-group' | 'chart-line' | 'bullhorn' | 'circle-dollar' | 'spa';
  onClick: (moduleId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(moduleId)}
      className="w-full rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-5 py-3"
      style={{ boxShadow: 'var(--shadow-300)' }}
    >
      <div className="flex items-center gap-4">
        <Icon name={icon} size={22} className="text-[var(--color-primary-strong)]" />
        <div className="min-w-0 flex-1 text-left">
          <p
            className="text-[21px] leading-[26px] text-[var(--text-neutral-x-strong)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', fontWeight: 600 }}
          >
            {title}
          </p>
          <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">{description}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-neutral-medium)] text-[var(--text-neutral-medium)]">
          <Icon name="arrow-left" size={12} className="rotate-180" />
        </span>
      </div>
    </button>
  );
}

export function SetupAccount() {
  const navigate = useNavigate();
  const [activeTaskId, setActiveTaskId] = useState(setupTasks[0].id);

  const activeTask = useMemo(
    () => setupTasks.find((task) => task.id === activeTaskId) ?? setupTasks[0],
    [activeTaskId]
  );

  const handleModuleClick = (moduleId: string) => {
    if (moduleId === 'year-to-date') {
      navigate('/setup-account/year-to-date');
    }
  };

  return (
    <div className="p-6">
      <div
        className="rounded-[var(--radius-large)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-x-weak)] p-4 md:p-6"
        style={{ boxShadow: 'var(--shadow-300)' }}
      >
        <section className="relative overflow-hidden rounded-[var(--radius-small)] bg-[#e6eee1] px-6 py-7 md:px-8 md:py-8">
          <div className="relative z-10 flex flex-col gap-5 md:max-w-[60%]">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex w-fit items-center gap-2 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]"
            >
              <Icon name="angle-left" size={12} />
              Back
            </button>
            <h1
              className="text-[44px] leading-[52px] md:text-[52px] md:leading-[62px] text-[var(--color-primary-strong)]"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', fontWeight: 700 }}
            >
              Let&apos;s Set Up Your Account!
            </h1>
            <div className="flex items-center gap-5">
              <div className="h-2 w-[110px] overflow-hidden rounded-full bg-[#cfd6cc]">
                <div className="h-full w-[32%] rounded-full bg-[var(--color-primary-strong)]" />
              </div>
              <div className="flex items-center gap-2 text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                <span>
                  Implementation is over in <strong className="text-[var(--text-neutral-x-strong)]">6 days</strong>
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#d8d8d8] text-[20px] font-semibold text-[#555555]">
                  0
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#d8d8d8] text-[20px] font-semibold text-[#555555]">
                  6
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="standard"
                size="small"
                icon="circle-plus-lined"
                onClick={() => navigate('/setup-account/onboarding-test')}
                className="text-[13px] leading-[19px]"
              >
                Start Onboarding Test
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => window.localStorage.removeItem(ONBOARDING_TEST_STORAGE_KEY)}
                className="text-[13px] leading-[19px]"
              >
                Reset Test
              </Button>
            </div>
          </div>

          <img
            src={heroArtworkUrl}
            alt="Account setup illustration"
            className="pointer-events-none absolute bottom-0 right-0 h-[220px] max-w-[45%] object-contain md:h-[260px]"
          />
        </section>

        <section className="mt-0 grid gap-7 rounded-b-[var(--radius-small)] bg-[var(--surface-neutral-white)] p-5 md:grid-cols-[1fr_1.45fr] md:p-7">
          <div className="space-y-3">
            {setupTasks.map((task) => (
              <LeftRailItem
                key={task.id}
                task={task}
                active={task.id === activeTask.id}
                onClick={() => setActiveTaskId(task.id)}
              />
            ))}
          </div>

          <div>
            <div className="flex items-start justify-between gap-6">
              <h2
                className="text-[34px] leading-[42px] md:text-[42px] md:leading-[50px] text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', fontWeight: 600 }}
              >
                {activeTask.title}
              </h2>
              <div className="w-[170px] shrink-0">
                <div className="mb-1 text-right text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                  {activeTask.progressLabel}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#d2d2d2]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary-strong)] transition-all"
                    style={{ width: `${activeTask.progressValue}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-[95%] text-[18px] leading-[28px] text-[var(--text-neutral-x-strong)]">
              Here we go! Get your company up and running by adding key information, bringing in your employee
              records, and customizing essential settings.
            </p>

            <div className="mt-6 space-y-3">
              {activeTask.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  moduleId={module.id}
                  icon={module.icon}
                  title={module.title}
                  description={module.description}
                  onClick={handleModuleClick}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SetupAccount;
