import React, { useState, useEffect, useCallback } from "react";

// The core functionalities of this application are implemented using local storage 
// for persistence, which is suitable for a single-user demonstration environment.

export default function App() {
  const [role, setRole] = useState("Citizen");
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [modalMessage, setModalMessage] = useState(null); // Custom modal for alerts

  // --- Persistence Handlers (using localStorage for demo) ---
  useEffect(() => {
    // Load issues from local storage on component mount
    const saved = localStorage.getItem("fedf_issues_v1");
    if (saved) setIssues(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Save issues to local storage whenever they change
    localStorage.setItem("fedf_issues_v1", JSON.stringify(issues));
    // Ensure the selected issue updates when issues array changes
    if (selected) {
      const updatedSelected = issues.find(i => i.id === selected.id);
      if (updatedSelected) {
        setSelected(updatedSelected);
      } else {
        setSelected(null); // Issue was deleted
      }
    }
  }, [issues]);

  // --- Core Action Functions ---

  const addIssue = useCallback((title, description, category) => {
    const newIssue = {
      id: Date.now().toString(),
      title,
      description,
      category,
      status: "Open",
      comments: [],
      createdAt: new Date().toLocaleString(),
      reporterRole: role,
    };
    setIssues((prev) => [newIssue, ...prev]);
  }, [role]);

  const addComment = useCallback((issueId, text) => {
    setIssues((prev) =>
      prev.map((it) =>
        it.id === issueId ? { 
          ...it, 
          comments: [...it.comments, { 
            id: Date.now().toString(), 
            role, 
            text, 
            at: new Date().toLocaleString() 
          }] 
        } : it
      )
    );
  }, [role]);

  const postUpdate = useCallback((text, category) => {
    // Politician posts an update visible in Updates feed
    const update = {
      id: Date.now().toString(),
      title: `Broadcast - ${category || 'General'}`,
      description: text,
      category: category || "General",
      status: "Update", // Custom status for broadcast
      comments: [],
      createdAt: new Date().toLocaleString(),
      reporterRole: 'Politician',
    };
    setIssues((prev) => [update, ...prev]);
  }, []);

  const changeStatus = useCallback((issueId, status) => {
    setIssues((prev) => prev.map((it) => (it.id === issueId ? { ...it, status } : it)));
  }, []);

  const deleteIssue = useCallback((issueId) => {
    if (role !== "Admin") {
      setModalMessage("Error: Only Admin users are authorized to delete reports.");
      return;
    }
    setIssues((prev) => prev.filter((it) => it.id !== issueId));
    setSelected(null);
  }, [role]);

  // Filter issues based on the selected status filter
  const visible = issues.filter((it) => (filter === "all" ? true : it.status === filter));

  return (
    <div className="page-root">
      <CustomModal message={modalMessage} onClose={() => setModalMessage(null)} />
      
      <style>{`
        /* Core Styling - Inter Font and Color Variables */
        :root{--bg:#f7fafc;--card:#fff;--muted:#6b7280;--primary:#1d4ed8;--accent:#10b981;--text-dark:#1f2937}
        *{box-sizing:border-box}
        body,html,#root{height:100%;margin:0;color:var(--text-dark)}
        
        /* Responsive Root Container */
        .page-root{
            font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; 
            background:var(--bg); 
            min-height:100vh; 
            padding: 16px; 
        }
        .container{
            max-width:1200px; 
            width:100%;
            margin:0 auto;
        } 
        
        /* Header and Role Toggle */
        header{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;margin-bottom:10px}
        h1{margin:0;font-size:24px;font-weight:700;color:var(--primary)}
        .role-toggle{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
        .pill{padding:8px 16px;border-radius:999px;border:1px solid #d1d5db;cursor:pointer;font-weight:600;transition:all 0.2s}
        
        .pill.active.citizen{background:#10b981;color:white;border-color:#059669}
        .pill.active.politician{background:#059669;color:white;border-color:#047857}
        .pill.active.moderator{background:#3b82f6;color:white;border-color:#2563eb}
        .pill.active.admin{background:#6b7280;color:white;border-color:#4b5563}
        .pill:not(.active):hover {background: #e5e7eb;}

        /* Card and Grid Layout (Responsive Breakpoints) */
        .card{background:var(--card);padding:18px;border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.06);margin-top:14px}
        
        /* Default: Single column layout for mobile/small screens */
        .grid{display:grid;grid-template-columns:1fr;gap:18px}
        
        /* Medium screens (Tablet/Small Desktop) */
        @media(min-width:920px){
            .page-root{padding: 28px 20px;} /* Increased padding for larger screens */
            .grid{grid-template-columns:1fr 1fr}
        } 
        
        /* Large screens (Desktop) */
        @media(min-width:1200px){
            .grid{grid-template-columns:1.5fr 1fr}
        }
        
        /* Form Elements and Buttons */
        label{display:block;font-weight:600;margin-bottom:6px}
        input[type="text"], textarea, select{
            width:100%;
            padding:10px 12px;
            border-radius:8px;
            border:1px solid #d1d5db;
            background:#fff;
            color:var(--text-dark);
            font-size:14px;
        }
        textarea{min-height:90px;resize:vertical}
        .btn{padding:8px 14px;border-radius:8px;border:none;background:var(--primary);color:white;font-weight:700;cursor:pointer;transition:background 0.2s}
        .btn.secondary{background:#60a5fa}
        .btn:hover:not(:disabled){filter:brightness(1.1)}
        .btn:disabled{background:#9ca3af;cursor:not-allowed}
        
        /* List Styles */
        .updates-list{margin-top:12px;max-height: 250px; overflow-y: auto; border-top: 1px solid #e5e7eb; padding-top: 5px;}
        .update-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px dashed #eef2f7}
        .avatar{width:36px;height:36px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;font-size:16px}
        .meta{font-size:12px;color:var(--muted)}
        .title-issue{font-weight:700;margin:0}
        .category-badge{display:inline-block;padding:3px 7px;border-radius:999px;font-size:11px;font-weight:600;margin-left:8px;text-transform:uppercase}
        .filters{display:flex;gap:8px;align-items:center;margin-top:10px}
        .issue-list{max-height:300px;overflow-y:auto;margin-top:8px}
        .issue-row{padding:10px;border-radius:8px;background:linear-gradient(0deg, rgba(255,255,255,1), rgba(255,255,255,0.8));cursor:pointer;transition:background 0.2s;border:1px solid transparent;}
        .issue-row:hover{background:#f0f4f7}
        .issue-row + .issue-row{margin-top:8px}
        .small{font-size:13px;color:var(--muted)}
        .center{display:flex;justify-content:center}

        /* Modal Styles */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0, 0, 0, 0.5); display: flex; 
            justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-content {
            background: white; padding: 30px; border-radius: 12px; 
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); 
            max-width: 400px; width: 90%; text-align: center;
        }
        .modal-close-btn { margin-top: 15px; }
      `}</style>

      <div className="container">
        <header>
          <h1>Citizen-Politician Platform</h1>
          <p className="small" style={{margin:0}}>Logged in as: <strong>{role}</strong>. Select a role to switch context.</p>
          <div className="role-toggle">
            <button className={`pill ${role==='Citizen'?'active citizen':''}`} onClick={()=>setRole('Citizen')}>Citizen</button>
            <button className={`pill ${role==='Politician'?'active politician':''}`} onClick={()=>setRole('Politician')}>Politician</button>
            <button className={`pill ${role==='Moderator'?'active moderator':''}`} onClick={()=>setRole('Moderator')}>Moderator</button>
            <button className={`pill ${role==='Admin'?'active admin':''}`} onClick={()=>setRole('Admin')}>Admin</button>
          </div>
        </header>

        <div className="grid">
          {/* Left Column: Submit Form and All Reports */}
          <div>
            <div className="card">
              <h3 style={{marginTop:0}}>Submit Issue or Feedback</h3>
              <p className="small" style={{marginTop:-5}}>
                {role === 'Citizen' ? 'Report a civic issue or provide public feedback.' : 'Not available for non-Citizen roles.'}
              </p>
              {role === 'Citizen' ? (
                <IssueForm onSubmit={addIssue} />
              ) : (
                <div className="small center" style={{padding: '20px 0'}}>
                  The reporting form is only accessible to **Citizen** users.
                </div>
              )}

              <div style={{marginTop:20}} className="small">Recent Updates & Open Reports</div>
              <div className="updates-list">
                {issues.filter(i => i.status === 'Update' || i.status === 'Open').slice(0, 6).map(u => (
                  <div key={u.id} className="update-item">
                    <div className="avatar" style={{
                      backgroundColor: u.reporterRole === 'Politician' ? '#dcfce7' : '#eef2ff', 
                      color: u.reporterRole === 'Politician' ? '#16a34a' : '#1e3a8a'
                    }}>{u.reporterRole ? u.reporterRole[0] : 'C'}</div>
                    <div>
                      <div style={{fontWeight:700}}>{u.reporterRole} <span className="category-badge">{u.category}</span></div>
                      <div style={{marginTop:3, fontSize:14}}>{u.description.substring(0, 100)}{u.description.length > 100 ? '...' : ''}</div>
                      <div className="meta">{u.createdAt} • {u.status === 'Update' ? 'Broadcast' : u.status}</div>
                    </div>
                  </div>
                ))}
                {issues.length === 0 && <div className="small center" style={{padding:10}}>No updates or reports yet.</div>}
              </div>
            </div>

            <div style={{marginTop:12}} className="card">
              <h4 style={{marginTop:0}}>All Public Reports</h4>
              <div style={{marginTop:8}} className="filters">
                <label style={{margin:0}}>Filter Status:</label>
                <select value={filter} onChange={(e)=>setFilter(e.target.value)} style={{maxWidth: 150}}>
                  <option value="all">All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Update">Broadcast Updates</option>
                </select>
              </div>

              <div className="issue-list">
                {visible.map(it => (
                  <div key={it.id} className="issue-row" onClick={()=>setSelected(it)} style={{
                    backgroundColor: selected && selected.id === it.id ? '#eef2f7' : undefined,
                    border: selected && selected.id === it.id ? '1px solid #d1d5db' : undefined
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div className="title-issue">{it.title}</div>
                        <div className="small">{it.createdAt} by {it.reporterRole}</div>
                      </div>
                      <StatusBadge status={it.status} category={it.category} />
                    </div>
                  </div>
                ))}
                {visible.length === 0 && <div className="small center" style={{padding:10}}>No reports matching filter criteria.</div>}
              </div>
            </div>
          </div>

          {/* Right Column: Detail and Broadcast */}
          <div>
            <div className="card">
              <h3 style={{marginTop:0}}>Report Details / Discussion</h3>
              {selected ? (
                <IssueDetail
                  issue={selected}
                  onComment={addComment}
                  onChangeStatus={changeStatus}
                  onDelete={deleteIssue}
                  currentRole={role}
                  setModalMessage={setModalMessage} // Pass modal handler
                />
              ) : (
                <div className="small center" style={{padding: '30px 0'}}>Select a report from the left list to view details and engage.</div>
              )}
            </div>

            <div style={{marginTop:12}} className="card">
              <h4 style={{marginTop:0}}>Post Public Broadcast (Politician)</h4>
              <p className="small" style={{marginTop:-5}}>
                Only the **Politician** role can post general updates to all citizens.
              </p>
              <Broadcast postUpdate={postUpdate} currentRole={role} setModalMessage={setModalMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatusBadge({ status }) {
  let bgColor = '#e5e7eb';
  let color = '#4b5563';

  if (status === 'Resolved') {
    bgColor = '#dcfce7'; // green-100
    color = '#16a34a'; // green-600
  } else if (status === 'In Progress') {
    bgColor = '#fef9c3'; // yellow-100
    color = '#a16207'; // yellow-700
  } else if (status === 'Open') {
    bgColor = '#fee2e2'; // red-100
    color = '#b91c1c'; // red-700
  } else if (status === 'Update') {
    bgColor = '#eff6ff'; // blue-100
    color = '#2563eb'; // blue-600
  }
  
  return (
    <div className="category-badge" style={{
      backgroundColor: bgColor,
      color: color,
      marginLeft: 0 // Badge should stand alone
    }}>{status}</div>
  );
}

function CustomModal({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h4 style={{marginTop:0, color: '#b91c1c'}}>Authorization Required</h4>
                <p>{message}</p>
                <button className="btn modal-close-btn" onClick={onClose}>Understood</button>
            </div>
        </div>
    );
}


function IssueForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return; // Form disabled for non-citizens, so no alert needed
    onSubmit(title.trim(), description.trim(), category);
    setTitle("");
    setDescription("");
    setCategory("General");
  }

  return (
    <form onSubmit={submit} style={{display:'grid',gap:10}}>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Short descriptive title (e.g. Broken street lights on Main St)" type="text" />
      <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Detailed description of the issue or feedback" />
      <div>
        <label style={{marginBottom:6}}>Category</label>
        <select value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option>General</option>
          <option>Electricity</option>
          <option>Roads</option>
          <option>Sanitation</option>
          <option>Water</option>
          <option>Other</option>
        </select>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn" type="submit">Submit New Report</button>
        <button type="button" className="btn secondary" onClick={() => { setTitle(''); setDescription(''); setCategory('General'); }}>Clear</button>
      </div>
    </form>
  );
}

function IssueDetail({ issue, onComment, onChangeStatus, onDelete, currentRole, setModalMessage }) {
  const [text, setText] = useState("");
  const isAuthorizedToAct = currentRole === 'Moderator' || currentRole === 'Politician' || currentRole === 'Admin';
  const isAdmin = currentRole === 'Admin';

  const handleStatusChange = (status) => {
    if (!isAuthorizedToAct) {
      setModalMessage(`Only Politician, Moderator, or Admin roles can change the status of a report. Current Role: ${currentRole}`);
      return;
    }
    onChangeStatus(issue.id, status);
  };

  const handleDelete = () => {
    if (!isAdmin) {
      setModalMessage("Error: Only Admin users are authorized to delete reports.");
      return;
    }
    onDelete(issue.id);
  };
  
  // Disable status buttons if the item is a broadcast update
  const isBroadcast = issue.status === 'Update';

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h4 style={{margin:0}}>{issue.title}</h4>
          <div className="small">Reported by **{issue.reporterRole}** on {issue.createdAt}</div>
        </div>
        <StatusBadge status={issue.status} />
      </div>

      <p style={{whiteSpace:'pre-wrap',marginTop:10, paddingBottom:10, borderBottom: '1px dashed #eef2f7'}}>**Description:** {issue.description}</p>

      <div style={{marginTop:12}}>
        <strong>Discussion ({issue.comments.length})</strong>
        <div style={{marginTop:8, maxHeight: 200, overflowY: 'auto'}}>
          {issue.comments.length===0 && <div className="small">No comments yet. Be the first to engage!</div>}
          {issue.comments.map(c=> (
            <div key={c.id} style={{padding:8,borderRadius:8,background:'#fafafa',marginTop:8, borderLeft: `3px solid ${c.role === 'Citizen' ? '#1d4ed8' : '#059669'}`}}>
              <div style={{fontSize:12,color:'#374151'}}>
                <strong>{c.role}</strong> <span className="meta">• {c.at}</span>
              </div>
              <div style={{marginTop:6}}>{c.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={(e)=>{e.preventDefault(); if(!text.trim()) return; onComment(issue.id, text.trim()); setText('');}} style={{marginTop:10}}>
          <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder={`Respond as ${currentRole}...`} rows={3} />
          <div style={{display:'flex',gap:8,marginTop:8, flexWrap:'wrap'}}>
            <button className="btn" type="submit">Add Comment</button>
            
            {/* Moderator and Politician/Admin Actions */}
            {isAuthorizedToAct && !isBroadcast && (
              <>
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={()=>handleStatusChange('In Progress')} 
                  disabled={issue.status === 'In Progress'}
                  title="Moderator/Politician Action"
                >
                  Mark In Progress
                </button>
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={()=>handleStatusChange('Resolved')} 
                  disabled={issue.status === 'Resolved'}
                  title="Moderator/Politician Action"
                >
                  Mark Resolved
                </button>
              </>
            )}
            
            {/* Admin-Only Action */}
            {isAdmin && (
              <button 
                type="button" 
                className="btn secondary" 
                onClick={handleDelete}
                title="Admin Action: Permanently delete this report."
              >
                Delete (Admin)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Broadcast({ postUpdate, currentRole, setModalMessage }) {
  const [msg, setMsg] = useState("");
  const [category, setCategory] = useState('General');

  const isPolitician = currentRole === 'Politician';

  const send = () => {
    if (!isPolitician) {
      setModalMessage(`Access Denied: Only the Politician role can post public broadcasts. Current Role: ${currentRole}`);
      return;
    }
    if (!msg.trim()) return;
    postUpdate(msg.trim(), category);
    setMsg('');
    setCategory('General');
  };

  return (
    <div>
      <textarea 
        value={msg} 
        onChange={(e)=>setMsg(e.target.value)} 
        placeholder={isPolitician ? 'Write public broadcast update to citizens...' : 'Only Politician can post updates.'}
        disabled={!isPolitician} 
        style={{
          backgroundColor: isPolitician ? '#fff' : '#f3f4f6', 
          cursor: isPolitician ? 'auto' : 'not-allowed'
        }}
      />
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <select value={category} onChange={(e)=>setCategory(e.target.value)} disabled={!isPolitician} style={{maxWidth: 150}}>
          <option>General</option>
          <option>Electricity</option>
          <option>Roads</option>
          <option>Sanitation</option>
          <option>Water</option>
        </select>
        <button 
          className="btn" 
          onClick={send} 
          disabled={!isPolitician} 
          style={{backgroundColor: isPolitician ? undefined : '#9ca3af', cursor: isPolitician ? undefined : 'not-allowed'}}
          title={isPolitician ? 'Send broadcast to all users.' : 'Not authorized to send broadcasts.'}
        >
          {isPolitician ? 'Post Broadcast' : 'Not Allowed'}
        </button>
      </div>
    </div>
  );
}