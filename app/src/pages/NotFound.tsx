import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui'
import { buttonStyles } from '../components/ui/Button'

export function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      action={
        <Link to="/path" className={buttonStyles('primary')}>
          Go to the learning path
        </Link>
      }
    >
      That page doesn't exist. Lessons live at <code className="font-mono">/lessons/&lt;id&gt;/</code>; the path lists them all.
    </EmptyState>
  )
}
