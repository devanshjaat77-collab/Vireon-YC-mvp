import { useState } from 'react'
import MachineScene from './components/MachineScene'
import { analyzeFault, type ComponentId, type Investigation } from './services/investigation'

type TimelineEvent = { time: string; title: string; detail: string; state: 'done' | 'active' | 'alert' }
type Feedback = 'worked' | 'failed' | null

const machines = [
  { id: 'pmp-02', name: 'Process Pump Skid — North Line', location: 'Utilities / Bay 03', health: '92.4%', fault: '01' },
  { id: 'pmp-04', name: 'Transfer Pump Skid — South Line', location: 'Utilities / Bay 05', health: '98.1%', fault: '00' },
  { id: 'pmp-07', name: 'Cooling Loop Pump — Cell 04', location: 'Production / Cell 04', health: '89.6%', fault: '02' },
]

function now() {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
}

export default function App() {
  const [machineId, setMachineId] = useState(machines[0].id)
  const [fault, setFault] = useState('High vibration and intermittent grinding noise during load.')
  const [result, setResult] = useState<Investigation | null>(null)
  const [selected, setSelected] = useState<ComponentId>('Drive bearing')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([
    { time: '10:42', title: 'Signal anomaly detected', detail: 'BRG-01 exceeded its vibration threshold.', state: 'alert' },
    { time: '10:44', title: 'Investigation opened', detail: 'North Line / Process Pump Skid selected.', state: 'done' },
  ])
  const machine = machines.find((item) => item.id === machineId) ?? machines[0]
  const actionTitle = feedback === 'worked' ? 'Action marked as resolved' : feedback === 'failed' ? result?.fallbackAction : result?.action

  function addEvent(title: string, detail: string, state: TimelineEvent['state']) {
    setEvents((current) => [...current, { time: now(), title, detail, state }])
  }

  function selectMachine(id: string) {
    const next = machines.find((item) => item.id === id) ?? machines[0]
    setMachineId(id)
    setResult(null)
    setFeedback(null)
    setSelected('Drive bearing')
    setEvents([{ time: now(), title: 'Asset context changed', detail: `${next.name} selected for investigation.`, state: 'done' }])
  }

  function investigate() {
    const next = analyzeFault(fault)
    setResult(next)
    setSelected(next.component)
    setFeedback(null)
    addEvent('Analysis completed', `${next.title} identified at ${next.component}.`, 'active')
  }

  function respond(worked: boolean) {
    if (!result || feedback) return
    setFeedback(worked ? 'worked' : 'failed')
    if (worked) {
      addEvent('Action confirmed', 'Engineer marked the recommended action as resolved.', 'done')
    } else {
      addEvent('Next diagnostic step issued', result.fallbackAction, 'alert')
    }
  }

  return <main>
    <header>
      <div className="brand"><span className="brand-mark">V</span><span>VIREON</span><em>INVESTIGATION CONSOLE</em></div>
      <div className="header-right"><span className="live"><i />SYSTEM LIVE</span><span className="date">SESSION / LIVE TELEMETRY</span><button className="user" aria-label="Engineer profile">AE</button></div>
    </header>

    <section className="toolbar">
      <div><p className="eyebrow">ACTIVE ASSET</p><select value={machineId} onChange={(event) => selectMachine(event.target.value)}>{machines.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><p className="asset-location">{machine.location}</p></div>
      <div className="asset-meta"><span><b>{machine.fault === '00' ? 'NOMINAL' : 'ATTENTION'}</b><small>STATUS</small></span><span><b>{machine.health}</b><small>HEALTH SCORE</small></span><span><b className={machine.fault === '00' ? '' : 'warning'}>{machine.fault}</b><small>ACTIVE FAULTS</small></span></div>
    </section>

    <section className="workflow-rail" aria-label="Investigation workflow">
      <div className="workflow-intro"><span className="pulse" /><div><p className="eyebrow">GUIDED WORKFLOW</p><strong>Investigate the anomaly in four focused steps.</strong></div></div>
      <ol><li className="complete"><b>01</b><span>Select asset</span></li><li className="active"><b>02</b><span>Describe fault</span></li><li><b>03</b><span>Review evidence</span></li><li><b>04</b><span>Confirm action</span></li></ol>
    </section>

    <div className="layout">
      <section className="visual card">
        <div className="panel-head"><div><p className="eyebrow">DIGITAL TWIN / PUMP SKID 02</p><h1>Process pump skid</h1></div><span className="hint">DRAG TO INSPECT · TAP TAGS</span></div>
        <div className="scene"><MachineScene selected={selected} onSelect={setSelected} /></div>
        <div className="component-strip"><span className="legend"><i className="teal" />Nominal <i className="orange" />Attention</span>{(['Drive bearing', 'Coolant valve', 'Pump casing'] as ComponentId[]).map((component) => <button key={component} onClick={() => setSelected(component)} className={selected === component ? 'selected' : ''}>{component === 'Drive bearing' ? 'BRG-01' : component === 'Coolant valve' ? 'VLV-08' : 'PMP-02'} <b>●</b></button>)}</div>
      </section>

      <aside className="investigation card">
        <div className="panel-head"><div><p className="eyebrow">AI-GUIDED INVESTIGATION</p><h2>Diagnose fault</h2></div><span className="demo">DEMO LOGIC</span></div>
        <label className="fault-label">DESCRIBE THE OBSERVED FAULT<textarea value={fault} onChange={(event) => setFault(event.target.value)} placeholder="Enter an alarm, operator observation, or error code…" /></label>
        <button className="analyze" onClick={investigate}>ANALYZE FAULT <span>→</span></button>
        {result ? <>
          <div className="finding"><div className="finding-top"><span>LIKELY AFFECTED SYSTEM</span><b>{result.confidence}% CONFIDENCE</b></div><h3>{result.title}</h3><p>{result.detail}</p><div className="affected"><span>FOCUS COMPONENT</span><button onClick={() => setSelected(result.component)}>{result.component} ↗</button></div></div>
          <div className="evidence"><p className="eyebrow">SUPPORTING EVIDENCE</p>{result.evidence.map((item) => <p key={item}><i />{item}</p>)}</div>
          <div className={`action ${feedback ?? ''}`}><p className="eyebrow">{feedback === 'failed' ? 'NEXT DIAGNOSTIC STEP' : 'NEXT BEST ACTION'}</p><h3>{actionTitle}</h3><div className="action-buttons"><button className={feedback === 'worked' ? 'affirmed' : ''} disabled={Boolean(feedback)} onClick={() => respond(true)}>ACTION WORKED</button><button className={feedback === 'failed' ? 'negative' : ''} disabled={Boolean(feedback)} onClick={() => respond(false)}>DIDN'T WORK</button></div></div>
        </> : <div className="empty-result"><span>01</span><p>Describe a fault to map the affected component and generate a guided action.</p></div>}
      </aside>

      <section className="timeline card"><div className="panel-head"><div><p className="eyebrow">INVESTIGATION LOG</p><h2>Session timeline</h2></div><span className="event-count">{events.length} EVENTS</span></div><div className="events">{events.map((event, index) => <article className="event" key={`${event.time}-${index}`}><span className={`dot ${event.state}`} /><time>{event.time}</time><div><h3>{event.title}</h3><p>{event.detail}</p></div></article>)}</div></section>
      <section className="systems card"><p className="eyebrow">COMPONENT STATUS</p><h2>System health</h2>{[['Main drive', 'Attention', '67%'], ['Process flow', 'Nominal', '96%'], ['Safety interlock', 'Nominal', '100%']].map(([name, status, score]) => <button className="system" key={name} onClick={() => setSelected(name === 'Main drive' ? 'Drive bearing' : name === 'Process flow' ? 'Coolant valve' : 'Pump casing')}><div><b>{name}</b><span className={status === 'Attention' ? 'attention' : ''}>{status}</span></div><div className="bar"><i style={{ width: score }} /></div><small>{score}</small></button>)}</section>
    </div>
  </main>
}
