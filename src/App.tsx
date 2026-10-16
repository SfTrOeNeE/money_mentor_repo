import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

export type GoalCategory = 'Travel' | 'Home' | 'Emergency' | 'Lifestyle'

export type SavingsGoal = {
  id: string
  name: string
  category: GoalCategory
  target: number
  saved: number
  deadline: string
}

const startingGoals: SavingsGoal[] = [
  {
    id: 'weekend-away',
    name: 'Weekend in the mountains',
    category: 'Travel',
    target: 1800,
    saved: 1240,
    deadline: '2026-12-20',
  },
  {
    id: 'rainy-day',
    name: 'Rainy day fund',
    category: 'Emergency',
    target: 5000,
    saved: 2150,
    deadline: '2027-03-15',
  },
  {
    id: 'home-office',
    name: 'A little home office upgrade',
    category: 'Home',
    target: 1200,
    saved: 890,
    deadline: '2027-01-30',
  },
]

function App() {
  const [goals, setGoals] = useState(startingGoals)
  const [selectedGoalId, setSelectedGoalId] = useState(startingGoals[0].id)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0]
  const totalSaved = goals.reduce((total, goal) => total + goal.saved, 0)
  const totalTarget = goals.reduce((total, goal) => total + goal.target, 0)
  const totalRemaining = Math.max(totalTarget - totalSaved, 0)
  const overallProgress =
    totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0

  function addGoal(goal: Omit<SavingsGoal, 'id'>) {
    const newGoal = { ...goal, id: crypto.randomUUID() }
    setGoals((currentGoals) => [...currentGoals, newGoal])
    setSelectedGoalId(newGoal.id)
    setEditingGoalId(null)
  }

  function updateGoal(goal: SavingsGoal) {
    setGoals((currentGoals) =>
      currentGoals.map((currentGoal) =>
        currentGoal.id === goal.id ? goal : currentGoal,
      ),
    )
    setSelectedGoalId(goal.id)
    setEditingGoalId(null)
  }

  function removeGoal(goalId: string) {
    setGoals((currentGoals) => {
      const remainingGoals = currentGoals.filter((goal) => goal.id !== goalId)
      setSelectedGoalId(remainingGoals[0]?.id ?? '')
      return remainingGoals
    })
    setEditingGoalId(null)
  }

  function addContribution(amount: number) {
    if (!selectedGoal) return
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === selectedGoal.id
          ? { ...goal, saved: Math.min(goal.saved + amount, goal.target) }
          : goal,
      ),
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Nest home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M5.5 14.2 16 5.5l10.5 8.7v11.3H5.5V14.2Z" />
              <path d="M12 25.5v-8h8v8M3.5 14.5 16 4l12.5 10.5" />
            </svg>
          </span>
          <span>nest<span className="brand-period">.</span></span>
        </a>

        <p className="nav-label">YOUR SPACE</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview">
            <NavIcon name="grid" />
            Overview
          </a>
          <a className="nav-link" href="#goals">
            <NavIcon name="target" />
            My goals
            <span className="nav-count">{goals.length}</span>
          </a>
          <a className="nav-link" href="#new-goal">
            <NavIcon name="plus" />
            Create a goal
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="note-sparkle" aria-hidden="true">✳</span>
          <p className="note-title">Little by little.</p>
          <p className="note-copy">Small steps add up to lovely things.</p>
          <a href="#goals">See your progress <span aria-hidden="true">→</span></a>
        </div>

        <div className="sidebar-footer">
          <span className="avatar">A</span>
          <span className="profile-copy"><strong>Alex Morgan</strong><small>Personal account</small></span>
          <span className="footer-dots" aria-hidden="true">···</span>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">My space <span>/</span> Overview</div>
          <div className="topbar-right">
            <span className="prototype-badge"><span /> PREVIEW</span>
            <button className="icon-button" type="button" aria-label="Notifications">
              <NavIcon name="bell" />
              <span className="notification-dot" />
            </button>
            <span className="top-avatar" aria-label="Alex Morgan">A</span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">{formatToday()}</p>
              <h1>A little progress, <span>every day.</span></h1>
              <p className="welcome-copy">You’re making room for the things that matter.</p>
            </div>
            <a className="primary-button" href="#new-goal">
              <span aria-hidden="true">＋</span> New savings goal
            </a>
          </section>

          <Dashboard
            goals={goals}
            totalSaved={totalSaved}
            totalTarget={totalTarget}
            totalRemaining={totalRemaining}
            overallProgress={overallProgress}
            selectedGoalId={selectedGoal?.id ?? ''}
            onSelectGoal={setSelectedGoalId}
          />

          <section className="workspace-grid">
            <Details
              goal={selectedGoal}
              onAddContribution={addContribution}
              onEditGoal={(goalId) => setEditingGoalId(goalId)}
              onRemoveGoal={removeGoal}
            />
            <Form
              goalToEdit={goals.find((goal) => goal.id === editingGoalId) ?? null}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onCancelEdit={() => setEditingGoalId(null)}
            />
          </section>

          <footer className="page-footer">
            <span>Made for your next little big thing <span className="footer-heart">♥</span></span>
            <span>PREVIEW BUILD <span className="footer-separator">·</span> Your savings, your pace.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

type DashboardProps = {
  goals: SavingsGoal[]
  totalSaved: number
  totalTarget: number
  totalRemaining: number
  overallProgress: number
  selectedGoalId: string
  onSelectGoal: (id: string) => void
}

function Dashboard({
  goals,
  totalSaved,
  totalTarget,
  totalRemaining,
  overallProgress,
  selectedGoalId,
  onSelectGoal,
}: DashboardProps) {
  return (
    <section aria-label="Savings dashboard">
      <div className="stats-grid">
        <article className="stat-card total-card">
          <div className="stat-topline">
            <span className="stat-label">TOTAL SAVED</span>
            <span className="stat-icon purple-icon"><NavIcon name="wallet" /></span>
          </div>
          <p className="stat-value">{formatCurrency(totalSaved)}</p>
          <p className="stat-caption"><span className="positive-dot" /> Across {goals.length} active goals</p>
        </article>
        <article className="stat-card">
          <div className="stat-topline">
            <span className="stat-label">YOUR TARGET</span>
            <span className="stat-icon peach-icon"><NavIcon name="flag" /></span>
          </div>
          <p className="stat-value">{formatCurrency(totalTarget)}</p>
          <p className="stat-caption">A little more to look forward to</p>
        </article>
        <article className="stat-card">
          <div className="stat-topline">
            <span className="stat-label">LEFT TO SAVE</span>
            <span className="stat-icon green-icon"><NavIcon name="leaf" /></span>
          </div>
          <p className="stat-value">{formatCurrency(totalRemaining)}</p>
          <p className="stat-caption">You’re {overallProgress}% of the way there</p>
        </article>
      </div>

      <div className="goals-section" id="goals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR SAVINGS PLAN</p>
            <h2>Goals in progress <span className="heading-count">{goals.length}</span></h2>
          </div>
          <a href="#new-goal" className="text-link">Add a goal <span aria-hidden="true">↗</span></a>
        </div>

        {goals.length > 0 ? (
          <div className="goals-list">
            {goals.map((goal) => {
              const progress =
                goal.target > 0
                  ? Math.min(Math.round((goal.saved / goal.target) * 100), 100)
                  : 0
              const isSelected = goal.id === selectedGoalId
              return (
                <button
                  className={`goal-row${isSelected ? ' selected' : ''}`}
                  key={goal.id}
                  type="button"
                  onClick={() => onSelectGoal(goal.id)}
                  aria-pressed={isSelected}
                >
                  <span className={`goal-icon ${goal.category.toLowerCase()}`}>
                    <CategoryIcon category={goal.category} />
                  </span>
                  <span className="goal-main">
                    <span className="goal-title-line">
                      <strong>{goal.name}</strong>
                      <span className="goal-category">{goal.category}</span>
                    </span>
                    <span className="progress-track" aria-label={`${progress}% saved`}>
                      <span className={`progress-fill ${goal.category.toLowerCase()}`} style={{ width: `${progress}%` }} />
                    </span>
                    <span className="goal-meta">
                      <span><strong>{formatCurrency(goal.saved)}</strong> saved of {formatCurrency(goal.target)}</span>
                      <span>{progress}%</span>
                    </span>
                  </span>
                  <span className="goal-arrow" aria-hidden="true">↗</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="empty-goals">
            <span className="empty-icon"><NavIcon name="target" /></span>
            <strong>Your next goal starts here.</strong>
            <p>Add a savings goal to see your progress.</p>
            <a className="text-link" href="#new-goal">Create your first goal <span aria-hidden="true">→</span></a>
          </div>
        )}
      </div>
    </section>
  )
}

type DetailsProps = {
  goal: SavingsGoal | undefined
  onAddContribution: (amount: number) => void
  onEditGoal: (goalId: string) => void
  onRemoveGoal: (goalId: string) => void
}

function Details({ goal, onAddContribution, onEditGoal, onRemoveGoal }: DetailsProps) {
  const [contribution, setContribution] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(contribution)
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) return
    onAddContribution(amount)
    setContribution('')
  }

  function handleRemoveGoal() {
    if (!goal) return
    const confirmed = window.confirm(`Are you sure you want to remove “${goal.name}”?`)
    if (confirmed) {
      onRemoveGoal(goal.id)
    }
  }

  if (!goal) {
    return (
      <section className="panel details-panel">
        <PanelHeading eyebrow="GOAL DETAILS" title="Pick a goal" />
        <p className="panel-empty-copy">Choose a goal above to see its details and add to your savings.</p>
      </section>
    )
  }

  const progress =
    goal.target > 0 ? Math.min(Math.round((goal.saved / goal.target) * 100), 100) : 0
  const remaining = Math.max(goal.target - goal.saved, 0)

  return (
    <section className="panel details-panel">
      <PanelHeading eyebrow="A CLOSER LOOK" title="Goal details" />
      <div className="detail-name-row">
        <span className={`goal-icon detail-goal-icon ${goal.category.toLowerCase()}`}>
          <CategoryIcon category={goal.category} />
        </span>
        <div>
          <span className="detail-category">{goal.category} goal</span>
          <h3>{goal.name}</h3>
        </div>
      </div>
      <div className="detail-amount-row">
        <div><span className="detail-label">SAVED SO FAR</span><strong>{formatCurrency(goal.saved)}</strong></div>
        <div className="detail-target"><span className="detail-label">YOUR TARGET</span><strong>{formatCurrency(goal.target)}</strong></div>
      </div>
      <div className="detail-actions">
        <button type="button" className="secondary-button" onClick={() => onEditGoal(goal.id)}>Edit goal</button>
        <button type="button" className="danger-button" onClick={handleRemoveGoal}>Remove goal</button>
      </div>
      <div className="detail-progress">
        <div className="detail-progress-label"><span>Your progress</span><strong>{progress}%</strong></div>
        <div className="detail-progress-track">
          <span className={`progress-fill ${goal.category.toLowerCase()}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="remaining-copy">
          {remaining > 0 ? `${formatCurrency(remaining)} to go — you’ve got this.` : 'Goal reached! What a lovely milestone.'}
        </div>
      </div>
      <div className="deadline-row">
        <span className="deadline-icon"><NavIcon name="calendar" /></span>
        <span><span className="detail-label">AIMING FOR</span><strong>{formatDate(goal.deadline)}</strong></span>
        <span className="deadline-note">One step at a time</span>
      </div>
      <form className="contribution-form" onSubmit={handleSubmit}>
        <label htmlFor="contribution">Add a little to this goal</label>
        <div className="contribution-controls">
          <span className="currency-prefix">$</span>
          <input
            id="contribution"
            type="number"
            min="0.01"
            step="0.01"
            max={remaining}
            placeholder="0.00"
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            disabled={remaining === 0}
            required
          />
          <button type="submit" disabled={remaining === 0}>Add</button>
        </div>
        <p className="form-footnote">Just a little at a time adds up.</p>
      </form>
    </section>
  )
}

type SavingsFormProps = {
  goalToEdit: SavingsGoal | null
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  onUpdateGoal: (goal: SavingsGoal) => void
  onCancelEdit: () => void
}

function Form({ goalToEdit, onAddGoal, onUpdateGoal, onCancelEdit }: SavingsFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<GoalCategory>('Travel')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!goalToEdit) {
      setName('')
      setCategory('Travel')
      setTarget('')
      setSaved('')
      setDeadline('')
      setError('')
      return
    }

    setName(goalToEdit.name)
    setCategory(goalToEdit.category)
    setTarget(String(goalToEdit.target))
    setSaved(String(goalToEdit.saved))
    setDeadline(goalToEdit.deadline)
    setError('')
  }, [goalToEdit])

  function resetForm() {
    setName('')
    setCategory('Travel')
    setTarget('')
    setSaved('')
    setDeadline('')
    setError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const targetAmount = Number(target)
    const savedAmount = Number(saved || 0)
    if (
      !name.trim() ||
      !Number.isFinite(targetAmount) ||
      !Number.isFinite(savedAmount) ||
      targetAmount <= 0 ||
      savedAmount < 0 ||
      savedAmount > targetAmount ||
      !deadline
    ) {
      setError('Add a name, a future date, and a starting amount no larger than your target.')
      return
    }

    if (goalToEdit) {
      onUpdateGoal({
        ...goalToEdit,
        name: name.trim(),
        category,
        target: targetAmount,
        saved: savedAmount,
        deadline,
      })
      return
    }

    onAddGoal({
      name: name.trim(),
      category,
      target: targetAmount,
      saved: savedAmount,
      deadline,
    })
    resetForm()
  }

  return (
    <section className="panel form-panel" id="new-goal">
      <PanelHeading eyebrow={goalToEdit ? 'UPDATE GOAL' : 'START SOMEWHERE'} title={goalToEdit ? 'Edit your savings goal' : 'Create a savings goal'} />
      <p className="form-intro">{goalToEdit ? 'Adjust the details and keep your plan on track.' : 'Big dream or small treat? Give it a name and a plan.'}</p>
      <form className="goal-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="goal-name">What are you saving for?</label>
        <input
          className="text-input"
          id="goal-name"
          type="text"
          placeholder="e.g. A weekend away"
          value={name}
          maxLength={60}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          required
        />

        <label className="field-label" htmlFor="goal-category">Choose a category</label>
        <select
          className="text-input select-input"
          id="goal-category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as GoalCategory)
            setError('')
          }}
        >
          <option value="Travel">Travel</option>
          <option value="Home">Home</option>
          <option value="Emergency">Emergency fund</option>
          <option value="Lifestyle">Something for me</option>
        </select>

        <div className="amount-fields">
          <div>
            <label className="field-label" htmlFor="goal-target">Savings target</label>
            <div className="input-with-prefix">
              <span>$</span>
              <input
                id="goal-target"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="2,000"
                value={target}
                onChange={(event) => {
                  setTarget(event.target.value)
                  setError('')
                }}
                required
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="goal-saved">Already saved</label>
            <div className="input-with-prefix">
              <span>$</span>
              <input
                id="goal-saved"
                type="number"
                min="0"
                max={target || undefined}
                step="0.01"
                placeholder="0"
                value={saved}
                onChange={(event) => {
                  setSaved(event.target.value)
                  setError('')
                }}
              />
            </div>
          </div>
        </div>

        <label className="field-label" htmlFor="goal-deadline">When would you like to reach it?</label>
        <input
          className="text-input date-input"
          id="goal-deadline"
          type="date"
          value={deadline}
          min={formatLocalDate(new Date())}
          onChange={(event) => {
            setDeadline(event.target.value)
            setError('')
          }}
          required
        />

        <div className="submit-row">
          <button className="submit-button" type="submit">{goalToEdit ? 'Save changes' : 'Create my goal'} <span aria-hidden="true">→</span></button>
          {goalToEdit && (
            <button type="button" className="text-button" onClick={onCancelEdit}>Cancel</button>
          )}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="form-footnote"><span aria-hidden="true">✦</span> {goalToEdit ? 'A small update can make a big difference.' : 'There’s no wrong place to start.'}</p>
      </form>
    </section>
  )
}

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="panel-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <span className="panel-heading-mark" aria-hidden="true">✳</span>
    </div>
  )
}

function CategoryIcon({ category }: { category: GoalCategory }) {
  const iconName = category === 'Travel' ? 'plane' : category === 'Home' ? 'home' : category === 'Emergency' ? 'shield' : 'spark'
  return <NavIcon name={iconName} />
}

function NavIcon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'grid':
      return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
    case 'target':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r=".8" fill="currentColor" /></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case 'bell':
      return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg>
    case 'wallet':
      return <svg {...common}><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 9V6a2 2 0 0 1 2-2h13M16 13h5M16.5 15.5h.01" /></svg>
    case 'flag':
      return <svg {...common}><path d="M5 21V5m0 0c5-4 9 4 14 0v11c-5 4-9-4-14 0" /></svg>
    case 'leaf':
      return <svg {...common}><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 8-8 8-16ZM4 21c2-5 5-8 10-11" /></svg>
    case 'calendar':
      return <svg {...common}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" /></svg>
    case 'plane':
      return <svg {...common}><path d="m3 14 7.4-1.6L6.5 5.5c-.4-.7.3-1.5 1-1.2l9.2 6.1 4.3-.9a1.8 1.8 0 0 1 .8 3.5l-4.3.9-6 9.3c-.4.7-1.5.4-1.5-.4l.3-8L3 16.3c-1 .2-1.1-2.1 0-2.3Z" /></svg>
    case 'home':
      return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10Z" /></svg>
    case 'shield':
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>
    default:
      return <svg {...common}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></svg>
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()).toUpperCase()
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export default App
