import { Fragment, useEffect, useState } from 'react'
import { listAuditLog, errorMessage, type AuditLogEntry } from '../../lib/admin'
import './Admin.css'

const ACTION_LABEL: Record<string, string> = {
  insert: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
}

function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listAuditLog()
      .then(setEntries)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>سجل النشاط</h1>
          <p>كل إضافة أو تعديل أو حذف يحصل في لوحة التحكم، مع اسم من قام به ووقته.</p>
        </div>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      <div className="tld-admin__panel">
        <div className="tld-admin__table-wrap">
          <table className="tld-admin__table">
            <thead>
              <tr>
                <th>الوقت</th>
                <th>بواسطة</th>
                <th>العملية</th>
                <th>الجدول</th>
                <th>المعرّف</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <Fragment key={entry.id}>
                  <tr>
                    <td dir="ltr">{new Date(entry.created_at).toLocaleString('ar-SA')}</td>
                    <td className="tld-admin__row-title">{entry.actor_label ?? '—'}</td>
                    <td>
                      <span
                        className={`tld-admin__badge tld-admin__badge--${entry.action === 'delete' ? 'draft' : 'live'}`}
                      >
                        {ACTION_LABEL[entry.action] ?? entry.action}
                      </span>
                    </td>
                    <td>{entry.target_table}</td>
                    <td dir="ltr">{entry.target_id ? entry.target_id.slice(0, 8) : '—'}</td>
                    <td>
                      <div className="tld-admin__table-actions">
                        <button
                          type="button"
                          className="tld-admin__file-hint"
                          onClick={() => setExpanded((id) => (id === entry.id ? null : entry.id))}
                        >
                          {expanded === entry.id ? 'إخفاء' : 'تفاصيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === entry.id && (
                    <tr>
                      <td colSpan={6}>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12.5 }}>
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {!loading && entries.length === 0 && <p className="tld-admin__empty">ما فيه نشاط مسجّل بعد.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminAuditLog
