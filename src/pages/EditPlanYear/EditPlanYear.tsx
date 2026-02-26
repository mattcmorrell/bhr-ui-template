import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, DatePicker } from '../../components';

type PlanYearStep = 'basics' | 'carriers' | 'plans' | 'open-enrollment' | 'new-hire';

const STEPS: { id: PlanYearStep; label: string }[] = [
  { id: 'basics', label: 'Plan Year Basics' },
  { id: 'carriers', label: 'Carriers' },
  { id: 'plans', label: 'Plans' },
  { id: 'open-enrollment', label: 'Open Enrollment' },
  { id: 'new-hire', label: 'New Hire Enrollment' },
];

const STEP_ORDER: PlanYearStep[] = ['basics', 'carriers', 'plans', 'open-enrollment', 'new-hire'];

const PLANS_BY_CARRIER: { carrier: string; plans: { name: string; category: string; includedIn: string }[] }[] = [
  {
    carrier: 'Aetna',
    plans: [
      { name: 'Medical FSA', category: 'Flex Savings Account', includedIn: '3 plan years' },
      { name: 'Dependent Care FSA', category: 'Flex Savings Account', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'Aflac',
    plans: [
      { name: 'Accident Insurance', category: 'Supplemental Health', includedIn: '3 plan years' },
      { name: 'Hospital Indemnity', category: 'Supplemental Health', includedIn: '3 plan years' },
      { name: 'Critical Illness Insurance', category: 'Supplemental Health', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'Delta Dental',
    plans: [
      { name: 'Dental PPO', category: 'Dental', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'Fidelity',
    plans: [
      { name: 'HSA', category: 'Health Savings Account', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'Guardian',
    plans: [
      { name: 'Basic Life Insurance', category: 'Life Insurance', includedIn: '3 plan years' },
      { name: 'Voluntary Life Insurance', category: 'Life Insurance', includedIn: '3 plan years' },
      { name: 'Short-Term Disability', category: 'Disability', includedIn: '3 plan years' },
      { name: 'Long-Term Disability', category: 'Disability', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'Met Life',
    plans: [
      { name: 'Employee Assistance Program', category: 'Other', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'United Healthcare',
    plans: [
      { name: 'HSA Medical $3,000', category: 'Medical', includedIn: '3 plan years' },
      { name: 'Standard PPO', category: 'Medical', includedIn: '3 plan years' },
    ],
  },
  {
    carrier: 'Vista',
    plans: [
      { name: 'Vision Plan', category: 'Vision', includedIn: '3 plan years' },
    ],
  },
];

const PLAN_YEAR_CARRIERS = [
  { id: 'aetna', name: 'Aetna' },
  { id: 'aflac', name: 'Aflac' },
  { id: 'delta-dental', name: 'Delta Dental' },
  { id: 'fidelity', name: 'Fidelity' },
  { id: 'guardian', name: 'Guardian' },
  { id: 'met-life', name: 'Met Life' },
  { id: 'united', name: 'United Healthcare' },
  { id: 'vista', name: 'Vista' },
];

export function EditPlanYear() {
  const [activeStep, setActiveStep] = useState<PlanYearStep>('basics');
  const [planYearName, setPlanYearName] = useState('2026 Testing');
  const [startDate, setStartDate] = useState('01/01/2026');
  const [endDate, setEndDate] = useState('12/31/2026');
  const [selectedCarriers, setSelectedCarriers] = useState<Set<string>>(
    new Set(['aetna', 'aflac', 'delta-dental', 'fidelity', 'guardian', 'met-life', 'united', 'vista'])
  );

  const currentIndex = STEP_ORDER.indexOf(activeStep);
  const goNext = () => {
    if (currentIndex < STEP_ORDER.length - 1) {
      setActiveStep(STEP_ORDER[currentIndex + 1]);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  return (
    <div className="px-8 pt-8 pb-10">
      {/* Breadcrumbs */}
      <Link
        to="/benefits"
        className="inline-flex items-center gap-1 text-[15px] text-[var(--text-neutral-medium)] hover:text-[var(--color-primary-strong)] mb-4"
      >
        <Icon name="angle-left" size={16} />
        Plan Years
      </Link>

      {/* Page Title */}
      <div className="mb-8 flex items-baseline gap-3">
        <h1
          className="text-[44px] font-bold text-[var(--color-primary-strong)]"
          style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '52px' }}
        >
          Edit Plan Year
        </h1>
        <span className="text-[22px] text-[var(--text-neutral-medium)]">
          {planYearName}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Left Panel - Steps */}
        <div className="w-[280px] shrink-0">
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] p-6">
            <nav className="space-y-1">
              {STEPS.map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-small)] text-left
                      text-[15px] font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-[var(--surface-selected-weak)] text-[var(--color-primary-strong)]'
                          : 'text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]'
                      }
                    `}
                  >
                    <Icon
                      name="check-circle"
                      size={20}
                      className={isActive ? 'text-[var(--color-primary-strong)]' : 'text-[var(--icon-neutral-strong)]'}
                    />
                    {step.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-[var(--border-neutral-x-weak)] space-y-3">
              <Button variant="standard" className="w-full justify-center">
                Save & Finish Later
              </Button>
              <Link
                to="/benefits"
                className="block text-center text-[15px] font-medium text-[var(--color-link)] hover:underline"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Content */}
        <div className="flex-1">
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] p-8">
            {activeStep === 'basics' && (
              <>
                <h2
                  className="text-[28px] font-bold text-[var(--text-neutral-x-strong)] mb-2"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '36px' }}
                >
                  Let's start with the basics...
                </h2>
                <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8">
                  Name the timeframe of the benefits you are offering next year.
                </p>

                <div className="bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] p-6 mb-8">
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-[14px] font-medium text-[var(--text-neutral-x-strong)] mb-2">
                        Plan Year Name
                      </label>
                      <input
                        type="text"
                        value={planYearName}
                        onChange={(e) => setPlanYearName(e.target.value)}
                        className="w-full h-10 px-4 py-2 bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-xx-small)] text-[15px] text-[var(--text-neutral-strong)]"
                        style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <DatePicker
                          label="Plan Year Started"
                          value={startDate}
                          onChange={setStartDate}
                        />
                      </div>
                      <span className="text-[var(--text-neutral-medium)] pb-10">-</span>
                      <div className="flex-1">
                        <DatePicker
                          label="Plan Year Ends"
                          value={endDate}
                          onChange={setEndDate}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="standard" onClick={goPrev} disabled={currentIndex === 0}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={goNext}>
                    Next
                  </Button>
                </div>
              </>
            )}
            {activeStep === 'carriers' && (
              <>
                <h2
                  className="text-[28px] font-bold text-[var(--text-neutral-x-strong)] mb-2"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '36px' }}
                >
                  Next, which carriers are you going to be offering plans through this year?
                </h2>
                <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8">
                  Once we know who we're working with, we'll dive into adding plans for each carrier.
                </p>

                <div className="space-y-3 mb-6">
                  {PLAN_YEAR_CARRIERS.map((carrier) => {
                    const isSelected = selectedCarriers.has(carrier.id);
                    return (
                      <label
                        key={carrier.id}
                        className={`
                          flex items-center justify-between w-full px-4 py-3 rounded-[var(--radius-small)]
                          border cursor-pointer transition-colors
                          ${
                            isSelected
                              ? 'border-[var(--color-primary-strong)]/40 bg-[var(--surface-selected-weak)]'
                              : 'border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] hover:bg-[var(--surface-neutral-xx-weak)]'
                          }
                        `}
                      >
                        <span className="text-[15px] font-medium text-[var(--color-primary-strong)]">
                          {carrier.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const next = new Set(selectedCarriers);
                            if (next.has(carrier.id)) next.delete(carrier.id);
                            else next.add(carrier.id);
                            setSelectedCarriers(next);
                          }}
                          className="w-4 h-4 rounded-[4px] cursor-pointer border-[var(--border-neutral-medium)] accent-[var(--color-primary-strong)] focus:ring-2 focus:ring-[var(--color-primary-strong)] focus:ring-offset-0"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="flex justify-center mb-8">
                  <Button
                    variant="standard"
                    onClick={() => {}}
                  >
                    Add Carrier
                  </Button>
                </div>

                <div className="flex justify-between">
                  <Button variant="standard" onClick={goPrev} disabled={currentIndex === 0}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={goNext}>
                    Next
                  </Button>
                </div>
              </>
            )}
            {activeStep === 'plans' && (
              <>
                <h2
                  className="text-[28px] font-bold text-[var(--text-neutral-x-strong)] mb-8 text-center"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '36px' }}
                >
                  Here are the plans that are offered by each carrier.
                </h2>

                <div className="overflow-hidden rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)]">
                  {/* Table Header - light gray bar, substantial space below */}
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-6 px-6 py-4 bg-[var(--surface-neutral-xx-weak)] border-b border-[var(--border-neutral-x-weak)]">
                    <div className="text-[15px] font-medium text-[var(--text-neutral-strong)]">Name</div>
                    <div className="text-[15px] font-medium text-[var(--text-neutral-strong)]">Category</div>
                    <div className="text-[15px] font-medium text-[var(--text-neutral-strong)]">Included In</div>
                  </div>

                  {/* Carrier Groups */}
                  {PLANS_BY_CARRIER.map(({ carrier, plans }, carrierIdx) => {
                    const isLastCarrier = carrierIdx === PLANS_BY_CARRIER.length - 1;
                    return (
                    <Fragment key={carrier}>
                      {/* Carrier Header */}
                      <div className="px-6 py-3 bg-[var(--surface-neutral-x-weak)] border-b border-[var(--border-neutral-x-weak)]">
                        <span className="text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                          {carrier}
                        </span>
                      </div>
                      {/* Plan Rows */}
                      {plans.map((plan, idx) => {
                        const isLastRow = isLastCarrier && idx === plans.length - 1;
                        return (
                        <div
                          key={`${carrier}-${plan.name}-${idx}`}
                          className={`grid grid-cols-[1fr_1fr_1fr] gap-6 px-6 py-4 bg-[var(--surface-neutral-white)] border-b border-[var(--border-neutral-xx-weak)] ${isLastRow ? 'border-b-0' : ''}`}
                        >
                          <div className="text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                            {plan.name}
                          </div>
                          <div className="text-[15px] text-[var(--text-neutral-strong)]">
                            {plan.category}
                          </div>
                          <div className="text-[15px] text-[var(--text-neutral-strong)]">
                            {plan.includedIn}
                          </div>
                        </div>
                      );})}
                    </Fragment>
                  );})}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="standard" onClick={goPrev} disabled={currentIndex === 0}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={goNext}>
                    Next
                  </Button>
                </div>
              </>
            )}
            {activeStep !== 'basics' && activeStep !== 'carriers' && activeStep !== 'plans' && (
              <div className="py-12 text-center">
                <p className="text-[15px] text-[var(--text-neutral-medium)]">
                  {STEPS.find((s) => s.id === activeStep)?.label} content coming soon.
                </p>
                <div className="flex justify-between mt-8">
                  <Button variant="standard" onClick={goPrev} disabled={currentIndex === 0}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={goNext}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
